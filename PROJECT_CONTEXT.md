# VitalFit Management - Contexto Completo do Sistema

Use este arquivo como contexto base em prompts futuros. Ele descreve o estado atual do projeto, a arquitetura, a direção visual e as regras importantes para qualquer alteração.

## Resumo Do Projeto

Este projeto é uma landing page premium em Next.js para um produto fictício de gestão fitness/gym management chamado **VitalFit Management**.

O objetivo visual atual não é uma landing SaaS tradicional com headline à esquerda e dashboard à direita. A hero foi reconstruída para ser uma **cena cinematográfica de produto**, inspirada em uma referência visual com painéis glassmorphism abertos no espaço.

A primeira dobra deve parecer uma interface fitness premium “flutuando” em um ambiente interno sofisticado:

- painel central grande frontal em glass
- painel lateral esquerdo em perspectiva, como menu/workspace
- painel lateral direito em perspectiva, como profile/calendar/challenges
- background ambientado com foto de interior
- motion sequencial cinematográfica
- navegação inferior glass no mobile

**Estado atual da cena desktop:** três painéis em perspectiva (esquerdo, central, direito). O `FrontFloatingModal` existe como componente, mas **não está renderizado** na cena no momento — apenas importado em `HeroScene.tsx`.

## Stack

- Next.js `16.2.10`
- React `19.2.4`
- TypeScript
- Tailwind CSS `4`
- App Router
- Framer Motion `12.42.2`
- Lucide React
- clsx + tailwind-merge
- Fonte: Geist Sans / Geist Mono (Google Fonts)

Scripts disponíveis:

```bash
npm run dev
npm run lint
npm run build
npm run start
```

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
    layout.tsx
    page.tsx
  components/
    common/
      button/
        premium-button.tsx
      glass-panel/
        glass-panel.tsx
      section-container/
        section-container.tsx
    landing/
      hero/
        HeroBackground.tsx
        HeroScene.tsx
        MobileBottomNav.tsx
        types.ts
        data/
          heroScene.mock.ts
        motion/
          heroScene.motion.ts
        panels/
          CenterDashboardPanel.tsx
          FrontFloatingModal.tsx
          LeftSidebarPanel.tsx
          RightProfilePanel.tsx
  config/
    theme.ts
  hooks/
    use-prefers-reduced-motion.ts
  lib/
    cn.ts
    motion.ts
