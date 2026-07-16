# VitalFit Management - Contexto Completo do Sistema

> Última atualização: jul/2026

Use este arquivo como contexto base em prompts futuros. Ele descreve o estado atual do projeto, a arquitetura, a direção visual e as regras importantes para qualquer alteração.

## Resumo Do Projeto

Este projeto é uma **aplicação premium em Next.js** para um produto fictício de gestão fitness/gym management chamado **VitalFit Management**.

O produto evoluiu de uma landing page isolada para um **app multi-rota autenticado** com shell responsivo. A identidade visual continua sendo uma **cena cinematográfica de produto** com painéis glassmorphism flutuando em um ambiente interno sofisticado.

A experiência logada deve parecer uma interface fitness premium “flutuando” em um ambiente interno:

- painel central grande frontal em glass
- painel lateral esquerdo em perspectiva, como menu/workspace (desktop)
- painel lateral direito em perspectiva, como profile/calendar/challenges (desktop)
- background ambientado com **imagem dourada customizada** (`public/system-background.png`) — fumaça/âmbar sobre fundo escuro, visível através dos painéis glass
- **sem fundos sólidos pretos** no sistema — `html`/`body` transparentes; legibilidade via camadas glass (frost branco + underlay quente translúcido)
- motion sequencial cinematográfica (desktop)
- navegação inferior glass no mobile

**Rota inicial:** `/` redireciona para `/dashboard` via `redirect()` em `src/app/page.tsx`.

**Autenticação:** rotas do app `(app)/` exigem sessão Supabase. `/login` é pública. Proxy em `src/proxy.ts` (Next.js 16) delega para `src/lib/supabase/middleware.ts`.

**Integração com API:** o projeto prioriza **dados reais via Supabase** e **Server Actions seguras** (com `try/catch`, validação Zod e retorno padronizado). Dados mockados permanecem apenas em áreas legadas ou de demonstração visual (KPIs/gráficos do dashboard, hero scene). Módulos com dados reais: alunos, usuários, profissionais, classes/agendamentos, **financeiro**, **agenda colaborativa**.

**Estado atual da cena desktop:** `DesktopAppShell` renderiza três painéis em perspectiva (esquerdo, central, direito). O conteúdo de cada rota aparece no painel central via `CenterPanelShell`.

**Estado atual do modal:** `FrontFloatingModal` existe como componente pronto, mas **não está renderizado** na cena — apenas importado em `HeroScene.tsx` (legado).

**Legado:** `HeroScene.tsx` permanece no repositório como composição anterior da landing, mas **não é mais a rota de entrada**. Não usar como referência de arquitetura principal.

## Stack

- Next.js `16.2.10`
- React `19.2.4`
- TypeScript
- Tailwind CSS `4`
- App Router
- Framer Motion `12.42.2`
- Lucide React
- Supabase Auth (`@supabase/ssr`, `@supabase/supabase-js`)
- React Hook Form + Zod + `@hookform/resolvers`
- clsx + tailwind-merge
- Fonte: Geist Sans / Geist Mono (Google Fonts)

Scripts disponíveis:

```bash
npm run dev
npm run lint
npm run build
npm run start
npm run seed:members   # popula tabela public.members (script local)
npm run seed           # seed completo: membros, financeiro e check-ins
npm run seed:bulk      # seed de alta densidade para teste de carga
npm run seed:classes   # profissionais, grade e agendamentos de aulas
npm run seed:agenda    # eventos e participantes da agenda colaborativa
npm run seed:test-flow # fluxo de teste (profissionais + vínculos)
npm run fix:avatars    # remove avatars base64 oversized do user_metadata (HTTP 431)
```

### Variáveis de ambiente (`.env`)

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # obrigatória para CRUD admin de usuários (server-only)
```

**Importante:** sem espaços ao redor do `=` no `.env`. A service role **nunca** deve ir para o client.

## Regra Importante Do Workspace

Este projeto possui uma regra em `AGENTS.md` dizendo que a versão do Next.js pode ter mudanças relevantes:

> This is NOT the Next.js you know. This version has breaking changes.

Antes de alterar APIs específicas do Next.js, verifique a documentação local se ela existir em `node_modules/next/dist/docs/`.

## Padrões de Código, Idioma e Nomenclatura

Regras **estritas** para qualquer código novo gerado no projeto:

| Contexto | Idioma | Exemplo |
|---|---|---|
| Identificadores de código (variáveis, funções, tipos) | **Inglês** | `getPatientName`, `useFinanceTransactions` |
| Textos de UI (labels, toasts, mensagens) | **Português (pt-BR)** | `"Transação registrada!"` |
| Mensagens de erro da API / Validação | **Português (pt-BR)** | `{ "error": "Acesso negado." }` |
| Comentários | **Português (pt-BR)** | Apenas para intenções não óbvias |
| Valores persistidos no banco de dados | **Não alterar** | Mantém o contrato de dados original |

### Nomenclatura de Arquivos e Pastas

| Tipo | Convenção | Exemplo |
|---|---|---|
| Componentes React | PascalCase | `DataTable.tsx`, `UserAvatar.tsx` |
| Hooks customizados | camelCase com prefixo `use` | `useFinance.ts`, `useMembersManagement.ts` |
| Módulos, utilitários e helpers (`lib/`) | kebab-case | `group-by-day.ts`, `action-result.ts` |
| Rotas e Actions (App Router) | Padrão do framework | `page.tsx`, `layout.tsx`, `route.ts`, `actions.ts` |
| Schemas Zod (domínio) | kebab-case + `.schema.ts` | `member.schema.ts`, `user.schema.ts` |
| Tipos de domínio | kebab-case + `.types.ts` | `members.types.ts`, `users.types.ts` |

## Arquitetura e Clean Code

Diretrizes técnicas exigidas em todo o codebase:

### Early Returns (Bouncers)

Evitar aninhamento profundo de `if/else`. Retornar cedo em casos de erro, validação inválida ou estados impossíveis, mantendo o caminho feliz na raiz da função.

```ts
// ✅ Preferido
if (!session.authenticated) return actionFailure(session.error);
if (!parsed.success) return actionFailure(parsed.error.issues[0].message);
// ... lógica principal

// ❌ Evitar
if (session.authenticated) {
  if (parsed.success) {
    // lógica aninhada
  }
}
```

### Separação de Responsabilidades (SoC)

| Camada | Responsabilidade |
|---|---|
| **Server Components** | Busca de dados no servidor, composição de layout |
| **Server Actions** | Mutations, validação Zod, integração Supabase, `try/catch` |
| **Custom Hooks** | Estado de UI, orquestração de actions, side effects client |
| **Client Components** | Renderização, interatividade, formulários — **sem lógica de negócio complexa** |

Padrão adotado nas rotas CRUD (`/members`, `/users`):

```txt
page.tsx (RSC)
  └─ *Content.tsx (RSC)          → chama Server Action de leitura
       └─ *ContentClient.tsx     → UI + Table + modais
            └─ use*Management.ts → estado, mutations, refresh
                 └─ actions.ts   → Server Actions (Supabase + Zod)
