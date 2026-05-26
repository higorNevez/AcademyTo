"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface AnamnesisFormValues {
  objectives: string
  healthConditions: string
  injuries: string
  medications: string
  activityLevel: string
  sleepQuality: string
  nutrition: string
  observations: string
}

interface AnamnesisFormProps {
  initialData?: Partial<Record<keyof AnamnesisFormValues, string | null>>
}

export default function AnamnesisForm({ initialData }: AnamnesisFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<AnamnesisFormValues>({
    objectives: "",
    healthConditions: "",
    injuries: "",
    medications: "",
    activityLevel: "",
    sleepQuality: "",
    nutrition: "",
    observations: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({
        ...prev,
        objectives: initialData.objectives ?? "",
        healthConditions: initialData.healthConditions ?? "",
        injuries: initialData.injuries ?? "",
        medications: initialData.medications ?? "",
        activityLevel: initialData.activityLevel ?? "",
        sleepQuality: initialData.sleepQuality ?? "",
        nutrition: initialData.nutrition ?? "",
        observations: initialData.observations ?? "",
      }))
    }
  }, [initialData])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch("/api/anamnesis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Não foi possível salvar a anamnese")
      } else {
        setMessage("Anamnese salva com sucesso")
        router.refresh()
      }
    } catch (err) {
      setError("Erro ao salvar a anamnese")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Anamnese</CardTitle>
        <CardDescription>Atualize seus dados de saúde e histórico para o personal acompanhar a evolução.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-300">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-300">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="objectives">Objetivos</Label>
              <Textarea
                id="objectives"
                rows={3}
                value={form.objectives}
                onChange={(event) => setForm({ ...form, objectives: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="healthConditions">Condições de saúde</Label>
              <Textarea
                id="healthConditions"
                rows={3}
                value={form.healthConditions}
                onChange={(event) => setForm({ ...form, healthConditions: event.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="injuries">Lesões</Label>
              <Textarea
                id="injuries"
                rows={3}
                value={form.injuries}
                onChange={(event) => setForm({ ...form, injuries: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medications">Medicações</Label>
              <Textarea
                id="medications"
                rows={3}
                value={form.medications}
                onChange={(event) => setForm({ ...form, medications: event.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="activityLevel">Nível de atividade</Label>
              <Input
                id="activityLevel"
                value={form.activityLevel}
                onChange={(event) => setForm({ ...form, activityLevel: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sleepQuality">Qualidade do sono</Label>
              <Input
                id="sleepQuality"
                value={form.sleepQuality}
                onChange={(event) => setForm({ ...form, sleepQuality: event.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nutrition">Nutrição</Label>
              <Input
                id="nutrition"
                value={form.nutrition}
                onChange={(event) => setForm({ ...form, nutrition: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                rows={3}
                value={form.observations}
                onChange={(event) => setForm({ ...form, observations: event.target.value })}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Anamnese"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
