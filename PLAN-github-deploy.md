# PLAN-github-deploy.md

## 📝 Visão Geral
Implementação de pipeline CI/CD automática usando GitHub Actions para deploy em VM Ubuntu na Oracle Cloud.

---

## 💻 Projeto
- **Nome:** moda-store
- **Tipo:** WEB (Next.js + Express + Docker)
- **Target:** Oracle VM (144.22.222.29)

---

## 🎯 Critérios de Sucesso
- [ ] Push no GitHub dispara a pipeline automaticamente.
- [ ] GitHub Actions conecta via SSH na VM com sucesso.
- [ ] Script de deploy atualiza o código fonte na VM.
- [ ] Docker Compose rebuilda as imagens e reinicia os serviços.
- [ ] Aplicação fica acessível no IP público após o deploy.

---

## 🛠️ Tecnologias
- **CI/CD:** GitHub Actions
- **Auth:** SSH Keys (moda-vm.pem)
- **Runtime:** Docker & Docker Compose
- **Scripting:** Bash (Ubuntu)

---

## 📂 Novos Arquivos
- `.github/workflows/deploy.yml`: Configuração da pipeline.
- `./deploy/update.sh`: Script que será executado dentro da VM.

---

## 📋 Task Breakdown

### Fase 1: Preparação da Infra (Análise)
- **Task ID:** setup-001
- **Nome:** Coletar Segredos do GitHub
- **Agente:** project-planner
- **Input:** Dados da VM (IP, User, Chave)
- **Output:** Lista de Secrets para configurar no GitHub (HOST, USER, SSH_KEY)
- **Verify:** Se o usuário tem acesso às configurações do repositório.

### Fase 2: Configuração Remota (VM)
- **Task ID:** vm-001
- **Nome:** Criar Script de Atualização Remota
- **Agente:** devops-engineer
- **Skills:** deployment-procedures, bash-linux
- **Input:** Estrutura atual de Docker Compose
- **Output:** Arquivo `./deploy/update.sh`
- **Verify:** ✅ Criado com sucesso em `deploy/update.sh`.

### Fase 3: Automação (GitHub Actions)
- **Task ID:** auto-001
- **Nome:** Criar Workflow de Deploy
- **Agente:** devops-engineer
- **Skills:** deployment-procedures
- **Input:** Credenciais e IP da VM
- **Output:** `.github/workflows/deploy.yml`
- **Verify:** ✅ Criado com sucesso em `.github/workflows/deploy.yml`.

---

## ✅ PHASE X: VERIFICAÇÃO FINAL
- [ ] Verificar se os segredos foram adicionados ao GitHub.
- [ ] Validar sintaxe do YAML do Workflow.
- [ ] Testar conexão SSH do runner do GitHub para a VM.
- [ ] Logs do Docker confirmando o rebuild após o push.

---

## 🚀 Próximos Passos
1. Execute `/create` para começar a implementação dos arquivos.
2. Prepare-se para copiar o conteúdo da sua `moda-vm.pem` para o GitHub Secrets.
