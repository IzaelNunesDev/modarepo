# Plano de Implementação: Evolução da Moda Store 🚀

Este documento detalha as etapas necessárias para transformar o protótipo atual da **Moda Store** em um sistema robusto, seguro e pronto para produção.

## 📌 Resumo do Estado Atual
O projeto possui uma base sólida em Next.js 15/16 e Node/Express, com integração ao Stripe e filas BullMQ. No entanto, sofre com falta de persistência (dados em memória), falhas de segurança no admin e configurações de deploy rígidas (IPs hardcoded).

---

## 🛠 Fase 1: Correções de Infraestrutura e Configuração (Imediato)
*Foco: Corrigir bugs de deploy e acessibilidade.*

1. **Desacoplamento de IPs**: 
   - Mover o IP `144.22.222.29` para variáveis de ambiente (`.env.production`).
   - Atualizar `docker-compose.yml` e `deploy/deploy.sh` para usar essas variáveis.
2. **Correção de Fluxo de Git**:
   - Padronizar o branch de deploy para `main` tanto no `deploy.yml` (GitHub Actions) quanto no `update.sh`.
3. **Acessibilidade e SEO**:
   - Remover `userScalable: false` e `maximumScale: 1` do `viewport` em `src/app/layout.tsx`.
   - Adotar `next/font/google` para carregar as fontes Manrope e Noto Sans, eliminando o Layout Shift.
4. **Otimização Next.js**:
   - Converter a `HomePage` (`src/app/page.tsx`) para **Server Component**, removendo o `'use client'` desnecessário.
5. **Documentação**:
   - Corrigir a versão do Next.js no `README.md` (ajustar para v15 ou v16 conforme real).

---

## 🗄 Fase 2: Persistência de Dados (Banco de Dados Real)
*Foco: Eliminar a perda de dados ao reiniciar containers.*

1. **Setup do Banco**:
   - Adicionar serviço **PostgreSQL** ao `docker-compose.yml`.
   - Configurar volumes para persistência dos dados do banco.
2. **Integração Backend**:
   - Instalar um ORM (Prisma ou Drizzle) no diretório `server/`.
   - Criar schemas para `Products`, `Orders` e `Users`.
3. **Migração de Serviços**:
   - Refatorar `order.service.ts` para realizar queries no PostgreSQL em vez de usar `Map` em memória.
   - Refatorar a listagem de produtos para ler do banco.

---

## 🔐 Fase 3: Segurança e Autenticação do Admin
*Foco: Proteger o painel de gerenciamento.*

1. **Implementação de Auth**:
   - Integrar **NextAuth.js (Auth.js)** para gerenciar sessões.
   - Configurar provider de credenciais (e futuramente Social Login).
2. **Proteção de Rotas**:
   - Criar um **Middleware** no Next.js para bloquear acesso a `/admin/*` para usuários não autenticados ou sem role `ADMIN`.
3. **Admin Funcional**:
   - Conectar as páginas de criação/edição de produtos ao banco de dados real.

---

## 🌐 Fase 4: Profissionalização (Produção)
*Foco: HTTPS, Domínio e Integrações Externas.*

1. **HTTPS / SSL**:
   - Configurar **Certbot** no Nginx via Docker para renovação automática de certificados Let's Encrypt.
2. **Upload de Imagens**:
   - Substituir o armazenamento local por **Cloudinary** ou **AWS S3/Cloudflare R2**.
3. **E-mails Transacionais**:
   - Integrar **Resend** para disparar confirmações de pedido e notificações de pagamento.
4. **SEO Dinâmico**:
   - Implementar `generateMetadata()` nas rotas de produtos para gerar títulos e tags OpenGraph dinâmicas para redes sociais.

---

## 📈 Fase 5: Consolidação e Performance
*Foco: Escalabilidade e monitoramento.*

1. **Paginação e Busca Server-Side**:
   - Mover a lógica de filtros de `.filter()` no cliente para queries `WHERE` no banco de dados com limite/offset.
2. **Testes Automatizados**:
   - Criar testes unitários para a lógica de pagamento e checkout.
   - Adicionar testes E2E básicos (Playwright ou Cypress) para o fluxo de compra.
3. **Monitoramento**:
   - Integrar **Sentry** para captura de erros em tempo real.

---

## 📋 Prioridade Sugerida para Execução
1. **Banco de Dados Real** (Crítico para preservar pedidos)
2. **Correções de Deploy e IP** (Necessário para fluxos CI/CD saudáveis)
3. **Autenticação Admin** (Segurança básica)
4. **HTTPS + Domínio** (Requisito para pagamentos reais)
5. **SEO e Otimizações de Componentes** (Qualidade final)
