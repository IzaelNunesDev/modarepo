# Moda Store - SaaS de Loja de Roupas

Sistema SaaS completo para loja de roupas com vitrine de produtos, painel administrativo, checkout e **gateway de pagamento com webhooks e filas**.

## 🎯 Funcionalidades

### Loja (Cliente)
- ✅ Listagem de produtos com busca e filtros
- ✅ Detalhes do produto com galeria de imagens
- ✅ Seleção de tamanho e cor
- ✅ Carrinho de compras
- ✅ Checkout com múltiplas formas de pagamento (PIX, Cartão, Boleto)

### Admin
- ✅ Dashboard com estatísticas
- ✅ Adicionar produtos com upload de fotos
- ✅ Controle de estoque por variação (tamanho/cor)

### � Gateway de Pagamento (NOVO)
- ✅ Integração com Stripe (modo simulado incluso)
- ✅ Suporte a PIX (QR Code + Copia e Cola)
- ✅ Suporte a Cartão de Crédito (Stripe Checkout)
- ✅ Suporte a Boleto (código de barras + PDF)
- ✅ Webhooks para receber eventos do Stripe
- ✅ Filas BullMQ + Redis para processamento assíncrono
- ✅ Idempotência (mesmo pagamento nunca processado duas vezes)
- ✅ Resiliência (se o servidor cair, a fila preserva os eventos)
- ✅ Graceful Shutdown (workers encerram corretamente)

## �🚀 Tecnologias

### Frontend
- **Next.js 15** - Framework React Full Stack
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Estilização

### Backend (Gateway de Pagamento)
- **Node.js + Express** - Servidor HTTP
- **TypeScript** - Tipagem estática
- **Stripe SDK** - Gateway de pagamento
- **BullMQ** - Filas de processamento assíncrono
- **Redis (IORedis)** - Broker de filas + cache de idempotência
- **UUID** - Geração de chaves únicas

## 🏗️ Arquitetura do Gateway de Pagamento

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Frontend      │────▶│  Express API     │────▶│   Stripe    │
│   (Next.js)     │     │  (Port 3001)     │     │   Gateway   │
└─────────────────┘     └──────────────────┘     └──────┬──────┘
                               │                        │
                               │                        │ Webhook
                               │                        ▼
                               │                ┌──────────────┐
                               │                │  /webhook/   │
                               │                │   stripe     │
                               │                └──────┬───────┘
                               │                       │
                               │            ┌──────────▼──────────┐
                               │            │  BullMQ Queue       │
                               │            │  (Redis Broker)     │
                               │            └──────────┬──────────┘
                               │                       │
                               │            ┌──────────▼──────────┐
                               └───────────▶│  Payment Worker     │
                                            │  (Async Processing) │
                                            └──────────┬──────────┘
                                                       │
                                            ┌──────────▼──────────┐
                                            │  Order Update       │
                                            │  Worker             │
                                            └─────────────────────┘
```

### Conceitos Técnicos Aplicados

1. **Filas (Queues)**: Webhooks são enfileirados no BullMQ e processados assincronamente. O servidor responde 200 ao Stripe imediatamente.

2. **Resiliência**: Se o servidor cair, o Redis preserva os jobs. Quando o servidor reinicia, os workers retomam o processamento.

3. **Webhooks**: O Stripe envia eventos (pagamento confirmado, falhou, etc.) via HTTP POST. O Express valida a assinatura e enfileira.

4. **Idempotência**: Três camadas de proteção:
   - **Frontend**: Gera uma chave única por checkout
   - **Middleware Redis**: Cache de resultados por chave
   - **BullMQ**: JobId = EventId do Stripe (nunca duplica)

## 🛠️ Desenvolvimento Local

### Pré-requisitos
- Node.js 18+
- Redis rodando localmente (porta 6379)
- (Opcional) Chaves do Stripe para modo real

### Instalação

```bash
# Frontend
npm install

# Backend
cd server
npm install
```

### Rodando

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd server
npm run dev
```

### Configuração (Opcional - Stripe Real)

Copie o `.env.example` para `.env` no diretório `server/`:

```bash
cd server
cp .env.example .env
# Edite o .env com suas chaves do Stripe
```

> **Sem chaves do Stripe?** O servidor opera em **modo simulado** automaticamente, gerando dados fake de PIX, Boleto e Cartão.

## 📋 API do Gateway de Pagamento

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/payment/checkout` | Cria checkout/pagamento |
| `GET` | `/api/payment/order/:orderId` | Consulta status do pedido |
| `GET` | `/api/payment/orders` | Lista todos os pedidos |
| `GET` | `/api/payment/queue-status` | Métricas das filas BullMQ |
| `POST` | `/api/webhook/stripe` | Recebe webhooks do Stripe |
| `POST` | `/api/payment/simulate-success/:orderId` | Simula pagamento (dev) |
| `POST` | `/api/payment/simulate-webhook` | Simula webhook (dev) |
| `GET` | `/api/health` | Health check |

## 📂 Estrutura do Projeto

```
src/                            # Frontend (Next.js)
├── app/
│   ├── page.tsx               # Home (listagem de produtos)
│   ├── produto/[id]/          # Detalhes do produto
│   ├── carrinho/              # Carrinho de compras
│   ├── checkout/              # Página de pagamento
│   │   ├── page.tsx           # Checkout (conectado ao backend)
│   │   └── sucesso/page.tsx   # Confirmação de pagamento
│   ├── conta/                 # Conta do usuário
│   └── admin/                 # Painel administrativo
├── components/                # Componentes reutilizáveis
├── data/                      # Dados mock
└── types/                     # Definições TypeScript

server/                         # Backend (Express)
├── src/
│   ├── index.ts               # Entry point Express
│   ├── config/
│   │   └── env.ts             # Variáveis de ambiente
│   ├── routes/
│   │   ├── payment.routes.ts  # Rotas de pagamento
│   │   └── webhook.routes.ts  # Rotas de webhook
│   ├── controllers/
│   │   ├── payment.controller.ts  # Lógica de pagamento
│   │   └── webhook.controller.ts  # Lógica de webhook
│   ├── services/
│   │   ├── stripe.service.ts  # Integração Stripe
│   │   └── order.service.ts   # Gestão de pedidos
│   ├── queues/
│   │   ├── connection.ts      # Conexão Redis
│   │   ├── payment.queue.ts   # Filas BullMQ
│   │   └── payment.worker.ts  # Workers assíncronos
│   ├── middleware/
│   │   └── idempotency.ts     # Middleware de idempotência
│   └── types/
│       └── index.ts           # Tipos TypeScript
├── package.json
├── tsconfig.json
└── .env.example
```

## 🎨 Design

O design foi baseado nos protótipos HTML originais em `design_assets/`, seguindo:
- Paleta de cores rosa/magenta
- Fontes Manrope e Noto Sans
- Componentes modernos e responsivos

## 📝 Licença

MIT