```

### Tipagem Forte

- **Proibido** o uso de `any`.
- Tipagem estrita; preferir tipos inferidos por schemas Zod (`z.infer`, `z.input`).
- Desestruturar props na assinatura do componente: `({ name, age }: Props) => { ... }`.
- Retornos de Server Actions padronizados via `ActionResult<T>` (`lib/action-result.ts`).

### Componentização

O design system depende da **reutilização rigorosa** dos componentes globais. Nunca recriar padrões visuais manualmente quando já existem no design system:

- `<GlassPanel>` — containers glass (elevations: `base`, `floating`, `popover`, `modal`, `solid`)
- `<ModalOverlay>` + `<ModalPanel>` — modais glass on glass
- `<Table>` + `<GlobalFilters>` — listagens com filtros e paginação
- Botões e inputs em `common/form/` (`GlassButton`, `GlassInput`, `GlassSelect`, etc.)
- `<RowActionsMenu>`, `<ConfirmRemoveDialog>`, `<InlineAlert>` — padrões de UI recorrentes
- **Tipografia glass:** `glassText` / `glassTextStyles` em `config/glass-typography.ts` — **nunca** hardcodar `text-white/XX` em superfícies glass

### Integração com API (Supabase)

Toda nova feature de dados deve seguir:

1. **Server Action** com `"use server"` e bloco `try/catch`.
2. **Validação Zod** no servidor (schema dedicado em `*.schema.ts`).
3. **Retorno padronizado:** `{ success: true, data }` ou `{ success: false, error }` via helpers `actionSuccess()` / `actionFailure()`.
4. **Mensagens de erro em pt-BR** — tanto validação quanto erros de banco/API.
5. **`revalidatePath()`** após mutations que afetam listagens.

## Arquitetura Atual

Estrutura principal atual:

```txt
src/
  app/
    globals.css
    layout.tsx                    # root layout, HeroBackground global, viewport lock mobile, MobileBottomNav
    page.tsx                      # redirect("/dashboard")
    login/page.tsx                # rota pública de autenticação
    (app)/
      layout.tsx                  # MobilePageWrapper + DesktopAppShell
      dashboard/page.tsx          # DashboardContent + getUser (nome do usuário)
      community/page.tsx
      analytics/page.tsx
      finance/page.tsx            # dashboard financeiro (Supabase real)
      finance/actions.ts          # Server Actions: resumo, movimentos, CRUD transações
      agenda/page.tsx             # agenda colaborativa (Supabase real)
      agenda/actions.ts           # Server Actions: eventos, participantes, sidebar
      members/page.tsx            # MembersContent (gestão de alunos — Supabase real)
      members/actions.ts          # Server Actions CRUD alunos (Supabase + Zod)
      users/page.tsx              # UsersContent (Super Admin only)
      users/actions.ts            # Server Actions CRUD usuários (Admin API + Zod)
      professionals/page.tsx      # ProfessionalsContent (gestão de profissionais — Supabase real)
      profile/page.tsx
      help/page.tsx
      settings/page.tsx
      classes/[slug]/page.tsx     # agenda dinâmica por modalidade
      settings/classes/page.tsx   # grade de aulas
      settings/categories/page.tsx
      settings/categories/actions.ts  # CRUD categorias financeiras
  components/
    app/
      CenterPanelShell.tsx        # GlassPanel wrapper do painel central
      DesktopAppShell.tsx         # cena 3D desktop
      NavUserMenu.tsx             # pill glass + menu logout (sidebar)
      RoutePlaceholder.tsx
    auth/
      LoginForm.tsx               # login Supabase + GlassButton
      login.schema.ts             # schema Zod do login
      useLoginForm.ts             # hook de autenticação client
    common/
      button/
        Button.tsx                # canônico Liquid Glass (CVA + motion)
        index.ts                  # barrel do design system de botões
        GlassButton.tsx           # alias → Button glass (+ href)
        GhostButton.tsx
        DangerButton.tsx
        IconButton.tsx            # alias → Button iconOnly
      date-picker/
        DatePicker.tsx            # seletor de data estilo pill (dd / mm / aaaa)
      feedback/
        InlineAlert.tsx           # banner de erro/aviso reutilizável
      form/
        index.ts                  # barrel: botões + GlassInput + GlassSelect + FormField...
        form.styles.ts            # tokens compartilhados de inputs/selects
        FormField.tsx
        GlassSwitch.tsx
        AvatarUploadTrigger.tsx
      input/
        GlassInput.tsx
      select/
        GlassSelect.tsx
      modal/
        ModalOverlay.tsx          # camada 1: scrim âmbar fosco + blur (glass on glass)
        ModalPanel.tsx            # camada 2: painel modal legível (wrapper GlassPanel modal)
        ConfirmRemoveDialog.tsx   # confirmação de remoção reutilizável
      menu/
        RowActionsMenu.tsx        # menu ⋮ de ações por linha (elevation popover)
      glass-panel/
        GlassPanel.tsx
      table/
        Table.tsx                 # tabela genérica + paginação + filtros
        GlobalFilters.tsx         # barra colapsável de filtros (acima do GlassPanel)
        global-filters.types.ts   # TableFilterDefinition (text | select | date)
        table.types.ts            # TableColumn<T>
        TableHead.tsx
        TableFooter.tsx
        TableColGroup.tsx
      section-container/
        SectionContainer.tsx
    dashboard/
      DashboardContent.tsx        # layout principal do dashboard
      BusinessHeader.tsx
      GymCapacity.tsx
      MetricCards.tsx
      RevenueAnalytics.tsx
      TrainerCards.tsx
      FavouritedWorkout.tsx
      MembersTable.tsx            # usa Table (dados mock — apenas dashboard)
      MobileAppPromo.tsx
      HeaderDateWeather.tsx       # data + clima (Open-Meteo)
    members/
      MembersContent.tsx          # RSC — getMembersAction()
      MembersContentClient.tsx    # client — Table + filtros + modais CRUD
      MemberRegistrationForm.tsx  # formulário de cadastro/edição
      useMembersManagement.ts     # hook — estado, mutations, refresh
      members.types.ts            # tipos de domínio (ManagedMember, MemberRow...)
      member.schema.ts            # schema Zod de validação server-side
      member.helpers.ts           # máscaras CPF/data + parse ISO
    professionals/
      ProfessionalsContent.tsx    # RSC — getProfessionalsAction()
      ProfessionalsContentClient.tsx
      ProfessionalRegistrationForm.tsx
      useProfessionalsManagement.ts
      professional-specialties.ts # especialidades e comparação com modalidade
    classes/
      ClassScheduleContent.tsx    # RSC — modalidade, grade e agenda inicial
      ClassScheduleContentClient.tsx
      ScheduleModal.tsx           # criação de agendamento global ou por modalidade
      ScheduleModalProvider.tsx   # contexto global do modal
      AgendaDateFilter.tsx        # filtros Dia / Semana / Mês
      ClassesSidebarSection.tsx   # navegação dinâmica de modalidades
      useClassSchedule.ts         # busca client da agenda por período
      ClassGradeTooltip.tsx       # visualização da grade no cabeçalho
    settings/classes/
      ClassesScheduleContent.tsx
      ClassesScheduleContentClient.tsx
      ScheduleForm.tsx            # CRUD da grade
      useScheduleManagement.ts
      schedule.types.ts
    users/
      UsersContent.tsx            # gestão de usuários do sistema
      UserForm.tsx
      UserAvatar.tsx
      AccessDenied.tsx
      useUsersManagement.ts       # hook — estado, mutations, refresh
      users.types.ts
      user.schema.ts              # schema Zod de validação server-side
      user.helpers.ts             # iniciais + cor avatar estilo Google
    finance/
      FinanceContent.tsx          # RSC — getFinanceDashboardAction()
      FinanceContentClient.tsx    # client — filtros, charts, Table + CRUD
      FinanceHeader.tsx
      PortfolioSummaryCard.tsx
      FinancialOverviewChart.tsx
      TransactionForm.tsx
      financial-health/           # FinancialHealthCard, HealthBarsChart
      expense-breakdown/          # ExpenseBreakdownCard, doughnut + legend
      financial-transactions/     # columns, helpers, types (canônico)
    agenda/
      AgendaContent.tsx           # RSC — listAgendaEventsAction + user options
      AgendaContentClient.tsx     # client — calendário + modais
      CollaborativeCalendar.tsx
      EventModal.tsx / EventDetailModal.tsx
      EventCard.tsx / AvatarStack.tsx / GlassMultiSelect.tsx
      event.schema.ts / agenda.types.ts / agenda.helpers.ts
    dashboard/right-sidebar/
      DashboardRightSidebar.tsx   # sidebar direita (perfil + UpNext)
      UpNextCard.tsx              # próximo evento real via getAgendaSidebarDataAction
    profile/ProfileContent.tsx
    mobile/MobilePageWrapper.tsx
    landing/hero/                 # cena visual (reutilizada pelo app)
      HeroBackground.tsx
      HeroScene.tsx               # legado
      MobileBottomNav.tsx
      data/hero-scene.mock.ts
      motion/hero-scene.motion.ts
      panels/
        LeftSidebarPanel.tsx      # sidebar + NavUserMenu
        RightProfilePanel.tsx
        FrontFloatingModal.tsx
        CenterDashboardPanel.tsx  # legado
  config/
    app-nav.config.ts
    brand-colors.ts               # paleta laranja/âmbar VitalFit (CTAs, gráficos, badges)
    glass-typography.ts           # tokens de hierarquia de texto glass-on-glass
    theme.ts                      # tokens visuais (glass.text documentado)
  public/
    system-background.png         # imagem de fundo do sistema (servida em /system-background.png)
  hooks/
    useHydrated.ts                # useSyncExternalStore (SSR-safe)
    useLocalWeather.ts            # Open-Meteo + geolocalização/IP
    usePrefersReducedMotion.ts    # disponível, não integrado na hero
    useFinancialTransactions.ts   # listagem/delete de transações (client)
    useCollaborativeAgenda.ts     # refetch de eventos da agenda (client)
  lib/
    action-result.ts              # ActionResult<T>, actionSuccess, actionFailure
    is-uuid.ts                    # validação de UUID
    auth/resolve-user-display.ts  # nome, avatar de user_metadata
    avatars/resolve-user-avatar.ts # data URL → Storage bucket avatars (URL pública)
    image/compress-image-data-url.ts # compressão client (≤256px JPEG)
    cn.ts
    motion.ts
    supabase/
      client.ts                   # browser client
      server.ts                   # server client (cookies)
      admin.ts                    # service role (server-only)
      middleware.ts               # refresh session + redirect login
      env.ts
  proxy.ts                        # Next.js 16 proxy (auth + refresh session)
