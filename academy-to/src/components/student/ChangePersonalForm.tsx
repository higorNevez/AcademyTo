"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface ChangePersonalFormProps {
  currentInviteCode: string
  currentPersonalName: string | null
}

export default function ChangePersonalForm({ currentInviteCode, currentPersonalName }: ChangePersonalFormProps) {
  const router = useRouter()
  const [inviteCode, setInviteCode] = useState(currentInviteCode)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const response = await fetch("/api/student/change-personal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Não foi possível atualizar o personal")
      } else {
        setSuccess("Personal atualizado com sucesso. Por favor, escolha um plano para continuar.")
        setTimeout(() => {
          router.push("/app/planos")
        }, 1200)
      }
    } catch (err) {
      setError("Erro ao atualizar o personal")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal atual</CardTitle>
        <CardDescription>
          Personal atual: {currentPersonalName ?? "Não informado"} | Código: {currentInviteCode}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-[#a1a1aa]">
          Caso queira trocar de personal, insira o novo código de convite e confirme. Após a troca, você deverá escolher um plano do novo personal.
        </p>

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-invite-code">Novo código do personal</Label>
            <Input
              id="new-invite-code"
              placeholder="Cole o código do novo personal"
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Atualizando..." : "Trocar de personal"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