```

`src/app/page.tsx` renderiza diretamente:

```tsx
<HeroScene />
```

`src/app/layout.tsx` define metadata, fontes Geist e `lang="pt-BR"`.

## Direção Visual Obrigatória

A hero deve parecer uma **scene composition 3D** no desktop, não uma landing tradicional.

Manter:

- composição centralizada
- painéis glass abertos no espaço
- sensação de workspace expandido
- background ambientado visível
- perspectiva 3D controlada (apenas desktop)
- motion sequencial premium
- mobile adaptativo com painel central legível e nav inferior glass

Evitar:

- headline gigante à esquerda
- navbar horizontal glass no topo
- layout em duas colunas `texto + dashboard`
- dashboard isolado à direita
- fundo dark abstrato genérico
- painéis laterais retos sem perspectiva (no desktop)
- composição limpa demais ou “SaaS boilerplate”
- rotateX / rotateZ / translateZ nos painéis laterais (causam distorção “pill”)

## Layout Responsivo Da Hero

Arquivo principal: `src/components/landing/hero/HeroScene.tsx`

A hero usa **dois layouts distintos** controlados pelo breakpoint `lg`:

### Mobile (`< lg`)

- `min-h-svh`, painel central em largura total com `px-4`
- `CenterDashboardPanel` com scroll interno (`overflow-y-auto`)
- `MobileBottomNav` fixo na base (`fixed bottom-6`)
- **sem** perspectiva 3D, **sem** painéis laterais
- animação apenas do painel central (`sceneMotion.center`)

### Desktop (`>= lg`)

- palco flex horizontal com `gap-[clamp(14px,1.4vw,24px)]`
- `perspective: 2400px` no container do palco
- `transformStyle: preserve-3d`
- três painéis lado a lado: esquerdo → central → direito
- glow ambiente radial atrás dos painéis
- sombra de chão na base do palco

Hierarquia espacial (desktop):

1. `CenterDashboardPanel` — painel principal, `z-30`
2. `RightProfilePanel` — lateral direito, `z-20`
3. `LeftSidebarPanel` — lateral esquerdo, `z-10`
4. `HeroBackground` — fundo absoluto, `-z-10`
5. `MobileBottomNav` — oculto no desktop (`lg:hidden`)

## Painéis Da Cena

### CenterDashboardPanel

Arquivo:

```txt
src/components/landing/hero/panels/CenterDashboardPanel.tsx
```

Função:

- âncora visual da cena
- painel frontal dominante
- showcase principal do produto
- usa `GlassPanel` variant `hero`, intensity `high`

Dimensões atuais:

- mobile: `h-[calc(100dvh-152px)]`, `w-full`, scroll interno
- desktop: `lg:h-[clamp(600px,85vh,880px)]`, `lg:w-[clamp(500px,52vw,1000px)]`

Conteúdo:

- `Welcome Jakob!` + data
- bloco `Members counting` (gráfico de barras)
- bloco `Popular Classes` (cards com imagem)
- timeline na base (dias, eventos, avatares)

### LeftSidebarPanel

Arquivo:

```txt
src/components/landing/hero/panels/LeftSidebarPanel.tsx
```

Função:

- substitui a navbar horizontal
- representa menu/workspace lateral
- placa glass plana (sem `GlassPanel`, sem extrusão)

Dimensões controladas pelo wrapper em `HeroScene`:

- `h-[clamp(550px,75vh,800px)]`
- `w-[clamp(215px,21.5vw,330px)]`
- `transformOrigin: right center`

Conteúdo:

- branding `FitnessUp`
- itens de menu (`sidebarMenu`)
- classes (`classMenu`)
- help/settings (`utilityMenu`)
- toggle light/dark inferior

Perspectiva aplicada via motion no wrapper (não no painel):

- `rotateY(60deg)` no estado visible
- entrada com `rotateY(30deg)` + `translate3d(-64px, 0, 0)`

### RightProfilePanel

Arquivo:

```txt
src/components/landing/hero/panels/RightProfilePanel.tsx
```

Função:

- painel lateral direito em perspectiva
- perfil, calendário e challenges
- placa glass plana (mesma abordagem do esquerdo)

Dimensões controladas pelo wrapper em `HeroScene`:

- `h-[clamp(550px,75vh,820px)]`
- `w-[clamp(215px,21.5vw,330px)]`
- `transformOrigin: left center`

Perspectiva aplicada via motion no wrapper:

- `rotateY(-60deg)` no estado visible
- entrada com `rotateY(-30deg)` + `translate3d(64px, 0, 0)`

### FrontFloatingModal

Arquivo:

```txt
src/components/landing/hero/panels/FrontFloatingModal.tsx
```

Status: **componente pronto, mas não renderizado** em `HeroScene.tsx` (import órfão).

Função planejada:

- modal frontal inferior
- sobrepor a timeline do painel central
- reforçar profundidade da cena

Dimensões atuais:

- `w-[90vw]` / `sm:w-[400px]`
- usa `GlassPanel` variant `strong`, intensity `high`

Motion preparada em `heroScene.motion.ts` (`modal`):

- `translate3d(0, 0, 150px)` no visible
- `delay: 0.68`

### MobileBottomNav

Arquivo:

```txt
src/components/landing/hero/MobileBottomNav.tsx
```

Função:

- navegação inferior glass no mobile
- substitui o sidebar esquerdo em telas pequenas
- scroll horizontal de ícones com estado ativo

Itens: Dashboard, Community (badge), Analytics, Members, Crossfit, TRX, Yoga, Help, Setting + avatar de perfil.

Visível apenas em `< lg`. Usa `profileAvatar` do mock.

## Motion

Arquivo:

```txt
src/components/landing/hero/motion/heroScene.motion.ts
```

Princípio: painéis laterais são **placas rígidas planas** — apenas `rotateY`. Sem `rotateX`, `rotateZ` ou `translateZ` nos laterais.

Sequência ativa (desktop):

1. painel central
2. painel esquerdo
3. painel direito

Sequência preparada (modal, não em uso):

4. modal frontal

Timing atual:

- central: sem delay, `duration: 0.86`
- esquerdo: `delay: 0.28`, `duration: 0.82`
- direito: `delay: 0.46`, `duration: 0.82`
- modal (inativo): `delay: 0.68`, `duration: 0.72`

Rotação lateral:

- esquerdo: `rotateY(60deg)`
- direito: `rotateY(-60deg)`

Easing:

```ts
[0.22, 1, 0.36, 1]
```

Entrada do central: `opacity` + `blur` + `translate3d(0, 26px, 0)` + `scale(0.97)`.

`ambientFloat` exportado mas não usado na cena atual.

Tokens genéricos reutilizáveis em `src/lib/motion.ts` (`fadeUp`, `glassReveal`, `floatSoft`, etc.).

## Background

Arquivo:

```txt
src/components/landing/hero/HeroBackground.tsx
```

Configuração em:

```txt
src/components/landing/hero/data/heroScene.mock.ts
```

Objeto `sceneBackground`:

- `image` — URL Unsplash (interior sofisticado)
- `position` — `center 54%`
- `overlay` — gradiente escuro vertical
- `blur` — `0px`
- `brightness` — `0.92`

Camadas adicionais no componente:

- gradientes radiais (warm, blue, lime)
- vinheta elíptica
- fade top/bottom
- glow animado pulsante no centro (`opacity` + `scale`, 8.5s loop)
- entrada com fade + scale (`duration: 1.2`)

Para trocar a imagem de fundo, altere `sceneBackground.image`.

## Glassmorphism

Componente base:

```txt
src/components/common/glass-panel/glass-panel.tsx
```

Variantes: `subtle`, `default`, `strong`, `hero`

Intensidades: `low`, `medium`, `high`

Usado em: `CenterDashboardPanel`, `FrontFloatingModal`.

Painéis laterais usam glass **inline** (não via `GlassPanel`):

- `bg-white/[0.07]`
- `backdrop-blur-[12px]`
- `border border-white/10`
- `shadow-2xl shadow-black/40`

Tokens de tema em `src/config/theme.ts`:

- accent: `#2777ff`
- kinetic: `#b9ff2e`
- background: `#070806`
- glass blur/opacity/border presets

