import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserPlus, Search, Mail, Phone } from "lucide-react"

async function getStudents(personalId: string) {
  return prisma.student.findMany({
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
      },
      workoutQueue: {
        include: {
          items: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })
}

export default async function AlunosPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.personalId) {
    return <div>Erro ao carregar alunos</div>
  }

  const students = await getStudents(session.user.personalId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Alunos</h1>
          <p className="text-[#a1a1aa]">Gerencie seus alunos e acompanhe o progresso</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1aa]" />
          <Input placeholder="Buscar aluno..." className="pl-10" />
        </div>
      </div>

      {students.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UserPlus className="h-12 w-12 text-[#a1a1aa] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Nenhum aluno cadastrado
            </h3>
            <p className="text-[#a1a1aa] mb-4">
              Compartilhe seu codigo de convite para que seus alunos possam se cadastrar
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student: { id: string; subscriptions: any[]; workoutSessions: { id: string; createdAt: Date; studentId: string; notes: string | null; workoutId: string; startedAt: Date; completedAt: Date | null }[]; workoutQueue?: { currentIndex: number; items: any[] } | null; user: { name: string; email: string; phone: string | null } }) => {
            const hasActiveSubscription = student.subscriptions.length > 0
            const lastWorkout = student.workoutSessions[0]
            const queueProgress = student.workoutQueue
              ? Math.round((student.workoutQueue.currentIndex / Math.max(student.workoutQueue.items.length, 1)) * 100)
              : 0

            return (
              <Link key={student.id} href={`/dashboard/alunos/${student.id}`}>
                <Card className="hover:border-[#7c3aed]/50 transition-colors cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-lg font-semibold">
                          {student.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{student.user.name}</CardTitle>
                          <Badge variant={hasActiveSubscription ? "success" : "secondary"} className="mt-1">
                            {hasActiveSubscription ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-[#a1a1aa]">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{student.user.email}</span>
                    </div>
                    {student.user.phone && (
                      <div className="flex items-center gap-2 text-sm text-[#a1a1aa]">
                        <Phone className="h-4 w-4" />
                        <span>{student.user.phone}</span>
                      </div>
                    )}
                    
                    {hasActiveSubscription && (
                      <div className="pt-2 border-t border-[#3a3a3a]">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-[#a1a1aa]">Progresso do plano</span>
                          <span className="text-white">{queueProgress}%</span>
                        </div>
                        <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#7c3aed] transition-all"
                            style={{ width: `${queueProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {lastWorkout && (
                      <p className="text-xs text-[#a1a1aa]">
                        Ultimo treino: {new Date(lastWorkout.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
