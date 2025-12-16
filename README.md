# SysGet — Gestão de Despesas Pessoais (MVP)

Sistema WEB responsivo com:
- **FrontEnd**: Next.js (Vercel)
- **BackEnd**: Node.js + Express + TypeScript (Render)
- **Banco**: Supabase (Postgres)

## Telas
- **Dashboard**: total, contagem, gasto por responsável + recentes
- **Despesas**: lançar e listar despesas (em aberto/pago)
- **Responsáveis**: cadastrar e listar responsáveis
 
> Observação: **não usamos categoria** neste MVP.
> Observação: valores exibidos em **USD** e responsável **não tem e-mail** neste MVP.

## Estrutura
- `frontend/`: Next.js + Tailwind (Vercel)
- `backend/`: API Express/TS (Render)
- `supabase/schema.sql`: SQL para criar as tabelas no Supabase

## 1) Supabase (Banco)
1. Crie um projeto no Supabase
2. Abra o **SQL Editor**
3. Execute o arquivo `supabase/schema.sql`

## 2) Backend (Render)
### Rodar local
No Windows/PowerShell, no diretório `backend/`:

1. Configure as variáveis de ambiente (use como base `backend/env.example`)
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CORS_ORIGIN` (ex.: `http://localhost:3000`)
2. Instale e rode:
   - `npm install`
   - `npm run dev`

API:
- `GET /health`
- `GET/POST/PUT/DELETE /responsibles`
- `GET/POST/PUT/DELETE /expenses`
- `PATCH /expenses/:id/status`
- `GET /dashboard`

Regras:
- **Excluir despesa**: permitido **somente** quando `status = open` (em aberto).

### Deploy no Render
Crie um **Web Service** apontando para o repo e use:
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

Env Vars no Render:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CORS_ORIGIN` = `https://seu-front.vercel.app`
- `PORT` (o Render normalmente já injeta)

## 3) Frontend (Vercel)
### Rodar local
No diretório `frontend/`:
1. Crie um `.env.local` baseado em `frontend/env.example`
   - `NEXT_PUBLIC_API_BASE_URL=http://localhost:3333`
2. Rode:
   - `npm install`
   - `npm run dev`

### Deploy na Vercel
Crie um projeto apontando para o repo e use:
- **Root Directory**: `frontend`

Env Vars na Vercel:
- `NEXT_PUBLIC_API_BASE_URL` = URL pública do backend no Render (ex.: `https://seu-back.onrender.com`)

## Atalhos (opcional)
Na raiz do repo:
- `npm run dev:backend`
- `npm run dev:frontend`


