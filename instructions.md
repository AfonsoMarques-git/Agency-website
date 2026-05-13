# WEMOV Agency — Manual do Gestor

Bem-vindo. Este documento explica, passo a passo, como instalar, executar e gerir o site da **WEMOV Agency** (servidor Node.js + Express, base de dados SQLite, painel admin integrado).

---

## 1. Pré-requisitos

Antes de começar, instale no servidor (ou no seu computador):

- **Node.js 18 ou superior** (recomendado: Node 20 LTS).
  - Verificar: `node --version`
- **npm** (vem com o Node.js).
  - Verificar: `npm --version`
- (Opcional, recomendado em produção) **PM2** ou outro gestor de processos:
  - `npm install -g pm2`

---

## 2. Instalação

A partir do diretório do projeto (onde está este ficheiro):

```bash
npm install
```

Isto descarrega todas as dependências para a pasta `node_modules/`.

---

## 3. Configuração do ambiente

Copie o ficheiro de exemplo:

```bash
cp .env.example .env
```

Abra `.env` num editor e preencha **obrigatoriamente** os campos abaixo:

```env
PORT=3000
NODE_ENV=production            # use "development" em local
PUBLIC_ORIGIN=https://www.wemovagency.com

# Gere uma string aleatória LONGA. Pode usar:
#   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=<cole-aqui-a-string-gerada>

# Credenciais iniciais do admin (apenas usadas no PRIMEIRO arranque):
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=WeMov2026!
```

> **Importante:** mude `DEFAULT_ADMIN_PASSWORD` para algo seu **antes** do primeiro arranque, ou então mude a password no painel admin imediatamente a seguir.

---

## 4. Primeiro arranque

```bash
npm start
```

No primeiro arranque o servidor:
1. Cria a base de dados em `data/wemov.db`
2. Cria todas as tabelas
3. **Insere automaticamente** todo o conteúdo atual do site (textos, serviços, projetos, equipa, testemunhos, episódios)
4. Cria o utilizador admin com as credenciais do `.env`

Deverá ver no terminal algo como:

```
WEMOV Agency — ready
  Site:  http://localhost:3000
  Admin: http://localhost:3000/admin/login
```

---

## 5. Aceder ao painel admin

Abra no navegador: **http://localhost:3000/admin/login**

- Username: o valor de `DEFAULT_ADMIN_USERNAME` (por defeito: `admin`)
- Password: o valor de `DEFAULT_ADMIN_PASSWORD` (por defeito: `WeMov2026!`)

Após login será redirecionado para `/admin` (Dashboard).

---

## 6. Mudar a password do admin

1. No painel, abra **Definições** (último item da sidebar)
2. Preencha:
   - Password atual
   - Nova password (mínimo 10 caracteres)
   - Confirmar nova password
3. Clique em **Atualizar password**

> Após 5 tentativas de login falhadas a conta é **bloqueada durante 30 minutos** para travar ataques de força bruta.

---

## 7. Gerir conteúdo

Cada secção do painel tem **criar**, **editar**, **eliminar**, **ativar/desativar** e (onde faz sentido) **reordenar** por drag-and-drop.

| Secção         | O que faz                                              |
| -------------- | ------------------------------------------------------ |
| Dashboard      | Visão geral com totais                                 |
| Projetos       | CRUD do portfólio com imagem, tags, destaque e tamanho |
| Serviços       | CRUD dos 8 serviços (drag para reordenar)              |
| Equipa         | CRUD dos membros com foto                              |
| Testemunhos    | CRUD das citações                                      |
| Episódios      | CRUD dos episódios WETALK                              |
| Conteúdo       | Edita TODO o texto do site (hero, lede, manifestos…)   |
| Contacto       | Email, telefone, morada, horário e redes sociais       |
| Media          | Upload e gestão das imagens                            |
| Definições     | Mudar a sua password de admin                          |

### Upload de imagens

Em qualquer campo de imagem (por exemplo num projeto) pode:
- Clicar em **Upload** para enviar uma imagem nova do disco
- Clicar em **Biblioteca** para escolher uma já existente
- Clicar em **Limpar** para remover

A biblioteca global está em **Media** (lateral). Aí pode fazer upload em massa (arrastar + largar) e eliminar ficheiros.

