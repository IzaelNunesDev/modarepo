#!/bin/bash
# ============================================================
# Moda Store — Setup Inicial do Servidor Oracle Cloud
# Execute: bash setup-server.sh
# ============================================================

set -euo pipefail

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   🛍️  Moda Store — Setup do Servidor Oracle Cloud          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ─── 1. Atualizar Sistema & Instalar Git ──────────────────────
echo "📦 [1/5] Atualizando sistema e instalando Git..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl gnupg lsb-release ca-certificates

# ─── 2. Instalar Docker ──────────────────────────────────────
echo "🐳 [2/5] Instalando Docker..."
if ! command -v docker &> /dev/null; then
    # Remover versões antigas
    sudo apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

    # Instalar dependências
    sudo apt install -y ca-certificates curl gnupg lsb-release

    # Adicionar chave GPG do Docker
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    # Adicionar repositório
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Instalar Docker Engine
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # Permitir uso sem sudo
    sudo usermod -aG docker $USER

    echo "✅ Docker instalado com sucesso!"
else
    echo "✅ Docker já está instalado"
fi

# ─── 3. Verificar Docker Compose ─────────────────────────────
echo "🔧 [3/5] Verificando Docker Compose..."
if docker compose version &> /dev/null; then
    echo "✅ Docker Compose plugin disponível"
else
    echo "❌ Docker Compose não encontrado. Reinstale o Docker."
    exit 1
fi

# ─── 4. Configurar Firewall ──────────────────────────────────
echo "🔒 [4/5] Configurando iptables..."

# Abrir porta 80 (HTTP)
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
# Abrir porta 443 (HTTPS - para futuro uso)
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT

# Salvar regras
sudo netfilter-persistent save 2>/dev/null || sudo sh -c "iptables-save > /etc/iptables/rules.v4" 2>/dev/null || true

echo "✅ Portas 80 e 443 abertas"

# ─── 5. Criar diretório do projeto ───────────────────────────
echo "📂 [5/5] Criando diretório do projeto..."
mkdir -p ~/modarepo
echo "✅ Diretório ~/modarepo criado"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   ✅ Setup completo!                                       ║"
echo "║                                                              ║"
echo "║   ⚠️  IMPORTANTE: Faça logout e login novamente para        ║"
echo "║   aplicar o grupo Docker ao seu usuário.                    ║"
echo "║                                                              ║"
echo "║   Próximo passo:                                            ║"
echo "║   1. Faça logout: exit                                      ║"
echo "║   2. Reconecte via SSH                                      ║"
echo "║   3. No servidor, rode: git clone [seu-repo] ~/modarepo     ║"
echo "║   4. Os próximos pushs do GitHub farão o resto!             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