supabase/
  members.sql / professionals.sql / classes.sql / ...
  financial-transactions.sql / financial-categories.sql / financial-reports.sql
  collaborative-agenda.sql        # events + event_participants
  avatars-storage.sql             # bucket público avatars + policy de leitura
```

### Fluxo de renderização

```txt
RootLayout (layout.tsx)
  ├─ HeroBackground               → fixed inset-0 z-0 (imagem + glow âmbar; global)
  └─ children wrapper (relative z-10, flex-1, min-h-0)
       └─ (app)/layout.tsx
            ├─ MobilePageWrapper   → visível em < lg
            └─ DesktopAppShell     → visível em >= lg
  └─ MobileBottomNav               → shrink-0, fluxo normal (não fixed)
```

`HeroBackground` vive **apenas** no root layout — não duplicar em `DesktopAppShell` ou `MobilePageWrapper`.

Cada rota em `(app)/` exporta o conteúdo que aparece **dentro** do painel central (mobile e desktop).

## Autenticação e Autorização

### Fluxo de login

- Rota: `/login` → `LoginForm` com validação Zod (`login.schema.ts`)
- Lógica client extraída para `useLoginForm.ts`
- `supabase.auth.signInWithPassword` via client
- Redirect pós-login: `/dashboard` (ou `?next=` se válido)
- Submit usa `GlassButton` (variant glass, shape pill)

### Proxy e sessão (auth)

- `src/proxy.ts` exporta `proxy()` e delega para `updateSession`
- Lógica em `src/lib/supabase/middleware.ts`
- Rotas públicas: `/login`
- Demais rotas: redireciona para `/login?next=` se não houver sessão
- Usuário logado em `/login` → redirect para `/dashboard`

### Metadados do usuário (Supabase Auth)

Nome e role vivem em **`user.user_metadata`** (não existe `user.name` no topo do objeto User):

| Chave | Uso |
|---|---|
| `name` | Nome exibido no dashboard, NavUserMenu, formulários |
| `role` | RBAC: `SUPER_ADMIN`, `ADMIN`, `TRAINER`, `MEMBER` |

Helpers: `src/lib/auth/resolve-user-display.ts` (`resolveDisplayName`, `resolveFirstName`, `resolveAvatarUrl`).

### RBAC atual

| Rota | Regra |
|---|---|
| `/users` | Apenas `user_metadata.role === "SUPER_ADMIN"` |
| Demais rotas `(app)/` | Qualquer usuário autenticado |

**Nota:** enquanto `role` não estiver definida no metadata, `/users/page.tsx` trata usuário logado sem role como `SUPER_ADMIN` (dev). Produção deve sempre definir `role` explicitamente.

### Server actions de usuários (`users/actions.ts`)

Requer `SUPABASE_SERVICE_ROLE_KEY` no servidor. Retorno via `ActionResult<T>`.

- `listUsersAction` — lista usuários Auth (Admin API)
- `createUserAction` — `admin.createUser` com `user_metadata.name` + `role` + avatar; validação via `user.schema.ts`
- `updateUserAction` — `admin.updateUserById`; se editar a si mesmo, client chama `refreshSession()` + `router.refresh()`
- Avatar: `resolveUserAvatarForMetadata` sobe data URL para Storage e persiste só URL pública (ver seção **Avatars**)

**Nunca** usar `signUp` no client para criar usuários admin — troca a sessão ativa. Sempre Admin API via service role.

### Server actions de alunos (`members/actions.ts`)

Usa `createClient()` (server, cookies do usuário logado). Retorno via `ActionResult<T>`. Validação via `member.schema.ts` (Zod).

| Action | Operação |
|---|---|
| `getMembersAction` | Lista `public.members` (select ordenado por `created_at`) |
| `createMemberAction` | Insert com validação Zod (CPF, e-mail, data, origem, plano) |
| `updateMemberAction` | Update por id com validação Zod |
| `updateMemberStatusAction` | Toggle `status` boolean |
| `deleteMemberAction` | Remove por id |

Todas as actions possuem `try/catch`, mensagens de erro em pt-BR e `revalidatePath("/members")` após mutations.

Mapeamento DB ↔ UI: `MemberRow` → `ManagedMember` via `mapRowToManaged()`. Datas: ISO no banco, `DD/MM/AAAA` na UI (`member.helpers.ts`).

### Contrato de retorno das Server Actions

Definido em `src/lib/action-result.ts`:

```ts
type ActionResult<T = null> =
  | { success: true; data: T }
  | { success: false; error: string };
```

Helpers: `actionSuccess(data)`, `actionFailure(error)`, `toActionError(error, fallbackMessage)`.

## Rotas Do App

| Rota | Página | Conteúdo atual |
|---|---|---|
| `/` | `page.tsx` | redirect → `/dashboard` |
| `/login` | `login/page.tsx` | `LoginForm` (pública) |
| `/dashboard` | `dashboard/page.tsx` | `DashboardContent` + nome via `getUser()` |
| `/community` | `community/page.tsx` | `RoutePlaceholder` |
| `/analytics` | `analytics/page.tsx` | `RoutePlaceholder` |
| `/finance` | `finance/page.tsx` | `FinanceContent` — **Supabase** (`financial_transactions`, categorias, RPCs) |
| `/agenda` | `agenda/page.tsx` | `AgendaContent` — **Supabase** (`events`, `event_participants`) |
| `/members` | `members/page.tsx` | `MembersContent` — **Supabase `public.members`** |
| `/users` | `users/page.tsx` | `UsersContent` (Super Admin) — **Supabase Auth** |
| `/professionals` | `professionals/page.tsx` | `ProfessionalsContent` — Supabase `public.professionals` |
| `/profile` | `profile/page.tsx` | `ProfileContent` |
| `/help` | `help/page.tsx` | `RoutePlaceholder` |
| `/settings` | `settings/page.tsx` | `RoutePlaceholder` |
| `/classes/[slug]` | `classes/[slug]/page.tsx` | Agenda dinâmica da modalidade, grade e agendamentos |
| `/settings/classes` | `settings/classes/page.tsx` | CRUD da grade de aulas, professores e capacidade |
| `/settings/categories` | `settings/categories/page.tsx` | Gestão de categorias financeiras |

Navegação centralizada em `src/config/app-nav.config.ts`:

- `mainNavItems` — Dashboard (`/dashboard`), **Financeiro** (`/finance`), **Agenda** (`/agenda`)
- `ClassesSidebarSection` — modalidades dinâmicas vindas do banco (sidebar), com contagem e **Show More**
- `utilityNavItems` — **Alunos** (`/members`), **Profissionais** (`/professionals`), **Usuários** (`/users`), **Configurações** (`/settings`)
- `getUtilityNavItemsForRole(role)` / `getMobileNavItemsForRole(role)` — esconde `/users` se não for `SUPER_ADMIN`
- `mobileNavItems` — deprecated alias; preferir `getMobileNavItemsForRole`
- `profileHref` — `/profile`
- `isNavActive(pathname, href)` — match exato de rota

**Nota:** rotas `/community` e `/analytics` ainda existem como placeholders, mas **não** estão na nav principal.

## Dashboard (`/dashboard`)

Arquivo orquestrador: `src/components/dashboard/DashboardContent.tsx`

### Cabeçalho fixo (não alterar estrutura base)

- Título: `Bem vindo de volta, {userName}!` — nome vem de `resolveFirstName(user_metadata, email)` no server
- Subtítulo: `HeaderDateWeather` — data pt-BR + temperatura/ícone via `useLocalWeather` (Open-Meteo)

### Layout (grid responsivo)

```txt
[Coluna esquerda lg:col-span-3]     [Coluna direita lg:col-span-9]
  BusinessHeader                      MetricCards | RevenueAnalytics
  GymCapacity                         Personal Trainer | FavouritedWorkout
                                      MembersTable (full width abaixo)
