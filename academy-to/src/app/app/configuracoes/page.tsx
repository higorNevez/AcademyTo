import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, User } from "lucide-react"
import ChangePersonalForm from "@/components/student/ChangePersonalForm"

async function getStudentSettings(studentId: string) {
  return prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: true,
      personal: { select: { inviteCode: true, user: { select: { name: true } } } },
      subscriptions: { where: { status: "ACTIVE" } }
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
        <p className="text-[#a1a1aa]">Gerencie suas preferências e segurança</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-[#7c3aed]" />
              <CardTitle>Conta</CardTitle>
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
            <Button className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] mt-2">Editar Dados</Button>
            <Button variant="outline" className="w-full mt-2">Alterar Senha</Button>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Vinculado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-[#a1a1aa]">Personal atual</p>
              <p className="text-white font-medium">{student.personal?.user.name ?? 'Não disponível'}</p>
              <p className="text-xs text-[#a1a1aa]">Código: {student.personal?.inviteCode ?? 'Não disponível'}</p>
            </div>
          </CardContent>
        </Card>

        <ChangePersonalForm
          currentInviteCode={student.personal?.inviteCode ?? ''}
          currentPersonalName={student.personal?.user.name ?? null}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Termos & Privacidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a href="#" className="text-sm text-[#a1a1aa] hover:underline">Termos de Uso</a>
            <a href="#" className="text-sm text-[#a1a1aa] hover:underline">Política de Privacidade</a>
            <div className="mt-4">
              <label className="text-sm text-[#a1a1aa] mr-2">Idioma</label>
              <select defaultValue="pt-BR" className="bg-[#2a2a2a] text-white p-2 rounded">
                <option value="pt-BR">Português (BR)</option>
                <option value="en-US">English (US)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suporte</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#a1a1aa] mb-3">Encontrou um erro ou problema? Nos avise para que possamos corrigir.</p>
            <Button className="w-full bg-[#7c3aed] hover:bg-[#6d28d9]">Reportar Erro</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
