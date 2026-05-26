"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Check, Plus } from "lucide-react"

interface AssignWorkoutsDialogProps {
  studentId: string
  triggerLabel: string
}

interface Workout {
  id: string
  name: string
  type: string
  description?: string
  muscleGroups?: string[]
}

export default function AssignWorkoutsDialog({ studentId, triggerLabel }: AssignWorkoutsDialogProps) {
  const [open, setOpen] = useState(false)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [selectedWorkoutIds, setSelectedWorkoutIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      setLoading(true)
      fetch("/api/workouts")
        .then((response) => response.json())
        .then((data) => setWorkouts(data))
        .catch((err) => {
          console.error(err)
          setError("Erro ao carregar treinos")
        })
        .finally(() => setLoading(false))
    }
  }, [open])

  const toggleWorkout = (workoutId: string) => {
    setSelectedWorkoutIds((current) =>
      current.includes(workoutId)
        ? current.filter((id) => id !== workoutId)
        : [...current, workoutId]
    )
  }

  const handleSave = async () => {
    if (selectedWorkoutIds.length === 0) {
      setError("Selecione pelo menos um treino")
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/students/${studentId}/workout-queue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workoutIds: selectedWorkoutIds }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data?.error || "Erro ao adicionar treinos")
        return
      }

      setOpen(false)
      setSelectedWorkoutIds([])
      router.refresh()
    } catch (err) {
      console.error(err)
      setError("Erro ao adicionar treinos")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => {
      setOpen(value)
      if (!value) {
        setSelectedWorkoutIds([])
        setError(null)
      }
    }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          <Plus className="h-4 w-4 mr-2" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Adicionar treinos ao aluno</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <p className="text-sm text-[#a1a1aa]">
            Selecione os treinos que deseja incluir na fila do aluno.
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-[#7c3aed]" />
            </div>
          ) : workouts.length === 0 ? (
            <div className="text-center py-10 text-[#a1a1aa]">Nenhum treino cadastrado ainda.</div>
          ) : (
            <div className="grid gap-3">
              {workouts.map((workout) => {
                const selected = selectedWorkoutIds.includes(workout.id)
                return (
                  <Card key={workout.id} className="border-[#3a3a3a]">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <CardTitle className="text-base text-white">{workout.name}</CardTitle>
                          <CardDescription className="text-xs text-[#a1a1aa]">
                            {workout.type}
                          </CardDescription>
                        </div>
                        <Badge variant={selected ? "success" : "secondary"} className="cursor-pointer" onClick={() => toggleWorkout(workout.id)}>
                          {selected ? "Selecionado" : "Selecionar"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {workout.description && (
                        <p className="text-sm text-[#d4d4d8] mb-2">{workout.description}</p>
                      )}
                      {workout.muscleGroups?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {workout.muscleGroups.map((group) => (
                            <Badge key={group} variant="outline">{group}</Badge>
                          ))}
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-200">
              {error}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || selectedWorkoutIds.length === 0}>
            {saving ? "Salvando..." : `Adicionar ${selectedWorkoutIds.length > 0 ? `(${selectedWorkoutIds.length})` : ""}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
