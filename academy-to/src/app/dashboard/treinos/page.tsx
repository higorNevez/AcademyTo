"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, Dumbbell, Pencil, Trash2, GripVertical, Loader2 } from "lucide-react"

const muscleGroups = [
  "Peito",
  "Costas",
  "Ombros",
  "Biceps",
  "Triceps",
  "Quadriceps",
  "Posterior",
  "Gluteos",
  "Panturrilha",
  "Abdomen",
  "Core",
]

const workoutTypes = [
  { value: "full-body", label: "Full Body" },
  { value: "upper", label: "Upper Body" },
  { value: "lower", label: "Lower Body" },
  { value: "push", label: "Push" },
  { value: "pull", label: "Pull" },
  { value: "legs", label: "Legs" },
  { value: "a", label: "Treino A" },
  { value: "b", label: "Treino B" },
  { value: "c", label: "Treino C" },
  { value: "d", label: "Treino D" },
  { value: "e", label: "Treino E" },
]

interface Exercise {
  id: string
  name: string
  muscleGroup: string
  description?: string
}

interface WorkoutExercise {
  id?: string
  exerciseId: string
  exercise?: Exercise
  sets: number
  reps: string
  restSeconds?: number
  notes?: string
  order: number
}

interface Workout {
  id: string
  name: string
  description?: string
  type: string
  muscleGroups: string[]
  isActive: boolean
  exercises: WorkoutExercise[]
}

export default function TreinosPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    muscleGroups: [] as string[],
    exercises: [] as WorkoutExercise[],
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [workoutsRes, exercisesRes] = await Promise.all([
        fetch("/api/workouts"),
        fetch("/api/exercises"),
      ])
      const workoutsData = await workoutsRes.json()
      const exercisesData = await exercisesRes.json()
      setWorkouts(workoutsData)
      setExercises(exercisesData)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingWorkout ? `/api/workouts/${editingWorkout.id}` : "/api/workouts"
      const method = editingWorkout ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchData()
        resetForm()
        setDialogOpen(false)
      }
    } catch (error) {
      console.error("Erro ao salvar treino:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este treino?")) return

    try {
      await fetch(`/api/workouts/${id}`, { method: "DELETE" })
      fetchData()
    } catch (error) {
      console.error("Erro ao excluir treino:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "",
      muscleGroups: [],
      exercises: [],
    })
    setEditingWorkout(null)
  }

  const openEditDialog = (workout: Workout) => {
    setEditingWorkout(workout)
    setFormData({
      name: workout.name,
      description: workout.description || "",
      type: workout.type,
      muscleGroups: workout.muscleGroups,
      exercises: workout.exercises.map((e) => ({
        exerciseId: e.exerciseId,
        sets: e.sets,
        reps: e.reps,
        restSeconds: e.restSeconds,
        notes: e.notes,
        order: e.order,
      })),
    })
    setDialogOpen(true)
  }

  const addExerciseToWorkout = () => {
    setFormData({
      ...formData,
      exercises: [
        ...formData.exercises,
        {
          exerciseId: "",
          sets: 3,
          reps: "12",
          restSeconds: 60,
          notes: "",
          order: formData.exercises.length,
        },
      ],
    })
  }

  const updateWorkoutExercise = (index: number, field: string, value: string | number) => {
    const updated = [...formData.exercises]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ ...formData, exercises: updated })
  }

  const removeExerciseFromWorkout = (index: number) => {
    const updated = formData.exercises.filter((_, i) => i !== index)
    setFormData({ ...formData, exercises: updated })
  }

  const toggleMuscleGroup = (group: string) => {
    const current = formData.muscleGroups
    if (current.includes(group)) {
      setFormData({ ...formData, muscleGroups: current.filter((g) => g !== group) })
    } else {
      setFormData({ ...formData, muscleGroups: [...current, group] })
    }
  }

  const filteredWorkouts = workouts.filter(
    (w) =>
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading && workouts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#7c3aed]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Treinos</h1>
          <p className="text-[#a1a1aa]">Crie e gerencie fichas de treino</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Treino
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingWorkout ? "Editar Treino" : "Novo Treino"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do treino</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Treino de Peito e Triceps"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {workoutTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descricao (opcional)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descricao do treino..."
                />
              </div>

              <div className="space-y-2">
                <Label>Grupos musculares</Label>
                <div className="flex flex-wrap gap-2">
                  {muscleGroups.map((group) => (
                    <Badge
                      key={group}
                      variant={formData.muscleGroups.includes(group) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleMuscleGroup(group)}
                    >
                      {group}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Exercicios</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addExerciseToWorkout}>
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </div>

                {formData.exercises.length === 0 ? (
                  <p className="text-center text-[#a1a1aa] py-4">
                    Nenhum exercicio adicionado
                  </p>
                ) : (
                  <div className="space-y-3">
                    {formData.exercises.map((ex, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-[#2a2a2a] rounded-lg"
                      >
                        <GripVertical className="h-5 w-5 text-[#a1a1aa] mt-2 cursor-grab" />
                        <div className="flex-1 grid grid-cols-4 gap-3">
                          <div className="col-span-2">
                            <Select
                              value={ex.exerciseId}
                              onValueChange={(value) => updateWorkoutExercise(index, "exerciseId", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Exercicio" />
                              </SelectTrigger>
                              <SelectContent>
                                {exercises.map((exercise) => (
                                  <SelectItem key={exercise.id} value={exercise.id}>
                                    {exercise.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Input
                            type="number"
                            placeholder="Series"
                            value={ex.sets}
                            onChange={(e) => updateWorkoutExercise(index, "sets", parseInt(e.target.value))}
                          />
                          <Input
                            placeholder="Reps"
                            value={ex.reps}
                            onChange={(e) => updateWorkoutExercise(index, "reps", e.target.value)}
                          />
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => removeExerciseFromWorkout(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingWorkout ? (
                    "Salvar"
                  ) : (
                    "Criar Treino"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1aa]" />
          <Input
            placeholder="Buscar treino..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredWorkouts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Dumbbell className="h-12 w-12 text-[#a1a1aa] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Nenhum treino encontrado
            </h3>
            <p className="text-[#a1a1aa]">
              Crie seu primeiro treino clicando no botao acima
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkouts.map((workout) => (
            <Card key={workout.id} className="hover:border-[#7c3aed]/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{workout.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {workoutTypes.find((t) => t.value === workout.type)?.label || workout.type}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEditDialog(workout)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(workout.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 mb-3">
                  {workout.muscleGroups.map((group) => (
                    <Badge key={group} variant="outline" className="text-xs">
                      {group}
                    </Badge>
                  ))}
                </div>
                {workout.description && (
                  <p className="text-sm text-[#a1a1aa] mb-3 line-clamp-2">
                    {workout.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-sm text-[#a1a1aa]">
                  <Dumbbell className="h-4 w-4" />
                  <span>{workout.exercises?.length || 0} exercicios</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
