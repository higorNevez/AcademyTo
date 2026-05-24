# AcademyTo - Sistema Inteligente de Gestão e Acompanhamento de Consultoria Fitness

## Visão Geral

**AcademyTo** é uma plataforma mobile/web completa voltada para **personal trainers que trabalham com consultoria online ou presencial**, oferecendo controle total sobre alunos, treinos, progresso, comunicação e faturamento.

Mais do que um aplicativo de treinos, trata-se de uma **estrutura profissional de gestão**, onde cada ação deixa rastro, cada decisão tem base e cada aluno possui uma leitura real do seu comportamento ao longo do tempo.

## Filosofia

**O aluno executa.**
**O personal observa, analisa e decide.**

Essa separação garante clareza de papéis, autoridade técnica e organização do processo.

---

## Arquitetura Técnica

### Stack Tecnológico
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Backend**: Next.js API Routes, Node.js
- **Database**: Prisma ORM com SQLite (dev) / PostgreSQL (prod)
- **Autenticação**: NextAuth.js v4
- **UI**: Radix UI, TailwindCSS v4, Lucide Icons
- **Validação**: Zod

### Estrutura do Projeto

```
academy-to/
├── src/
│   ├── app/
│   │   ├── api/                    # API Routes
│   │   │   ├── auth/
│   │   │   ├── exercises/
│   │   │   └── workouts/
│   │   ├── dashboard/              # Área autenticada
│   │   │   ├── alunos/
│   │   │   ├── treinos/
│   │   │   ├── exercicios/
│   │   │   ├── mensagens/
│   │   │   ├── financeiro/
│   │   │   └── configuracoes/
│   │   ├── login/
│   │   ├── cadastro/
│   │   ├── page.tsx               # Landing page
│   │   ├── layout.tsx
│   │   └── globals.css
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

### Variáveis de Ambiente

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

---

## Modelo de Dados

### Vínculo Personal-Aluno

Cada **aluno está vinculado exclusivamente a um personal trainer** por meio de um `inviteCode` único:

- O personal gera um código de convite
- O aluno utiliza esse código ao se cadastrar
- O vínculo é permanente e não pode ser alterado
- Cada personal enxerga **apenas seus próprios alunos**

### Hierarquia de Usuários

| Tipo | Permissões |
|------|-----------|
| **Personal** | Acesso total a alunos, treinos, dados financeiros, histórico completo |
| **Aluno** | Acesso apenas a informações próprias, execução de treinos, envio de mídias |

### Principais Entidades

**User**: Usuário base (personal ou aluno)
- `email`, `password`, `name`, `phone`, `avatar`
- `role`: PERSONAL ou STUDENT

**Personal**: Perfil do personal trainer
- `userId`, `bio`, `specialties` (JSON), `inviteCode` (único)
- Relacionamento 1:N com Student, Workout, Exercise, Plan

**Student**: Perfil do aluno
- `userId`, `personalId` (referência ao personal), `birthDate`, `gender`, `height`
- Dados biométricos: Anamnesis, Measurement, Photo

**Workout**: Ficha de treino
- `name`, `type` (full-body, upper/lower, A/B, A/B/C, etc)
- `muscleGroups` (JSON): mapeamento de volume por grupamento

**WorkoutQueue**: Fila contínua de treinos
- `studentId`, `currentIndex`
- `items`: array de WorkoutQueueItem
- Avanço automático ao completar um treino

**WorkoutSession**: Execução de um treino
- `studentId`, `workoutId`, `startedAt`, `completedAt`
- Histórico completo de cada execução

**Subscription**: Plano do aluno
- `studentId`, `planId`, `status` (ACTIVE, CANCELLED, EXPIRED, PENDING)
- `startDate`, `endDate`

**Payment**: Registro de pagamentos
- `subscriptionId`, `amount`, `status` (PENDING, PAID, FAILED, REFUNDED)

**Message**: Comunicação personal-aluno
- `senderId`, `receiverId`, `content`, `mediaUrl`, `mediaType`, `readAt`

---

## Funcionalidades

### Para o Personal Trainer

#### 📋 Gestão de Alunos
- Anamnese completa (objetivos, condições de saúde, lesões, medicações, nível de atividade, sono, nutrição)
- Histórico de informações e observações técnicas
- Registro de medidas corporais (peso, % gordura, circunferências)
- Upload de fotos do aluno

#### 🏋️‍♂️ Montagem e Controle de Treino
- Criação de fichas personalizadas
- Divisão por grupamentos musculares
- Controle de volume por músculo
- Múltiplos modelos:
  - Full body
  - Upper/Lower
  - A/B
  - A/B/C
  - Até A/B/C/D/E/F/G

#### 📊 Acompanhamento de Desempenho
- Treinos concluídos vs pendentes
- Histórico completo de execuções
- Estatísticas por grupamento muscular
- Leitura de constância e aderência
- Porcentagem de conclusão do plano

#### 💬 Comunicação
- Chat direto com aluno
- Envio e recebimento de fotos/vídeos
- Correções técnicas
- Opiniões, ajustes e orientações

#### 💰 Gestão Financeira
- Acompanhamento de faturamento mensal
- Visualização de planos ativos
- Taxa de cancelamento
- Leitura de aderência dos alunos
- Recorrência financeira

### Para o Aluno

- Visualizar treinos da semana
- Executar treino disponível
- Repetir treinos já realizados
- Enviar fotos e vídeos para correção
- Responder formulários
- Deixar feedbacks
- Cancelar assinatura
- Trocar plano
- Alterar forma de pagamento
- Acompanhar período contratado

---

## Sistema de Treinos em Fila (Queue)

Os treinos funcionam em formato de **fila contínua**:

1. **Criação**: Personal monta a sequência de treinos
2. **Execução**: Aluno realiza o treino atual
3. **Avanço**: Sistema avança automaticamente para o próximo
4. **Repetição**: Aluno pode repetir qualquer treino, reiniciando a fila
5. **Registro**: Cada repetição conta como nova execução e interfere no progresso

**Princípio**: Nada é apagado, nada é mascarado. Tudo deixa rastro.

---

## Cálculo de Progresso

O progresso **não é baseado em carga, intensidade ou volume**.

Ele é baseado em **tempo + compromisso**.

### Duração dos Planos
- 6 meses (100%)
- 12 meses (100%)

### Válida
Cada semana só é considerada **válida** quando o aluno realiza a **quantidade mínima de treinos prescrita** pelo personal — independentemente de serem 1 ou 7 treinos.

Isso garante justiça entre diferentes rotinas (personalizadas vs genéricas).

---

## Identidade Visual

### Paleta de Cores

| Cor | Uso | Hex |
|-----|-----|-----|
| **Roxo** | Navbar, botões primários, elementos principais | `#7c3aed` |
| **Preto Soft** | Fundo do site | `#1a1a1a` |
| **Verde Exército** | Botões de ação, CTA | `#4b5320` / `#556b2f` |

