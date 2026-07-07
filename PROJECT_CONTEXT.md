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

**Autenticação:** rotas do app `(app)/` exigem sessão Supabase. `/login` é pública. Middleware em `src/middleware.ts` + `src/lib/supabase/middleware.ts`.

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
      members/page.tsx            # MembersContent (gestão de alunos)
      users/page.tsx              # UsersContent (Super Admin only)
      users/actions.ts            # server actions: list/create/update users
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
    common/
      button/
        premium-button.tsx        # legado (landing)
        glass-button.tsx          # botão com GlassPanel (só vidro, sem fill colorido)
      glass-panel/glass-panel.tsx
      table/reusable-table.tsx    # tabela genérica com filtro global + GlassPanel
      section-container/
    dashboard/
      DashboardContent.tsx        # layout principal do dashboard
      BusinessHeader.tsx
      GymCapacity.tsx
      MetricCards.tsx
      RevenueAnalytics.tsx
      TrainerCards.tsx
      FavouritedWorkout.tsx
      MembersTable.tsx            # usa ReusableTable (dados mock dashboard)
      MobileAppPromo.tsx
      HeaderDateWeather.tsx         # data + clima (Open-Meteo)
    members/
      MembersContent.tsx          # gestão de alunos (mock local, pronto p/ API)
      MemberRegistrationForm.tsx
      members.types.ts
      member.helpers.ts           # máscaras CPF e data
    users/
      UsersContent.tsx            # gestão de usuários do sistema
      UserForm.tsx
      UserAvatar.tsx
      AccessDenied.tsx
      users.types.ts
      user.helpers.ts             # iniciais + cor avatar estilo Google
    profile/ProfileContent.tsx
    mobile/MobilePageWrapper.tsx
    landing/hero/                 # cena visual (reutilizada pelo app)
      HeroBackground.tsx
      HeroScene.tsx               # legado
      MobileBottomNav.tsx
      data/heroScene.mock.ts
      motion/heroScene.motion.ts
      panels/
        LeftSidebarPanel.tsx      # sidebar + NavUserMenu
        RightProfilePanel.tsx
        FrontFloatingModal.tsx
        CenterDashboardPanel.tsx  # legado
  config/
    app-nav.config.ts
    theme.ts
  hooks/
    use-hydrated.ts               # useSyncExternalStore (SSR-safe)
    use-local-weather.ts          # Open-Meteo + geolocalização/IP
    use-prefers-reduced-motion.ts
  lib/
    auth/resolve-user-display.ts  # nome, avatar de user_metadata
    cn.ts
    motion.ts
    supabase/
      client.ts                   # browser client
      server.ts                   # server client (cookies)
      admin.ts                    # service role (server-only)
      middleware.ts               # refresh session + redirect login
      env.ts
  middleware.ts
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

- Rota: `/login` → `LoginForm` com validação Zod
- `supabase.auth.signInWithPassword` via client
- Redirect pós-login: `/dashboard` (ou `?next=` se válido)
- Submit usa `GlassButton` (variant glass, shape pill)

### Middleware

- `src/middleware.ts` delega para `updateSession`
- Rotas públicas: `/login`
- Demais rotas: redireciona para `/login` se não houver sessão

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

Requer `SUPABASE_SERVICE_ROLE_KEY` no servidor:

- `listUsersAction` — lista usuários Auth (Admin API)
- `createUserAction` — `admin.createUser` com `user_metadata.name` + `role`
- `updateUserAction` — `admin.updateUserById`; se editar a si mesmo, client chama `refreshSession()` + `router.refresh()`

**Nunca** usar `signUp` no client para criar usuários admin — troca a sessão ativa. Sempre Admin API via service role.

## Rotas Do App

| Rota | Página | Conteúdo atual |
|---|---|---|
| `/` | `page.tsx` | redirect → `/dashboard` |
| `/login` | `login/page.tsx` | `LoginForm` (pública) |
| `/dashboard` | `dashboard/page.tsx` | `DashboardContent` + nome via `getUser()` |
| `/community` | `community/page.tsx` | `RoutePlaceholder` |
| `/analytics` | `analytics/page.tsx` | `RoutePlaceholder` |
| `/members` | `members/page.tsx` | `MembersContent` (gestão de alunos) |
| `/users` | `users/page.tsx` | `UsersContent` (Super Admin) |
| `/profile` | `profile/page.tsx` | `ProfileContent` |
| `/help` | `help/page.tsx` | `RoutePlaceholder` |
| `/settings` | `settings/page.tsx` | `RoutePlaceholder` |
| `/classes/*` | `classes/*/page.tsx` | `RoutePlaceholder` |

Navegação centralizada em `src/config/app-nav.config.ts`:

- `mainNavItems` — Dashboard, Community, Analytics, **Alunos** (`/members`)
- `classNavItems` — Crossfit, TRX, Yoga
- `utilityNavItems` — **Usuários** (`/users`), Help, Setting
- `mobileNavItems` — combinação usada no `MobileBottomNav`
- `profileHref` — `/profile`
- `isNavActive(pathname, href)` — match exato de rota

## Dashboard (`/dashboard`)

Arquivo orquestrador: `src/components/dashboard/DashboardContent.tsx`

### Cabeçalho fixo (não alterar estrutura base)

