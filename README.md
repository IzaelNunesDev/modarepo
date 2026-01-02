# Moda Store - SaaS de Loja de Roupas

Sistema SaaS completo para loja de roupas com vitrine de produtos, painel administrativo e checkout.

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

## 🚀 Tecnologias

- **Next.js 16** - Framework React Full Stack
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Estilização
- **Node.js** - Backend (via API Routes do Next.js)

## 📱 Mobile First

Todo o sistema foi desenvolvido com foco em dispositivos móveis, garantindo uma experiência perfeita em smartphones.

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build de produção
npm run build

# Rodar produção localmente
npm start
```

## ☁️ Deploy no Render

### Configuração no Render

1. Crie um novo **Web Service** no Render
2. Conecte ao repositório GitHub
3. Configure:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Node Version:** `18` (ou superior)

### Variáveis de Ambiente (opcional)
```
PORT=3000
NODE_ENV=production
```

## 📂 Estrutura do Projeto

```
src/
├── app/                    # Páginas (App Router)
│   ├── page.tsx           # Home (listagem de produtos)
│   ├── produto/[id]/      # Detalhes do produto
│   ├── carrinho/          # Carrinho de compras
│   ├── checkout/          # Página de pagamento
│   ├── conta/             # Conta do usuário
│   └── admin/             # Painel administrativo
│       ├── page.tsx       # Dashboard
│       ├── produtos/novo/ # Adicionar produto
│       └── estoque/       # Controle de estoque
├── components/            # Componentes reutilizáveis
├── data/                  # Dados mock
└── types/                 # Definições TypeScript
```

## 🎨 Design

O design foi baseado nos protótipos HTML originais em `design_assets/`, seguindo:
- Paleta de cores rosa/magenta
- Fontes Manrope e Noto Sans
- Componentes modernos e responsivos

## 📝 Licença

MIT