```

### Subcomponentes

| Componente | GlassPanel | Descrição |
|---|---|---|
| `BusinessHeader` | não | título + botões ação (sem glass manual) |
| `GymCapacity` | subtle/floating | matriz de dots + Space Status |
| `MetricCards` | 4× subtle/floating | KPIs 2×2 — tipografia via `glassTextStyles.kpiValue` / `kpiLabel` |
| `StatsOverviewExact` | subtle/floating | cards de estatísticas — tokens glass migrados |
| `RevenueAnalytics` | subtle/floating | gráfico barras; tooltip Apr usa `elevation="modal"` |
| `TrainerCards` | 2× subtle/floating | cards King Zarips |
| `FavouritedWorkout` | subtle/floating | tags scatter + tabs |
| `MembersTable` | via Table | tabela mock do dashboard (demonstração visual) |

### Regras do dashboard

- **Nunca** usar `bg-white/5 backdrop-blur-md` manual nos cards — sempre `<GlassPanel>`
- Cards internos: preferir `variant="subtle"`, `intensity="low"`, `elevation="floating"`
- `CenterPanelShell` tem scroll vertical (`overflow-y-auto`) — conteúdo longo rola dentro do painel
- `DashboardContent` **não** usa `h-full` — altura vem do conteúdo para o scroll funcionar

## Gestão de Usuários (`/users`)

Padrão visual e arquitetural espelhado em `/members`:

- Header + botão "Novo Usuário" (`GlassButton`) → modal `UserForm`
- `Table` com busca textual padrão (`searchPlaceholder`)
- Menu de ações por linha via `<RowActionsMenu>`: Editar, Desativar/Reativar, Remover
- Confirmação de remoção via `<ConfirmRemoveDialog>`
- Avatar: `UserAvatar` + `AvatarUploadTrigger` (compress → Storage `avatars`; fallback iniciais estilo Google)
- **Dados reais:** Supabase Auth via `listUsersAction` (`users/actions.ts`)
- **Lógica client:** `useUsersManagement.ts` (estado, mutations, refresh de sessão)

## Gestão de Alunos (`/members`)

**Fonte de dados:** Supabase `public.members` — integração real, sem mocks.

### Arquitetura server + client

```txt
members/page.tsx
  └─ MembersContent.tsx (RSC)
       ├─ getMembersAction()          → ActionResult<ManagedMember[]>
       └─ MembersContentClient.tsx (client)
            ├─ useMembersManagement.ts → estado, toggle, delete, form
            ├─ Table + GlobalFilters
            ├─ MemberRegistrationForm  → createMemberAction / updateMemberAction
            ├─ RowActionsMenu          → menu ⋮ por linha
            └─ ConfirmRemoveDialog     → deleteMemberAction
```

### Server Actions (`members/actions.ts`)

Todas retornam `ActionResult<T>` com `try/catch` e validação Zod (`member.schema.ts`):

- `getMembersAction()` → `ActionResult<ManagedMember[]>`
- `createMemberAction(formValues)` → `ActionResult<ManagedMember>`
- `updateMemberAction(id, formValues)` → `ActionResult<ManagedMember>`
- `updateMemberStatusAction(id, isActive)` → `ActionResult<ManagedMember>`
- `deleteMemberAction(id)` → `ActionResult`

Script auxiliar para popular dados: `npm run seed:members`

### Filtros da tabela (`GlobalFilters`)

Configurados em `MembersContentClient` via prop `filters`:

| Filtro | Tipo | Comportamento |
|---|---|---|
| Busca | `text` | nome, e-mail, CPF (colunas com `searchValue`) |
| Status | `select` | match exato em `member.status` |
| Nascimento | `date` | match em ISO via `parseBirthDateToIso(member.birthDate)` |

### Colunas

Aluno (avatar + nome/e-mail), CPF, Origem, Plano, Status, ações (menu ⋮)

### Formulário (`MemberRegistrationForm`)

Grid `md:grid-cols-2`:

- Avatar (drop/upload + iniciais)
- Nome, e-mail, CPF (máscara), data nascimento (máscara DD/MM/AAAA)
- Origem: Academia / Gympass / TotalPass
- Plano: Mensal Base / Trimestral Premium / Anual Pro
- Toggle iOS (`GlassSwitch`) para status Ativo/Inativo
- Submit via `GlassButton`; modais usam `ModalOverlay` + `ModalPanel` (glass on glass)

## Gestão de Classes e Agendamentos (`/classes/[slug]`)

Módulo com dados reais do Supabase. A modalidade é identificada por slug derivado de `classes.name` via `src/lib/class-slug.ts`; não criar páginas estáticas por modalidade.

### Modelagem de dados

| Tabela | Campos e constraints relevantes | Relações |
|---|---|---|
| `classes` | `id`, `name` único, `description` | Uma modalidade possui vários horários em `gym_settings_schedule`. |
| `professionals` | `id`, dados cadastrais, `status`, `specialty` obrigatório | `specialty` é uma modalidade permitida (`Musculação`, `Dança`, `Yoga`, `Spinning`, `Jump`, `Pilates`, `Crossfit`, `TRX`). Um profissional pode ministrar vários horários. |
| `gym_settings_schedule` | `id`, `class_id`, `day_of_week` (`0=domingo…6=sábado`), `start_time`, `professional_id`, `max_capacity` > 0; unique (`class_id`, `day_of_week`, `start_time`) | `class_id → classes.id` (`ON DELETE CASCADE`); `professional_id → professionals.id` (`ON DELETE RESTRICT`). Define a grade fixa, professor e capacidade de cada slot. |
| `appointments` | `id`, `member_id`, `schedule_id`, `date`, `status`, `created_at`; unique (`member_id`, `schedule_id`, `date`) | `member_id → members.id` e `schedule_id → gym_settings_schedule.id`, ambos com `ON DELETE CASCADE`. Representa a reserva de um aluno em uma ocorrência da grade. |

Schema principal: `supabase/classes.sql`. Para bases existentes, executar `supabase/schedule-professionals-integration.sql` depois de `professionals.sql` e `classes.sql`.

`appointments.status` no schema base aceita `CONFIRMED` e `CANCELLED`. A migration opcional `supabase/appointments-pending-status.sql` adiciona `PENDING` (aguardando); qualquer mudança de status deve também atualizar os tipos e filtros do domínio.

### Integridade, capacidade e agendamento

1. A UI obtém slots válidos por data através de `getClassScheduleSlotsAction(classId, date)`. O dia da data precisa corresponder a `gym_settings_schedule.day_of_week`.
2. Antes do insert, `createAppointment()` chama a função SQL `get_class_slots(date, schedule_id)`. Só confirma se `remaining_slots > 0`.
3. O trigger `appointments_capacity_check` chama `enforce_appointment_capacity()` no banco antes de inserts `CONFIRMED`. Portanto, a capacidade é protegida também contra requisições concorrentes.
4. A constraint única de `appointments` impede que o mesmo aluno reserve o mesmo horário na mesma data duas vezes.
5. Exclusões usam `deleteAppointmentAction()`, que valida que o agendamento pertence à modalidade indicada pelo slug antes do delete. Ao remover uma reserva confirmada, a vaga volta a ficar disponível.

Responsabilidades técnicas:

```txt
classes/[slug]/page.tsx
  └─ ClassScheduleContent.tsx (RSC: modalidade + grade + agenda inicial)
       └─ ClassScheduleContentClient.tsx
            ├─ useClassSchedule.ts (período e refetch)
            ├─ AgendaDateFilter.tsx
            ├─ ClassGradeTooltip.tsx
            └─ ScheduleModalProvider → ScheduleModal.tsx

classes/actions.ts
  └─ class-manager.ts
       └─ Supabase: classes / gym_settings_schedule / appointments / get_class_slots
```

### Componentes e comportamento de UI

| Componente | Responsabilidade e regra |
|---|---|
| `ScheduleModalProvider` | Disponibiliza um único modal para o app por `useScheduleModal()`. Recebe `classes` e membros em `ClassesAppProviders`; o modal filtra os alunos ativos antes de exibir o Select. |
| `ScheduleModal` | Formulário de reserva. Carrega dias e slots da grade, bloqueia dias sem grade e horários esgotados; exibe estados de validação e confirmação. |
| `AgendaDateFilter` | Controle de período `day`, `week` e `month`, com navegação anterior/próxima e retorno a Hoje. Atualiza a consulta da agenda. |
| `ClassScheduleContentClient` | No modo Dia mantém a coluna Data. Nos modos Semana/Mês remove a coluna Data e agrupa linhas por dia através de `Table.groupBy`. |
| `ClassGradeTooltip` | Ícone de calendário à esquerda de **Agendar**; abre popover com a grade da modalidade. |
| `ClassesSidebarSection` | Busca `listClassesNavAction()`, mostra até três modalidades inicialmente e expande/recolhe via **Show More/Show Less**. Links sempre usam `/classes/[slug]`. |

#### Estados do `ScheduleModal`

| Estado | Como abrir | Comportamento |
|---|---|---|
| Global | `openScheduleModal({ defaultClassId: null })` | Select de modalidade habilitado; o usuário escolhe a aula antes de carregar os slots. |
| Por classe | `openScheduleModal({ defaultClassId: classRecord.id, slug })` | Modal pré-seleciona e bloqueia o Select de modalidade; reserva somente na classe da página atual. |

### Regras de negócio obrigatórias

- Profissional ativo só pode ser associado a um horário cuja modalidade corresponda à sua `specialty`.
- Essa compatibilidade é validada no servidor por `validateProfessionalForClass()` em `settings/classes/actions.ts`, usando `specialtyMatchesClass()`. Não depender apenas do filtro visual do formulário.
- O banco mantém a FK `gym_settings_schedule.professional_id`, mas a igualdade entre `professionals.specialty` e `classes.name` é uma regra de aplicação; preservá-la em qualquer nova mutation ou importação.
- `professional_id` é obrigatório na grade; o campo legado `instructor_name` foi removido pela migration de integração.
- Sempre chamar `revalidatePath("/classes")` e a rota da modalidade após mutations que alterem agenda, grade ou contadores da navegação.

## Financeiro (`/finance`)

**Fonte de dados:** Supabase real — `financial_transactions`, `financial_categories` e RPCs de balanço (`financial_balance_today` / `_month` / `_year`). Schema: `supabase/financial-transactions.sql`, `financial-categories.sql`, `financial-reports.sql`, `plans.sql`.

Paleta **laranja/âmbar** obrigatória — ver `brand-colors.ts` e `.cursor/rules/design-system-colors.mdc`.

### Arquitetura server + client

```txt
finance/page.tsx
  └─ FinanceContent.tsx (RSC)
       ├─ getFinanceDashboardAction(period)  → resumo + movimentos + despesas + transações
       └─ FinanceContentClient.tsx (client)
            ├─ FinanceHeader / PortfolioSummaryCard / FinancialOverviewChart
            ├─ FinancialHealthCard / ExpenseBreakdownCard
            ├─ Table + financial-transactions.columns.tsx
            ├─ useFinancialTransactions.ts → listagem / delete
            └─ TransactionForm → createTransactionAction / updateTransactionAction
