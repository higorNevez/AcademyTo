import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Bell, Lock, User } from "lucide-react"

async function getStudentSettings(studentId: string) {
  return prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: true,
      subscriptions: {
        where: { status: "ACTIVE" }
      }
    }
  })
}

export default async function ConfiguracoesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.studentId) {
    return <div>Erro ao carregar configurações</div>
  }

  const student = await getStudentSettings(session.user.studentId)

  if (!student) {
    return <div>Aluno não encontrado</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
        <p className="text-[#a1a1aa]">Gerencie suas preferências e dados pessoais</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-[#7c3aed]" />
            <CardTitle>Dados Pessoais</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-[#a1a1aa] mb-2">Nome</p>
            <p className="text-white font-medium">{student.user.name}</p>
          </div>
          <div>
            <p className="text-sm text-[#a1a1aa] mb-2">Email</p>
            <p className="text-white font-medium">{student.user.email}</p>
          </div>
          {student.user.phone && (
            <div>
              <p className="text-sm text-[#a1a1aa] mb-2">Telefone</p>
              <p className="text-white font-medium">{student.user.phone}</p>
            </div>
          )}
          {student.birthDate && (
            <div>
              <p className="text-sm text-[#a1a1aa] mb-2">Data de Nascimento</p>
              <p className="text-white font-medium">
                {new Date(student.birthDate).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}
          <Button className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] mt-2">
            Editar Dados
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#4b5320]" />
            <CardTitle>Notificações</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-[#2a2a2a] rounded-lg">
            <div>
              <p className="text-white font-medium">Notificações de Treino</p>
              <p className="text-sm text-[#a1a1aa]">Receba lembrete quando um novo treino estiver disponível</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between p-3 bg-[#2a2a2a] rounded-lg">
            <div>
              <p className="text-white font-medium">Mensagens do Personal</p>
              <p className="text-sm text-[#a1a1aa]">Receba notificações de novas mensagens</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between p-3 bg-[#2a2a2a] rounded-lg">
            <div>
              <p className="text-white font-medium">Email Marketing</p>
              <p className="text-sm text-[#a1a1aa]">Receba dicas e novidades do AcademyTo</p>
            </div>
            <input type="checkbox" className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-500" />
            <CardTitle>Segurança</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full bg-[#7c3aed] hover:bg-[#6d28d9]">
            Alterar Senha
          </Button>
          <Button variant="outline" className="w-full">
            Sessões Ativas
          </Button>
        </CardContent>
      </Card>

      {student.subscriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Plano e Assinatura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-[#2a2a2a] p-4 rounded-lg">
              <p className="text-sm text-[#a1a1aa] mb-2">Status</p>
              <p className="text-white font-medium mb-3">Ativo</p>
              <Button variant="outline" className="w-full text-red-500 border-red-500/30 hover:bg-red-500/10">
                Cancelar Assinatura
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-red-500/10 border-red-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-500 mb-1">Zona de Perigo</p>
              <p className="text-xs text-[#a1a1aa] mb-3">
                As ações abaixo são irreversíveis. Proceda com cautela.
              </p>
              <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
                Deletar Conta Permanentemente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
