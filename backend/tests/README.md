# 🧪 Guia de Testes da API

## Iniciar o Servidor

```bash
cd backend
npm run dev
```

Servidor estará em: http://localhost:3001

---

## 🔑 API Keys de Teste

```
Futebol:    br_football_teste123456789
Basquete:   br_basketball_teste987654321
```

---

## 📋 Endpoints para Testar

### 1. Health Check (Público)

```bash
# Health básico
curl http://localhost:3001/health

# Health completo (com banco de dados)
curl http://localhost:3001/health/full
```

### 2. Info da API (Público)

```bash
curl http://localhost:3001/
```

---

## 🔒 Endpoints Protegidos (Requerem API Key)

### 3. Listar Ligas

```bash
# Todas as ligas
curl -H "x-api-key: br_football_teste123456789" \
  http://localhost:3001/v1/football/leagues

# Filtrar por país
curl -H "x-api-key: br_football_teste123456789" \
  "http://localhost:3001/v1/football/leagues?country=england"
```

### 4. Jogos/Fixtures

```bash
# Jogos de uma liga específica
curl -H "x-api-key: br_football_teste123456789" \
  "http://localhost:3001/v1/football/fixtures?league=england-premier-league-2025-2026"

# Jogos de um time
curl -H "x-api-key: br_football_teste123456789" \
  "http://localhost:3001/v1/football/fixtures?team=Liverpool"

# Jogos por rodada
curl -H "x-api-key: br_football_teste123456789" \
  "http://localhost:3001/v1/football/fixtures?league=england-premier-league-2025-2026&round=Round%2025"
```

### 5. Detalhes de um Jogo

```bash
# Primeiro pegue um ID de jogo do endpoint anterior, depois:
curl -H "x-api-key: br_football_teste123456789" \
  http://localhost:3001/v1/football/fixtures/lbnqyVFq
```

### 6. Classificação/Standings

```bash
curl -H "x-api-key: br_football_teste123456789" \
  "http://localhost:3001/v1/football/standings?league=england-premier-league-2025-2026"
```

### 7. Times

```bash
# Listar todos os times
curl -H "x-api-key: br_football_teste123456789" \
  http://localhost:3001/v1/football/teams

# Buscar time específico
curl -H "x-api-key: br_football_teste123456789" \
  "http://localhost:3001/v1/football/teams?search=Arsenal"

# Jogos de um time específico
curl -H "x-api-key: br_football_teste123456789" \
  "http://localhost:3001/v1/football/teams/Arsenal/fixtures"
```

### 8. Estatísticas do Jogo

```bash
curl -H "x-api-key: br_football_teste123456789" \
  http://localhost:3001/v1/football/fixtures/lbnqyVFq/stats
```

### 9. Estatísticas da Liga

```bash
curl -H "x-api-key: br_football_teste123456789" \
  http://localhost:3001/v1/football/leagues/england-premier-league-2025-2026/stats
```

---

## ⚠️ Testes de Erro

### API Key inválida

```bash
curl -H "x-api-key: chave_invalida" \
  http://localhost:3001/v1/football/leagues
```

**Esperado:** `401 Unauthorized`

### Sem API Key

```bash
curl http://localhost:3001/v1/football/leagues
```

**Esperado:** `401 Unauthorized`

### Esporte não permitido na assinatura

```bash
# Assinatura é de futebol, tentar acessar basquete:
curl -H "x-api-key: br_football_teste123456789" \
  http://localhost:3001/v1/basketball/leagues
```

**Esperado:** `403 Forbidden`

### Liga não encontrada

```bash
curl -H "x-api-key: br_football_teste123456789" \
  "http://localhost:3001/v1/football/standings?league=liga-inexistente"
```

**Esperado:** `404 Not Found`

---

## 🧪 Testar Cache

Faça a mesma requisição 2 vezes e observe o header `cached`:

```bash
# Primeira vez (cached: false)
curl -H "x-api-key: br_football_teste123456789" \
  "http://localhost:3001/v1/football/leagues?country=england" | jq '.meta'

# Segunda vez (cached: true - se dentro do TTL)
curl -H "x-api-key: br_football_teste123456789" \
  "http://localhost:3001/v1/football/leagues?country=england" | jq '.meta'
```

---

## 📊 Verificar Quota

Cada requisição retorna a quota restante:

```bash
curl -H "x-api-key: br_football_teste123456789" \
  http://localhost:3001/v1/football/leagues | jq '.meta.remainingQuota'
```

---

## 🔄 Testar Rate Limit (por IP)

Faça muitas requisições rápidas:

```bash
for i in {1..110}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    http://localhost:3001/health
done
```

**Esperado:** Após ~100 requisições, retorna `429 Too Many Requests`

---

## 💡 Dicas

1. **Use jq** para formatar JSON: `curl ... | jq`
2. **Use -v** para ver headers completos: `curl -v ...`
3. **Use -w** para ver timing: `curl -w "@curl-format.txt" ...`
