# VitalFit Management - Contexto Completo do Sistema

Use este arquivo como contexto base em prompts futuros. Ele descreve o estado atual do projeto, a arquitetura, a direção visual e as regras importantes para qualquer alteração.

## Resumo Do Projeto

Este projeto é uma **aplicação premium em Next.js** para um produto fictício de gestão fitness/gym management chamado **VitalFit Management**.

O produto evoluiu de uma landing page isolada para um **app multi-rota autenticado** com shell responsivo. A identidade visual continua sendo uma **cena cinematográfica de produto** com painéis glassmorphism flutuando em um ambiente interno sofisticado.

A experiência logada deve parecer uma interface fitness premium “flutuando” em um ambiente interno:

- painel central grande frontal em glass
- painel lateral esquerdo em perspectiva, como menu/workspace (desktop)
- painel lateral direito em perspectiva, como profile/calendar/challenges (desktop)
- background ambientado com foto de interior
- motion sequencial cinematográfica (desktop)
- navegação inferior glass no mobile

**Rota inicial:** `/` redireciona para `/dashboard` via `redirect()` em `src/app/page.tsx`.

**Autenticação:** rotas do app `(app)/` exigem sessão Supabase. `/login` é pública. Proxy em `src/proxy.ts` (Next.js 16) delega para `src/lib/supabase/middleware.ts`.

**Integração com API:** o projeto prioriza **dados reais via Supabase** e **Server Actions seguras** (com `try/catch`, validação Zod e retorno padronizado). Dados mockados permanecem apenas em áreas legadas ou de demonstração visual (dashboard KPIs, hero scene).

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

- `<GlassPanel>` — containers glass
- `<Table>` + `<GlobalFilters>` — listagens com filtros e paginação
- Botões e inputs em `common/form/` (`GlassButton`, `GlassInput`, `GlassSelect`, etc.)
- `<RowActionsMenu>`, `<ConfirmRemoveDialog>`, `<InlineAlert>` — padrões de UI recorrentes

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
    layout.tsx                    # root layout, viewport lock mobile, MobileBottomNav
    page.tsx                      # redirect("/dashboard")
    login/page.tsx                # rota pública de autenticação
    (app)/
      layout.tsx                  # MobilePageWrapper + DesktopAppShell
      dashboard/page.tsx          # DashboardContent + getUser (nome do usuário)
      community/page.tsx
      analytics/page.tsx
      members/page.tsx            # MembersContent (gestão de alunos — Supabase real)
      members/actions.ts          # Server Actions CRUD alunos (Supabase + Zod)
      users/page.tsx              # UsersContent (Super Admin only)
      users/actions.ts            # Server Actions CRUD usuários (Admin API + Zod)
      professionals/page.tsx      # placeholder (em desenvolvimento)
      profile/page.tsx
      help/page.tsx
      settings/page.tsx
      classes/crossfit|trx|yoga/page.tsx
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
        GlassButton.tsx           # botão com GlassPanel (só vidro, sem fill colorido)
        SolidButton.tsx           # CTA sólido
        OutlineButton.tsx
        GhostButton.tsx
        DangerButton.tsx
        IconButton.tsx
        PremiumButton.tsx         # legado (landing)
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
        ModalOverlay.tsx
        ConfirmRemoveDialog.tsx   # confirmação de remoção reutilizável
      menu/
        RowActionsMenu.tsx        # menu ⋮ de ações por linha (Table)
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
    users/
      UsersContent.tsx            # gestão de usuários do sistema
      UserForm.tsx
      UserAvatar.tsx
      AccessDenied.tsx
      useUsersManagement.ts       # hook — estado, mutations, refresh
      users.types.ts
      user.schema.ts              # schema Zod de validação server-side
      user.helpers.ts             # iniciais + cor avatar estilo Google
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
    theme.ts
  hooks/
    useHydrated.ts                # useSyncExternalStore (SSR-safe)
    useLocalWeather.ts            # Open-Meteo + geolocalização/IP
    usePrefersReducedMotion.ts    # disponível, não integrado na hero
  lib/
    action-result.ts              # ActionResult<T>, actionSuccess, actionFailure
    is-uuid.ts                    # validação de UUID
    auth/resolve-user-display.ts  # nome, avatar de user_metadata
    cn.ts
    motion.ts
    supabase/
      client.ts                   # browser client
      server.ts                   # server client (cookies)
      admin.ts                    # service role (server-only)
      middleware.ts               # refresh session + redirect login
      env.ts
  proxy.ts                        # Next.js 16 proxy (auth + refresh session)
