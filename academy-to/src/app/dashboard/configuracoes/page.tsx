import PersonalPlansForm from "@/components/personal/PersonalPlansForm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Copy, Lock, User, Bell, Settings } from "lucide-react"

async function getPersonalSettings(personalId: string) {
  return prisma.personal.findUnique({
    where: { id: personalId },
    include: {
      user: true,
      students: {
        select: { id: true }
      },
      plans: {
        where: {
          durationMonths: { in: [6, 12] }
        },
        orderBy: { durationMonths: 'asc' }
      }
    }
  })
}

export default async function ConfiguracoesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.personalId) {
    return <div>Erro ao carregar configurações</div>
  }

  const personal = await getPersonalSettings(session.user.personalId)

  if (!personal) {
    return <div>Personal não encontrado</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
        <p className="text-[#a1a1aa]">Gerencie sua conta e preferências</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-[#7c3aed]" />
            <CardTitle>Perfil Profissional</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-[#a1a1aa] mb-2">Nome</p>
            <p className="text-white font-medium">{personal.user.name}</p>
          </div>
          <div>
            <p className="text-sm text-[#a1a1aa] mb-2">Email</p>
            <p className="text-white font-medium">{personal.user.email}</p>
          </div>
          {personal.user.phone && (
            <div>
              <p className="text-sm text-[#a1a1aa] mb-2">Telefone</p>
              <p className="text-white font-medium">{personal.user.phone}</p>
            </div>
          )}
          {personal.bio && (
            <div>
              <p className="text-sm text-[#a1a1aa] mb-2">Biografia</p>
              <p className="text-white text-sm">{personal.bio}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-[#a1a1aa] mb-2">Total de Alunos</p>
            <p className="text-white font-medium">{personal.students.length}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] mt-2">
              Editar Perfil
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#7c3aed]/30 bg-[#7c3aed]/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Copy className="h-5 w-5 text-[#7c3aed]" />
            <CardTitle>Código de Convite</CardTitle>
          </div>
          <CardDescription>Compartilhe com seus alunos para que eles se cadastrem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-[#2a2a2a] px-4 py-3 rounded-lg text-[#7c3aed] font-mono text-sm break-all">
              {personal.inviteCode}
            </code>
            <Button
              size="icon"
              className="bg-[#7c3aed] hover:bg-[#6d28d9]"
              title="Copiar código"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-3">
            Este código é único e permanente. Cada aluno que usar este código será vinculado a você.
          </p>
        </CardContent>
      </Card>

      <PersonalPlansForm initialPlans={personal.plans} />

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
              <p className="text-sm text-[#a1a1aa]">Receba alerta quando aluno completar treino</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 cursor-pointer" />
          </div>
          <div className="flex items-center justify-between p-3 bg-[#2a2a2a] rounded-lg">
            <div>
              <p className="text-white font-medium">Notificações de Pagamento</p>
              <p className="text-sm text-[#a1a1aa]">Notifique-me sobre novos pagamentos</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 cursor-pointer" />
          </div>
          <div className="flex items-center justify-between p-3 bg-[#2a2a2a] rounded-lg">
            <div>
              <p className="text-white font-medium">Alertas de Aderência</p>
              <p className="text-sm text-[#a1a1aa]">Alerte quando aluno com baixa aderência</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 cursor-pointer" />
          </div>
          <div className="flex items-center justify-between p-3 bg-[#2a2a2a] rounded-lg">
            <div>
              <p className="text-white font-medium">Relatórios Semanais</p>
              <p className="text-sm text-[#a1a1aa]">Envie relatórios de desempenho dos alunos</p>
            </div>
            <input type="checkbox" className="w-5 h-5 cursor-pointer" />
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
        <CardContent className="space-y-3">
          <Button className="w-full bg-[#7c3aed] hover:bg-[#6d28d9]">
            Alterar Senha
          </Button>
          <Button variant="outline" className="w-full">
            Dispositivos Conectados
          </Button>
          <Button variant="outline" className="w-full">
            Histórico de Acessos
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-[#a1a1aa]" />
            <CardTitle>Integracoes</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-[#2a2a2a] rounded-lg">
            <div>
              <p className="text-white font-medium">Stripe</p>
              <p className="text-sm text-[#a1a1aa]">Integração de pagamentos</p>
            </div>
            <Badge variant="secondary">Em breve</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#2a2a2a] rounded-lg">
            <div>
              <p className="text-white font-medium">Google Fit</p>
              <p className="text-sm text-[#a1a1aa]">Sincronize dados de atividade</p>
            </div>
            <Badge variant="secondary">Em breve</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#2a2a2a] rounded-lg">
            <div>
              <p className="text-white font-medium">WhatsApp</p>
              <p className="text-sm text-[#a1a1aa]">Envie notificações via WhatsApp</p>
            </div>
            <Badge variant="secondary">Em breve</Badge>
          </div>
        </CardContent>
      </Card>

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

