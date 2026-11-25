# SiNutre — Frontend

Interface web do **SiNutre**, um sistema de acompanhamento de ingestão de
macronutrientes. Desenvolvida em **React 19 + TypeScript + Vite + Tailwind CSS v4
+ daisyUI v5**, consome a API do [sinutre-backend](https://github.com/Silvinho1982/sinutre-backend).

## Links de produção

- **Frontend (Vercel):** _será preenchido após o deploy_
- **Backend (Railway):** https://sinutre-api-production.up.railway.app
- **Healthcheck da API:** https://sinutre-api-production.up.railway.app/health
- **Repositório do backend:** https://github.com/Silvinho1982/sinutre-backend

## Funcionalidades desenvolvidas

### Alimentos
- [x] **Alterar** alimento cadastrado (modal de edição com dados atuais).
- [x] **Excluir** alimento com confirmação e bloqueio quando já usado em refeições.
- [x] **Validação de dados** no cadastro e na alteração: nome obrigatório (2–120
  caracteres), calorias entre 0 e 1000 kcal/100 g e carboidratos, proteínas e
  gorduras entre 0 e 100 g/100 g. Erros do servidor são exibidos campo a campo.
- [x] Busca de alimentos por nome e estados de carregamento/vazio.

### Perfil do usuário
- [x] **Cadastro de dados complementares** do usuário logado: meta calórica
  diária, altura, peso e nível de atividade física.
- [x] **Alteração** dos dados complementares, com prévia do IMC em tempo real.
- [x] Validação: meta entre 500 e 20.000 kcal (inteiro), altura entre 80 e 250 cm,
  peso entre 20 e 400 kg e nível de atividade obrigatório.

### Dashboard
- [x] **Meta calórica exibida** no dashboard, lida do banco de dados.
- [x] Barra de progresso com consumido, restante e percentual da meta.
- [x] **Sinalização de meta ultrapassada** com alerta destacado e valores em
  quilocalorias acima da meta.

### Métricas
- [x] Página **Métricas** acessível pelo menu lateral.
- [x] **IMC** do usuário com faixa sinalizada (abaixo do peso, peso normal,
  sobrepeso ou obesidade) e escala visual.
- [x] **Média calórica dos últimos 7 dias** e sua relação com a meta
  (abaixo, dentro ou acima), incluindo gráfico de barras por dia.

### Interface e sessão
- [x] **Login e logout** com e-mail/senha (JWT) e suporte opcional a GitHub OAuth.
- [x] **Modo claro/escuro** com alternância no menu lateral, cabeçalho e tela de
  login; preferência persistida no navegador.
- [x] Layout responsivo (menu retrátil no mobile, tabela no desktop e cards no
  mobile).

## Stack

- Vite 6 + React 19 + TypeScript
- Tailwind CSS v4 + daisyUI v5 (temas `sinutre` e `sinutre-dark`)
- React Router 7
- Axios
- @phosphor-icons/react

## Rodando localmente

```bash
npm install
cp .env.example .env      # VITE_API_URL apontando para o backend
npm run dev               # http://localhost:5173
```

O backend precisa estar rodando (por padrão em `http://localhost:3333`) e com o
PostgreSQL migrado. Veja as instruções no repositório do backend.

## Variáveis de ambiente

| Variável | Descrição |
| --- | --- |
| `VITE_API_URL` | URL pública da API (ex.: `https://sinutre-backend.up.railway.app`) |

## Estrutura

```
src/
├── components/
│   ├── cards/      # cards do dashboard
│   ├── forms/      # campos de formulário
│   ├── layout/     # sidebar, header, tema
│   ├── macros/     # barras de macronutrientes
│   ├── meals/      # listas e tabelas de refeições
│   └── modal/      # modais de refeição e de alimento (criar/editar)
├── contexts/       # AuthContext e ThemeContext
├── pages/          # Login, Dashboard, Alimentos, Métricas e Perfil
├── routes/         # rotas e proteção de sessão
├── services/       # integração com a API
├── styles/         # Tailwind + temas claro/escuro
├── types/          # tipos do domínio
└── lib/            # cliente HTTP e tratamento de erros
```

## Deploy na Vercel

1. Importe este repositório em [vercel.com](https://vercel.com).
2. Framework: **Vite** (build `npm run build`, output `dist`).
3. Configure `VITE_API_URL` com a URL do backend no Railway.
4. O `vercel.json` já redireciona rotas do SPA para `index.html`.
