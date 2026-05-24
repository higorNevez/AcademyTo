import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardMensagensPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mensagens</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#a1a1aa]">
            Esta seção ainda está em desenvolvimento. Em breve você poderá enviar e receber mensagens dos seus alunos.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
