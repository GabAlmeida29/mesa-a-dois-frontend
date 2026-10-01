# Mesa a Dois — Web

Front-end do **Mesa a Dois**, o diário gastronômico de Gabriel e Milena. Ele mostra os restaurantes visitados num mapa escuro e interativo, em grade com busca e filtros e em páginas de detalhe com notas e pratos. Também traz a área administrativa para cadastrar tudo.

- **Visitantes** só visualizam.
- **Gabriel e Milena** entram com senha + código 2FA e passam a ver as ações de criar, editar e excluir.

---

## Sumário

1. [Stack](#stack)
2. [Páginas](#páginas)
3. [Estrutura de pastas](#estrutura-de-pastas)
4. [Como o front conversa com a API](#como-o-front-conversa-com-a-api)
5. [Autenticação no front](#autenticação-no-front)
6. [Mapa](#mapa)
7. [Cadastro de restaurante](#cadastro-de-restaurante)
8. [Busca, filtros e ordenação](#busca-filtros-e-ordenação)
9. [Design system](#design-system)
10. [Textos e personalização](#textos-e-personalização)
11. [Segurança (headers e CSP)](#segurança-headers-e-csp)
12. [Variáveis de ambiente](#variáveis-de-ambiente)
13. [Rodando localmente](#rodando-localmente)
14. [Scripts](#scripts)
15. [Build e Docker](#build-e-docker)

---

## Stack

| Área          | Tecnologia                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------------ |
| Framework     | Next.js 15 (App Router) · React 19 · TypeScript                                                                    |
| Estilo        | Tailwind CSS 4 (tokens em `@theme`, utilitários próprios com `@utility`)                                           |
| Formulários   | React Hook Form + Zod                                                                                              |
| Mapa          | Leaflet + React-Leaflet, com o mapa base **vetorial** desenhado pelo MapLibre GL (`@maplibre/maplibre-gl-leaflet`) |
| Dados do mapa | OpenFreeMap (tiles vetoriais, gratuito, sem chave)                                                                 |
| Endereços     | Photon (OpenStreetMap): autocomplete e busca reversa, sem chave                                                    |
| Ícones        | lucide-react                                                                                                       |
| Fontes        | Inter e Fraunces, self-hosted via `@fontsource-variable` (o build não depende de rede)                             |
| Qualidade     | ESLint (`next/core-web-vitals` + TypeScript) · Prettier com ordenação de classes Tailwind                          |

---

## Páginas

| Rota                        | Acesso  | O que faz                                                                                                                                                                                                       |
| --------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                         | público | Mapa com um pin por restaurante (com a foto/logo) e estatísticas: total de restaurantes, pratos, cidades e nota média. O popup mostra foto, categoria, cidade, faixa de preço, data, nota e link para o detalhe |
| `/restaurantes`             | público | Grade de cards com busca, **filtros** e ordenação. Logado, cada card ganha editar/excluir                                                                                                                       |
| `/restaurantes/[id]`        | público | Foto em destaque, notas do Gabriel e da Milena, média, "voltaríamos?", opinião, pratos (foto, preço, notas) e mini-mapa com link para o Google Maps (busca pelo endereço)                                       |
| `/restaurantes/novo`        | admin   | Cadastro de restaurante                                                                                                                                                                                         |
| `/restaurantes/[id]/editar` | admin   | Edição                                                                                                                                                                                                          |
| `/login`                    | público | Login em duas etapas: e-mail + senha, depois o código do app autenticador                                                                                                                                       |
| `/sobre`                    | público | Apresentação do casal, com fotos, e de como eles avaliam                                                                                                                                                        |

As páginas de admin ficam dentro do `AdminGuard`, que redireciona para `/login` quando não há sessão. Mesmo assim, **quem protege de fato é a API**: toda escrita exige sessão válida.

---

## Estrutura de pastas

```
web/
├── public/about/                 # fotos do "Sobre nós"
├── src/
│   ├── app/                      # rotas (App Router)
│   │   ├── layout.tsx            # fontes, providers (Auth/Toast), header e footer
│   │   ├── globals.css           # tokens de cor, utilitários (btn, card, input, select) e tema do Leaflet
│   │   ├── page.tsx              # mapa + estatísticas
│   │   ├── restaurantes/         # grade, detalhe, novo, editar
│   │   ├── login/ · sobre/ · not-found.tsx
│   ├── components/
│   │   ├── Header.tsx · UserMenu.tsx · UserAvatar.tsx · Footer.tsx
│   │   ├── RestaurantCard.tsx · RestaurantFilters.tsx · RatingBadge.tsx · RatingSummary.tsx
│   │   ├── RestaurantForm.tsx · AddressAutocomplete.tsx · ImageUpload.tsx
│   │   ├── DishCard.tsx · DishForm.tsx
│   │   ├── Modal.tsx · ConfirmDialog.tsx · States.tsx · AdminGuard.tsx
│   │   └── map/
│   │       ├── index.ts           # carrega os mapas só no cliente (next/dynamic, ssr: false)
│   │       ├── RestaurantMap.tsx  # mapa público com pins e popups
│   │       ├── LocationPicker.tsx # mapa do formulário (clique/arraste o pin)
│   │       ├── BaseTiles.tsx      # camada vetorial MapLibre dentro do Leaflet
│   │       ├── map-style.ts       # ajusta as cores do estilo "dark" à paleta do site
│   │       └── leaflet-utils.ts   # ícones dos pins
│   ├── constants/
│   │   ├── texts.ts              # TODOS os textos do site + lista de categorias
│   │   └── config.ts             # centro do mapa, URLs do mapa e do geocoder
│   ├── contexts/                 # AuthContext (sessão) e ToastContext (avisos)
│   └── lib/
│       ├── api.ts                # cliente HTTP da API
│       ├── geocode.ts            # autocomplete e busca reversa (Photon)
│       ├── filters.ts            # filtros da grade (aplicação e sincronização com a URL)
│       ├── format.ts             # datas, moeda, notas, link do Google Maps
│       ├── form-utils.ts         # validação de notas/preço digitados como texto
│       ├── use-debounced-value.ts
│       └── types.ts
└── next.config.ts                # rewrites para a API + headers de segurança
```

---

## Como o front conversa com a API

O navegador **só fala com o próprio domínio do site**:

- **Desenvolvimento**: o Next encaminha `/api/*` e `/uploads/*` para a API (`API_INTERNAL_URL`, padrão `http://localhost:3333`) pelos `rewrites` do `next.config.ts`.
- **Produção**: o Caddy faz o mesmo papel, roteando `/api` e `/uploads` direto para a API.

Vantagens:

- o cookie de sessão é _first-party_ e pode ser `SameSite=Strict`;
- não existe CORS aberto;
- a CSP pode limitar `connect-src` a `'self'` (mais os serviços de mapa).

O `lib/api.ts` centraliza as chamadas:

- usa `credentials: 'same-origin'`, então o cookie vai junto automaticamente;
- envia `X-Requested-With: mesa-a-dois`, exigido pela API em toda escrita;
- converte erros em `ApiError` (`status`, `message`, `details`, `mfaRequired`, `mfaSetupRequired`);
- em qualquer `401` dispara o evento `mesa:unauthorized`, e o `AuthContext` derruba o estado de login.

---

## Autenticação no front

- **Sem token no JavaScript**: a sessão vive num cookie `httpOnly` que o código do site nem consegue ler. Nada é guardado em `localStorage`.
- Ao carregar, o `AuthContext` chama `GET /api/auth/me` para saber se há sessão. `isAdmin` libera os botões de ação.
- **Fluxo do login** (`/login`):
  1. o usuário envia e-mail e senha;
  2. se a API responder `mfaRequired`, a tela pede o código de 6 dígitos (com `autocomplete="one-time-code"`);
  3. se responder `mfaSetupRequired`, a tela mostra o comando de terminal para ativar o 2FA;
  4. se responder `429`, mostra o aviso de bloqueio temporário.
- **Menu do usuário**: o avatar com o nome abre um popover com "Novo restaurante" e "Sair". Ele fecha com clique fora ou `Esc`. No celular, as mesmas opções aparecem no menu hambúrguer.
- O avatar usa a foto do "Sobre nós" quando o nome bate (Gabriel/Milena). Caso contrário, mostra a inicial.

---

## Mapa

- **Base vetorial**: o estilo `dark` do OpenFreeMap é carregado uma única vez e ajustado em `map-style.ts`, que só troca cores:
  - fundo grafite e água azulada;
  - áreas verdes discretas;
  - ruas mais visíveis e rótulos com contraste.

  Por ser vetorial e desenhado em WebGL, fica nítido em qualquer zoom (até 19).

- **Leaflet por cima**: pins, popups e interações continuam no Leaflet. O MapLibre entra como uma camada (`L.maplibreGL`).
- **Pins**: gota com a foto do restaurante, ou a inicial do nome quando não há foto (`leaflet-utils.ts`).
- **Enquadramento automático**: o mapa ajusta o zoom para mostrar todos os restaurantes.
- **Sem barra de atribuição no mapa**: os créditos exigidos pela licença (OpenStreetMap, OpenMapTiles, OpenFreeMap) ficam discretos no rodapé do site.
- **Só no cliente**: Leaflet e MapLibre acessam `window`, por isso os mapas são carregados com `next/dynamic` e `ssr: false`.

Para trocar o visual, edite as cores em `PALETTE` (`map-style.ts`) ou aponte `NEXT_PUBLIC_MAP_STYLE_URL` para outro estilo, como `positron` ou `liberty` do OpenFreeMap.

---

## Cadastro de restaurante

O formulário (`RestaurantForm.tsx`) tem três blocos.

**1. Informações básicas**

- foto/logo em upload quadrado (`ImageUpload`), enviada para `/api/uploads` e convertida em WebP pela API;
- nome;
- **categoria**: select com a lista fixa `CUISINES`, para evitar variações de digitação;
- faixa de preço;
- data da visita;
- descrição curta.

**2. Localização**, com um campo único de endereço (`AddressAutocomplete`):

- sugestões **enquanto digita**, com debounce de 350 ms, priorizando lugares perto do mapa atual;
- teclado: `↑`/`↓` navega, `Enter` escolhe, `Esc` fecha (combobox acessível);
- escolher uma sugestão preenche endereço, **cidade** e pin, e também o nome, se ainda estiver vazio;
- se você digitou o número e a sugestão é só a rua, o número digitado é mantido;
- clicar no mapa, arrastar o pin ou usar o GPS dispara a **busca reversa**, que descobre a cidade (e o endereço, se vazio);
- a cidade aparece como "Cidade: X" com a opção **corrigir**.

**3. Avaliação**

- nota do Gabriel e da Milena (0–10, aceita vírgula, passo de 0,5);
- opinião;
- "voltaríamos".

A validação usa **Zod no front** (feedback imediato) e é repetida **na API** (a que vale de verdade).

Os pratos são criados e editados num modal (`DishForm`) na página do restaurante.

---

## Busca, filtros e ordenação

Na página `/restaurantes`:

- **Busca**: texto livre, com debounce, consultado na API. Encontra por nome, categoria, cidade e **nome de prato**.
- **Filtros** (`RestaurantFilters.tsx`), aplicados no navegador sobre o resultado da busca:
  - categoria e cidade, com contagem (as opções saem dos próprios restaurantes);
  - faixa de preço (`$`–`$$$$`);
  - nota mínima;
  - período da visita (de/até);
  - "voltaríamos?".
- **Ordenação**: visita mais recente, melhor nota ou nome.
- **Tudo fica na URL**, como em `?cozinha=Italiana&nota=8&de=2026-01-01`:
  - ao voltar da página de detalhe, a lista continua como estava;
  - o link filtrado pode ser compartilhado.
- O botão "Filtros" mostra quantos filtros estão ativos, e a página mostra "X de Y restaurantes".

---

## Design system

- **Tema escuro "luz de vela"**: os tokens ficam no bloco `@theme` do `globals.css`.

  | Token                          | Uso                              |
  | ------------------------------ | -------------------------------- |
  | `bg` / `surface` / `surface-2` | fundos em camadas                |
  | `accent` (brasa)               | ações principais                 |
  | `gold`                         | preços                           |
  | `good` / `bad`                 | notas altas/baixas, sucesso/erro |

- **Utilitários** (`@utility`): `card`, `btn-primary`, `btn-ghost`, `btn-danger`, `input`, `select` (seta própria, sem visual nativo), `label`, `field-error`.
- **Tipografia**: Fraunces nos títulos, Inter no texto.
- **Responsivo**: a grade vai de 1 a 4 colunas, o menu vira hambúrguer no celular e os mapas ajustam a altura.
- **Acessibilidade**:
  - `aria-*` nos menus, combobox e diálogos;
  - diálogos com o `<dialog>` nativo;
  - foco visível;
  - ícones com rótulo.

---

## Textos e personalização

| O que mudar                                                      | Onde                                                                          |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Qualquer texto do site (títulos, botões, mensagens, "Sobre nós") | `src/constants/texts.ts`                                                      |
| Lista de categorias de cozinha                                   | `CUISINES` em `texts.ts`                                                      |
| Fotos do "Sobre nós"                                             | `public/about/gabriel.webp` e `milena.webp` (campo `photo` em `ABOUT.people`) |
| Cores do site                                                    | `@theme` em `src/app/globals.css`                                             |
| Cores do mapa                                                    | `PALETTE` em `src/components/map/map-style.ts`                                |
| Centro e zoom inicial do mapa                                    | `MAP_DEFAULT_CENTER` / `MAP_DEFAULT_ZOOM` em `src/constants/config.ts`        |

---

## Segurança (headers e CSP)

O `next.config.ts` aplica em todas as páginas:

- **Content-Security-Policy**:
  - `default-src 'self'`;
  - imagens só do próprio site, dos hosts do mapa e de `NEXT_PUBLIC_IMAGE_HOSTS`;
  - `connect-src` só para o próprio site, o Photon e o OpenFreeMap;
  - `worker-src blob:`, exigido pelo MapLibre;
  - `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`;
  - `upgrade-insecure-requests` em produção.
- **Strict-Transport-Security** (produção), **X-Frame-Options: DENY**, **X-Content-Type-Options: nosniff**, **Referrer-Policy**, **Permissions-Policy** (só geolocalização, e só no próprio site) e **Cross-Origin-Opener-Policy**.
- `poweredByHeader: false`.

> `script-src` inclui `'unsafe-inline'` porque o Next injeta scripts inline de hidratação. No modo dev entra também `'unsafe-eval'`, exigido pelo recarregamento automático (HMR).

---

## Variáveis de ambiente

Copie `.env.example` para `.env.local`. Todas são opcionais.

| Variável                           | Padrão                          | Descrição                                                      |
| ---------------------------------- | ------------------------------- | -------------------------------------------------------------- |
| `API_INTERNAL_URL`                 | `http://localhost:3333`         | para onde o Next encaminha `/api` e `/uploads` (lida no build) |
| `NEXT_PUBLIC_MAP_STYLE_URL`        | OpenFreeMap `dark`              | estilo vetorial do mapa                                        |
| `NEXT_PUBLIC_MAP_HOSTS`            | `https://tiles.openfreemap.org` | hosts do mapa liberados na CSP (separados por espaço)          |
| `NEXT_PUBLIC_GEOCODER_URL`         | Photon `/api/`                  | autocomplete de endereço                                       |
| `NEXT_PUBLIC_REVERSE_GEOCODER_URL` | Photon `/reverse`               | busca reversa                                                  |
| `NEXT_PUBLIC_GEOCODER_HOST`        | `https://photon.komoot.io`      | host do geocoder liberado na CSP                               |
| `NEXT_PUBLIC_IMAGE_HOSTS`          | vazio                           | hosts extras de imagem (ex.: bucket R2 público)                |

---

## Rodando localmente

Com a API rodando em `http://localhost:3333` (veja o [repositório da API](https://github.com/GabAlmeida29/mesa-a-dois-backend)):

```bash
cd web
cp .env.example .env.local
npm install
npm run dev        # http://localhost:3000
```

Use sempre o endereço **:3000**: é por ele que `/api` chega à API com o cookie de sessão.

---

## Scripts

| Script                            | O que faz                                           |
| --------------------------------- | --------------------------------------------------- |
| `npm run dev`                     | servidor de desenvolvimento                         |
| `npm run build`                   | build de produção (inclui lint e checagem de tipos) |
| `npm start`                       | serve o build                                       |
| `npm run lint`                    | ESLint                                              |
| `npm run typecheck`               | TypeScript                                          |
| `npm run format` / `format:check` | Prettier (com ordenação de classes Tailwind)        |

---

## Build e Docker

- `output: 'standalone'` gera um servidor Node mínimo.
- O `Dockerfile` (multi-stage) copia só o necessário e roda como usuário `node`.
- `API_INTERNAL_URL` é passada como _build arg_, porque os rewrites são definidos em tempo de build. No `deploy/docker-compose.yml` do repositório da API ela aponta para `http://api:3333`.

Em produção, o Caddy expõe o site com HTTPS automático e roteia `/api` e `/uploads` para a API. Veja o [guia de deploy](https://github.com/GabAlmeida29/mesa-a-dois-backend/blob/main/deploy/README.md).