## Dados Mockados

Arquivo:

```txt
src/components/landing/hero/data/heroScene.mock.ts
```

Contém:

- `sceneBackground`
- `sidebarMenu`, `classMenu`, `utilityMenu`
- `popularClasses`
- `memberBars`, `barMonths`
- `timelineDays`
- `challenges`
- `modalFields`
- `profileAvatar`, `trainerAvatars`, `memberAvatars`
- `sceneStats` (não usado na UI atual)

Tipos em `src/components/landing/hero/types.ts`.

Ao trocar conteúdo visual da hero, preferir alterar o mock antes de mexer na UI.

## Responsividade — Resumo

| Breakpoint | Comportamento |
|---|---|
| `< lg` | Painel central full-width + scroll interno + `MobileBottomNav` |
| `>= lg` | Cena 3D completa: laterais em perspectiva + central dominante |

Ao ajustar responsividade, manter a ideia de cena premium. Não voltar para layout tradicional em duas colunas.

## Hooks e Utilitários

- `src/hooks/use-prefers-reduced-motion.ts` — detecta `prefers-reduced-motion` (disponível, não integrado na hero ainda)
- `src/lib/cn.ts` — `clsx` + `tailwind-merge`
- `src/lib/motion.ts` — tokens e variants Framer Motion genéricos

## Arquivos Que Não Devem Voltar Como Estrutura Principal

A arquitetura anterior foi removida/descontinuada. Não recriar como base principal:

- `src/components/hero/hero-section.tsx`
- `src/components/hero/hero-content.tsx`
- `src/components/hero/hero-actions.tsx`
- `src/components/hero/hero-visual-panel.tsx`
- `src/components/layout/navbar.tsx`
- `src/components/layout/animated-background.tsx`

## Checklist Para Futuras Alterações

Antes de concluir qualquer alteração visual, verificar:

- a hero desktop ainda parece uma cena 3D?
- painel central continua dominante?
- laterais continuam em perspectiva (apenas `rotateY`)?
- mobile mantém painel central legível com nav inferior?
- background ainda é ambientado, não abstrato?
- não voltou a existir headline gigante à esquerda?
- não voltou a existir navbar horizontal competindo com a cena?
- motion mantém a ordem central → esquerdo → direito?
- se reativar o modal, ele sobrepõe a base do painel central?
- `npm run lint` passa?
- `npm run build` passa?

## Prompt Base Para Usar No Futuro

Copie este bloco quando quiser pedir uma nova alteração:

```md
Estou trabalhando no projeto VitalFit Management.

Contexto: a hero atual é uma scene composition 3D em Next.js/React/Tailwind/Framer Motion, inspirada em uma referência de Gym Management premium com painéis glass abertos no espaço.

Não quero voltar para uma landing SaaS tradicional. Não usar headline gigante à esquerda, navbar horizontal no topo ou layout em duas colunas.

Arquitetura atual:
- Hero principal: `src/components/landing/hero/HeroScene.tsx`
- Background: `src/components/landing/hero/HeroBackground.tsx`
- Nav mobile: `src/components/landing/hero/MobileBottomNav.tsx`
- Dados/mock: `src/components/landing/hero/data/heroScene.mock.ts`
- Motion: `src/components/landing/hero/motion/heroScene.motion.ts`
- Painel central: `src/components/landing/hero/panels/CenterDashboardPanel.tsx`
- Painel esquerdo: `src/components/landing/hero/panels/LeftSidebarPanel.tsx`
- Painel direito: `src/components/landing/hero/panels/RightProfilePanel.tsx`
- Modal frontal (inativo): `src/components/landing/hero/panels/FrontFloatingModal.tsx`
- Glass base: `src/components/common/glass-panel/glass-panel.tsx`
- Tema: `src/config/theme.ts`

Layout:
- mobile (< lg): painel central + MobileBottomNav, sem 3D
- desktop (>= lg): três painéis em perspectiva, perspective 2400px

Regras:
- manter painel central dominante
- manter painéis laterais em perspectiva 3D (rotateY apenas)
- manter background ambientado com foto de interior
- manter motion sequencial: central → esquerdo → direito
- preservar estética premium/glassmorphism/cinematográfica

Tarefa:
[descreva aqui a alteração desejada]
```
