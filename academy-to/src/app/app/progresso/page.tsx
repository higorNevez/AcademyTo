import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Zap, Calendar } from "lucide-react"

async function getStudentProgress(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      subscriptions: {
        where: { status: "ACTIVE" },
        include: { plan: true }
      },
      workoutQueue: {
        include: { items: true }
      },
      workoutSessions: true,
      measurements: {
        orderBy: { date: "desc" }
      }
    }
  })
  return student
}

export default async function ProgressoPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.studentId) {
    return <div>Erro ao carregar progresso</div>
  }

  const student = await getStudentProgress(session.user.studentId)

  if (!student) {
    return <div>Aluno não encontrado</div>
  }

  const hasActiveSubscription = student.subscriptions.length > 0
  const progressPercentage = student.workoutQueue
    ? Math.round(((student.workoutQueue.currentIndex + 1) / Math.max(student.workoutQueue.items.length, 1)) * 100)
    : 0
  const daysRemaining = hasActiveSubscription
    ? Math.ceil(
        (new Date(student.subscriptions[0].endDate || new Date()).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0

  const completedThisWeek = student.workoutSessions.filter((s) => {
    const sessionDate = new Date(s.createdAt)
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    return sessionDate >= weekStart && s.completedAt
  }).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Progresso</h1>
        <p className="text-[#a1a1aa]">Acompanhe seu desenvolvimento e aderência</p>
      </div>

      {hasActiveSubscription && (
        <>
          <Card className="border-[#7c3aed]/50 bg-[#7c3aed]/5">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Progresso do Plano</span>
                <Badge>{student.subscriptions[0].plan.durationMonths} meses</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#a1a1aa]">Conclusão</span>
                  <span className="text-white font-medium">{progressPercentage}%</span>
                </div>
                <div className="h-3 bg-[#2a2a2a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#7c3aed] to-[#9333ea] transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <div className="bg-[#2a2a2a] p-4 rounded-lg">
                  <p className="text-xs text-[#a1a1aa] mb-2">Treinos Totais</p>
                  <p className="text-2xl font-bold text-white">{student.workoutQueue?.items.length || 0}</p>
                </div>
                <div className="bg-[#2a2a2a] p-4 rounded-lg">
                  <p className="text-xs text-[#a1a1aa] mb-2">Concluídos</p>
                  <p className="text-2xl font-bold text-[#7c3aed]">{student.workoutQueue?.currentIndex || 0}</p>
                </div>
                <div className="bg-[#2a2a2a] p-4 rounded-lg">
                  <p className="text-xs text-[#a1a1aa] mb-2">Restantes</p>
                  <p className="text-2xl font-bold text-white">
                    {Math.max(0, (student.workoutQueue?.items.length || 0) - (student.workoutQueue?.currentIndex || 0))}
                  </p>
                </div>
                <div className="bg-[#2a2a2a] p-4 rounded-lg">
                  <p className="text-xs text-[#a1a1aa] mb-2">Dias Restantes</p>
                  <p className="text-2xl font-bold text-white">{Math.max(0, daysRemaining)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#a1a1aa]">
                  Treinos Esta Semana
                </CardTitle>
                <Zap className="h-4 w-4 text-[#4b5320]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#4b5320]">{completedThisWeek}</div>
                <p className="text-xs text-[#a1a1aa]">semana em andamento</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#a1a1aa]">
                  Taxa de Aderência
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-[#7c3aed]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {student.workoutQueue?.items.length ? Math.round((completedThisWeek / Math.ceil((student.workoutQueue.items.length) / (student.subscriptions[0].plan.durationMonths * 4.34))) * 100) : 0}%
                </div>
                <p className="text-xs text-[#a1a1aa]">consistência</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#a1a1aa]">
                  Total Treinos
                </CardTitle>
                <Calendar className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{student.workoutSessions.length}</div>
                <p className="text-xs text-[#a1a1aa]">na carreira</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {student.measurements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Medidas Corporais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {student.measurements[0] && (
                <>
                  {student.measurements[0].weight && (
                    <div className="bg-[#2a2a2a] p-4 rounded-lg">
                      <p className="text-xs text-[#a1a1aa] mb-2">Peso</p>
                      <p className="text-2xl font-bold text-white">{student.measurements[0].weight}kg</p>
                      <p className="text-xs text-[#a1a1aa] mt-1">
                        {new Date(student.measurements[0].date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
                  {student.measurements[0].bodyFat && (
                    <div className="bg-[#2a2a2a] p-4 rounded-lg">
                      <p className="text-xs text-[#a1a1aa] mb-2">Gordura Corporal</p>
                      <p className="text-2xl font-bold text-white">{student.measurements[0].bodyFat}%</p>
                    </div>
                  )}
                  {student.measurements[0].chest && (
                    <div className="bg-[#2a2a2a] p-4 rounded-lg">
                      <p className="text-xs text-[#a1a1aa] mb-2">Peito</p>
                      <p className="text-2xl font-bold text-white">{student.measurements[0].chest}cm</p>
                    </div>
                  )}
                  {student.measurements[0].waist && (
                    <div className="bg-[#2a2a2a] p-4 rounded-lg">
                      <p className="text-xs text-[#a1a1aa] mb-2">Cintura</p>
                      <p className="text-2xl font-bold text-white">{student.measurements[0].waist}cm</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
