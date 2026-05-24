import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle, Clock } from "lucide-react"

async function getWorkoutHistory(studentId: string) {
  return prisma.workoutSession.findMany({
    where: { studentId },
    include: { workout: true },
    orderBy: { createdAt: "desc" }
  })
}

export default async function HistoricoPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.studentId) {
    return <div>Erro ao carregar histórico</div>
  }

  const sessions = await getWorkoutHistory(session.user.studentId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Histórico de Treinos</h1>
        <p className="text-[#a1a1aa]">Acompanhe todos os seus treinos realizados</p>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-[#a1a1aa] mx-auto mb-4" />
            <p className="text-[#a1a1aa]">Nenhum treino realizando ainda</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-[#7c3aed] flex items-center justify-center">
                        {session.completedAt ? (
                          <CheckCircle className="h-5 w-5 text-white" />
                        ) : (
                          <Clock className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">{session.workout.name}</p>
                        <div className="flex items-center gap-2 text-sm text-[#a1a1aa]">
                          <Calendar className="h-3 w-3" />
                          {new Date(session.createdAt).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(session.createdAt).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {session.notes && (
                      <div className="text-xs text-[#a1a1aa] max-w-xs text-right">
                        {session.notes}
                      </div>
                    )}
                    <Badge variant={session.completedAt ? "success" : "secondary"}>
                      {session.completedAt ? 'Concluído' : 'Iniciado'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