> Tipos aceites: **JPEG, PNG, WebP, SVG**. Tamanho máximo: **8 MB**.
> Os ficheiros são guardados em `uploads/` com nomes UUID por segurança.

---

## 8. Deploy em produção

### 8.1 Servidor

1. Instale Node.js no servidor
2. Faça upload do projeto (não inclua `node_modules/`)
3. No servidor, dentro da pasta do projeto:
   ```bash
   npm install --omit=dev
   cp .env.example .env
   nano .env             # preencha JWT_SECRET, etc., e ponha NODE_ENV=production
   ```

### 8.2 Arrancar com PM2

```bash
pm2 start server/index.js --name wemov
pm2 save
pm2 startup            # configura o arranque automático no boot
```

### 8.3 HTTPS (obrigatório em produção)

O painel admin assenta em cookies seguros (`secure: true` quando `NODE_ENV=production`). **Tem de servir o site via HTTPS** ou os cookies não serão enviados.

Use um reverse proxy (Nginx, Caddy ou similar) com certificado Let's Encrypt:

```nginx
server {
  listen 443 ssl http2;
  server_name www.wemovagency.com;
  ssl_certificate     /etc/letsencrypt/live/wemovagency.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/wemovagency.com/privkey.pem;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For  $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

---

## 9. Backups

A base de dados é **um único ficheiro**: `data/wemov.db`.

Para fazer backup:

```bash
# Pare o servidor (recomendado) ou use o checkpoint SQLite
cp data/wemov.db backups/wemov-$(date +%F).db
```

Faça também backup da pasta `uploads/` (imagens carregadas pelo gestor).

Para restaurar: pare o servidor, substitua `data/wemov.db` pelo backup, reinicie.

---

## 10. Adicionar imagens novas

A forma mais rápida é pelo painel:

1. **Media** → arraste imagens para a área de upload
2. Em qualquer projeto / membro da equipa, escolha **Biblioteca** e selecione a imagem

Em alternativa, pode colocar imagens diretamente em `public/assets/` e referenciá-las pelo nome do ficheiro (ex.: `proj-novo.jpg`).

---

## 11. Resolução de problemas

| Problema | Causa provável / solução |
| --- | --- |
| `EADDRINUSE: 0.0.0.0:3000` | Outro processo usa a porta 3000. Mude `PORT` no `.env`. |
| Login não funciona | Verifique se `JWT_SECRET` está definido no `.env`. Em produção, o site **tem de** estar em HTTPS. |
| "Sessão inválida ou expirada" repetido | Cookies bloqueados? Verifique se está a aceder pelo mesmo domínio que `PUBLIC_ORIGIN`. |
| Upload falha | Verifique a permissão da pasta `uploads/` e o tamanho do ficheiro (máx. 8 MB). |
| Imagens não aparecem | Confirme que ficaram em `uploads/` (admin) ou em `public/assets/` (estáticas). |
| Quero recriar a BD do zero | Apague `data/wemov.db` e arranque o servidor outra vez — irá fazer seed automaticamente. |
| Conta admin bloqueada | Aguarde 30 minutos OU apague a linha em `admin_users` e crie nova. |

### Logs

```bash
pm2 logs wemov          # tempo real
pm2 logs wemov --lines 200
```

---

## 12. Estrutura do projeto

```
WeMov/
├── server/           # Express + rotas + DB + modelos
├── views/            # Templates EJS das páginas públicas
├── public/           # CSS, JS, imagens (assets estáticos)
├── admin/            # Painel admin (HTML + CSS + JS)
├── uploads/          # Ficheiros carregados pelo admin (ignorado pelo git)
├── data/             # Base de dados SQLite (ignorado pelo git)
├── .env              # Configuração local (NUNCA commit)
└── instructions.md   # Este ficheiro
```

---

## 13. Segurança — boas práticas

- Use **passwords longas e únicas**, idealmente geradas por gestor de passwords.
- Mantenha o sistema operativo e Node.js atualizados.
- Faça backups regulares (`data/wemov.db` + `uploads/`).
- Não partilhe o ficheiro `.env`.
- Em produção: **HTTPS obrigatório**, firewall a expor apenas as portas necessárias.

---

Boa edição. Beyond Stories.
