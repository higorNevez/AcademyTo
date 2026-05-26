import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dumbbell, TrendingUp, Calendar, AlertCircle } from "lucide-react"
import Link from "next/link"

async function getStudentData(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: true,
      personal: {
        select: {
          user: { select: { name: true } },
          inviteCode: true,
        }
      },
      subscriptions: {
        where: { status: "ACTIVE" },
        include: { plan: true }
      },
      workoutQueue: {
        include: {
          items: {
            include: { workout: true }
          }
        }
      },
      workoutSessions: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { workout: true }
      }
    }
  })
  return student
}

export default async function AppPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.studentId) {
    return <div>Erro ao carregar dados</div>
  }

  const student = await getStudentData(session.user.studentId)

  if (!student) {
    return <div>Aluno não encontrado</div>
  }

  const hasActiveSubscription = student.subscriptions.length > 0
  const currentWorkout = student.workoutQueue?.items[student.workoutQueue?.currentIndex || 0]
  const progressPercentage = student.workoutQueue
    ? Math.round(((student.workoutQueue.currentIndex + 1) / Math.max(student.workoutQueue.items.length, 1)) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Início</h1>
        <p className="text-[#a1a1aa]">Bem-vindo de volta, {student.user.name}</p>
      </div>

      {student.personal && (
        <Card className="border-[#3a3a3a] bg-[#2a2a2a]">
          <CardContent className="space-y-2">
            <p className="text-sm text-[#a1a1aa]">Personal atual</p>
            <p className="text-white font-medium">{student.personal.user.name}</p>
            <p className="text-xs text-[#a1a1aa]">Código: {student.personal.inviteCode}</p>
            <Link href="/app/configuracoes" className="text-sm text-[#7c3aed] hover:underline">
              Trocar de personal ou escolher plano
            </Link>
          </CardContent>
        </Card>
      )}

      {!hasActiveSubscription && (
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-500 font-medium">Sem plano ativo</p>
                <p className="text-xs text-[#a1a1aa]">Escolha um plano para liberar seus treinos.</p>
              </div>
            </div>
            <Link href="/app/planos" className="inline-flex items-center justify-center rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-medium text-white hover:bg-[#6d28d9]">
              Escolher plano
            </Link>
          </CardContent>
        </Card>
      )}

      {hasActiveSubscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Seu Plano Ativo</span>
              <Badge variant="success">{student.subscriptions[0].plan.name}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#a1a1aa]">Progresso do plano</span>
                <span className="text-white">{progressPercentage}%</span>
              </div>
              <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#7c3aed] transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <div>
                <p className="text-[#a1a1aa]">Início</p>
                <p className="text-white font-medium">
                  {student.subscriptions[0].startDate
                    ? new Date(student.subscriptions[0].startDate).toLocaleDateString('pt-BR')
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-[#a1a1aa]">Término</p>
                <p className="text-white font-medium">
                  {student.subscriptions[0].endDate
                    ? new Date(student.subscriptions[0].endDate).toLocaleDateString('pt-BR')
                    : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#a1a1aa]">
              Treinos Realizados
            </CardTitle>
            <Dumbbell className="h-4 w-4 text-[#7c3aed]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.workoutSessions.length}</div>
            <p className="text-xs text-[#a1a1aa]">no total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#a1a1aa]">
              Progresso Atual
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-[#4b5320]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressPercentage}%</div>
            <p className="text-xs text-[#a1a1aa]">do plano</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#a1a1aa]">
              Próximo Treino
            </CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentWorkout ? 'Pronto' : 'N/A'}</div>
            <p className="text-xs text-[#a1a1aa]">
              {currentWorkout ? 'Clique para iniciar' : 'Aguarde novo treino'}
            </p>
          </CardContent>
        </Card>
      </div>

      {currentWorkout && hasActiveSubscription && (
        <Card className="border-[#7c3aed]/50 bg-[#7c3aed]/5">
          <CardHeader>
            <CardTitle>Treino Disponível</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-[#a1a1aa] text-sm mb-2">Treino #{student.workoutQueue?.currentIndex! + 1}</p>
                <p className="text-lg font-semibold text-white">{currentWorkout.workout?.name}</p>
                {currentWorkout.workout?.description && (
                  <p className="text-sm text-[#a1a1aa] mt-2">{currentWorkout.workout.description}</p>
                )}
              </div>
              <Link href="/app/treino">
                <button className="w-full bg-[#4b5320] hover:bg-[#3d4419] text-white font-medium py-2 rounded-lg transition-colors">
                  Iniciar Treino
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {student.workoutSessions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Atividade Recente</CardTitle>
              <Link href="/app/historico" className="text-sm text-[#7c3aed] hover:underline">
                Ver tudo
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {student.workoutSessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#2a2a2a]"
                >
                  <div>
                    <p className="text-white font-medium">{session.workout.name}</p>
                    <p className="text-xs text-[#a1a1aa]">
                      {new Date(session.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  {session.completedAt && (
                    <Badge variant="success">Concluído</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