### Estilo
- Moderno, sério e com presença
- Elegância, foco e conforto visual
- Design responsivo (mobile-first)

### Tipografia
- Sans-serif moderna (Geist)
- Tamanhos escalonados
- Contraste adequado para acessibilidade

---

## Fluxos Principais

### Cadastro de Personal
1. Acessa `/cadastro?tipo=personal`
2. Preenche dados (nome, email, senha)
3. Recebe `inviteCode` único
4. Acessa dashboard pessoal

### Cadastro de Aluno
1. Acessa `/cadastro?tipo=aluno`
2. Insere `inviteCode` do personal
3. Preenche dados pessoais
4. Vinculação automática ao personal

### Criação de Treino
1. Personal acessa `/dashboard/treinos`
2. Cria nova ficha com nome e tipo
3. Adiciona exercícios com séries/reps
4. Define muscleGroups e volume
5. Ativa para alunos

### Execução de Treino (Aluno)
1. Acessa `/dashboard` (student view)
2. Vê treino atual da fila
3. Executa exercícios
4. Registra performance (séries, reps, peso)
5. Conclui sessão
6. Sistema avança fila automaticamente

### Acompanhamento (Personal)
1. Acessa `/dashboard/alunos`
2. Visualiza aluno
3. Vê histórico de execuções
4. Analisa performance
5. Envia feedback ou ajustes via chat

---

## Autenticação e Autorização

### NextAuth.js
- Provedor customizado (usuário/senha)
- JWT session strategy
- Callbacks para autorização

### Níveis de Acesso
- **Público**: Landing page, login, cadastro
- **Autenticado Personal**: Dashboard completo
- **Autenticado Student**: View limitada

### Proteção
- Rota `/dashboard/*` exige autenticação
- Dados separados por `personalId` ou `userId`
- Nenhum cruzamento de dados entre profissionais

---

## Padrões de Código

### Componentes UI
- Radix UI como base
- Tailwind CSS para estilização
- Componentes reutilizáveis em `src/components/ui/`

### API Routes
- RESTful endpoints em `src/app/api/*`
- Validação com Zod
- Autenticação com `getServerSession`

### Database
- Prisma Client para queries
- Singleton em `src/lib/prisma.ts`
- Eager loading com `include` quando necessário

### Type Safety
- TypeScript strict mode
- Tipos globais em `src/types/`
- Validação com Zod schemas

---

## Próximas Fases

- [ ] Integração de pagamentos (Stripe/MercadoPago)
- [ ] Notificações em tempo real (WebSocket)
- [ ] App mobile nativa (React Native)
- [ ] Analytics avançado
- [ ] Relatórios PDF
- [ ] Integração com wearables (Apple Health, Google Fit)
- [ ] IA para recomendações de treino