```

### Server Actions (`finance/actions.ts`)

| Action | Operação |
|---|---|
| `getFinanceSummaryAction` | Saldos (hoje / mês / ano) via RPCs |
| `getFinanceMovementsAction` | Movimentos diários no período |
| `getFinanceExpensesByCategoryAction` | Despesas agrupadas por categoria |
| `getFinancialTransactionsAction` | Lista de transações |
| `getFinanceDashboardAction` | Agrega as leituras acima |
| `createTransactionAction` | Insert com validação Zod (`transaction.schema.ts`) |
| `updateTransactionAction` | Update por id |
| `deleteTransactionAction` | Remove por id |

Categorias: CRUD em `settings/categories/actions.ts`. Colunas canônicas da tabela: `src/components/finance/financial-transactions/financial-transactions.columns.tsx`.

| Componente | Descrição |
|---|---|
| `FinanceHeader` | título + filtros de período + CTAs gradiente laranja |
| `PortfolioSummaryCard` | resumo de saldos (dados reais) |
| `FinancialOverviewChart` | gráfico de movimentos |
| `FinancialHealthCard` | barras de saúde financeira |
| `ExpenseBreakdownCard` | doughnut + legenda de despesas por categoria |
| `TransactionForm` | create/edit de transação |

Layout: coluna esquerda ~70% (portfolio + chart), direita ~30% (health + breakdown), tabela de transações abaixo. Todos os cards usam `GlassPanel` — **nunca roxo/ciano como destaque principal**.

## Agenda Colaborativa (`/agenda`)

**Fonte de dados:** Supabase `events` + `event_participants`. Schema: `supabase/collaborative-agenda.sql`. Seed: `npm run seed:agenda`.

### Arquitetura server + client

```txt
agenda/page.tsx
  └─ AgendaContent.tsx (RSC)
       ├─ listAgendaEventsAction(start, end)
       ├─ getAgendaUserOptionsAction()   → usuários Auth (Admin API)
       └─ AgendaContentClient.tsx (client)
            ├─ useCollaborativeAgenda.ts
            ├─ CollaborativeCalendar / EventCard / AvatarStack
            ├─ EventModal / EventDetailModal / GlassMultiSelect
            └─ createAgendaEventAction / deleteAgendaEventAction
```

### Server Actions (`agenda/actions.ts`)

| Action | Operação |
|---|---|
| `getAgendaUserOptionsAction` | Opções de participantes (Auth Admin API) |
| `listAgendaEventsAction` | Eventos no intervalo + participantes |
| `createAgendaEventAction` | Cria evento + vínculos em `event_participants` |
| `deleteAgendaEventAction` | Remove evento |
| `getAgendaSidebarDataAction` | Dados do próximo evento para a sidebar do dashboard |

Validação via `event.schema.ts`. Evento browser `AGENDA_CHANGED_EVENT` (`agenda-events.ts`) notifica a right sidebar para refetch.

### Integração com o dashboard

`DashboardRightSidebar` / `UpNextCard` consomem `getAgendaSidebarDataAction` (dados reais, não mock). Empty state aponta para `/agenda`.

## Avatars (Storage)

Pipeline para evitar `user_metadata` com base64 enorme (risco de HTTP 431):

1. **Client:** `AvatarUploadTrigger` → `compressImageDataUrl` (`lib/image/compress-image-data-url.ts`) — resize ≤256px, JPEG q≈0.82
2. **Server:** `resolveUserAvatarForMetadata` (`lib/avatars/resolve-user-avatar.ts`) — se for data URL, faz upload no bucket `avatars` (`users/{userId}.{ext}`) e grava **apenas URL http(s)** no metadata
3. **SQL:** `supabase/avatars-storage.sql` — bucket público + policy de leitura
4. **Manutenção:** `npm run fix:avatars` — remove avatars base64 oversized de usuários existentes

Usado em create/update de usuários (`users/actions.ts`). Helpers de display: `resolveAvatarUrl` em `lib/auth/resolve-user-display.ts`.

## Componentes Compartilhados

### `Table<T>` (`common/table/Table.tsx`)

Componente principal de listagem. Estrutura em **dois blocos**:

```txt
[ GlobalFilters ]     ← acima, fora do GlassPanel da tabela
[ GlassPanel ]
    título (opcional)
    thead fixo + tbody scrollável
    TableFooter (paginação + itens por página)
```

**Props principais:** `data`, `columns`, `getRowId`, `title`, `filters`, `filterValues`, `onFilterChange`, `headerActions`, `filterAccessory`, `groupBy`, `rowClassName`, `defaultPageSize`, `pageSizeOptions`

**Filtros (`filters?: TableFilterDefinition<T>[]`):**

| Tipo | Uso |
|---|---|
| `text` | busca parcial nas colunas com `searchValue` |
| `select` | match exato via `match(row)` |
| `date` | match exato em ISO (`YYYY-MM-DD`) via `match(row)` |

Filtros ativos combinam com **AND**. Sem `filters`, usa busca textual padrão (`searchPlaceholder`).

**Exemplo de configuração de filtros:**

```tsx
const filters: TableFilterDefinition<ManagedMember>[] = [
  { type: "text", key: "search", placeholder: "Buscar..." },
  {
    type: "select",
    key: "status",
    placeholder: "Status",
    options: [{ value: "active", label: "Ativo" }],
    match: (row) => row.status,
  },
  {
    type: "date",
    key: "birthDate",
    match: (row) => parseBirthDateToIso(row.birthDate) ?? "",
  },
];

<Table data={rows} columns={columns} filters={filters} ... />
```

**Coluna (`TableColumn<T>`):** `key`, `header`, `render`, `searchValue?`, `width?`, `className?`

**Tipografia padrão (via `glassTextStyles`):** título `panelTitle`, cabeçalhos `tableHeader`, células `tableCell`, empty state `tableEmpty`.

**Subcomponentes:** `TableHead`, `TableFooter`, `TableColGroup`, `GlobalFilters`

`groupBy` é opcional e recebe `key(row)` + `renderHeader(key)`. Ele insere um cabeçalho de seção no `tbody`; é usado pela agenda de Classes para separar Semana/Mês por dia sem repetir a coluna Data.

### `GlobalFilters<T>` (`common/table/GlobalFilters.tsx`)

Barra de filtros **colapsável** (estado inicial: fechada), renderizada **acima** do `GlassPanel` da tabela.

- Wrapper: `GlassPanel elevation="floating"` (só a barra de filtros, não a tabela)
- Cabeçalho: "Filtrar por" + badge de filtros ativos + chevron expand/collapse
- Expandido: `GlassInput` / `GlassSelect` / `DatePicker` + botão "Limpar filtros" (`GlassButton`)
- Colapsado com filtros ativos: botão compacto "Limpar"

Tipos em `global-filters.types.ts`.

### `RowActionsMenu` (`common/menu/RowActionsMenu.tsx`)

Menu dropdown de ações por linha (ícone ⋮). Reutilizado em `/members` e `/users`.

- Container: `GlassPanel elevation="popover"` (frost denso + underlay quente — legível sobre background dourado)
- Ações padrão: `glassText.primaryElevated` + hover `bg-white/10`
- Trigger (⋮): `text-glass-secondary` → hover `text-glass-primary`
- Ação destrutiva: `text-red-300` + hover `bg-red-500/12`

### `ModalOverlay` + `ModalPanel` (glass on glass)

Padrão obrigatório para modais de formulário e confirmação — **sem preto sólido**.

**Camada 1 — `ModalOverlay`:** scrim marrom-escuro translúcido (`rgba(15,10,5,0.45)`) + `backdrop-blur-[16px]` + `backdrop-saturate-[1.6]`. Funde com o fundo âmbar sem preto sólido.

**Camada 2 — `ModalPanel`:** wrapper sobre `GlassPanel elevation="modal"` com frost blindado (`bg-white/[0.16]`, blur `32px`, saturate `2`), `rounded-3xl` e `intensity="high"`. Aplica `text-glass-secondary` como cor base do painel.

```tsx
<ModalOverlay scrollable>
  <ModalPanel className="w-full max-w-2xl">
    <p className={glassTextStyles.modalTitle}>Título</p>
    <p className={glassTextStyles.modalSubtitle}>Descrição de apoio</p>
    {/* conteúdo */}
  </ModalPanel>
