# 🚀 Instruções para Fase 2: Banco de Dados e Storage

Acabei de configurar a infraestrutura de código para:
1. **Banco de Dados**: PostgreSQL com Prisma ORM.
2. **Armazenamento**: Oracle Object Storage (compatível com S3) para upload de imagens.

## 📝 Passo 1: Instalar Dependências

No diretório `server/`, foram adicionadas dependências ao `package.json`. Você precisa instalá-las:

```bash
cd server
npm install
```

Isso instalará:
- `@prisma/client` e `prisma` (Banco de Dados)
- `@aws-sdk/client-s3` (Oracle Object Storage)
- `multer` (Upload de arquivos via API)

## 🗄️ Passo 2: Configurar Banco de Dados

1. **Suba o container do Postgres**:
   ```bash
   # Na raiz do projeto
   docker compose up -d postgres
   ```

2. **Gere a estrutura do banco (Migrations)**:
   ```bash
   cd server
   npx prisma generate
   npx prisma db push
   ```
   *Nota: `prisma db push` sincroniza o esquema com o banco sem criar arquivos de migração por enquanto, ideal para prototipagem rápida.*

3. **Verifique o banco (Opcional)**:
   ```bash
   npx prisma studio
   ```
   Isso abrirá uma interface web em `http://localhost:5555` para inspecionar o banco.

## ☁️ Passo 3: Configurar Oracle Object Storage

1. **Edite o arquivo `.env.production`** (ou verifique se as variáveis estão corretas):
   - `ORACLE_ACCESS_KEY_ID`: Sua chave de acesso.
   - `ORACLE_SECRET_ACCESS_KEY`: Sua chave secreta.
   - `ORACLE_ENDPOINT`: URL do seu bucket (ex: `https://<namespace>.compat.objectstorage.sa-saopaulo-1.oraclecloud.com`).
   - `ORACLE_BUCKET_NAME`: Nome do bucket (ex: `imagens-site`).

2. **Teste o Upload**:
   Fiz uma rota de teste `/api/upload`. Você pode testar pelo Postman ou Insomnia:
   - **Método**: POST
   - **URL**: `http://localhost:3001/api/upload`
   - **Body**: form-data
   - **Key**: `file` (Tipo: File) -> Selecione uma imagem.

## ⚠️ Observações sobre Erros de Lint

Você pode ver erros no editor como "Cannot find module '@prisma/client'". Eles **desaparecerão** assim que você rodar `npm install` e `npx prisma generate`.

---

**Próximo Passo (Fase 3)**: Quando isso estiver rodando, me avise para migrarmos a autenticação!
