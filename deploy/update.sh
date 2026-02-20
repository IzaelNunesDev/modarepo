#!/bin/bash

# Script de Deploy Remoto - VM Oracle
echo "🚀 Iniciando Deploy na VM Oracle..."

# 1. Navegar até o diretório do projeto
# Ajuste este caminho se o projeto estiver em outro lugar na VM
PROJECT_DIR="/home/ubuntu/modarepo"

if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Erro: Diretório $PROJECT_DIR não encontrado."
    exit 1
fi

cd "$PROJECT_DIR" || exit

# 2. Arquivos já foram extraídos pelo GitHub Actions
echo "📥 Código já atualizado via SCP pelo GitHub Actions."

# Copiar .env.production para .env para que o docker compose o utilize
if [ -f ".env.production" ]; then
    echo "📄 Configurando variáveis de ambiente para produção..."
    cp .env.production .env
else
    echo "⚠️ Arquivo .env.production não encontrado!"
fi

# 3. Configurar Certificados SSL (Self-Signed)
echo "🔒 Verificando certificados SSL..."
mkdir -p nginx/certs
if [ ! -f "nginx/certs/self-signed.crt" ]; then
    echo "⚠️ Certificado SSL não encontrado. Gerando um novo auto-assinado..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/certs/self-signed.key \
        -out nginx/certs/self-signed.crt \
        -subj "/C=BR/ST=Sao Paulo/L=Sao Paulo/O=ModaStore/OU=IT/CN=modastore.local"
    echo "✅ Certificado gerado com sucesso!"
else
    echo "✅ Certificado SSL já existe."
fi

# 4. Rebuildar e Reiniciar Containers
echo "🏗️ Rebuildando containers (Docker Compose)..."
# Usamos --build para garantir que as alterações no código sejam compiladas
# Usamos -d para rodar em background
docker compose up -d --build

# 4. Rodar Migrações do Banco de Dados
echo "🗄️ Executando migrações do banco de dados (Prisma)..."
# Aguarda o backend estar pronto (retry simples)
sleep 10
docker compose exec -T backend npx prisma db push

# 5. Reiniciar o Nginx
echo "🔄 Reiniciando Nginx (para atualizar cache de IPs internos do Docker)..."
docker compose restart nginx

# 4. Limpeza (opcional)
echo "🧹 Limpando imagens antigas..."
docker image prune -f

echo "✅ Deploy finalizado com sucesso em $(date)!"
