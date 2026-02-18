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

# 2. Atualizar código fonte
echo "📥 Puxando alterações do GitHub..."
git pull origin master

# 3. Rebuildar e Reiniciar Containers
echo "🏗️ Rebuildando containers (Docker Compose)..."
# Usamos --build para garantir que as alterações no código sejam compiladas
# Usamos -d para rodar em background
docker compose up -d --build

# 4. Limpeza (opcional)
echo "🧹 Limpando imagens antigas..."
docker image prune -f

echo "✅ Deploy finalizado com sucesso em $(date)!"
