import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"

async function getCurrentWorkout(studentId: string) {
  const queue = await prisma.workoutQueue.findUnique({
    where: { studentId },
    include: {
      items: {
        include: {
          workout: {
            include: {
              exercises: {
                include: { exercise: true }
              }
            }
          }
        }
      }
    }
  })

  if (!queue || queue.items.length === 0) {
    return null
  }

  const currentItem = queue.items[queue.currentIndex]
  return { currentItem, currentIndex: queue.currentIndex, totalItems: queue.items.length }
}

export default async function TreinoPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.studentId) {
    return <div>Erro ao carregar treino</div>
  }

  const data = await getCurrentWorkout(session.user.studentId)

  if (!data) {
    return (
      <div className="space-y-6">
        <Link href="/app" className="flex items-center gap-2 text-[#7c3aed] hover:underline w-fit">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-[#a1a1aa]">Nenhum treino disponível no momento</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { currentItem, currentIndex, totalItems } = data
  const workout = currentItem.workout

  return (
    <div className="space-y-6">
      <Link href="/app" className="flex items-center gap-2 text-[#7c3aed] hover:underline w-fit">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-white">{workout.name}</h1>
          <span className="text-sm text-[#a1a1aa]">
            Treino {currentIndex + 1} de {totalItems}
          </span>
        </div>
        {workout.description && (
          <p className="text-[#a1a1aa]">{workout.description}</p>
        )}
      </div>

      <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#7c3aed]"
          style={{ width: `${((currentIndex + 1) / totalItems) * 100}%` }}
        />
      </div>

      <div className="space-y-4">
        {workout.exercises.map((exercise, index) => (
          <Card key={exercise.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{exercise.exercise.name}</CardTitle>
                  <p className="text-sm text-[#a1a1aa] mt-1">{exercise.exercise.muscleGroup}</p>
                </div>
                <span className="text-xs bg-[#7c3aed]/20 text-[#7c3aed] px-2 py-1 rounded">
                  Exercício {index + 1}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {exercise.exercise.description && (
                <div>
                  <p className="text-sm text-[#a1a1aa] mb-2">Descrição</p>
                  <p className="text-white">{exercise.exercise.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#2a2a2a] p-3 rounded-lg">
                  <p className="text-xs text-[#a1a1aa] mb-1">Séries</p>
                  <p className="text-xl font-bold text-white">{exercise.sets}</p>
                </div>
                <div className="bg-[#2a2a2a] p-3 rounded-lg">
                  <p className="text-xs text-[#a1a1aa] mb-1">Repetições</p>
                  <p className="text-xl font-bold text-white">{exercise.reps}</p>
                </div>
                {exercise.restSeconds && (
                  <div className="bg-[#2a2a2a] p-3 rounded-lg">
                    <p className="text-xs text-[#a1a1aa] mb-1">Repouso</p>
                    <p className="text-xl font-bold text-white">{exercise.restSeconds}s</p>
                  </div>
                )}
              </div>

              {exercise.notes && (
                <div>
                  <p className="text-sm text-[#a1a1aa] mb-2">Notas</p>
                  <p className="text-white text-sm">{exercise.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4">
        <Link href="/app" className="flex-1">
          <Button variant="outline" className="w-full">
            Cancelar
          </Button>
        </Link>
        <Button className="flex-1 bg-[#4b5320] hover:bg-[#3d4419] text-white flex items-center justify-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Marcar como Concluído
        </Button>
      </div>
    </div>
  )
}