- Título: `Welcome {userName}!` — nome vem de `resolveFirstName(user_metadata, email)` no server
- Subtítulo: `HeaderDateWeather` — data pt-BR + temperatura/ícone via `useLocalWeather` (Open-Meteo)

### Layout (grid responsivo)

```txt
[Coluna esquerda lg:col-span-3]     [Coluna direita lg:col-span-9]
  BusinessHeader                      MetricCards | RevenueAnalytics
  GymCapacity                         Personal Trainer | FavouritedWorkout
  (MobileAppPromo — opcional)         MembersTable (full width abaixo)
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
| `MembersTable` | via ReusableTable | tabela mock do dashboard |

### Regras do dashboard

- **Nunca** usar `bg-white/5 backdrop-blur-md` manual nos cards — sempre `<GlassPanel>`
- Cards internos: preferir `variant="subtle"`, `intensity="low"`, `elevation="floating"`
- `CenterPanelShell` tem scroll vertical (`overflow-y-auto`) — conteúdo longo rola dentro do painel
- `DashboardContent` **não** usa `h-full` — altura vem do conteúdo para o scroll funcionar

## Gestão de Usuários (`/users`)

Padrão visual espelhado em `/members`:

- Header + botão "Novo Usuário" → modal `UserForm`
- `ReusableTable` com busca global
- Menu de ações: Editar, Desativar/Reativar, Remover (confirmação modal)
- Avatar: `UserAvatar` (foto ou iniciais coloridas estilo Google)
- Dados reais do Supabase Auth via `listUsersAction`

## Gestão de Alunos (`/members`)

Mesma arquitetura visual que `/users`:

- Header + botão "Novo Aluno" → modal `MemberRegistrationForm`
- `ReusableTable` — colunas: Aluno, CPF, Origem, Plano, Status
- Formulário em grid `md:grid-cols-2`:
  - Avatar (drop/upload + iniciais)
  - Nome, e-mail, CPF (máscara), data nascimento (máscara DD/MM/AAAA)
  - Origem: Academia / Gympass / TotalPass
  - Plano: Mensal Base / Trimestral Premium / Anual Pro
  - Toggle iOS para status Ativo/Inativo
- **Persistência:** mock local por enquanto (`setTimeout` simulado) — preparado para server action/API
- Submit usa `GlassButton`

## Componentes Compartilhados

### `ReusableTable<T>` (`common/table/reusable-table.tsx`)

- Wrapper: `GlassPanel variant="subtle" elevation="floating"`
- Props: `data`, `columns`, `getRowId`, `title`, `searchPlaceholder`, `headerActions`, `rowClassName`
- Coluna com `searchValue(row)` participa do filtro global interno
- Suporta `globalFilter` controlado externamente

### `GlassButton` (`common/button/glass-button.tsx`)

Botão **somente vidro** — sem fill colorido/sólido:

- Variants: `subtle`, `default`, `strong` (intensidade do GlassPanel)
- Shapes: `rounded`, `pill`
- Props: `loading`, `fullWidth`, `leftIcon`, `rightIcon`, `href` (link)
- Inner: `text-white` + `hover:bg-white/8`

### `GlassPanel` (`common/glass-panel/glass-panel.tsx`)

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

Componente base: `src/components/common/glass-panel/glass-panel.tsx`

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
| `useHydrated` | `use-hydrated.ts` | `useSyncExternalStore` — false no SSR, true no client |
| `useLocalWeather` | `use-local-weather.ts` | GPS → IP → São Paulo; Open-Meteo; refresh 30min |
| `usePrefersReducedMotion` | `use-prefers-reduced-motion.ts` | disponível, não integrado na hero |

## Dados Mockados

Arquivo: `src/components/landing/hero/data/heroScene.mock.ts`

Usado por: background, painéis laterais legados, componentes hero.

**Dashboard** e **Members** têm mocks próprios nos respectivos componentes. **Users** lê do Supabase Auth.

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

- [ ] Cards internos usam `<GlassPanel>` (não glass manual)?
- [ ] Modais/dropdowns usam `elevation="floating"` ou `"modal"`?
- [ ] Iluminação `before:`/`after:` preservada?
- [ ] Nova rota adicionada em `app-nav.config.ts`?
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
- Auth: middleware + LoginForm + user_metadata (name, role)
- Shell mobile: MobilePageWrapper | desktop: DesktopAppShell
- Painel central: CenterPanelShell (scroll interno)
- Dashboard: src/components/dashboard/* (GlassPanel em todos os cards)
- Usuários: /users (Super Admin) — Supabase Admin API
- Alunos: /members — mock local, ReusableTable + MemberRegistrationForm
- Tabela: src/components/common/table/reusable-table.tsx
- Botão glass: src/components/common/button/glass-button.tsx
- Glass: src/components/common/glass-panel/glass-panel.tsx
- Nav: src/config/app-nav.config.ts + NavUserMenu (logout)
- Clima header: use-local-weather.ts + HeaderDateWeather.tsx

Regras glass:
- NUNCA backdrop-blur manual nos cards internos
- Cards: GlassPanel variant subtle + elevation floating
- Modais: elevation modal
- NavUserMenu expandido: glass no fluxo (base), não overlay absoluto

Tarefa:
[descreva aqui]
```
