# AcademyTo - Sistema Inteligente de Gestão e Acompanhamento de Consultoria Fitness

**Projeto em desenvolvimento**

Plataforma mobile/web voltada para **personal trainers**, com foco em gestão de alunos, acompanhamento de treinos, leitura de aderência comportamental e controle administrativo.

Este projeto tem como objetivo ir além de aplicativos genéricos de treino, oferecendo uma **estrutura profissional baseada em dados reais** de execução, constância e comportamento ao longo do tempo.

---

## Filosofia do Sistema

> **O aluno executa.**  
> **O personal observa, analisa e decide.**

A plataforma organiza toda a relação entre personal trainer e aluno, garantindo clareza de papéis, histórico completo e leitura real de progresso.

---

## Funcionalidades Principais

### Para Personal Trainers
- ✅ Vínculo exclusivo com alunos via código de convite
- ✅ Gestão completa de alunos (anamnese, medidas, histórico)
- ✅ Criação e controle de treinos personalizados
- ✅ Sistema de treinos em fila (queue)
- ✅ Acompanhamento de desempenho e aderência
- ✅ Chat com envio de mídias
- ✅ Gestão financeira e recorrência
- ✅ Dashboard com métricas
- ✅ Exercício personalizado por aluno

### Para Alunos
- ✅ Visualização de treino atual
- ✅ Execução de treinos com registro de performance
- ✅ Histórico completo de execuções
- ✅ Acompanhamento de progresso do plano
- ✅ Comunicação com personal trainer
- ✅ Gerenciamento de assinatura
- ✅ Visualização de medidas corporais

---

## Stack Tecnológico

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Backend**: Next.js API Routes, Node.js
- **Database**: Prisma ORM + SQLite (dev) / PostgreSQL (prod)
- **Autenticação**: NextAuth.js v4
- **UI**: Radix UI, TailwindCSS v4, Lucide Icons
- **Validação**: Zod

---

## Identidade Visual

| Elemento | Cor | Uso |
|----------|-----|-----|
| **Primária (Roxo)** | #7c3aed | Navbar, botões primários |
| **Fundo (Preto Soft)** | #1a1a1a | Background principal |
| **Ação (Verde Exército)** | #4b5320 | Botões de CTA |

---

## Estrutura do Projeto

```
academy-to/
├── src/
│   ├── app/
│   │   ├── api/                    # API Routes
│   │   ├── app/                    # Dashboard de alunos
│   │   ├── dashboard/              # Dashboard de personal
│   │   ├── login/
│   │   ├── cadastro/
│   │   └── page.tsx               # Landing page
│   ├── components/
│   │   ├── layout/
│   │   └── ui/
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── prisma.ts
│   │   ├── utils.ts
│   │   └── validations.ts
│   └── types/
├── prisma/
│   └── schema.prisma
└── public/
```

---

## Primeiros Passos

### Instalação

```bash
cd academy-to
npm install
```

### Configuração do Ambiente

Crie um arquivo `.env` baseado em `.env.example`:

```env
DATABASE_URL=file:./dev.db
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### Setup do Banco de Dados

```bash
npx prisma migrate dev --name init
```

### Desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:3000`

---

## Fluxos Principais

### Cadastro de Personal
1. Acessa a landing page
2. Clica em "Sou Personal Trainer"
3. Preenche dados de cadastro
4. Recebe `inviteCode` único
5. Acessa dashboard pessoal

### Cadastro de Aluno
1. Acessa a landing page
2. Clica em "Sou Aluno"
3. Insere `inviteCode` do personal
4. Preenche dados pessoais
5. Vinculação automática ao personal

### Execução de Treino (Aluno)
1. Acessa `/app`
2. Visualiza treino atual
3. Clica em "Iniciar Treino"
4. Executa exercícios e registra performance
5. Marca como concluído
6. Sistema avança fila automaticamente

---

## Modelo de Dados

- **User**: Usuário base (personal ou aluno)
- **Personal**: Perfil do trainer com inviteCode
- **Student**: Aluno vinculado a um personal
- **Workout**: Ficha de treino
- **WorkoutQueue**: Fila contínua de treinos do aluno
- **WorkoutSession**: Execução de um treino
- **Subscription**: Plano ativo do aluno
- **Message**: Comunicação personal-aluno

---

## Documentação Detalhada

Consulte [CLAUDE.md](./CLAUDE.md) para documentação técnica completa, arquitetura, padrões de código e guias de desenvolvimento.

---

## Desenvolvedores

- **Higor Neves** - Desenvolvedor principal

---

## Próximas Fases

- [ ] Integração de pagamentos
- [ ] Notificações em tempo real
- [ ] App mobile nativa
- [ ] Analytics avançado
- [ ] Relatórios PDF
- [ ] Integração com wearables