</ModalOverlay>
```

**Tipografia em modais:** usar `glassTextStyles.modalTitle` / `modalSubtitle` ou `glassText.primaryElevated` / `secondaryElevated` (inclui `font-medium` para compensar blur denso). Evitar `text-white/XX` hardcoded.

### `ConfirmRemoveDialog` (`common/modal/ConfirmRemoveDialog.tsx`)

Modal de confirmação de remoção com `ModalOverlay` + `ModalPanel`. Props: `title`, `subjectName`, `pending`, `onConfirm`, `onCancel`.

### `InlineAlert` (`common/feedback/InlineAlert.tsx`)

Banner de erro/aviso reutilizável (`role="alert"`, estilo orange). Usado em formulários e listagens.

### `DatePicker` (`common/date-picker/DatePicker.tsx`)

Seletor de data com aparência de input pill:

- Placeholder: `dd / mm / aaaa`
- Ícone calendário à direita
- Valor interno: ISO `YYYY-MM-DD` (input nativo `type="date"`)
- Estilos via `form.styles.ts` (`tone="muted"` padrão)

### Design system de formulários

Barrel: `common/form/index.ts`

| Componente | Uso |
|---|---|
| `GlassInput` | inputs de texto com ícone opcional |
| `GlassSelect` | select nativo estilizado |
| `Button` | **fonte da verdade** — primary / glass / ghost / danger + sizes + loading + ícones |
| `GlassButton` | alias legado → `Button variant="glass"` (mantém `href`) |
| `GhostButton` | alias legado → `Button variant="ghost"` |
| `DangerButton` | alias legado → `Button variant="danger"` |
| `IconButton` | alias → `Button iconOnly` (sempre com `aria-label`) |
| `FormField` | label + erro + children (labels: `text-glass-secondary`, hints: `text-glass-muted`) |
| `GlassSwitch` | toggle iOS |
| `ModalOverlay` | scrim glass (camada 1) — blur + tint âmbar |
| `ModalPanel` | painel modal legível (camada 2) — wrapper GlassPanel modal + base `text-glass-secondary` |

Tokens compartilhados: `form.styles.ts` (`inputToneClasses`, `inputSizeClasses`, etc.)

**Inputs:** `GlassInput` usa `text-glass-primary` + `placeholder:text-glass-placeholder`; ícones à esquerda usam `text-glass-tertiary`.

### `Button` (`common/button/Button.tsx`)

Componente canônico Liquid Glass (CVA + framer-motion):

- Variants: `primary` (laranja), `glass`, `ghost`, `danger`
- Sizes: `sm` | `md` | `lg` — sempre pill (`rounded-full`)
- Props: `isLoading`, `leftIcon`, `rightIcon`, `iconOnly`, `fullWidth`
- Micro-interação: scale `1.02` hover / `0.98` press
- Barrel: `common/button/index.ts` e reexport em `common/form`

### `GlassButton` (`common/button/GlassButton.tsx`)

Alias de `Button variant="glass"` (compat):

- Variants legadas: `subtle`, `default`, `strong` (ajuste fino de opacidade)
- Shapes: `rounded`, `pill`
- Props: `loading` / `isLoading`, `fullWidth`, `leftIcon`, `rightIcon`, `href` (link)

### `GlassPanel` (`common/glass-panel/GlassPanel.tsx`)

Ver seção Glassmorphism abaixo.

### `UserAvatar` + `user.helpers.ts`

- Reutilizado em `/users`, `/members` e `NavUserMenu`
- `getInitials(name)` → "JF"
- `getAvatarColor(name)` → cor determinística estilo Google Workspace

## NavUserMenu (sidebar)

Arquivo: `src/components/app/NavUserMenu.tsx`

- Posição: final do `LeftSidebarPanel` (substitui link "Profile" estático)
- Pill: `GlassPanel elevation="floating"`
- Menu expandido: `GlassPanel elevation="popover"` — **no fluxo do documento** (empurra itens acima, sem overlay absoluto entre camadas)
- Texto do menu: `glassText.primaryElevated` + hover `bg-white/10`
- Ações: Meu perfil (`/profile`), Sair (`signOut` → `/login`)
- Lê sessão via `supabase.auth.getUser()` + `onAuthStateChange`

## Background do Sistema

Arquivo: `src/components/landing/hero/HeroBackground.tsx`  
Config: `src/components/landing/hero/data/hero-scene.mock.ts` (`sceneBackground.image = "/system-background.png"`)

- Renderizado **uma vez** no `RootLayout` (`fixed inset-0 z-0`)
- Imagem estática em `public/system-background.png`
- Overlays escuros removidos — apenas glow âmbar sutil opcional
- **Nunca** usar `-z-10` no background nem `bg-[#070806]` sólido em `main`/`body` (esconde a imagem)

## Root Layout e Viewport Mobile

Arquivo: `src/app/layout.tsx`

- Exporta `viewport` com `viewportFit: "cover"` (safe areas em dispositivos com notch)
- Renderiza `<HeroBackground />` global (`fixed inset-0 z-0`) antes do conteúdo (`relative z-10`)
- **Mobile (`< lg`):** `html` e `body` com `h-dvh overflow-hidden` — trava o viewport, sem scroll na página
- **Desktop (`>= lg`):** comportamento normal (`lg:h-full`, `lg:overflow-auto`)
- `body` usa **flex column** no mobile:
  - área de conteúdo: `flex-1 min-h-0 overflow-hidden`
  - `MobileBottomNav`: `shrink-0` no fluxo do documento (não é mais `fixed`)
  - gap entre conteúdo e navbar: `gap-[var(--mobile-nav-content-gap)]`

### Variáveis CSS mobile (`globals.css`)

```css
--background: transparent;
--foreground: #f7f7f2;
--mobile-content-top-gap: 1.5rem;
--mobile-nav-bottom-gap: 1.5rem;
--mobile-nav-content-gap: 1.5rem;
--mobile-nav-bar-height: 4.75rem;
--mobile-nav-reserved-height: calc(...);

/* Tipografia glass (Tailwind v4 @theme) */
--color-glass-primary: #ffffff;
--color-glass-secondary: rgb(255 255 255 / 0.63);
--color-glass-tertiary: rgb(255 255 255 / 0.47);
--color-glass-muted: rgb(255 255 255 / 0.47);
--color-glass-placeholder: rgb(255 255 255 / 0.45);
```

Utility opcional: `text-glass-contrast-shadow` — sombra sutil para texto primary em vidro muito claro (usar com parcimônia).

Constantes TypeScript: `src/config/glass-typography.ts` (`glassText`, `glassTextStyles`).

`html` e `body` usam `background: transparent` — o fundo visual vem exclusivamente de `HeroBackground`.

## Layout Mobile (`MobilePageWrapper`)

Arquivo: `src/components/mobile/MobilePageWrapper.tsx`

- ocupa `h-full` do wrapper flex-1 do root layout
- background vem do `HeroBackground` global (não renderiza fundo próprio)
- `GlassPanel` variant `hero`, intensity `high`, elevation `base`
- **scroll apenas dentro** do painel glass
- sem perspectiva 3D, sem painéis laterais

**Não** adicionar `pb-32` ou `min-h-svh` extras no mobile — quebra o viewport lock.

## Layout Desktop (`DesktopAppShell`)

Arquivo: `src/components/app/DesktopAppShell.tsx`

- visível apenas em `>= lg`
- reutiliza `LeftSidebarPanel`, `RightProfilePanel` (background global via root layout)
- painel central: `CenterPanelShell` com `{children}` da rota ativa
- `key={pathname}` no painel central para re-animar transição de rota
- `useHydrated()` evita flash de animação no SSR

## Painéis Da Cena

### CenterPanelShell

- wrapper padrão do painel central em todas as rotas
- `GlassPanel` variant `hero`, intensity `high`, elevation `base`
- desktop: `lg:h-[clamp(600px,85vh,880px)]`, `lg:w-[clamp(500px,52vw,1000px)]`
- **scroll vertical sempre ativo** (`overflow-y-auto`) — desktop e mobile

### LeftSidebarPanel

- menu lateral glass inline (sem `GlassPanel` no container externo)
- itens de `app-nav.config.ts`
- `NavUserMenu` no rodapé da nav (logout + perfil)

### RightProfilePanel

- perfil, calendário e challenges
- placa glass inline, perspectiva `rotateY(-60deg)`

### FrontFloatingModal

Status: **componente pronto, não renderizado**. Ao reativar, usar `elevation="floating"` ou `"modal"`.

## Glassmorphism — Liquid Glass (visionOS)

Componente base: `src/components/common/glass-panel/GlassPanel.tsx`

### Props

| Prop | Valores | Default |
|---|---|---|
| `variant` | `subtle`, `default`, `strong`, `hero` | `default` |
| `intensity` | `low`, `medium`, `high` | `medium` |
| `elevation` | `base`, `floating`, `popover`, `modal`, `solid` | `base` |

### Iluminação (preservada em todas as elevações)

- **Rim light (HIG):** borda `rgba(255,255,255,0.08)` + highlight superior `inset 0 1px 0` (opacidade por elevation)
- `before:` — reflexo specular via `--glass-shine` (`intensity` controla a intensidade)
- `after:` — underlay quente em `popover` (`after:bg-amber-500/[0.015]`)
- `variant` — só ajusta opacidade do sheen (`before:opacity-*`); **não** define blur/corpo
- Utilities espelhadas em `globals.css`: `glass-rim`, `glass-material-*`, `glass-modal-scrim`, `glass-control-recessed`
- **Não sobrescrever** bordas/reflexos com `className` agressivo no GlassPanel

### Física de empilhamento (`elevation`)

Regra Liquid Glass: camadas superiores ganham **mais opacidade/contraste**; blur permanece controlado (não somar blurs cegamente). Todo `backdrop-blur` leva `backdrop-saturate` para o âmbar não “morrer” cinza.

| Elevation | Uso | Blur | Saturate | Corpo | Sombra |
|---|---|---|---|---|---|
| `base` | shells, painel principal | `20px` | `1.6` | `bg-white/[0.03]` | inset top `0.1` + `0 4px 30px` |
| `floating` | cards internos, pills, chrome de tabela | `12px` | `1.4` | `bg-white/[0.08]` + borda `white/8` | inset top `0.16` |
| `popover` | selects, menus ⋮, tooltips | `24px` | `1.8` | `bg-white/[0.14]` + warm underlay | inset top `0.2` + drop suave |
| `modal` | painel sobre `ModalOverlay` | `32px` | `2.0` | `bg-white/[0.16]` | inset `0 1px 1px` + drop profundo |
| `solid` | fallback opaco (raro; preferir `popover`) | nenhum | — | `#8B6F4E` | shine + drop curto |

### Glass on glass — modais

1. `ModalOverlay` — scrim `rgba(15,10,5,0.45)` + `backdrop-blur-[16px]` + `backdrop-saturate-[1.6]` (camada 1)
2. `ModalPanel` / `GlassPanel elevation="modal"` — frost blindado (camada 2), `rounded-3xl`
3. Tipografia via `glassText` / `glassTextStyles` — ver seção **Tipografia Glass-on-Glass**

### Controles de formulário (recessivo → elevado)

- Idle: `bg-black/[0.12] border-white/[0.06]` (`form.styles` / `glass-control-recessed`)
- Focus: `bg-white/[0.08] border-orange-500/50 ring-2 ring-orange-500/20`
- Ícones decorativos: `text-glass-tertiary`
- Dropdown aberto: `GlassPanel elevation="popover"`

### Tipografia Glass-on-Glass

Sistema padronizado para legibilidade em composições glass sobre glass (especialmente sobre background dourado/âmbar de alta luminosidade).

**Arquivos:** `src/app/globals.css` (`@theme` + utility `text-glass-contrast-shadow`), `src/config/glass-typography.ts`, `src/config/theme.ts` (`glass.text`).

| Nível | Classe Tailwind | Valor | Uso |
|---|---|---|---|
| **Primary** | `text-glass-primary` | `#ffffff` | Títulos, valores principais, KPIs |
| **Secondary** | `text-glass-secondary` | `white/63` | Labels, descrições, células de tabela, corpo de modal |
| **Tertiary** | `text-glass-tertiary` | `white/47` | Cabeçalhos de tabela (uppercase), ícones decorativos |
| **Muted** | `text-glass-muted` | `white/47` | Hints, empty states, footer de paginação |
| **Placeholder** | `text-glass-placeholder` / `placeholder:text-glass-placeholder` | `white/45` | Placeholders de inputs |

**Variantes elevadas** (popover/modal — vidro mais denso, blur maior):

| Classe | Comportamento |
|---|---|
| `glassText.primaryElevated` | `text-glass-primary font-medium` |
| `glassText.secondaryElevated` | `text-glass-secondary font-medium` |

**Padrões compostos** (`glassTextStyles`):

| Constante | Uso |
|---|---|
| `modalTitle` | Título de modal (`text-sm font-semibold`) |
| `modalSubtitle` | Subtítulo de modal (`mt-1 text-[11px]`) |
| `panelTitle` | Título de painel/tabela |
| `tableHeader` | Cabeçalho de coluna |
| `tableCell` | Célula de dados |
| `tableEmpty` | Mensagem de lista vazia |
| `kpiValue` / `kpiLabel` | Cards de métricas do dashboard |
| `pageTitle` / `pageSubtitle` | Cabeçalhos de páginas CRUD |
| `entityName` / `entityEmail` | Identidade em células de tabela |
| `badge` | Badges de role/status em tabelas |

**Uso recomendado:**

```tsx
import { glassText, glassTextStyles } from "@/config/glass-typography";

<p className={glassTextStyles.kpiValue}>$4,53k</p>
<p className={glassTextStyles.kpiLabel}>Month / July</p>
<p className={glassTextStyles.modalTitle}>Cadastrar aluno</p>
```

**Regras:**

- **Evitar** `text-white/35`, `text-white/40`, `text-white/48` etc. hardcoded — usar tokens semânticos
- Em modais/popovers: preferir variantes `*Elevated` para compensar frost denso
- `text-glass-contrast-shadow` apenas quando primary ainda falha em vidro muito claro (raro após `backdrop-brightness`)
- Componentes já migrados: **todo o `src/`** — design system (`GhostButton`, `IconButton`, `GlassButton`, `GlassSelect`, `DatePicker`, `FormField`, `GlassInput`), CRUD (`UsersContent`, `MembersContentClient`, `ProfessionalsContentClient`), `NavUserMenu`, `Table` (+ Head/Footer/GlobalFilters), dashboard/*, finance/*, auth/login, profile, landing

**Migração concluída (mar/2026):** todo o `src/` usa tokens `glassText` / `glassTextStyles`. Exceções intencionais: `text-white` na raiz (`layout.tsx`, shells) como cor base herdada; textos escuros em pills coloridos (`text-[#0a0a0a]`, `text-[#1a1d19]`).

### Regra crítica para cards internos

`DashboardContent`, `/users`, `/members`, `/finance` e `/agenda` renderizam-se **dentro** de `CenterPanelShell` (já glass `hero/base`).

- Cards da UI: `<GlassPanel variant="subtle" elevation="floating">`
- Menus dropdown (⋮): `elevation="popover"` via `RowActionsMenu`
- Modais/formulários: `ModalOverlay` + `ModalPanel` (não usar `bg-[#13111f]/94` nem `bg-black/*` sólido)
- **Proibido:** `bg-white/5 backdrop-blur-md` manual em cards — causa blur composto

### Glass sobre glass no fluxo (NavUserMenu)

Quando o menu expande **empurrando** itens da sidebar (sem overlay absoluto):

1. Pill do usuário → `elevation="floating"`
2. Menu de ações → `elevation="popover"` (legível sobre background dourado)

## Hooks

| Hook | Arquivo | Uso |
|---|---|---|
| `useHydrated` | `hooks/useHydrated.ts` | `useSyncExternalStore` — false no SSR, true no client |
| `useLocalWeather` | `hooks/useLocalWeather.ts` | GPS → IP → São Paulo; Open-Meteo; refresh 30min |
| `usePrefersReducedMotion` | `hooks/usePrefersReducedMotion.ts` | disponível, não integrado na hero |
| `useFinancialTransactions` | `hooks/useFinancialTransactions.ts` | listagem/delete de transações financeiras |
| `useCollaborativeAgenda` | `hooks/useCollaborativeAgenda.ts` | refetch de eventos da agenda |
| `useMembersManagement` | `members/useMembersManagement.ts` | estado CRUD de alunos (client) |
| `useUsersManagement` | `users/useUsersManagement.ts` | estado CRUD de usuários (client) |
| `useProfessionalsManagement` | `professionals/useProfessionalsManagement.ts` | estado CRUD de profissionais |
| `useLoginForm` | `auth/useLoginForm.ts` | autenticação client com Zod |

## Dados Mockados (Escopo Limitado)

O projeto **prioriza integração real com API**. Mocks permanecem apenas em:

| Área | Arquivo | Escopo |
|---|---|---|
| Hero scene (legado) | `landing/hero/data/hero-scene.mock.ts` | path da imagem de background; demais mocks da landing legada |
| Dashboard KPIs / demos | componentes em `dashboard/*` | `MembersTable`, `MetricCards`, `RevenueAnalytics`, etc. (exceto right sidebar / UpNext) |

**Rotas com dados reais (Supabase):**

| Rota | Fonte |
|---|---|
| `/members` | `public.members` via Server Actions |
| `/users` | Supabase Auth via Admin API |
| `/professionals` | `public.professionals` via Server Actions |
| `/classes/[slug]` | `classes`, `gym_settings_schedule`, `appointments` |
| `/finance` | `financial_transactions`, `financial_categories`, RPCs de balanço |
| `/agenda` | `events`, `event_participants` |
| `/settings/categories` | categorias financeiras |
| `/login` | Supabase Auth (signInWithPassword) |
| `/dashboard` (nome + UpNext) | `user.user_metadata` + `getAgendaSidebarDataAction` |

## Direção Visual Obrigatória

### Paleta da marca

Tokens centralizados em `src/config/brand-colors.ts`. Regra Cursor: `.cursor/rules/design-system-colors.mdc`.

| Papel | Tons |
|---|---|
| Primary | `#FF7A00` / `orange-500` → `orange-600` |
| Secondary | `#FFB300` / `amber-500` |
| Deep accent | `#FF4D3D` / `orange-700` |
| CTAs / botões principais | gradiente laranja (`from-orange-500 to-orange-600`) |
| Erros / perdas | `#FF5E4A` ou `red-500` — **nunca roxo** |

Dashboards (`/dashboard`, `/finance`): gráficos, highlights e badges seguem laranja/âmbar.

Manter:

- composição centralizada, painéis glass, **background dourado visível** através das camadas
- perspectiva 3D controlada (desktop), motion sequencial premium
- mobile: painel central legível + nav inferior glass + viewport lock
- inputs: recessivos `bg-black/[0.12]` + `border-white/[0.06]`; focus eleva com rim laranja; texto `text-glass-primary`
- **hierarquia de texto glass:** `text-glass-primary` → `text-glass-secondary` → `text-glass-tertiary` / `text-glass-muted` (ver `glass-typography.ts`)

Evitar:

- headline gigante à esquerda, navbar horizontal no topo
- layout landing SaaS tradicional
- **fundos sólidos pretos** (`bg-black`, `bg-[#070806]`, `bg-[#13111f]/94`) — usar glass frost + underlay quente
- `backdrop-blur` manual em camadas sobre GlassPanel
- scroll na página mobile (body/html)
- botões coloridos sólidos onde o design system pede glass (`GlassButton`)
- roxo/rosa/ciano como destaque principal em dashboards
- **`text-white/XX` hardcoded** em superfícies glass — usar tokens `glassText` / `glassTextStyles`

## Responsividade — Resumo

| Breakpoint | Comportamento |
|---|---|
| `< lg` | `MobilePageWrapper` + scroll interno + `MobileBottomNav` |
| `>= lg` | `DesktopAppShell` — cena 3D com laterais em perspectiva |

## Checklist Para Futuras Alterações

### Design System

- [ ] Tabelas usam `Table` + `GlobalFilters` (não glass manual no container)?
- [ ] Filtros `select`/`date` têm `match(row)` correto?
- [ ] Cards internos usam `<GlassPanel>` (não glass manual)?
- [ ] Modais usam `ModalOverlay` + `ModalPanel` (glass on glass, sem preto sólido)?
- [ ] Dropdowns/menus usam `elevation="popover"` (ou `solid` quando precisar de base opaca)?
- [ ] Iluminação `before:`/`after:` preservada?
- [ ] Menus de ação usam `<RowActionsMenu>` (não duplicar dropdown)?
- [ ] Confirmações de remoção usam `<ConfirmRemoveDialog>`?
- [ ] Background global via `HeroBackground` no root layout (não duplicar nos shells)?
- [ ] Sem `bg-[#070806]` / `bg-black` sólido em fundos de página?
- [ ] Destaques visuais usam paleta laranja/âmbar (`brand-colors.ts`)?
- [ ] Texto em superfícies glass usa `glassText` / `glassTextStyles` (não `text-white/XX` hardcoded)?
- [ ] Modais/popovers usam variantes `*Elevated` quando o vidro é denso?

### Arquitetura e Código

- [ ] Identificadores em inglês, UI/erros em pt-BR?
- [ ] Nomenclatura de arquivos correta (PascalCase componentes, camelCase hooks, kebab-case lib)?
- [ ] Lógica de negócio extraída para Custom Hook ou Server Action (não no componente UI)?
- [ ] Server Actions com `try/catch`, Zod e `ActionResult<T>`?
- [ ] Zero `any` — tipagem estrita?
- [ ] Early returns em validações e guards?
- [ ] Nova rota adicionada em `app-nav.config.ts`?

### Supabase e Deploy

- [ ] CRUD admin usa `createAdminClient()` + service role (nunca `signUp` client)?
- [ ] Nome/role gravados em `user_metadata.name` / `user_metadata.role`?
- [ ] Avatar em metadata é URL http(s) (nunca data URL base64) — via `resolveUserAvatarForMetadata`?
- [ ] Mobile: scroll só no painel glass?
- [ ] `npm run lint` passa?
- [ ] `npm run build` passa?

## Prompt Base Para Usar No Futuro

```md
Estou trabalhando no projeto VitalFit Management.

Contexto: app premium autenticado (Supabase) em Next.js/React/Tailwind/Framer Motion.
Desktop = cena 3D com painéis glass; mobile = painel central + nav inferior.
Background = imagem dourada customizada (public/system-background.png) via HeroBackground no root layout.
Rota inicial: /dashboard. Login: /login.

Arquitetura:
- Auth: src/proxy.ts + lib/supabase/middleware.ts + LoginForm + user_metadata (name, role, avatar_url)
- Avatars: compress client → resolveUserAvatarForMetadata → Storage bucket `avatars` (URL pública no metadata)
- Background: HeroBackground em layout.tsx (fixed z-0); html/body transparentes
- Shell mobile: MobilePageWrapper | desktop: DesktopAppShell
- Painel central: CenterPanelShell (scroll interno)
- Dashboard: src/components/dashboard/* (KPIs mock; UpNext/right sidebar = agenda real)
- Financeiro: /finance — financial_transactions + categorias + RPCs; FinanceContent + useFinancialTransactions
- Agenda colaborativa: /agenda — events + event_participants; CollaborativeCalendar + useCollaborativeAgenda
- Usuários: /users (Super Admin) — Supabase Admin API + useUsersManagement
- Alunos: /members — Supabase public.members + useMembersManagement
- Classes: /classes/[slug] — classes, gym_settings_schedule, appointments; grade por professional_id
- Agendamento de aulas: ScheduleModal global ou por classe; capacidade via get_class_slots + trigger SQL
- Regra de grade: professionals.specialty deve coincidir com classes.name; validar com validateProfessionalForClass
- Server Actions: ActionResult<T> (lib/action-result.ts) + Zod (*.schema.ts)
- Tabela: src/components/common/table/Table.tsx
- Filtros: GlobalFilters (colapsável, acima do GlassPanel) + DatePicker
- Formulários: common/form/index.ts (GlassInput, GlassSelect, botões...)
- Modais: ModalOverlay (scrim) + ModalPanel (painel legível)
- UI compartilhada: RowActionsMenu (popover), ConfirmRemoveDialog, InlineAlert
- Glass: GlassPanel (elevations: base | floating | popover | modal | solid)
- Tipografia glass: src/config/glass-typography.ts (glassText, glassTextStyles) + tokens em globals.css
- Paleta: src/config/brand-colors.ts + .cursor/rules/design-system-colors.mdc
- Nav: main = Dashboard / Financeiro / Agenda; utility = Alunos / Profissionais / Usuários / Configurações (+ RBAC)

Regras de código:
- Identificadores em inglês; UI e erros em pt-BR
- Componentes PascalCase, hooks useCamelCase, lib kebab-case
- SoC: UI → hooks → Server Actions (sem lógica complexa em componentes)
- Early returns, tipagem estrita (zero any), ActionResult padronizado

Regras glass:
- NUNCA backdrop-blur manual nos cards internos
- NUNCA fundos pretos sólidos — usar frost branco + underlay quente translúcido
- Cards: GlassPanel variant subtle + elevation floating
- Modais: ModalOverlay + ModalPanel (glass on glass)
- Dropdowns/menus: elevation popover (ou solid se bleed-through); RowActionsMenu, NavUserMenu
- GlobalFilters: glass próprio acima da tabela; corpo da tabela em GlassPanel separado
- HeroBackground só no root layout — não duplicar nos shells
- Tipografia: glassText / glassTextStyles — evitar text-white/XX hardcoded; modais usam *Elevated

Tarefa:
[descreva aqui]
```
