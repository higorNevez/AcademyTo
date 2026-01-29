import Link from "next/link"
import { Dumbbell, Users, TrendingUp, Shield, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#7c3aed]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">AcademyTo</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Entrar
              </Button>
            </Link>
            <Link href="/cadastro">
              <Button className="bg-[#4b5320] hover:bg-[#3d4419] text-white">
                Cadastrar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-20">
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Gestao Inteligente para{" "}
              <span className="text-[#7c3aed]">Personal Trainers</span>
            </h1>
            <p className="text-xl text-[#a1a1aa] mb-8 max-w-3xl mx-auto">
              Plataforma completa para gerenciar seus alunos, treinos, progresso e
              faturamento. Tudo em um so lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cadastro?tipo=personal">
                <Button size="lg" className="bg-[#4b5320] hover:bg-[#3d4419] text-white">
                  Sou Personal Trainer
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/cadastro?tipo=aluno">
                <Button size="lg" variant="outline" className="border-[#7c3aed] text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white">
                  Sou Aluno
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-[#222222]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Funcionalidades Principais
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#3a3a3a]">
                <div className="w-12 h-12 bg-[#7c3aed]/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-[#7c3aed]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Gestao de Alunos
                </h3>
                <p className="text-[#a1a1aa]">
                  Anamnese completa, historico de informacoes e observacoes tecnicas
                  de cada aluno vinculado.
                </p>
              </div>

              <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#3a3a3a]">
                <div className="w-12 h-12 bg-[#4b5320]/20 rounded-lg flex items-center justify-center mb-4">
                  <Dumbbell className="h-6 w-6 text-[#4b5320]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Treinos Personalizados
                </h3>
                <p className="text-[#a1a1aa]">
                  Crie fichas de treino personalizadas com controle de volume por
                  grupamento muscular.
                </p>
              </div>

              <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#3a3a3a]">
                <div className="w-12 h-12 bg-[#7c3aed]/20 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-[#7c3aed]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Acompanhamento Real
                </h3>
                <p className="text-[#a1a1aa]">
                  Estatisticas de aderencia, frequencia e comportamento ao longo do
                  tempo.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-[#7c3aed] to-[#9333ea] rounded-2xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Pronto para comecar?
                  </h2>
                  <p className="text-white/80">
                    Cadastre-se agora e comece a gerenciar seus alunos de forma
                    profissional.
                  </p>
                </div>
                <Link href="/cadastro">
                  <Button size="lg" className="bg-[#4b5320] hover:bg-[#3d4419] text-white">
                    Criar conta gratuita
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-[#222222]">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-[#7c3aed]" />
              <span className="text-[#a1a1aa]">Dados protegidos e seguros</span>
            </div>
            <p className="text-[#a1a1aa] text-sm">
              Cada personal enxerga somente seus proprios alunos. Privacidade e
              seguranca garantidas.
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-[#1a1a1a] border-t border-[#3a3a3a] py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-[#7c3aed]" />
            <span className="font-semibold text-white">AcademyTo</span>
          </div>
          <p className="text-[#a1a1aa] text-sm">
            2024 AcademyTo. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
