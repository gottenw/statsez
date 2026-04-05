# Integrações Frontend ↔ Backend — Statsez API

> Referência completa para reconstruir o frontend. Todos os endpoints, fluxos, formatos de dados e exemplos de código.

---

## Índice

- [1. Variáveis de Ambiente](#1-variáveis-de-ambiente)
- [2. Autenticação](#2-autenticação)
- [3. Cookie & CORS](#3-cookie--cors)
- [4. API Client (padrão de requisição)](#4-api-client-padrão-de-requisição)
- [5. Endpoints do Usuário](#5-endpoints-do-usuário)
- [6. Endpoints Admin](#6-endpoints-admin)
- [7. Internacionalização (i18n)](#7-internacionalização-i18n)
- [8. Fluxos Completos](#8-fluxos-completos)
- [9. Modelos de Dados (TypeScript)](#9-modelos-de-dados-typescript)
- [10. Pricing (valores atuais)](#10-pricing-valores-atuais)

---

## 1. Variáveis de Ambiente

```env
# Frontend (.env)
NEXT_PUBLIC_API_URL=https://api.statsez.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

O `NEXT_PUBLIC_API_URL` é a base de todas as chamadas API. O `GOOGLE_CLIENT_ID` deve ser o mesmo no frontend e backend.

---

## 2. Autenticação

### 2.1 Google OAuth

**Fluxo:**
1. Usuário clica no botão Google Login (`@react-oauth/google`)
2. Google retorna `credentialResponse.credential` (JWT do Google)
3. Frontend envia para o backend
4. Backend verifica, cria/atualiza user, seta cookie httpOnly, retorna dados

**Request:**
```http
POST /auth/google
Content-Type: application/json

{ "idToken": "eyJhbGciOiJSUzI1NiI..." }
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@gmail.com",
    "name": "João",
    "role": "USER",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "isNewUser": true,
    "subscription": {
      "planName": "free",
      "apiKey": "se_live_NGI3MmM4..."
    }
  }
}
```

> `subscription.apiKey` só é retornado quando um novo plano free é criado (primeira vez). Para usuários existentes, é `null`.

**Código frontend (exemplo):**
```tsx
const res = await fetch(`${API_URL}/auth/google`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include", // Recebe o cookie httpOnly
  body: JSON.stringify({ idToken: credentialResponse.credential }),
});
const data = await res.json();
if (data.success) {
  // Salva dados do user (NÃO o token) no localStorage
  localStorage.setItem("statsez_user", JSON.stringify(data.data));
  // Redireciona
  window.location.href = "/dashboard";
}
```

### 2.2 Login Email/Senha

**Request:**
```http
POST /auth/login
Content-Type: application/json

{ "email": "user@example.com", "password": "SecurePass123" }
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "João",
    "role": "USER",
    "token": "jwt..."
  }
}
```

**Erros:** `401` — "Credenciais inválidas"

### 2.3 Registro Email/Senha

**Request:**
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "João"
}
```

**Validação:** senha mín 8 chars, 1 maiúscula, 1 número. Nome é opcional.

**Response (201):** mesmo formato do login.

**Erros:** `409` — "Email já cadastrado"

### 2.4 Logout

```http
POST /auth/logout
```

Limpa o cookie `statsez_token`. Retorna `{ "success": true }`.

**Código frontend:**
```tsx
await fetch(`${API_URL}/auth/logout`, {
  method: "POST",
  credentials: "include",
});
localStorage.removeItem("statsez_user");
window.location.href = "/";
```

---

## 3. Cookie & CORS

### Cookie httpOnly

O backend seta um cookie `statsez_token` em todas as rotas de login:

| Propriedade | Valor |
|---|---|
| `httpOnly` | `true` (JS não acessa) |
| `secure` | `true` em produção |
| `sameSite` | `Lax` |
| `domain` | `.statsez.com` (prod) / omitido (dev) |
| `maxAge` | `86400` (24h) |
| `path` | `/` |

### CORS

O backend permite:
- **Origens:** `statsez.com`, `www.statsez.com`, `localhost:3000` (dev), `localhost:3001` (dev)
- **Métodos:** GET, POST, PUT, DELETE, OPTIONS
- **Headers:** Content-Type, Authorization, x-api-key, Accept
- **Credentials:** `true` (permite cookies cross-origin)

### Padrão de Requisição

Toda requisição do frontend deve incluir `credentials: "include"`:

```tsx
fetch(`${API_URL}/endpoint`, {
  credentials: "include", // Envia o cookie httpOnly automaticamente
  headers: { "Content-Type": "application/json" },
});
```

O backend lê o token do cookie primeiro. Se não encontrar, tenta o header `Authorization: Bearer <token>` como fallback.

---

## 4. API Client (padrão de requisição)

```tsx
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.statsez.com";

async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401) {
    localStorage.removeItem("statsez_user");
    window.location.href = "/auth/register";
    throw new Error("Unauthorized");
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}
```

---

## 5. Endpoints do Usuário

Todos requerem autenticação (cookie ou header Bearer).

### GET `/user/me`

Retorna perfil completo do usuário com subscriptions e API keys.

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "João",
    "role": "USER",
    "createdAt": "2026-01-15T10:30:00Z",
    "updatedAt": "2026-01-15T10:30:00Z",
    "subscriptions": [
      {
        "id": "sub_uuid",
        "sport": "football",
        "planName": "free",
        "monthlyQuota": 500,
        "biWeeklyQuota": 250,
        "currentUsage": 45,
        "isActive": true,
        "startsAt": "2026-01-15T00:00:00Z",
        "expiresAt": "2026-02-15T00:00:00Z",
        "cycleStartDate": "2026-01-15T00:00:00Z",
        "cycleEndDate": "2026-01-30T00:00:00Z",
        "apiKey": {
          "id": "key_uuid",
          "key": "sha256_hash...",
          "isActive": true,
          "lastUsedAt": "2026-01-15T14:22:00Z",
          "createdAt": "2026-01-15T10:30:00Z"
        }
      }
    ]
  }
}
```

> **Nota:** `apiKey.key` é o hash SHA-256, não a key raw. A key raw só é visível no momento da criação/rotação.

### GET `/user/keys`

Lista API keys do usuário (apenas de subscriptions ativas).

```json
{
  "success": true,
  "data": [
    {
      "id": "key_uuid",
      "key": "sha256_hash...",
      "subscriptionId": "sub_uuid",
      "isActive": true,
      "createdAt": "2026-01-15T10:30:00Z",
      "subscription": {
        "planName": "free",
        "sport": "football",
        "biWeeklyQuota": 250,
        "currentUsage": 45,
        "isActive": true,
        "expiresAt": "2026-02-15T00:00:00Z"
      }
    }
  ]
}
```

### POST `/user/keys/rotate`

Invalida a key atual e gera uma nova.

**Request:**
```json
{ "subscriptionId": "sub_uuid" }
```

**Response:**
```json
{
  "success": true,
  "data": { "key": "se_live_ABCDEfghij..." }
}
```

> **A key raw é retornada UMA ÚNICA VEZ.** O frontend deve exibi-la com destaque e opção de copiar.

### POST `/user/keys/generate`

Gera uma key para o usuário. Se não tiver subscription, cria plano free (apenas uma vez por usuário).

**Request:** sem body.

**Response (nova key):**
```json
{
  "success": true,
  "data": { "key": "se_live_ABCDEfghij...", "subscriptionId": "sub_uuid" }
}
```

**Response (key já existe):**
```json
{
  "success": true,
  "data": { "key": null, "subscriptionId": "sub_uuid", "message": "Key já existe. Use /keys/rotate para gerar uma nova." }
}
```

**Erro (free já usado):**
```json
{ "success": false, "error": "Plano free já utilizado. Entre em contato para assinar um plano." }
```

---

## 6. Endpoints Admin

Todos requerem `role: "ADMIN"` no JWT.

### GET `/admin/stats/overview`

```json
{
  "success": true,
  "data": {
    "totalUsers": 542,
    "activeSubscriptions": 123,
    "subscriptionsByPlan": { "free": 89, "dev": 22, "enterprise": 8, "gold": 4 },
    "totalRequests": 450293,
    "cachedRequests": 382749,
    "cacheHitRatio": 85.01
  }
}
```

### GET `/admin/stats/requests?period=7d|30d|90d`

```json
{
  "success": true,
  "data": [
    { "date": "2026-01-15", "requests": 12450 },
    { "date": "2026-01-16", "requests": 13200 }
  ]
}
```

### GET `/admin/stats/top-endpoints?limit=10`

```json
{
  "success": true,
  "data": [
    { "endpoint": "/v1/football/fixtures", "count": 89234 },
    { "endpoint": "/v1/football/standings", "count": 56123 }
  ]
}
```

### GET `/admin/stats/growth?period=7d|30d|90d`

```json
{
  "success": true,
  "data": [
    { "date": "2026-01-15", "newUsers": 4 },
    { "date": "2026-01-16", "newUsers": 7 }
  ]
}
```

### GET `/admin/stats/cost-analysis`

```json
{
  "success": true,
  "data": {
    "period": { "start": "2026-01-01T00:00:00Z", "end": "2026-01-31T23:59:59Z" },
    "totalRequestsThisMonth": 450293,
    "currentUpstreamPlan": "Plan B",
    "currentPlanLimit": 1000000,
    "currentPlanCost": 280,
    "percentageUsed": 45.03,
    "nextPlanThreshold": 5000000,
    "alerts": [
      { "level": "info", "message": "45.0% do Plan B utilizado", "recommendation": "..." }
    ],
    "financials": { "upstreamCost": 280, "fixedCosts": 44.17 },
    "upstreamPlans": [
      { "name": "Plan A", "limit": 50000, "cost": 45, "costPerReq": 0.0009 }
    ]
  }
}
```

### GET `/admin/users?page=1&limit=20&search=`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid", "email": "user@example.com", "name": "João",
      "role": "USER", "createdAt": "...",
      "activePlan": "free", "usage": "45/250"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 542, "totalPages": 28 }
}
```

### GET `/admin/users/:userId`

Retorna user com `hasGoogleAuth: boolean` (não expõe googleId), subscriptions com apiKey, e histórico.

### PATCH `/admin/users/:userId/subscription`

```json
// Request body (todos opcionais)
{
  "planName": "dev",
  "monthlyQuota": 40000,
  "biWeeklyQuota": 20000,
  "isActive": true,
  "currentUsage": 0
}
```

Planos válidos: `free`, `dev`, `enterprise`, `gold`

### POST `/admin/users/:userId/deactivate`

Desativa todas as subscriptions ativas do usuário.

```json
{ "success": true, "data": { "deactivated": 1 } }
```

### GET `/admin/keys?page=1&limit=20`

Lista todas as API keys com informações do owner.

### POST `/admin/keys/:keyId/revoke`

Revoga uma API key específica.

### GET `/admin/system/cache`

Estatísticas do cache: total, expirado, ativo, breakdown por sport e endpoint.

### DELETE `/admin/system/cache/expired`

Limpa entradas expiradas.

### GET `/admin/system/logs?page=1&limit=50&sport=`

Logs de requisições com paginação e filtro por sport.

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid", "apiKeyId": "...", "subscriptionId": "...",
      "sport": "football", "endpoint": "/v1/football/fixtures",
      "statusCode": 200, "cached": true, "responseTimeMs": 23,
      "createdAt": "2026-01-15T14:22:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 50, "total": 450293, "totalPages": 9006 }
}
```

---

## 7. Internacionalização (i18n)

### Configuração

```typescript
// i18n/config.ts
export type Locale = "pt" | "en";
export const defaultLocale: Locale = "pt";
export const locales: Locale[] = ["pt", "en"];
export const localeLabels: Record<Locale, string> = { pt: "PT", en: "EN" };
```

### Detecção de Locale

Prioridade:
1. Cookie `locale` (setado pelo language switcher)
2. Header `Accept-Language`
3. Default: `"pt"`

### Mensagens

Arquivos JSON em `/messages/pt.json` e `/messages/en.json` com as chaves:

- `nav.*` — navegação
- `hero.*` — seção hero
- `capabilities.*` — seção de recursos
- `pricing.*` — planos e preços
- `coverage.*` — cobertura global
- `footer.*` — rodapé
- `dashboard.*` — painel do usuário
- `languageSelector.*` — seletor de idioma

### Language Switcher

```tsx
// Salva preferência no cookie e recarrega
document.cookie = `locale=${newLocale};path=/;max-age=31536000;Secure;SameSite=Strict`;
window.location.reload();
```

---

## 8. Fluxos Completos

### Fluxo: Primeiro Login

```
1. Usuário → /auth/register
2. Clica Google Login
3. Google retorna credential
4. Frontend POST /auth/google { idToken }  [credentials: "include"]
5. Backend:
   - Verifica token Google
   - Cria User no banco
   - Verifica se já teve plano free → NÃO
   - Cria Subscription free (500 mensal, 250 quinzenal, 30 dias)
   - Gera API key raw → hash SHA-256 → salva hash no banco
   - Seta cookie httpOnly statsez_token
   - Retorna { user, token, subscription: { planName, apiKey: raw_key } }
6. Frontend:
   - Salva user em localStorage (sem token!)
   - Redireciona para /dashboard
```

### Fluxo: Login Existente

```
1. Usuário → /auth/register
2. Google Login
3. POST /auth/google { idToken }
4. Backend:
   - Encontra user existente
   - Verifica subscription ativa → SIM
   - Seta cookie
   - Retorna { user, token, subscription: { planName, apiKey: null } }
5. Frontend salva user, redireciona
```

### Fluxo: Rotação de Key

```
1. Usuário → /dashboard/keys
2. Clica "Rotacionar"
3. Confirma no modal
4. Frontend POST /user/keys/rotate { subscriptionId }
5. Backend:
   - Verifica ownership da subscription
   - Gera nova key raw
   - Hash SHA-256
   - Atualiza registro no banco (old hash → new hash)
   - Retorna { key: raw_key }
6. Frontend:
   - Mostra key raw com banner "COPIE AGORA — só será exibida uma vez"
   - Botão copiar
   - Ao sair da página ou refresh, key desaparece para sempre
```

### Fluxo: Assinar Plano Pago

```
1. Usuário vê preços na landing page
2. Clica "Assinar Agora"
3. Modal abre com link para Telegram @joaonaithen
4. Usuário entra em contato
5. Admin vai em /dashboard/admin/users/:userId
6. Admin edita subscription: planName → "dev", quotas → 40000/20000
7. Se necessário, gera nova key para o usuário
```

---

## 9. Modelos de Dados (TypeScript)

```typescript
interface User {
  id: string;
  email: string;
  name?: string;
  role: "USER" | "ADMIN";
}

interface Subscription {
  id: string;
  planName: string;
  sport: string;
  monthlyQuota: number;
  biWeeklyQuota: number;
  currentUsage: number;
  isActive: boolean;
  startsAt: string;
  expiresAt: string | null;
  cycleStartDate: string;
  cycleEndDate: string | null;
  apiKey: ApiKeyData | null;
}

interface ApiKeyData {
  id: string;
  key: string;        // SHA-256 hash (não é a key raw)
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

---

## 10. Pricing (valores atuais)

| Plano | Requests/mês | Quota quinzenal | Preço |
|---|---|---|---|
| **Free** | 500 | 250 | Grátis (uma vez por usuário) |
| **Dev** | 40.000 | 20.000 | R$ 69,99/mês |
| **Enterprise** | 250.000 | 125.000 | R$ 219,99/mês |
| **Gold** | 600.000 | 300.000 | R$ 499,99/mês |

Contato para assinatura: Telegram [@joaonaithen](https://t.me/joaonaithen)
