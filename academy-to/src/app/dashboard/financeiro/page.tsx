import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, Users, CreditCard, AlertCircle, Download } from "lucide-react"

async function getFinancialData(personalId: string) {
  const [subscriptions, payments, students] = await Promise.all([
    prisma.subscription.findMany({
      where: {
        student: { personalId }
      },
      include: {
        plan: true,
        student: { include: { user: true } }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.payment.findMany({
      where: {
        subscription: {
          student: { personalId }
        }
      },
      include: {
        subscription: {
          include: {
            plan: true,
            student: { include: { user: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 20
    }),
    prisma.student.count({
      where: { personalId }
    })
  ])

  const monthlyRevenue = subscriptions
    .filter(s => s.status === "ACTIVE")
    .reduce((acc, sub) => {
      return acc + (sub.plan.price / sub.plan.durationMonths)
    }, 0)

  const totalRevenue = payments
    .filter(p => p.status === "PAID")
    .reduce((acc, p) => acc + p.amount, 0)

  const activeSubscriptions = subscriptions.filter(s => s.status === "ACTIVE").length
  const cancelledSubscriptions = subscriptions.filter(s => s.status === "CANCELLED").length

  return {
    subscriptions,
    payments,
    students,
    monthlyRevenue,
    totalRevenue,
    activeSubscriptions,
    cancelledSubscriptions
  }
}

export default async function FinanceiroPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.personalId) {
    return <div>Erro ao carregar dados financeiros</div>
  }

  const data = await getFinancialData(session.user.personalId)

  const retentionRate = data.students > 0
    ? Math.round((data.activeSubscriptions / data.students) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Financeiro</h1>
          <p className="text-[#a1a1aa]">Acompanhe receitas, planos e pagamentos</p>
        </div>
        <Button className="bg-[#7c3aed] hover:bg-[#6d28d9] flex items-center gap-2">
          <Download className="h-4 w-4" />
          Relatório
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#a1a1aa]">
              Receita Mensal
            </CardTitle>
            <DollarSign className="h-4 w-4 text-[#7c3aed]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(data.monthlyRevenue)}
            </div>
            <p className="text-xs text-[#a1a1aa]">baseado em planos ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#a1a1aa]">
              Receita Total
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(data.totalRevenue)}
            </div>
            <p className="text-xs text-[#a1a1aa]">total arrecadado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#a1a1aa]">
              Planos Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-[#4b5320]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeSubscriptions}</div>
            <p className="text-xs text-[#a1a1aa]">alunos com plano</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#a1a1aa]">
              Taxa de Retencao
            </CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{retentionRate}%</div>
            <p className="text-xs text-[#a1a1aa]">alunos em relacao ao total</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Planos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            {data.subscriptions.filter(s => s.status === "ACTIVE").length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-[#a1a1aa] mx-auto mb-2" />
                <p className="text-sm text-[#a1a1aa]">Nenhum plano ativo</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.subscriptions
                  .filter(s => s.status === "ACTIVE")
                  .slice(0, 8)
                  .map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-3 bg-[#2a2a2a] rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-white">{sub.student.user.name}</p>
                        <p className="text-xs text-[#a1a1aa]">{sub.plan.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-white">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(sub.plan.price / sub.plan.durationMonths)}
                        </p>
                        <Badge variant="success" className="mt-1">Ativo</Badge>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estatisticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-[#2a2a2a] rounded-lg">
              <p className="text-sm text-[#a1a1aa] mb-1">Planos Cancelados</p>
              <p className="text-2xl font-bold text-red-500">{data.cancelledSubscriptions}</p>
            </div>
            <div className="p-4 bg-[#2a2a2a] rounded-lg">
              <p className="text-sm text-[#a1a1aa] mb-1">Total de Alunos</p>
              <p className="text-2xl font-bold text-white">{data.students}</p>
            </div>
            <div className="p-4 bg-[#2a2a2a] rounded-lg">
              <p className="text-sm text-[#a1a1aa] mb-1">Ticket Médio Mensal</p>
              <p className="text-2xl font-bold text-[#7c3aed]">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(data.activeSubscriptions > 0 ? data.monthlyRevenue / data.activeSubscriptions : 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Histórico de Pagamentos</CardTitle>
            <Badge variant="outline">{data.payments.length} registros</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {data.payments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-8 w-8 text-[#a1a1aa] mx-auto mb-2" />
              <p className="text-sm text-[#a1a1aa]">Nenhum pagamento registrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#3a3a3a]">
                    <th className="text-left py-3 px-2 text-[#a1a1aa] font-medium">Aluno</th>
                    <th className="text-left py-3 px-2 text-[#a1a1aa] font-medium">Plano</th>
                    <th className="text-left py-3 px-2 text-[#a1a1aa] font-medium">Valor</th>
                    <th className="text-left py-3 px-2 text-[#a1a1aa] font-medium">Status</th>
                    <th className="text-left py-3 px-2 text-[#a1a1aa] font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-[#3a3a3a]/50">
                      <td className="py-3 px-2 text-white">{payment.subscription.student.user.name}</td>
                      <td className="py-3 px-2 text-white">{payment.subscription.plan.name}</td>
                      <td className="py-3 px-2 text-white font-medium">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(payment.amount)}
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant={payment.status === "PAID" ? "success" : payment.status === "PENDING" ? "warning" : "destructive"}>
                          {payment.status === "PAID" ? "Pago" : payment.status === "PENDING" ? "Pendente" : "Falhou"}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-[#a1a1aa]">
                        {new Date(payment.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

