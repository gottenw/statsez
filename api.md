# PROJETO: API Gateway de Esportes (Wrapper Brasileiro)

## 1. Visão Geral
O objetivo é criar uma API comercial (Wrapper) focada no mercado brasileiro que fornece dados estatísticos de esportes (Futebol, Basquete, Tênis, Hóquei). O sistema revende dados de uma API terceira, adicionando cache, rate-limiting, gestão de planos e pagamento simplificado.
**NÃO HAVERÁ DADOS DE LIVESCORE (TEMPO REAL).** Apenas estatísticas, históricos, line-ups e tabelas.

## 2. Stack Tecnológica
- **Linguagem:** TypeScript.
- **Runtime:** Node.js (v20+) ou Bun.
- **Framework Backend:** Hono (pela leveza e suporte a Edge) ou Fastify.
- **Banco de Dados:** PostgreSQL (via Supabase ou Neon). Usar Prisma ORM.
- **Cache:** Redis (via Upstash) para cachear respostas da API original e economizar custos.
- **Frontend:** Next.js 14+ (App Router), TailwindCSS, Shadcn/UI (para o dashboard do cliente).
- **Pagamento:** Integração com Gateway Brasileiro (ex: Asaas, Stripe BR ou Mercado Pago) para aceitar PIX/Cartão.

## 3. Arquitetura do Sistema

### A. Fluxo da Requisição
1.  Cliente faz GET em `api.meudominio.com/v1/football/fixtures...` enviando `x-api-key` no header.
2.  **Middleware de Autenticação:**
    - Verifica se a Key existe no Banco de Dados.
    - Verifica se o plano está ativo.
    - Verifica a restrição de Esporte (ex: Cliente comprou só Futebol, bloqueia Basquete).
3.  **Middleware de Rate Limit e Quota:**
    - Verifica se o cliente tem saldo de requisições para a *quinzena atual*.
    - O ciclo reseta a cada 15 dias (Quota quinzenal = Total Mensal / 2).
4.  **Camada de Cache:**
    - Verifica no Redis se essa requisição já foi feita nas últimas X horas.
    - Se SIM: Retorna o JSON do Redis (Custo zero na API original).
    - Se NÃO: Chama a API original, salva no Redis e retorna ao cliente.
5.  **Logging:**
    - Decrementa 1 crédito do saldo do cliente no Banco de Dados.

### B. Pasta de Integração (IMPORTANTE)
**Nota para o Desenvolvedor:** Eu tenho uma pasta local contendo a lógica de conexão com a API original (endpoints, tipos, mapeamento). Eu vou colar essa pasta no projeto. Sua tarefa é criar a infraestrutura ao redor dela (autenticação, cobrança, rotas públicas), e não reescrever a lógica de fetch, apenas importá-la.

## 4. Regras de Negócio e Planos

### Modelo de Cobrança
- **Moeda:** BRL (Reais).
- **Restrição:** Cada assinatura é vinculada a **apenas 1 esporte** (escolhido no checkout).
- **Ciclo de Quota:** As requisições não são liberadas todas de uma vez. O limite é renovado 50% no dia 1 e 50% no dia 15 da assinatura para evitar abuso massivo em curto prazo.

### Calculadora de Preço (Feature Personalizada)
No frontend, haverá um slider onde o usuário escolhe a quantidade exata de requisições.
- **Lógica:** Preço Base + (Custo por Req * Qtd).
- Deve haver um desconto progressivo para volumes altos.

## 5. Banco de Dados (Schema Sugerido - Prisma)

```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String
  createdAt     DateTime @default(now())
  subscriptions Subscription[]
}

model Subscription {
  id             String   @id @default(uuid())
  userId         String
  sport          String   // "football", "basketball", "tennis", "hockey"
  planName       String   // "Basic", "Pro", "Custom"
  monthlyQuota   Int      // Ex: 40000
  biWeeklyQuota  Int      // Ex: 20000 (Metade do mensal)
  currentUsage   Int      @default(0) // Uso no ciclo atual de 15 dias
  cycleStartDate DateTime @default(now()) // Data que iniciou a quinzena atual
  isActive       Boolean  @default(true)
  apiKey         ApiKey?
  
  user           User     @relation(fields: [userId], references: [id])
}

model ApiKey {
  id             String       @id @default(uuid())
  key            String       @unique // Hash seguro ex: "br_sport_..."
  subscriptionId String       @unique
  subscription   Subscription @relation(fields: [subscriptionId], references: [id])
}
6. Requisitos de Segurança
Rotação de Keys: O usuário pode gerar uma nova chave no dashboard (invalidando a anterior).

Headers de Segurança: Helmet.js ou similar.

Rate Limit por IP: Para evitar DDoS na nossa porta de entrada, independente da API Key.

7. Instruções Passo a Passo para Implementação
Configure o projeto Next.js com a pasta /app (Frontend) e uma pasta /api-server (Backend Hono) ou use Next API Routes se preferir manter tudo em um deploy só (Vercel Functions são ótimas para isso, mas cuidado com o custo de tempo de execução. Para reduzir custo, prefira um server separado no Railway rodando Node/Bun).

Configure o Prisma com SQLite (para dev) e prepare para Postgres.

Crie o Middleware que intercepta as chamadas, valida a API Key no banco e checa o Redis.

Integre a pasta de scripts da API original que fornecerei.

Crie o Dashboard do Usuário:

Tela de Login/Cadastro.

Tela "Minha Assinatura": Mostra gráfico de uso, total restante na quinzena e botão de renovar/cancelar.

Tela "Documentação": Renderiza um Swagger/OpenAPI simples dos endpoints disponíveis.