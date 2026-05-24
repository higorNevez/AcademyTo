import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#a1a1aa]">
            Esta seção ainda está em desenvolvimento. Aqui você poderá ajustar suas preferências e informações de conta.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
