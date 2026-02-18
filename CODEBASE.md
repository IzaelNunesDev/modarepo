# CODEBASE.md - moda-store

## 📝 Visão Geral
Projeto de e-commerce de moda (Moda Store) construído com uma arquitetura moderna dividida entre Frontend (Next.js) e Backend (Node.js/Express).

---

## 💻 Ambiente & Contexto
- **Sistema Operacional:** Windows
- **Gerenciador de Pacotes:** npm
- **Ambiente de Dev:** Next.js Dev Server (Porta 3000) / Express Server (Porta 3001)

---

## 🛠️ Tech Stack
- **Frontend:**
  - Next.js 15+ (App Router)
  - React 19
  - Tailwind CSS v4
  - Lucide React (Ícones)
- **Backend:**
  - Node.js & Express
  - TypeScript
  - Stripe (Pagamentos)
  - Redis + BullMQ (Filas de processamento)
- **Infraestrutura:**
  - Docker & Docker Compose
  - Nginx (Reverse Proxy)

---

## 📂 Estrutura de Diretórios

```plaintext
moda-store/
├── src/                    # Frontend (Next.js)
│   ├── app/                # Rotas e Páginas (App Router)
│   ├── components/         # Componentes Reutilizáveis
│   └── types/              # Definições de Tipos TS
├── server/                 # Backend (Express)
│   ├── src/
│   │   ├── controllers/    # Lógica de Controle
│   │   ├── services/       # Integrações (Stripe, etc.)
│   │   ├── routes/         # Definições de API
│   │   └── queues/         # Processamento Background (BullMQ)
├── public/                 # Ativos Estáticos
├── deploy/                 # Scripts de Deployment
├── .agent/                 # Antigravity Kit (Agentes e Skills)
└── docker-compose.yml      # Orquestração de Containers
```

---

## 🔗 Dependências Críticas
- **Stripe:** Processamento de pagamentos e webhooks.
- **Redis:** Necessário para o funcionamento das filas de processamento do backend.
- **Tailwind v4:** Sistema de estilização global.

---

## 🚦 Status de Desenvolvimento
- [x] Estrutura Base (Monorepo-like)
- [x] Configuração Docker
- [x] Integração Stripe (Base)
- [ ] Painel Administrativo (Em progresso)
- [ ] Finalização de UI/UX Premium
