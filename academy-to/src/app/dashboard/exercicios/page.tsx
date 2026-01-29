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
import { Plus, Search, Dumbbell, Pencil, Trash2, Loader2, Video, Image } from "lucide-react"

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

interface Exercise {
  id: string
  name: string
  muscleGroup: string
  description?: string
  videoUrl?: string
  imageUrl?: string
}

export default function ExerciciosPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterMuscle, setFilterMuscle] = useState<string>("all")

  const [formData, setFormData] = useState({
    name: "",
    muscleGroup: "",
    description: "",
    videoUrl: "",
    imageUrl: "",
  })

  useEffect(() => {
    fetchExercises()
  }, [])

  const fetchExercises = async () => {
    try {
      const response = await fetch("/api/exercises")
      const data = await response.json()
      setExercises(data)
    } catch (error) {
      console.error("Erro ao carregar exercicios:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingExercise ? `/api/exercises/${editingExercise.id}` : "/api/exercises"
      const method = editingExercise ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchExercises()
        resetForm()
        setDialogOpen(false)
      }
    } catch (error) {
      console.error("Erro ao salvar exercicio:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este exercicio?")) return

    try {
      await fetch(`/api/exercises/${id}`, { method: "DELETE" })
      fetchExercises()
    } catch (error) {
      console.error("Erro ao excluir exercicio:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      muscleGroup: "",
      description: "",
      videoUrl: "",
      imageUrl: "",
    })
    setEditingExercise(null)
  }

  const openEditDialog = (exercise: Exercise) => {
    setEditingExercise(exercise)
    setFormData({
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      description: exercise.description || "",
      videoUrl: exercise.videoUrl || "",
      imageUrl: exercise.imageUrl || "",
    })
    setDialogOpen(true)
  }

  const filteredExercises = exercises.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMuscle = filterMuscle === "all" || e.muscleGroup === filterMuscle
    return matchesSearch && matchesMuscle
  })

  const groupedExercises = filteredExercises.reduce((acc, exercise) => {
    const group = exercise.muscleGroup
    if (!acc[group]) acc[group] = []
    acc[group].push(exercise)
    return acc
  }, {} as Record<string, Exercise[]>)

  if (loading && exercises.length === 0) {
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
          <h1 className="text-2xl font-bold text-white">Exercicios</h1>
          <p className="text-[#a1a1aa]">Biblioteca de exercicios para seus treinos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Exercicio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingExercise ? "Editar Exercicio" : "Novo Exercicio"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Supino Reto"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Grupo muscular</Label>
                <Select
                  value={formData.muscleGroup}
                  onValueChange={(value) => setFormData({ ...formData, muscleGroup: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {muscleGroups.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Descricao (opcional)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Como executar o exercicio..."
                />
              </div>

              <div className="space-y-2">
                <Label>URL do video (opcional)</Label>
                <Input
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label>URL da imagem (opcional)</Label>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingExercise ? (
                    "Salvar"
                  ) : (
                    "Criar"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1aa]" />
          <Input
            placeholder="Buscar exercicio..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterMuscle} onValueChange={setFilterMuscle}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por grupo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os grupos</SelectItem>
            {muscleGroups.map((group) => (
              <SelectItem key={group} value={group}>
                {group}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredExercises.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Dumbbell className="h-12 w-12 text-[#a1a1aa] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Nenhum exercicio encontrado
            </h3>
            <p className="text-[#a1a1aa]">
              Adicione exercicios a sua biblioteca
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedExercises).map(([muscleGroup, exercises]) => (
            <div key={muscleGroup}>
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Badge variant="default">{muscleGroup}</Badge>
                <span className="text-sm text-[#a1a1aa] font-normal">
                  ({exercises.length} exercicios)
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exercises.map((exercise) => (
                  <Card key={exercise.id} className="hover:border-[#7c3aed]/50 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{exercise.name}</CardTitle>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEditDialog(exercise)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(exercise.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {exercise.description && (
                        <p className="text-sm text-[#a1a1aa] mb-3 line-clamp-2">
                          {exercise.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3">
                        {exercise.videoUrl && (
                          <a
                            href={exercise.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-[#7c3aed] hover:underline"
                          >
                            <Video className="h-3 w-3" />
                            Video
                          </a>
                        )}
                        {exercise.imageUrl && (
                          <a
                            href={exercise.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-[#7c3aed] hover:underline"
                          >
                            <Image className="h-3 w-3" />
                            Imagem
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
