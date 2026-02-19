#!/bin/bash

# ============================================
# Script de Testes da API Gateway de Esportes
# ============================================

set -e

API_URL="http://localhost:3001"
API_KEY="br_football_teste123456789"
API_KEY_BASKET="br_basketball_teste987654321"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "🧪 Testes da API Gateway de Esportes"
echo "=========================================="
echo ""

# Verifica se servidor está rodando
if ! curl -s "$API_URL/health" > /dev/null; then
    echo -e "${RED}❌ Servidor não está rodando em $API_URL${NC}"
    echo "Inicie com: npm run dev"
    exit 1
fi

echo -e "${GREEN}✅ Servidor está online${NC}"
echo ""

# ============================================
# TESTES PÚBLICOS
# ============================================

echo "📋 TESTES PÚBLICOS"
echo "------------------"

echo -n "Health check básico... "
if curl -s "$API_URL/health" | grep -q '"status":"ok"'; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌${NC}"
fi

echo -n "Info da API... "
if curl -s "$API_URL/" | grep -q '"success":true'; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌${NC}"
fi

echo ""

# ============================================
# TESTES DE AUTENTICAÇÃO
# ============================================

echo "🔒 TESTES DE AUTENTICAÇÃO"
echo "-------------------------"

echo -n "Sem API Key... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/v1/football/leagues")
if [ "$STATUS" = "401" ]; then
    echo -e "${GREEN}✅ (401)${NC}"
else
    echo -e "${RED}❌ (esperado 401, veio $STATUS)${NC}"
fi

echo -n "API Key inválida... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "x-api-key: invalida" "$API_URL/v1/football/leagues")
if [ "$STATUS" = "401" ]; then
    echo -e "${GREEN}✅ (401)${NC}"
else
    echo -e "${RED}❌ (esperado 401, veio $STATUS)${NC}"
fi

echo -n "Esporte não permitido... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "x-api-key: $API_KEY" "$API_URL/v1/basketball/leagues")
if [ "$STATUS" = "403" ]; then
    echo -e "${GREEN}✅ (403)${NC}"
else
    echo -e "${RED}❌ (esperado 403, veio $STATUS)${NC}"
fi

echo -n "API Key válida... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "x-api-key: $API_KEY" "$API_URL/v1/football/leagues")
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✅ (200)${NC}"
else
    echo -e "${RED}❌ (esperado 200, veio $STATUS)${NC}"
fi

echo ""

# ============================================
# TESTES DE DADOS
# ============================================

echo "📊 TESTES DE DADOS"
echo "------------------"

echo -n "Listar ligas... "
TOTAL=$(curl -s -H "x-api-key: $API_KEY" "$API_URL/v1/football/leagues" | jq -r '.data.total // 0')
if [ "$TOTAL" -gt 0 ]; then
    echo -e "${GREEN}✅ ($TOTAL ligas)${NC}"
else
    echo -e "${RED}❌${NC}"
fi

echo -n "Filtrar por país (england)... "
TOTAL=$(curl -s -H "x-api-key: $API_KEY" "$API_URL/v1/football/leagues?country=england" | jq -r '.data.total // 0')
if [ "$TOTAL" -gt 0 ]; then
    echo -e "${GREEN}✅ ($TOTAL ligas)${NC}"
else
    echo -e "${RED}❌${NC}"
fi

echo -n "Jogos da Premier League... "
LEAGUE=$(curl -s -H "x-api-key: $API_KEY" "$API_URL/v1/football/fixtures?league=england-premier-league-2025-2026" | jq -r '.data.league // empty')
if [ "$LEAGUE" = "Premier League" ]; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌${NC}"
fi

echo -n "Classificação... "
TOTAL_TEAMS=$(curl -s -H "x-api-key: $API_KEY" "$API_URL/v1/football/standings?league=england-premier-league-2025-2026" | jq -r '.data.totalTeams // 0')
if [ "$TOTAL_TEAMS" -eq 20 ]; then
    echo -e "${GREEN}✅ ($TOTAL_TEAMS times)${NC}"
else
    echo -e "${YELLOW}⚠️ ($TOTAL_TEAMS times, esperado 20)${NC}"
fi

echo -n "Buscar times... "
TOTAL_TEAMS=$(curl -s -H "x-api-key: $API_KEY" "$API_URL/v1/football/teams?search=Arsenal" | jq -r '.data.total // 0')
if [ "$TOTAL_TEAMS" -gt 0 ]; then
    echo -e "${GREEN}✅ ($TOTAL_TEAMS times)${NC}"
else
    echo -e "${RED}❌${NC}"
fi

echo -n "Estatísticas da liga... "
TOTAL_MATCHES=$(curl -s -H "x-api-key: $API_KEY" "$API_URL/v1/football/leagues/england-premier-league-2025-2026/stats" | jq -r '.data.stats.totalMatches // 0')
if [ "$TOTAL_MATCHES" -gt 0 ]; then
    echo -e "${GREEN}✅ ($TOTAL_MATCHES jogos)${NC}"
else
    echo -e "${RED}❌${NC}"
fi

echo ""

# ============================================
# TESTE DE CACHE
# ============================================

echo "💾 TESTE DE CACHE"
echo "-----------------"

echo -n "Primeira requisição (cache miss)... "
CACHED1=$(curl -s -H "x-api-key: $API_KEY" "$API_URL/v1/football/leagues?country=spain" | jq -r '.meta.cached')
if [ "$CACHED1" = "false" ]; then
    echo -e "${GREEN}✅ (cached: false)${NC}"
else
    echo -e "${YELLOW}⚠️ (cached: $CACHED1)${NC}"
fi

echo -n "Segunda requisição (cache hit)... "
CACHED2=$(curl -s -H "x-api-key: $API_KEY" "$API_URL/v1/football/leagues?country=spain" | jq -r '.meta.cached')
if [ "$CACHED2" = "true" ]; then
    echo -e "${GREEN}✅ (cached: true)${NC}"
else
    echo -e "${YELLOW}⚠️ (cached: $CACHED2)${NC}"
fi

echo ""

# ============================================
# TESTE DE QUOTA
# ============================================

echo "📉 TESTE DE QUOTA"
echo "-----------------"

QUOTA=$(curl -s -H "x-api-key: $API_KEY" "$API_URL/v1/football/leagues" | jq -r '.meta.remainingQuota')
echo -e "Quota restante: ${GREEN}$QUOTA${NC}"

echo ""
echo "=========================================="
echo "✅ Testes concluídos!"
echo "=========================================="
