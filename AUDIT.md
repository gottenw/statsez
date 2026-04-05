# Auditoria de Segurança e Qualidade — Statsez API

> Gerado em: 2026-04-05

---

## Índice

- [Resumo por Prioridade](#resumo-por-prioridade)
- [P0 — Críticos](#p0--críticos)
- [P1 — Altos](#p1--altos)
- [P2 — Médios](#p2--médios)
- [P3 — Baixos](#p3--baixos)

---

## Resumo por Prioridade

| Prioridade | Issue | Risco |
|---|---|---|
| P0 | Valor do pagamento não validado no backend | Perda financeira direta |
| P0 | Webhook sem validação obrigatória | Subscriptions fraudulentas |
| P0 | Race condition na quota | Uso acima do limite |
| P1 | Rate limit burlável via header | DoS / abuso |
| P1 | `passwordHash` exposto no `/user/me` | Vazamento de credenciais |
| P1 | API keys em plain text no banco | Exposição massiva se DB comprometido |
| P2 | Admin stats carregam tudo em memória | OOM em produção |
| P2 | Plano free renovável infinitamente | Perda de receita |
| P2 | `biWeeklyQuota` do free = mensal | Quota 2x maior que o esperado |
| P3 | Cache key ordering inconsistente | Cache misses extras |
| P3 | Sem try/catch nos endpoints de sport | Erros opacos |
| P3 | Token JWT no localStorage | Vulnerável a XSS |
| P3 | Subscription expirada só detectada no middleware de API key | Métricas distorcidas no admin |
| P3 | Admin endpoint vaza `googleId` dos usuários | Exposição de dados desnecessária |

---

## P0 — Críticos

### 1. Valor do Pagamento Não Validado no Backend

**Arquivo:** `backend/src/routes/payments.ts:85-182`

**Problema:**
O `transaction_amount` vem diretamente do cliente e é enviado ao Mercado Pago sem nenhuma verificação server-side. Um atacante pode enviar `transaction_amount: 0.01` com `planName: "gold"` e receber uma subscription Gold por R$0,01.

**Código vulnerável:**
```ts
const validated = parsed.data;

const result = await processPayment({
  transaction_amount: validated.transaction_amount,
  // ...
});

if (result.status === 'approved') {
  // Cria subscription baseada no planName, ignorando o valor pago
  const subResult = await createSubscriptionForUser(userId, validated.planName, validated.sport);
}
```

**Correção sugerida:**
Adicionar um mapa de preços no backend e validar que o `transaction_amount` corresponde ao preço do plano:

```ts
const PLAN_PRICES: Record<string, number> = {
  dev: 124.90,
  enterprise: 459.90,
  gold: 999.90,
};

const expectedPrice = PLAN_PRICES[validated.planName];
if (Math.abs(validated.transaction_amount - expectedPrice) > 0.01) {
  return c.json({ success: false, error: 'Valor incorreto para o plano selecionado' }, 400);
}
```

---

### 2. Webhook sem Validação Obrigatória

**Arquivo:** `backend/src/routes/payments.ts:187`

**Problema:**
A validação de assinatura HMAC do webhook é condicional — só acontece se `MERCADOPAGO_WEBHOOK_SECRET` estiver definido. Se não estiver (ou estiver vazio como no default `''`), qualquer pessoa pode enviar webhooks falsos para criar subscriptions gratuitas.

**Código vulnerável:**
```ts
const WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET || '';
// ...
if (WEBHOOK_SECRET) { // Se vazio, pula toda a validação
  // validação HMAC...
}
```

**Correção sugerida:**
Tornar a validação obrigatória. Falhar se o secret não estiver configurado:

```ts
const WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET;
if (!WEBHOOK_SECRET) {
  throw new Error('MERCADOPAGO_WEBHOOK_SECRET é obrigatório');
}

// No handler, sempre validar:
app.post('/webhook', async (c) => {
  const xSignature = c.req.header('x-signature') || '';
  // ... validação HMAC obrigatória
  // Se falhar, retorna 401 — sem exceção
});
```

---

### 3. Race Condition na Quota

**Arquivo:** `backend/src/middleware/auth.ts:91-172`

**Problema:**
O ciclo de verificação e incremento de quota não é atômico. Duas (ou mais) requisições simultâneas podem:

1. Ambas ler `currentUsage = 99` (limite = 100)
2. Ambas passar na verificação `currentUsage >= biWeeklyQuota` (99 < 100 ✓)
3. Ambas serem processadas
4. Ambas incrementar para 100 e 101, ultrapassando o limite

O `decrementQuota` (linhas 154-172) roda **após** o `next()`, mas a verificação roda **antes** — sem lock ou transação atômica.

**Código vulnerável:**
```ts
// Verificação (ANTES do request)
if (subscription.currentUsage >= subscription.biWeeklyQuota) {
  return c.json({ error: 'Quota esgotada' }, 429);
}

// ... request é processado ...

// Incremento (DEPOIS do request)
await prisma.subscription.update({
  where: { id: auth.subscriptionId },
  data: { currentUsage: { increment: 1 } }
});
```

**Correção sugerida:**
Usar incremento atômico com condição no banco (UPDATE ... WHERE):

```ts
const result = await prisma.$executeRaw`
  UPDATE "Subscription"
  SET "currentUsage" = "currentUsage" + 1
  WHERE id = ${auth.subscriptionId}
  AND "currentUsage" < "biWeeklyQuota"
`;

if (result === 0) {
  return c.json({ error: 'Quota esgotada' }, 429);
}
```

Ou mover o incremento para **antes** do processamento, usando uma transação.

---

## P1 — Altos

### 4. Rate Limit Facilmente Burlável

**Arquivo:** `backend/src/middleware/rateLimit.ts:35-37`

**Problema:**
O IP do cliente é lido de headers HTTP que o próprio cliente pode forjar:

```ts
const ip = c.req.header('x-forwarded-for') ||
           c.req.header('x-real-ip') ||
           'unknown'
```

Qualquer atacante pode enviar `x-forwarded-for: <valor-aleatório>` a cada requisição e bypassar completamente o rate limit. Além disso, o store está em memória — reiniciar o servidor reseta todos os contadores.

**Correção sugerida:**
- Usar o IP real da conexão TCP (disponível em `c.env` dependendo do runtime, ou via `c.req.raw`)
- Se atrás de um proxy confiável (Railway, etc.), configurar corretamente para ler apenas o último IP adicionado pelo proxy confiável, não o header inteiro
- Considerar migrar o store para Redis para persistência entre restarts

---

### 5. `passwordHash` Exposto no Endpoint `/user/me`

**Arquivo:** `backend/src/routes/user.ts:37-48`

**Problema:**
O endpoint retorna o objeto `user` completo do Prisma, incluindo o campo `passwordHash`. Qualquer usuário autenticado pode ver seu próprio hash de senha.

**Código vulnerável:**
```ts
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { subscriptions: { include: { apiKey: true }, orderBy: { createdAt: 'desc' } } }
});
return c.json({ success: true, data: user });
```

**Correção sugerida:**
Usar `select` explícito para excluir campos sensíveis:

```ts
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    email: true,
    name: true,
    role: true,
    createdAt: true,
    updatedAt: true,
    subscriptions: {
      include: { apiKey: true },
      orderBy: { createdAt: 'desc' }
    }
  }
});
```

---

### 6. API Keys Armazenadas em Texto Plano

**Arquivo:** `backend/prisma/schema.prisma:60`

**Problema:**
As API keys (`se_live_...`) são armazenadas em plain text no banco de dados. O comentário no schema diz "Hash seguro" mas o código armazena e compara o valor diretamente. Se o banco for comprometido (SQL injection, backup vazado, acesso indevido ao Supabase), todas as keys ficam expostas imediatamente.

**Código atual:**
```ts
// Armazena em plain text
const apiKey = `se_live_${crypto.randomBytes(32).toString('base64url')}`;
await prisma.apiKey.create({ data: { key: apiKey, ... } });

// Busca por plain text
const keyRecord = await prisma.apiKey.findUnique({ where: { key: apiKey } });
```

**Correção sugerida:**
Armazenar apenas o hash SHA-256 da key. Mostrar a key ao usuário apenas uma vez (na criação/rotação):

```ts
// Na criação:
const rawKey = `se_live_${crypto.randomBytes(32).toString('base64url')}`;
const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');
await prisma.apiKey.create({ data: { key: hashedKey, ... } });
// Retornar rawKey ao usuário uma única vez

// Na autenticação:
const hashedInput = crypto.createHash('sha256').update(apiKey).digest('hex');
const keyRecord = await prisma.apiKey.findUnique({ where: { key: hashedInput } });
```

---

## P2 — Médios

### 7. Admin Stats Carregam Todos os Registros em Memória

**Arquivos:**
- `backend/src/routes/admin.ts:67-71` (request stats)
- `backend/src/routes/admin.ts:111-127` (revenue)
- `backend/src/routes/admin.ts:137-152` (growth)

**Problema:**
Os endpoints de estatísticas do admin fazem `findMany` sem paginação e agregam os dados em JavaScript. Para 90 dias de logs, isso pode significar **milhões de registros** carregados em memória, causando OOM (Out of Memory) em produção.

**Código vulnerável (exemplo — request stats):**
```ts
const logs = await prisma.requestLog.findMany({
  where: { createdAt: { gte: since } },
  select: { createdAt: true },
  orderBy: { createdAt: 'asc' }
});

// Agrega em JS
const dailyMap: Record<string, number> = {};
for (const log of logs) {
  const dateKey = log.createdAt.toISOString().split('T')[0];
  dailyMap[dateKey] = (dailyMap[dateKey] || 0) + 1;
}
```

**Correção sugerida:**
Usar `$queryRaw` com `DATE_TRUNC` do PostgreSQL para agregar no banco:

```ts
const data = await prisma.$queryRaw`
  SELECT DATE_TRUNC('day', "createdAt")::date AS date,
         COUNT(*)::int AS requests
  FROM "RequestLog"
  WHERE "createdAt" >= ${since}
  GROUP BY 1
  ORDER BY 1
`;
```

---

### 8. Plano Free Renovável Infinitamente

**Arquivo:** `backend/src/routes/auth.ts:121-137`

**Problema:**
O plano free expira em 30 dias (`expiresAt`). Porém, quando o usuário faz login novamente via Google e não possui subscription ativa, o código cria automaticamente **outra** subscription free:

```ts
const existingSubscription = await prisma.subscription.findFirst({
  where: { userId: user.id, isActive: true },
  // ...
});

if (!existingSubscription) {
  const freeSub = await createFreeSubscription(user.id); // Cria outra free!
}
```

Isso permite uso gratuito ilimitado para sempre — basta relogar a cada 30 dias.

**Correção sugerida:**
Verificar se o usuário **já teve** um plano free (independente de estar ativo):

```ts
const hadFreePlan = await prisma.subscription.findFirst({
  where: { userId: user.id, planName: 'free' }
});

if (!existingSubscription && !hadFreePlan) {
  const freeSub = await createFreeSubscription(user.id);
}
```

Ou limitar a uma única subscription free por usuário no schema.

---

### 9. `biWeeklyQuota` do Plano Free Igual ao `monthlyQuota`

**Arquivo:** `backend/src/routes/auth.ts:53-59`

**Problema:**
O plano free define:
```ts
monthlyQuota: 500,
biWeeklyQuota: 500, // Deveria ser 250?
```

Os planos pagos usam `biWeeklyQuota = monthlyQuota / 2` (metade, pois há 2 ciclos de 15 dias por mês). Mas o free define ambos como 500, resultando em **1000 requisições/mês** (500 × 2 ciclos), não 500 como o nome sugere.

**Correção sugerida:**
Alinhar com a lógica dos planos pagos:
```ts
monthlyQuota: 500,
biWeeklyQuota: 250, // 500 / 2
```

Ou, se a intenção é 500 total/mês, documentar claramente e ajustar o `monthlyQuota`.

---

## P3 — Baixos

### 10. Cache Key com Ordering Inconsistente

**Arquivo:** `backend/src/services/cache.ts:11-14`

**Problema:**
A chave de cache é gerada com `JSON.stringify(params)`, que não garante ordem consistente das propriedades de um objeto. Os objetos `{ a: 1, b: 2 }` e `{ b: 2, a: 1 }` geram cache keys **diferentes** para a mesma query.

```ts
function generateCacheKey(sport: string, endpoint: string, params?: Record<string, any>): string {
  const paramsHash = params ? JSON.stringify(params) : '';
  return `${sport}:${endpoint}:${Buffer.from(paramsHash).toString('base64')}`;
}
```

**Correção sugerida:**
Ordenar as chaves antes de serializar:

```ts
function generateCacheKey(sport: string, endpoint: string, params?: Record<string, any>): string {
  const sorted = params ? JSON.stringify(params, Object.keys(params).sort()) : '';
  return `${sport}:${endpoint}:${Buffer.from(sorted).toString('base64')}`;
}
```

---

### 11. Sem `try/catch` nos Endpoints de Sport

**Arquivo:** `backend/src/routes/sports.ts`

**Problema:**
Nenhum endpoint de sport possui tratamento de erro. Se a API upstream (`sportdb.dev`) falhar, retornar timeout, ou dados inesperados, o erro borbulha para o handler genérico do Hono que retorna apenas "Erro interno do servidor" sem contexto útil para debugging.

**Correção sugerida:**
Adicionar try/catch em cada endpoint (ou um middleware de erro) que retorne uma mensagem mais útil e logue o contexto:

```ts
app.get('/:sport/leagues', async (c) => {
  try {
    // ... lógica existente
  } catch (error: any) {
    console.error(`[Sport] Erro em leagues:`, error.message);
    return c.json({
      success: false,
      error: 'Erro ao buscar dados. Tente novamente.'
    }, 502);
  }
});
```

---

### 12. Token JWT Armazenado no `localStorage`

**Arquivo:** `frontend/lib/auth-context.tsx`

**Problema:**
O JWT é persistido em `localStorage`, que é acessível por qualquer script JavaScript na mesma origem. Se houver uma vulnerabilidade XSS (mesmo via dependência de terceiros), o token pode ser roubado.

**Correção sugerida:**
Migrar para cookies `httpOnly` + `Secure` + `SameSite=Strict`, setados pelo backend. O frontend não precisa (e não deveria) ter acesso direto ao token.

---

### 13. Subscription Expirada Só Detectada no Middleware de API Key

**Arquivo:** `backend/src/middleware/auth.ts:60-74`

**Problema:**
A desativação de subscriptions expiradas só acontece quando o usuário faz uma requisição de API que passa pelo middleware `apiKeyAuth`. Se o usuário nunca mais usar a API, a subscription permanece como `isActive: true` no banco indefinidamente, distorcendo as métricas do painel admin (contagem de assinaturas ativas, receita estimada, etc.).

**Correção sugerida:**
Implementar um job periódico (cron) que desativa subscriptions expiradas:

```ts
// Rodar a cada hora via cron/scheduler
await prisma.subscription.updateMany({
  where: {
    isActive: true,
    expiresAt: { lt: new Date() }
  },
  data: { isActive: false }
});
```

---

### 14. Admin Endpoint Vaza `googleId` dos Usuários

**Arquivo:** `backend/src/routes/admin.ts:282-308`

**Problema:**
O endpoint `GET /admin/users/:userId` inclui o `googleId` na resposta. Embora seja um endpoint admin-only, o `googleId` é um identificador sensível que não tem utilidade no painel administrativo.

**Correção sugerida:**
Excluir `googleId` do select, ou substituir por um indicador booleano `hasGoogleAuth: !!user.googleId`.