```

### Fluxo de renderização

```txt
RootLayout (layout.tsx)
  └─ children wrapper (flex-1, min-h-0)
       └─ (app)/layout.tsx
            ├─ MobilePageWrapper   → visível em < lg
            └─ DesktopAppShell     → visível em >= lg
  └─ MobileBottomNav               → shrink-0, fluxo normal (não fixed)
```

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
- `createUserAction` — `admin.createUser` com `user_metadata.name` + `role`; validação via `user.schema.ts`
- `updateUserAction` — `admin.updateUserById`; se editar a si mesmo, client chama `refreshSession()` + `router.refresh()`

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
| `/members` | `members/page.tsx` | `MembersContent` — **Supabase `public.members`** |
| `/users` | `users/page.tsx` | `UsersContent` (Super Admin) — **Supabase Auth** |
| `/professionals` | `professionals/page.tsx` | placeholder (em desenvolvimento) |
| `/profile` | `profile/page.tsx` | `ProfileContent` |
| `/help` | `help/page.tsx` | `RoutePlaceholder` |
| `/settings` | `settings/page.tsx` | `RoutePlaceholder` |
| `/classes/*` | `classes/*/page.tsx` | `RoutePlaceholder` |

Navegação centralizada em `src/config/app-nav.config.ts`:

- `mainNavItems` — Dashboard, Community, Analytics, **Alunos** (`/members`), **Profissionais** (`/professionals`)
- `classNavItems` — Crossfit, TRX, Yoga
- `utilityNavItems` — **Usuários** (`/users`), Help, Setting
- `mobileNavItems` — combinação usada no `MobileBottomNav`
- `profileHref` — `/profile`
- `isNavActive(pathname, href)` — match exato de rota

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
| `MetricCards` | 4× subtle/floating | KPIs 2×2 |
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
- Avatar: `UserAvatar` (foto ou iniciais coloridas estilo Google)
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
- Submit via `GlassButton`; modais usam `ModalOverlay` + `GlassPanel elevation="modal"`

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

**Props principais:** `data`, `columns`, `getRowId`, `title`, `filters`, `filterValues`, `onFilterChange`, `headerActions`, `rowClassName`, `defaultPageSize`, `pageSizeOptions`

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

**Subcomponentes:** `TableHead`, `TableFooter`, `TableColGroup`, `GlobalFilters`

### `GlobalFilters<T>` (`common/table/GlobalFilters.tsx`)

Barra de filtros **colapsável** (estado inicial: fechada), renderizada **acima** do `GlassPanel` da tabela.

- Wrapper: `GlassPanel elevation="floating"` (só a barra de filtros, não a tabela)
- Cabeçalho: "Filtrar por" + badge de filtros ativos + chevron expand/collapse
- Expandido: `GlassInput` / `GlassSelect` / `DatePicker` + botão "Limpar filtros" (`GlassButton`)
- Colapsado com filtros ativos: botão compacto "Limpar"

Tipos em `global-filters.types.ts`.

### `RowActionsMenu` (`common/menu/RowActionsMenu.tsx`)

Menu dropdown de ações por linha (ícone ⋮). Reutilizado em `/members` e `/users`.

### `ConfirmRemoveDialog` (`common/modal/ConfirmRemoveDialog.tsx`)

Modal de confirmação de remoção com `GlassPanel elevation="modal"`. Props: `title`, `subjectName`, `pending`, `onConfirm`, `onCancel`.

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
| `GlassButton` | ação glass (sem fill sólido) |
| `SolidButton` | CTA principal (ex.: Novo Aluno) |
| `OutlineButton` | ação secundária com borda |
| `GhostButton` | ação terciária / menu |
| `DangerButton` | ações destrutivas |
| `IconButton` | botão só ícone |
| `FormField` | label + erro + children |
| `GlassSwitch` | toggle iOS |
| `ModalOverlay` | overlay de modal com scroll opcional |

Tokens compartilhados: `form.styles.ts` (`inputToneClasses`, `inputSizeClasses`, etc.)

### `GlassButton` (`common/button/GlassButton.tsx`)

Botão **somente vidro** — sem fill colorido/sólido:

- Variants: `subtle`, `default`, `strong` (intensidade do GlassPanel)
- Shapes: `rounded`, `pill`
- Props: `loading`, `fullWidth`, `leftIcon`, `rightIcon`, `href` (link)
- Inner: `text-white` + `hover:bg-white/8`

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
- Menu expandido: `GlassPanel elevation="base"` — **no fluxo do documento** (empurra itens acima, sem overlay absoluto entre camadas)
- Ações: Meu perfil (`/profile`), Sair (`signOut` → `/login`)
- Lê sessão via `supabase.auth.getUser()` + `onAuthStateChange`

## Root Layout e Viewport Mobile

Arquivo: `src/app/layout.tsx`

- Exporta `viewport` com `viewportFit: "cover"` (safe areas em dispositivos com notch)
- **Mobile (`< lg`):** `html` e `body` com `h-dvh overflow-hidden` — trava o viewport, sem scroll na página
- **Desktop (`>= lg`):** comportamento normal (`lg:h-full`, `lg:overflow-auto`)
- `body` usa **flex column** no mobile:
  - área de conteúdo: `flex-1 min-h-0 overflow-hidden`
  - `MobileBottomNav`: `shrink-0` no fluxo do documento (não é mais `fixed`)
  - gap entre conteúdo e navbar: `gap-[var(--mobile-nav-content-gap)]`

### Variáveis CSS mobile (`globals.css`)

```css
--mobile-content-top-gap: 1.5rem;
--mobile-nav-bottom-gap: 1.5rem;
--mobile-nav-content-gap: 1.5rem;
--mobile-nav-bar-height: 4.75rem;
--mobile-nav-reserved-height: calc(...);
```

## Layout Mobile (`MobilePageWrapper`)

Arquivo: `src/components/mobile/MobilePageWrapper.tsx`

- ocupa `h-full` do wrapper flex-1 do root layout
- `HeroBackground` como fundo ambientado
- `GlassPanel` variant `hero`, intensity `high`, elevation `base`
- **scroll apenas dentro** do painel glass
- sem perspectiva 3D, sem painéis laterais

**Não** adicionar `pb-32` ou `min-h-svh` extras no mobile — quebra o viewport lock.

## Layout Desktop (`DesktopAppShell`)

Arquivo: `src/components/app/DesktopAppShell.tsx`

- visível apenas em `>= lg`
- reutiliza `HeroBackground`, `LeftSidebarPanel`, `RightProfilePanel`
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
| `elevation` | `base`, `floating`, `modal` | `base` |

### Iluminação (preservada em todas as elevações)

- `before:` — reflexo specular via `--glass-shine`
- `after:` — bordas internas e highlights
- `intensityVars` controla `--glass-shine` e `--glass-border`
- **Não sobrescrever** bordas/reflexos com `className` agressivo no GlassPanel

### Física de empilhamento (`elevation`)

Regra: camadas sobrepostas usam **menos blur** e **mais solidez** para não somar desfoque composto.

| Elevation | Uso | Blur | Corpo |
|---|---|---|---|
| `base` | painéis de fundo, shells, menus no fluxo | alto do variant + saturate | gradiente do variant |
| `floating` | cards internos, pills, popovers | `12px` | `bg-white/5` |
| `modal` | modais, dropdowns, tooltips legíveis | `12px` | `bg-black/10` |

### Regra crítica para cards internos

`DashboardContent`, `/users` e `/members` renderizam-se **dentro** de `CenterPanelShell` (já glass `hero/base`).

- Cards da UI: `<GlassPanel variant="subtle" elevation="floating">`
- Modais/formulários: `elevation="modal"` (+ `bg-[#221d17]/90` apenas quando legibilidade exige, ex.: tooltip sobre barra listrada)
- **Proibido:** `bg-white/5 backdrop-blur-md` manual em cards — causa blur composto

### Glass sobre glass no fluxo (NavUserMenu)

Quando o menu expande **empurrando** itens da sidebar (sem overlay absoluto):

1. Pill do usuário → `elevation="floating"`
2. Menu de ações → `elevation="base"` (empilhado no fluxo, não floating sobre floating)

## Hooks

| Hook | Arquivo | Uso |
|---|---|---|
| `useHydrated` | `useHydrated.ts` | `useSyncExternalStore` — false no SSR, true no client |
| `useLocalWeather` | `useLocalWeather.ts` | GPS → IP → São Paulo; Open-Meteo; refresh 30min |
| `usePrefersReducedMotion` | `usePrefersReducedMotion.ts` | disponível, não integrado na hero |
| `useMembersManagement` | `members/useMembersManagement.ts` | estado CRUD de alunos (client) |
| `useUsersManagement` | `users/useUsersManagement.ts` | estado CRUD de usuários (client) |
| `useLoginForm` | `auth/useLoginForm.ts` | autenticação client com Zod |

## Dados Mockados (Escopo Limitado)

O projeto **prioriza integração real com API**. Mocks permanecem apenas em:

| Área | Arquivo | Escopo |
|---|---|---|
| Hero scene (legado) | `landing/hero/data/hero-scene.mock.ts` | background, painéis laterais, profile mock |
| Dashboard KPIs | componentes em `dashboard/*` | `MembersTable`, `MetricCards`, `RevenueAnalytics`, etc. |

**Rotas com dados reais (Supabase):**

| Rota | Fonte |
|---|---|
| `/members` | `public.members` via Server Actions |
| `/users` | Supabase Auth via Admin API |
| `/login` | Supabase Auth (signInWithPassword) |
| `/dashboard` (nome) | `user.user_metadata` via `getUser()` |

## Direção Visual Obrigatória

Manter:

- composição centralizada, painéis glass, background ambientado
- perspectiva 3D controlada (desktop), motion sequencial premium
- mobile: painel central legível + nav inferior glass + viewport lock
- inputs escuros: `bg-white/5`, `border-white/14`, texto branco
- textos secundários: `text-white/48`

Evitar:

- headline gigante à esquerda, navbar horizontal no topo
- layout landing SaaS tradicional
- `backdrop-blur` manual em camadas sobre GlassPanel
- scroll na página mobile (body/html)
- botões coloridos sólidos onde o design system pede glass (`GlassButton`)

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
- [ ] Modais/dropdowns usam `elevation="floating"` ou `"modal"`?
- [ ] Iluminação `before:`/`after:` preservada?
- [ ] Menus de ação usam `<RowActionsMenu>` (não duplicar dropdown)?
- [ ] Confirmações de remoção usam `<ConfirmRemoveDialog>`?

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
- [ ] Mobile: scroll só no painel glass?
- [ ] `npm run lint` passa?
- [ ] `npm run build` passa?

## Prompt Base Para Usar No Futuro

```md
Estou trabalhando no projeto VitalFit Management.

Contexto: app premium autenticado (Supabase) em Next.js/React/Tailwind/Framer Motion.
Desktop = cena 3D com painéis glass; mobile = painel central + nav inferior.
Rota inicial: /dashboard. Login: /login.

Arquitetura:
- Auth: src/proxy.ts + lib/supabase/middleware.ts + LoginForm + user_metadata (name, role)
- Shell mobile: MobilePageWrapper | desktop: DesktopAppShell
- Painel central: CenterPanelShell (scroll interno)
- Dashboard: src/components/dashboard/* (GlassPanel em todos os cards; KPIs mock)
- Usuários: /users (Super Admin) — Supabase Admin API + useUsersManagement
- Alunos: /members — Supabase public.members + useMembersManagement
- Server Actions: ActionResult<T> (lib/action-result.ts) + Zod (*.schema.ts)
- Tabela: src/components/common/table/Table.tsx
- Filtros: GlobalFilters (colapsável, acima do GlassPanel) + DatePicker
- Formulários: common/form/index.ts (GlassInput, GlassSelect, botões...)
- UI compartilhada: RowActionsMenu, ConfirmRemoveDialog, InlineAlert
- Glass: src/components/common/glass-panel/GlassPanel.tsx
- Nav: src/config/app-nav.config.ts + NavUserMenu (logout)
- Clima header: useLocalWeather.ts + HeaderDateWeather.tsx

Regras de código:
- Identificadores em inglês; UI e erros em pt-BR
- Componentes PascalCase, hooks useCamelCase, lib kebab-case
- SoC: UI → hooks → Server Actions (sem lógica complexa em componentes)
- Early returns, tipagem estrita (zero any), ActionResult padronizado

Regras glass:
- NUNCA backdrop-blur manual nos cards internos
- Cards: GlassPanel variant subtle + elevation floating
- Modais: elevation modal
- GlobalFilters: glass próprio acima da tabela; corpo da tabela em GlassPanel separado
- NavUserMenu expandido: glass no fluxo (base), não overlay absoluto

Tarefa:
[descreva aqui]
```
