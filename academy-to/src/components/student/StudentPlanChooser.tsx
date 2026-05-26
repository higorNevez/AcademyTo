"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface PlanOption {
  id: string
  name: string
  durationMonths: number
  price: number
  description?: string | null
}

interface StudentPlanChooserProps {
  personalName: string
  personalInviteCode: string
  plans: PlanOption[]
}

export default function StudentPlanChooser({ personalName, personalInviteCode, plans }: StudentPlanChooserProps) {
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  async function handleChoosePlan(planId: string) {
    setError(null)
    setSuccess(null)
    setLoadingPlanId(planId)

    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Não foi possível ativar o plano")
      } else {
        setSuccess("Plano escolhido com sucesso! Redirecionando...")
        setTimeout(() => {
          router.push("/app")
        }, 1200)
      }
    } catch (err) {
      setError("Erro ao escolher o plano")
    } finally {
      setLoadingPlanId(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-[#7c3aed]/30 bg-[#7c3aed]/5">
        <CardHeader>
          <CardTitle>Seu personal</CardTitle>
          <CardDescription>
            Personal atual: {personalName} | Código: {personalInviteCode}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#a1a1aa]">
            Escolha um dos planos definidos pelo seu personal para começar a treinar.
          </p>
        </CardContent>
      </Card>

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

      {plans.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-sm text-[#a1a1aa]">
              Este personal ainda não definiu valores de plano. Entre em contato com ele para que sejam cadastrados os valores de 6 meses e 1 ano.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <Card key={plan.id} className="border-[#3a3a3a]/50">
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.durationMonths} meses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-[#a1a1aa]">Valor</p>
                  <p className="text-2xl font-semibold text-white">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(plan.price)}
                  </p>
                </div>
                {plan.description && <p className="text-sm text-[#a1a1aa]">{plan.description}</p>}
                <Button
                  className="w-full"
                  onClick={() => handleChoosePlan(plan.id)}
                  disabled={loadingPlanId !== null}
                >
                  {loadingPlanId === plan.id ? 'Escolhendo...' : `Escolher ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
