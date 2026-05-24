import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardFinanceiroPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#a1a1aa]">
            Esta seção ainda está em desenvolvimento. Aqui você verá receitas, planos e pagamentos futuros.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
