import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import StudentPlanChooser from '@/components/student/StudentPlanChooser'

async function getStudentPlanData(studentId: string) {
  return prisma.student.findUnique({
    where: { id: studentId },
    include: {
      personal: {
        select: {
          user: { select: { name: true } },
          inviteCode: true,
          plans: {
            where: {
              isActive: true,
              durationMonths: { in: [6, 12] },
            },
            orderBy: { durationMonths: 'asc' },
          },
        },
      },
      subscriptions: {
        where: { status: 'ACTIVE' },
        include: { plan: true },
      },
    },
  })
}

export default async function PlanosPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.studentId) {
    return <div>Erro ao carregar os dados do aluno</div>
  }

  const student = await getStudentPlanData(session.user.studentId)

  if (!student || !student.personal) {
    return <div>Aluno ou personal não encontrado</div>
  }

  const activeSubscription = student.subscriptions[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Escolher Plano</h1>
        <p className="text-[#a1a1aa]">
          Escolha um plano disponível do seu personal para ativar sua assinatura.
        </p>
      </div>

      {activeSubscription ? (
        <div className="rounded-3xl border border-green-500/20 bg-green-500/10 p-6">
          <h2 className="text-lg font-semibold text-white">Você já possui um plano ativo</h2>
          <p className="text-sm text-[#a1a1aa] mt-2">
            Plano atual: <strong>{activeSubscription.plan.name}</strong> ({activeSubscription.plan.durationMonths} meses)
          </p>
        </div>
      ) : (
        <StudentPlanChooser
          personalName={student.personal.user.name}
          personalInviteCode={student.personal.inviteCode}
          plans={student.personal.plans.map((plan) => ({
            id: plan.id,
            name: plan.name,
            durationMonths: plan.durationMonths,
            price: plan.price,
            description: plan.description,
          }))}
        />
      )}
    </div>
  )
}
