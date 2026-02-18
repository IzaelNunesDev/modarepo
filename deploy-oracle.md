# 🚀 Status do Deploy - Oracle Cloud

Este documento resume o status atual da implantação na Oracle Cloud.

## 📊 Status Geral: ✅ ONLINE

O backend está respondendo corretamente às requisições de Health Check.

### 🏥 Health Check (`/api/health`)
- **Status:** `ok`
- **Serviço:** `moda-store-backend`
- **Ambiente:** `production`
- **Stripe:** `configured`
- **Uptime:** ~33 minutos (no momento da verificação)
- **Timestamp:** `2026-02-18T04:37:50.380Z`

## 🌐 Acesso
- **Frontend:** [http://144.22.222.29](http://144.22.222.29)
- **API:** [http://144.22.222.29/api](http://144.22.222.29/api)
- **Health:** [http://144.22.222.29/api/health](http://144.22.222.29/api/health)

## 🛠️ Logs e Troubleshooting (Via SSH)

Para investigar problemas mais a fundo ou ver logs em tempo real, acesse o servidor via SSH:

```bash
ssh -i "caminho/para/sua-chave.pem" ubuntu@144.22.222.29
```

### Comandos Úteis no Servidor
```bash
# Navegar para o diretório
cd ~/modarepo

# Ver logs do Backend
docker compose logs -f backend

# Ver logs do Frontend
docker compose logs -f frontend

# Ver logs do Banco de Dados
docker compose logs -f postgres

# Status dos Containers
docker compose ps
```

## 🔄 Fluxo de CI/CD
O deploy é acionado automaticamente a cada **push na branch `master`**.
1. GitHub Actions conecta via SSH.
2. Executa `deploy/update.sh`.
3. Puxa o código mais recente (`git pull`).
4. Reconstrói os containers (`docker compose up -d --build`).
5. Aplica migrações do banco (`npx prisma db push`).
