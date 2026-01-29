"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Dumbbell, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function CadastroContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tipoParam = searchParams.get("tipo")
  
  const [activeTab, setActiveTab] = useState(tipoParam === "aluno" ? "aluno" : "personal")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [personalForm, setPersonalForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  const [studentForm, setStudentForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    inviteCode: "",
  })

  useEffect(() => {
    if (tipoParam) {
      setActiveTab(tipoParam === "aluno" ? "aluno" : "personal")
    }
  }, [tipoParam])

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    if (personalForm.password !== personalForm.confirmPassword) {
      setError("As senhas nao conferem")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "personal",
          ...personalForm,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error)
      } else {
        setSuccess("Cadastro realizado com sucesso! Redirecionando...")
        setTimeout(() => router.push("/login"), 2000)
      }
    } catch {
      setError("Erro ao processar cadastro")
    } finally {
      setLoading(false)
    }
  }

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    if (studentForm.password !== studentForm.confirmPassword) {
      setError("As senhas nao conferem")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "student",
          ...studentForm,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error)
      } else {
        setSuccess("Cadastro realizado com sucesso! Redirecionando...")
        setTimeout(() => router.push("/login"), 2000)
      }
    } catch {
      setError("Erro ao processar cadastro")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="absolute top-4 left-4 text-[#a1a1aa] hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-[#7c3aed] rounded-lg flex items-center justify-center">
              <Dumbbell className="h-7 w-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Criar conta</CardTitle>
          <CardDescription>
            Escolha o tipo de conta que deseja criar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              {success}
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="aluno">Aluno</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <form onSubmit={handlePersonalSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="personal-name">Nome completo</Label>
                  <Input
                    id="personal-name"
                    placeholder="Seu nome"
                    value={personalForm.name}
                    onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personal-email">Email</Label>
                  <Input
                    id="personal-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={personalForm.email}
                    onChange={(e) => setPersonalForm({ ...personalForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personal-phone">Telefone (opcional)</Label>
                  <Input
                    id="personal-phone"
                    placeholder="(00) 00000-0000"
                    value={personalForm.phone}
                    onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personal-password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="personal-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="******"
                      value={personalForm.password}
                      onChange={(e) => setPersonalForm({ ...personalForm, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personal-confirm">Confirmar senha</Label>
                  <Input
                    id="personal-confirm"
                    type={showPassword ? "text" : "password"}
                    placeholder="******"
                    value={personalForm.confirmPassword}
                    onChange={(e) => setPersonalForm({ ...personalForm, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    "Criar conta de Personal"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="aluno">
              <form onSubmit={handleStudentSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-code">Codigo do Personal</Label>
                  <Input
                    id="student-code"
                    placeholder="Cole o codigo de convite"
                    value={studentForm.inviteCode}
                    onChange={(e) => setStudentForm({ ...studentForm, inviteCode: e.target.value })}
                    required
                  />
                  <p className="text-xs text-[#a1a1aa]">
                    Solicite o codigo ao seu personal trainer
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-name">Nome completo</Label>
                  <Input
                    id="student-name"
                    placeholder="Seu nome"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-email">Email</Label>
                  <Input
                    id="student-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-phone">Telefone (opcional)</Label>
                  <Input
                    id="student-phone"
                    placeholder="(00) 00000-0000"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="student-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="******"
                      value={studentForm.password}
                      onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-confirm">Confirmar senha</Label>
                  <Input
                    id="student-confirm"
                    type={showPassword ? "text" : "password"}
                    placeholder="******"
                    value={studentForm.confirmPassword}
                    onChange={(e) => setStudentForm({ ...studentForm, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    "Criar conta de Aluno"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm">
            <span className="text-[#a1a1aa]">Ja tem uma conta? </span>
            <Link href="/login" className="text-[#7c3aed] hover:underline">
              Entrar
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CadastroPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#7c3aed]" />
      </div>
    }>
      <CadastroContent />
    </Suspense>
  )
}
