"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface MeasurementFormValues {
  height: string
  weight: string
  bodyFat: string
  shoulders: string
  back: string
  leftArm: string
  rightArm: string
  leftForearm: string
  rightForearm: string
  chest: string
  waist: string
  hips: string
  leftThigh: string
  rightThigh: string
  leftCalf: string
  rightCalf: string
}

export default function MeasurementForm() {
  const router = useRouter()
  const [form, setForm] = useState<MeasurementFormValues>({
    height: "",
    weight: "",
    bodyFat: "",
    shoulders: "",
    back: "",
    leftArm: "",
    rightArm: "",
    leftForearm: "",
    rightForearm: "",
    chest: "",
    waist: "",
    hips: "",
    leftThigh: "",
    rightThigh: "",
    leftCalf: "",
    rightCalf: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const body = {
      height: form.height ? Number(form.height.replace(',', '.')) : undefined,
      weight: form.weight ? Number(form.weight.replace(',', '.')) : undefined,
      bodyFat: form.bodyFat ? Number(form.bodyFat.replace(',', '.')) : undefined,
      shoulders: form.shoulders ? Number(form.shoulders.replace(',', '.')) : undefined,
      back: form.back ? Number(form.back.replace(',', '.')) : undefined,
      leftArm: form.leftArm ? Number(form.leftArm.replace(',', '.')) : undefined,
      rightArm: form.rightArm ? Number(form.rightArm.replace(',', '.')) : undefined,
      leftForearm: form.leftForearm ? Number(form.leftForearm.replace(',', '.')) : undefined,
      rightForearm: form.rightForearm ? Number(form.rightForearm.replace(',', '.')) : undefined,
      chest: form.chest ? Number(form.chest.replace(',', '.')) : undefined,
      waist: form.waist ? Number(form.waist.replace(',', '.')) : undefined,
      hips: form.hips ? Number(form.hips.replace(',', '.')) : undefined,
      leftThigh: form.leftThigh ? Number(form.leftThigh.replace(',', '.')) : undefined,
      rightThigh: form.rightThigh ? Number(form.rightThigh.replace(',', '.')) : undefined,
      leftCalf: form.leftCalf ? Number(form.leftCalf.replace(',', '.')) : undefined,
      rightCalf: form.rightCalf ? Number(form.rightCalf.replace(',', '.')) : undefined,
    }

    try {
      const response = await fetch("/api/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Não foi possível salvar a ficha de medições")
      } else {
        setMessage("Medição salva com sucesso")
        setForm({
          height: "",
          weight: "",
          bodyFat: "",
          shoulders: "",
          back: "",
          leftArm: "",
          rightArm: "",
          leftForearm: "",
          rightForearm: "",
          chest: "",
          waist: "",
          hips: "",
          leftThigh: "",
          rightThigh: "",
          leftCalf: "",
          rightCalf: "",
        })
        router.refresh()
      }
    } catch (err) {
      setError("Erro ao salvar a medição")
    } finally {
      setLoading(false)
    }
  }

  const field = (id: keyof MeasurementFormValues, label: string, suffix?: string) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        step="0.1"
        inputMode="decimal"
        placeholder={suffix ? `Ex: 78.5 ${suffix}` : "Digite o valor"}
        value={form[id]}
        onChange={(event) => setForm({ ...form, [id]: event.target.value })}
      />
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ficha de Medições</CardTitle>
        <CardDescription>
          Registre peso, percentual de gordura, altura e medições corporais. Os resultados são salvos imediatamente para acompanhar evolução.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {field("height", "Altura", "cm")}
            {field("weight", "Peso", "kg")}
            {field("bodyFat", "% Gordura", "%")}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {field("shoulders", "Ombros", "cm")}
            {field("chest", "Peitoral", "cm")}
            {field("back", "Dorsal", "cm")}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {field("leftArm", "Braço esquerdo", "cm")}
            {field("rightArm", "Braço direito", "cm")}
            {field("leftForearm", "Antebraço esquerdo", "cm")}
            {field("rightForearm", "Antebraço direito", "cm")}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {field("waist", "Abdômen/Cintura", "cm")}
            {field("hips", "Glúteos", "cm")}
            {field("leftThigh", "Coxa esquerda", "cm")}
            {field("rightThigh", "Coxa direita", "cm")}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {field("leftCalf", "Panturrilha esquerda", "cm")}
            {field("rightCalf", "Panturrilha direita", "cm")}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Medição"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
