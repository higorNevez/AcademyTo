"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface PlanItem {
  durationMonths: number
  price: number
}

interface PersonalPlansFormProps {
  initialPlans: PlanItem[]
}

export default function PersonalPlansForm({ initialPlans }: PersonalPlansFormProps) {
  const initialSemestral = useMemo(
    () => initialPlans.find((plan) => plan.durationMonths === 6)?.price.toString() || "",
    [initialPlans]
  )
  const initialAnual = useMemo(
    () => initialPlans.find((plan) => plan.durationMonths === 12)?.price.toString() || "",
    [initialPlans]
  )

  const [semestralPrice, setSemestralPrice] = useState(initialSemestral)
  const [anualPrice, setAnualPrice] = useState(initialAnual)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    const semestral = Number(semestralPrice.replace(',', '.'))
    const anual = Number(anualPrice.replace(',', '.'))

    if (Number.isNaN(semestral) || Number.isNaN(anual) || semestral <= 0 || anual <= 0) {
      setError('Informe valores válidos para os dois planos')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/personal/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semestralPrice: semestral, anualPrice: anual }),
      })

      const json = await response.json()

      if (!response.ok) {
        setError(json.error || 'Não foi possível salvar os valores')
      } else {
        setSuccess('Valores atualizados com sucesso')
      }
    } catch (err) {
      setError('Erro ao salvar os valores de plano')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Valores de Plano</CardTitle>
        <CardDescription>
          Defina os valores do plano semestral e anual que os alunos poderão escolher após o cadastro.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="semestral-price">Plano Semestral (6 meses)</Label>
              <Input
                id="semestral-price"
                value={semestralPrice}
                onChange={(event) => setSemestralPrice(event.target.value)}
                placeholder="Ex: 799.90"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="anual-price">Plano Anual (12 meses)</Label>
              <Input
                id="anual-price"
                value={anualPrice}
                onChange={(event) => setAnualPrice(event.target.value)}
                placeholder="Ex: 1499.90"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-300">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-300">
              {success}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Salvando valores...' : 'Salvar valores de plano'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
