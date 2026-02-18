#!/bin/bash
# ============================================================
# Moda Store — Deploy Script
# Execute dentro de ~/moda-store no servidor
# ============================================================

set -euo pipefail

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   🛍️  Moda Store — Deploy                                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ─── Verificações ─────────────────────────────────────────────
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Erro: docker-compose.yml não encontrado."
    echo "   Execute este script no diretório raiz do projeto."
    exit 1
fi

if [ -f ".env.production" ]; then
    export $(grep -v '^#' .env.production | xargs)
fi

if [ -z "${PUBLIC_IP:-}" ]; then
    echo "❌ Erro: PUBLIC_IP não definido no .env.production"
    exit 1
fi

# ─── Parar containers existentes ─────────────────────────────
echo "🛑 Parando containers existentes..."
docker compose down 2>/dev/null || true

# ─── Build das imagens ───────────────────────────────────────
echo "🔨 Buildando imagens Docker..."
echo "   (Isso pode levar alguns minutos na primeira vez)"
echo "   ⚙️  Modo low-memory ativado (BuildKit desabilitado)"

# Desabilitar BuildKit para usar o builder clássico (menos RAM)
export DOCKER_BUILDKIT=0
export COMPOSE_DOCKER_CLI_BUILD=0

docker compose build --no-cache

# ─── Subir containers ────────────────────────────────────────
echo "🚀 Iniciando containers..."
docker compose up -d

# ─── Aguardar containers ficarem saudáveis ───────────────────
echo "⏳ Aguardando containers ficarem prontos..."
sleep 10

# ─── Verificar status ────────────────────────────────────────
echo ""
echo "📊 Status dos containers:"
docker compose ps

echo ""
echo "🏥 Testando health check..."
if curl -s http://localhost/api/health > /dev/null 2>&1; then
    echo "✅ Backend respondendo!"
    curl -s http://localhost/api/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost/api/health
else
    echo "⚠️  Backend ainda não está respondendo. Verifique os logs:"
    echo "   docker compose logs backend"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   ✅ Deploy concluído!                                     ║"
echo "║                                                              ║"
echo "║   🌐 Acesse: http://${PUBLIC_IP}                           ║
║   📋 API:    http://${PUBLIC_IP}/api                        ║
║   🏥 Health: http://${PUBLIC_IP}/api/health                 ║
"
echo "║                                                              ║"
echo "║   📊 Comandos úteis:                                        ║"
echo "║   • Logs:    docker compose logs -f                         ║"
echo "║   • Status:  docker compose ps                              ║"
echo "║   • Restart: docker compose restart                         ║"
echo "║   • Stop:    docker compose down                            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
