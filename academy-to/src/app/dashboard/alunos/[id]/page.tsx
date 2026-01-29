import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Dumbbell,
  TrendingUp,
  MessageSquare,
  ClipboardList,
  Activity
} from "lucide-react"

async function getStudentDetails(studentId: string, personalId: string) {
  const student = await prisma.student.findFirst({
    where: {
      id: studentId,
      personalId: personalId
    },
    include: {
      user: true,
      anamnesis: true,
      measurements: {
        orderBy: { date: "desc" },
        take: 10
      },
      subscriptions: {
        include: { plan: true },
        orderBy: { createdAt: "desc" }
      },
      workoutSessions: {
        include: {
          workout: true,
          exercises: {
            include: {
              workoutExercise: {
                include: { exercise: true }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 20
      },
      workoutQueue: {
        include: {
          items: {
            include: { workout: true },
            orderBy: { order: "asc" }
          }
        }
      },
      photos: {
        orderBy: { date: "desc" },
        take: 10
      },
      feedbacks: {
        orderBy: { createdAt: "desc" },
        take: 10
      }
    }
  })

  return student
}

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.personalId) {
    notFound()
  }

  const student = await getStudentDetails(id, session.user.personalId)

  if (!student) {
    notFound()
  }

  const activeSubscription = student.subscriptions.find(s => s.status === "ACTIVE")
  const totalWorkouts = student.workoutSessions.length
  const completedWorkouts = student.workoutSessions.filter(s => s.completedAt).length
  const queueProgress = student.workoutQueue
    ? Math.round((student.workoutQueue.currentIndex / Math.max(student.workoutQueue.items.length, 1)) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/alunos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-xl font-semibold">
              {student.user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{student.user.name}</h1>
              <div className="flex items-center gap-2">
                <Badge variant={activeSubscription ? "success" : "secondary"}>
                  {activeSubscription ? "Ativo" : "Inativo"}
                </Badge>
                {activeSubscription && (
                  <span className="text-sm text-[#a1a1aa]">
                    {activeSubscription.plan.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <Link href={`/dashboard/mensagens?aluno=${student.id}`}>
          <Button variant="primary">
            <MessageSquare className="h-4 w-4 mr-2" />
            Mensagem
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-[#a1a1aa]" />
              <div>
                <p className="text-xs text-[#a1a1aa]">Email</p>
                <p className="text-sm text-white">{student.user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-[#a1a1aa]" />
              <div>
                <p className="text-xs text-[#a1a1aa]">Telefone</p>
                <p className="text-sm text-white">{student.user.phone || "Nao informado"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-[#a1a1aa]" />
              <div>
                <p className="text-xs text-[#a1a1aa]">Membro desde</p>
                <p className="text-sm text-white">
                  {new Date(student.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Dumbbell className="h-5 w-5 text-[#a1a1aa]" />
              <div>
                <p className="text-xs text-[#a1a1aa]">Treinos realizados</p>
                <p className="text-sm text-white">{totalWorkouts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {activeSubscription && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Progresso do Plano</CardTitle>
            <CardDescription>
              {activeSubscription.plan.name} - {activeSubscription.plan.durationMonths} meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#a1a1aa]">Progresso geral</span>
                <span className="text-white">{queueProgress}%</span>
              </div>
              <Progress value={queueProgress} />
              {activeSubscription.startDate && activeSubscription.endDate && (
                <p className="text-xs text-[#a1a1aa]">
                  {new Date(activeSubscription.startDate).toLocaleDateString('pt-BR')} -{" "}
                  {new Date(activeSubscription.endDate).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="treinos">
        <TabsList>
          <TabsTrigger value="treinos">Treinos</TabsTrigger>
          <TabsTrigger value="anamnese">Anamnese</TabsTrigger>
          <TabsTrigger value="medidas">Medidas</TabsTrigger>
          <TabsTrigger value="historico">Historico</TabsTrigger>
        </TabsList>

        <TabsContent value="treinos" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Fila de Treinos</CardTitle>
                <Button size="sm">Editar fila</Button>
              </div>
            </CardHeader>
            <CardContent>
              {!student.workoutQueue || student.workoutQueue.items.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardList className="h-12 w-12 text-[#a1a1aa] mx-auto mb-4" />
                  <p className="text-[#a1a1aa]">Nenhum treino na fila</p>
                  <Button className="mt-4" size="sm">Adicionar treinos</Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {student.workoutQueue.items.map((item, index) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        index === student.workoutQueue!.currentIndex
                          ? "bg-[#7c3aed]/20 border border-[#7c3aed]/50"
                          : index < student.workoutQueue!.currentIndex
                          ? "bg-[#2a2a2a] opacity-50"
                          : "bg-[#2a2a2a]"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        index === student.workoutQueue!.currentIndex
                          ? "bg-[#7c3aed] text-white"
                          : index < student.workoutQueue!.currentIndex
                          ? "bg-green-500/20 text-green-500"
                          : "bg-[#3a3a3a] text-[#a1a1aa]"
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">{item.workout.name}</p>
                        <p className="text-xs text-[#a1a1aa]">{item.workout.type}</p>
                      </div>
                      {index === student.workoutQueue!.currentIndex && (
                        <Badge variant="default">Atual</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anamnese" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Anamnese</CardTitle>
                <Button size="sm">{student.anamnesis ? "Editar" : "Criar"}</Button>
              </div>
            </CardHeader>
            <CardContent>
              {!student.anamnesis ? (
                <div className="text-center py-8">
                  <ClipboardList className="h-12 w-12 text-[#a1a1aa] mx-auto mb-4" />
                  <p className="text-[#a1a1aa]">Anamnese ainda nao preenchida</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {student.anamnesis.objectives && (
                    <div className="p-4 bg-[#2a2a2a] rounded-lg">
                      <p className="text-xs text-[#a1a1aa] mb-1">Objetivos</p>
                      <p className="text-white">{student.anamnesis.objectives}</p>
                    </div>
                  )}
                  {student.anamnesis.healthConditions && (
                    <div className="p-4 bg-[#2a2a2a] rounded-lg">
                      <p className="text-xs text-[#a1a1aa] mb-1">Condicoes de saude</p>
                      <p className="text-white">{student.anamnesis.healthConditions}</p>
                    </div>
                  )}
                  {student.anamnesis.injuries && (
                    <div className="p-4 bg-[#2a2a2a] rounded-lg">
                      <p className="text-xs text-[#a1a1aa] mb-1">Lesoes</p>
                      <p className="text-white">{student.anamnesis.injuries}</p>
                    </div>
                  )}
                  {student.anamnesis.activityLevel && (
                    <div className="p-4 bg-[#2a2a2a] rounded-lg">
                      <p className="text-xs text-[#a1a1aa] mb-1">Nivel de atividade</p>
                      <p className="text-white">{student.anamnesis.activityLevel}</p>
                    </div>
                  )}
                  {student.anamnesis.observations && (
                    <div className="p-4 bg-[#2a2a2a] rounded-lg md:col-span-2">
                      <p className="text-xs text-[#a1a1aa] mb-1">Observacoes</p>
                      <p className="text-white">{student.anamnesis.observations}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medidas" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Medidas Corporais</CardTitle>
                <Button size="sm">Nova medida</Button>
              </div>
            </CardHeader>
            <CardContent>
              {student.measurements.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-[#a1a1aa] mx-auto mb-4" />
                  <p className="text-[#a1a1aa]">Nenhuma medida registrada</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#3a3a3a]">
                        <th className="text-left py-2 text-[#a1a1aa] font-medium">Data</th>
                        <th className="text-left py-2 text-[#a1a1aa] font-medium">Peso</th>
                        <th className="text-left py-2 text-[#a1a1aa] font-medium">% Gordura</th>
                        <th className="text-left py-2 text-[#a1a1aa] font-medium">Cintura</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.measurements.map((measurement) => (
                        <tr key={measurement.id} className="border-b border-[#3a3a3a]/50">
                          <td className="py-3 text-white">
                            {new Date(measurement.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-3 text-white">
                            {measurement.weight ? `${measurement.weight} kg` : "-"}
                          </td>
                          <td className="py-3 text-white">
                            {measurement.bodyFat ? `${measurement.bodyFat}%` : "-"}
                          </td>
                          <td className="py-3 text-white">
                            {measurement.waist ? `${measurement.waist} cm` : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Historico de Treinos</CardTitle>
            </CardHeader>
            <CardContent>
              {student.workoutSessions.length === 0 ? (
                <div className="text-center py-8">
                  <Dumbbell className="h-12 w-12 text-[#a1a1aa] mx-auto mb-4" />
                  <p className="text-[#a1a1aa]">Nenhum treino realizado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {student.workoutSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 bg-[#2a2a2a] rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          session.completedAt ? "bg-green-500/20" : "bg-yellow-500/20"
                        }`}>
                          <Dumbbell className={`h-5 w-5 ${
                            session.completedAt ? "text-green-500" : "text-yellow-500"
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-white">{session.workout.name}</p>
                          <p className="text-xs text-[#a1a1aa]">
                            {new Date(session.startedAt).toLocaleDateString('pt-BR')} -{" "}
                            {new Date(session.startedAt).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge variant={session.completedAt ? "success" : "warning"}>
                        {session.completedAt ? "Completo" : "Em andamento"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
