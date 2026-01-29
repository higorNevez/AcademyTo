import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Dumbbell, DollarSign, TrendingUp, Copy, CheckCircle } from "lucide-react"
import Link from "next/link"

async function getDashboardData(personalId: string) {
  const [students, workouts, subscriptions] = await Promise.all([
    prisma.student.findMany({
      where: { personalId },
      include: {
        user: true,
        subscriptions: {
          where: { status: "ACTIVE" },
          include: { plan: true }
        },
        workoutSessions: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    }),
    prisma.workout.findMany({
      where: { personalId, isActive: true }
    }),
    prisma.subscription.findMany({
      where: {
        student: { personalId },
        status: "ACTIVE"
      },
      include: { plan: true }
    })
  ])

  const monthlyRevenue = subscriptions.reduce((acc, sub) => {
    return acc + (sub.plan.price / sub.plan.durationMonths)
  }, 0)

  const activeStudents = students.filter(s => 
    s.subscriptions.some(sub => sub.status === "ACTIVE")
  ).length

  return {
    totalStudents: students.length,
    activeStudents,
    totalWorkouts: workouts.length,
    monthlyRevenue,
    students,
  }
}

async function getInviteCode(personalId: string) {
  const personal = await prisma.personal.findUnique({
    where: { id: personalId },
    select: { inviteCode: true }
  })
  return personal?.inviteCode
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.personalId) {
    return <div>Erro ao carregar dashboard</div>
  }

  const [data, inviteCode] = await Promise.all([
    getDashboardData(session.user.personalId),
    getInviteCode(session.user.personalId)
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-[#a1a1aa]">Bem-vindo de volta, {session.user.name}</p>
        </div>
      </div>

      <Card className="bg-[#7c3aed]/10 border-[#7c3aed]/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-[#a1a1aa] mb-1">Seu codigo de convite para alunos:</p>
              <div className="flex items-center gap-2">
                <code className="bg-[#2a2a2a] px-3 py-1.5 rounded text-[#7c3aed] font-mono">
                  {inviteCode}
                </code>
                <button className="p-2 hover:bg-[#2a2a2a] rounded transition-colors" title="Copiar codigo">
                  <Copy className="h-4 w-4 text-[#a1a1aa]" />
                </button>
              </div>
            </div>
            <p className="text-xs text-[#a1a1aa]">
              Compartilhe este codigo com seus alunos para que eles possam se cadastrar
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#a1a1aa]">
              Total de Alunos
            </CardTitle>
            <Users className="h-4 w-4 text-[#7c3aed]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalStudents}</div>
            <p className="text-xs text-[#a1a1aa]">
              {data.activeStudents} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#a1a1aa]">
              Treinos Criados
            </CardTitle>
            <Dumbbell className="h-4 w-4 text-[#4b5320]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalWorkouts}</div>
            <p className="text-xs text-[#a1a1aa]">treinos ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#a1a1aa]">
              Receita Mensal
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(data.monthlyRevenue)}
            </div>
            <p className="text-xs text-[#a1a1aa]">estimativa mensal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#a1a1aa]">
              Taxa de Retencao
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-[#7c3aed]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.totalStudents > 0
                ? Math.round((data.activeStudents / data.totalStudents) * 100)
                : 0}%
            </div>
            <p className="text-xs text-[#a1a1aa]">alunos ativos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Alunos Recentes</CardTitle>
              <Link href="/dashboard/alunos" className="text-sm text-[#7c3aed] hover:underline">
                Ver todos
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data.students.length === 0 ? (
              <p className="text-[#a1a1aa] text-center py-8">
                Nenhum aluno cadastrado ainda
              </p>
            ) : (
              <div className="space-y-4">
                {data.students.slice(0, 5).map((student) => (
                  <Link
                    key={student.id}
                    href={`/dashboard/alunos/${student.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#7c3aed] flex items-center justify-center text-white font-semibold">
                        {student.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white">{student.user.name}</p>
                        <p className="text-sm text-[#a1a1aa]">{student.user.email}</p>
                      </div>
                    </div>
                    <Badge variant={student.subscriptions.length > 0 ? "success" : "secondary"}>
                      {student.subscriptions.length > 0 ? "Ativo" : "Inativo"}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Atividade Recente</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {data.students.filter(s => s.workoutSessions.length > 0).length === 0 ? (
              <p className="text-[#a1a1aa] text-center py-8">
                Nenhuma atividade registrada ainda
              </p>
            ) : (
              <div className="space-y-4">
                {data.students
                  .filter(s => s.workoutSessions.length > 0)
                  .slice(0, 5)
                  .map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-[#2a2a2a]"
                    >
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-white">
                          <span className="font-medium">{student.user.name}</span> completou um treino
                        </p>
                        <p className="text-xs text-[#a1a1aa]">
                          {new Date(student.workoutSessions[0].createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
