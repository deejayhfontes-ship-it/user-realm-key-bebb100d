---
description: Como subir mudanças locais para o GitHub e fazer deploy na Vercel
---

# Deploy — Subir Mudanças para GitHub + Vercel

## Pré-requisitos
- Token GitHub: O usuário deve ter um token válido com escopo `repo`
- O projeto deve estar em: `c:\Users\djhen\Downloads\demo\DESIGN - DO FUTURO\lovable-site`

## Passos

### 1. Verificar se há secrets no código
Antes de subir, verificar se há tokens/chaves expostas no código-fonte.
O GitHub bloqueia uploads com tokens detectados pelo Secret Scanning (ex: tokens Atlassian/Trello `ATTA...`, chaves AWS, etc).

```powershell
# Buscar por possíveis secrets nos arquivos modificados
git diff --name-only | ForEach-Object { Select-String -Path $_ -Pattern "ATTA|ghp_|sk-|aws_|password|secret" -CaseSensitive }
```

> **Se encontrar secrets:** Mover para variáveis de ambiente (`import.meta.env.VITE_...`) e configurar na Vercel.

### 2. Fazer commit local
// turbo
```powershell
cd "c:\Users\djhen\Downloads\demo\DESIGN - DO FUTURO\lovable-site"
git add -A
git status
```

Depois fazer o commit:
```powershell
git commit -m "descrição das mudanças"
```

### 3. Subir para o GitHub
Tentar push normal primeiro:
```powershell
git push origin main
```

Se o push falhar silenciosamente (sem output ou sem atualizar o remoto), usar o **script Node.js de upload via API**:
```powershell
node sync-to-github.js
```

### 4. Verificar o deploy na Vercel
A Vercel faz deploy automático quando detecta commits no GitHub.
- Verificar em: https://vercel.com/deejayhfontes-ship-its-projects/user-realm-key-bebb100d/deployments
- O deploy deve aparecer com status "Building" → "Ready" ✅

### 5. Se o deploy falhar
1. Verificar o log de erro na Vercel
2. Se for `ENOENT` (arquivo faltando): usar o script `sync-to-github.js` para garantir que todos os arquivos estão no repository
3. Se for erro de secret scanning: remover o secret do código e mover para variável de ambiente

## Variáveis de Ambiente na Vercel
Configuradas em: Settings → Environment Variables
- `VITE_TRELLO_API_KEY` — Chave da API do Trello
- `VITE_TRELLO_TOKEN` — Token do Trello (Atlassian)
- `VITE_TRELLO_LIST_ID` — ID da lista do Trello

## Notas Importantes
- **NUNCA** commitar tokens/chaves no código — sempre usar variáveis de ambiente
- O `.gitignore` deve conter `.env` para proteger credenciais locais
- O repositório GitHub: `deejayhfontes-ship-it/user-realm-key-bebb100d`
- Existem 2 projetos Vercel ligados ao mesmo repo — ambos fazem deploy automaticamente
