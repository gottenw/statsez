# Equação de Precificação - SportsDB API

## 📐 Fórmula Geral do Preço Justo

### Variáveis

| Variável | Descrição |
|----------|-----------|
| `R` | Receita/Preço do plano (o que o cliente paga) |
| `F` | Custos fixos mensais (Railway + Domínio/12) |
| `V` | Custo variável por request upstream |
| `Q` | Quantidade de requests do cliente no plano |
| `M` | Multiplicador médio de upstream (sem cache = 2.4) |
| `C` | Fator de cache (%) - ex: 0.35 = 35% cache hit |
| `T` | Taxa do gateway de pagamento (Mercado Pago) |
| `L` | Margem de lucro desejada (0.20 = 20%) |
| `B` | Taxa fixa do boleto (R$ 3,49) |

---

## 💰 Custos Base

```
F = 30.00 + (55 / 12) = 30.00 + 4.58 = R$ 34,58/mês

Onde:
- Railway: R$ 30,00/mês
- Domínio: R$ 55,00/ano = R$ 4,58/mês
```

```
V = 0.0009 // R$0,0009 por request upstream
M = 2.4    // Multiplicador médio ponderado
```

---

## 🧮 FÓRMULA PRINCIPAL

### Para pagamentos com taxa percentual (Cartão, Pix, etc.):

```
R = (F + (Q × M × (1 - C) × V)) / ((1 - T) × (1 - L))
```

### Para pagamentos com taxa fixa (Boleto):

```
R = (F + (Q × M × (1 - C) × V) + B) / (1 - L)
```

---

## 🔢 Explicação dos Componentes

### 1. **Custo Efetivo de Upstream** (`U`)

Requests que realmente batem no upstream (não cacheados):

```
U = Q × M × (1 - C)
```

| Componente | Significado |
|------------|-------------|
| `Q` | Requests do cliente |
| `M` | Multiplicador médio (2.4 sem cache) |
| `(1 - C)` | Taxa de cache miss |

### 2. **Custo Variável Total** (`CV`)

```
CV = U × V = Q × M × (1 - C) × V
```

### 3. **Custo Total Operacional** (`CT`)

```
CT = F + CV = 34.58 + (Q × 2.4 × (1 - C) × 0.0009)
```

### 4. **Taxa do Gateway** (`T`)

| Método | Taxa (`T`) |
|--------|-----------|
| Cartão Crédito - Na hora | 0.0498 |
| Cartão Crédito - 14 dias | 0.0449 |
| Cartão Crédito - 30 dias | 0.0398 |
| Saldo MP/Linha Crédito - Na hora | 0.0499 |
| Saldo MP/Linha Crédito - 14 dias | 0.0449 |
| Saldo MP/Linha Crédito - 30 dias | 0.0399 |
| Débito Virtual Caixa | 0.0399 |
| **Pix** | **0.0099** |
| Open Finance | 0.0000 |
| **Boleto** | **Taxa fixa R$ 3,49** |

### 5. **Margem de Lucro** (`L`)

Para 20% de lucro: `L = 0.20`

---

## 💡 CÁLCULO COM CACHE 35% (C = 0.35)

### Fórmula simplificada com C = 0.35:

Cache miss = 65% = 0.65

```
Custo Variável = Q × 2.4 × 0.65 × 0.0009 = Q × 0.001404

Custo Total = 34.58 + (Q × 0.001404)
```

---

## 📊 PREÇOS JUSTOS COM 35% CACHE - PIX (0.99%)

### Plano Dev (40.000 requests)

```
CV = 40000 × 0.001404 = R$ 56,16
CT = 34.58 + 56.16 = R$ 90,74

R = 90.74 / (0.9901 × 0.80)
R = 90.74 / 0.7921
R = R$ 114,56
```

**Preço sugerido: R$ 114,90** (ou R$ 115,00)

---

### Plano Enterprise (250.000 requests)

```
CV = 250000 × 0.001404 = R$ 351,00
CT = 34.58 + 351.00 = R$ 385,58

R = 385.58 / 0.7921
R = R$ 486,78
```

**Preço sugerido: R$ 487,00** (ou R$ 489,90)

---

### Plano Gold (600.000 requests)

```
CV = 600000 × 0.001404 = R$ 842,40
CT = 34.58 + 842.40 = R$ 876,98

R = 876.98 / 0.7921
R = R$ 1.107,16
```

**Preço sugerido: R$ 1.107,00** (ou R$ 1.097,00 / R$ 1.197,00)

---

## 📋 TABELA RESUMO - PREÇOS COM 35% CACHE

### Pix (0.99% taxa)

| Plano | Requests | Custo Variável | Custo Total | Preço com 20% Lucro |
|-------|----------|----------------|-------------|---------------------|
| **Dev** | 40.000 | R$ 56,16 | R$ 90,74 | **R$ 114,56** |
| **Enterprise** | 250.000 | R$ 351,00 | R$ 385,58 | **R$ 486,78** |
| **Gold** | 600.000 | R$ 842,40 | R$ 876,98 | **R$ 1.107,16** |

### Cartão 30 dias (3.98% taxa)

| Plano | Preço com 20% Lucro |
|-------|---------------------|
| **Dev** | **R$ 118,12** |
| **Enterprise** | **R$ 501,90** |
| **Gold** | **R$ 1.141,60** |

### Boleto (taxa fixa R$ 3,49)

| Plano | Custo + Boleto | Preço com 20% Lucro |
|-------|----------------|---------------------|
| **Dev** | R$ 94,23 | **R$ 117,79** |
| **Enterprise** | R$ 389,07 | **R$ 486,34** |
| **Gold** | R$ 880,47 | **R$ 1.100,59** |

---

## 🎯 PREÇOS SUGERIDOS (PIX - mais barato)

| Plano | Preço Atual | Preço Correto (35% cache) | Diferença |
|-------|-------------|---------------------------|-----------|
| **Dev** (40k req) | R$ 79,00 | **R$ 114,56** | -R$ 35,56 |
| **Enterprise** (250k req) | R$ 349,00 | **R$ 486,78** | -R$ 137,78 |
| **Gold** (600k req) | R$ 699,00 | **R$ 1.107,16** | -R$ 408,16 |

---

## 🧮 CALCULADORA RÁPIDA

```python
def preco_justo(qtd_requests, cache_percent, metodo_pagamento='pix', lucro=0.20):
    """
    Calcula o preço justo para 20% de margem de lucro.
    
    Args:
        qtd_requests: Quantidade de requests do plano
        cache_percent: Porcentagem de cache hit (0-100)
        metodo_pagamento: 'pix', 'cartao_30', 'cartao_14', 'cartao_now', 
                          'saldo_30', 'saldo_14', 'saldo_now', 
                          'debito_caixa', 'open_finance', 'boleto'
        lucro: Margem de lucro desejada (padrão: 0.20 = 20%)
    """
    
    # Custos base
    RAILWAY = 30.00
    DOMINIO_ANO = 55.00
    CUSTO_FIXO = RAILWAY + (DOMINIO_ANO / 12)  # 34.58
    
    CUSTO_UPSTREAM = 0.0009
    MULTIPLICADOR = 2.4
    BOLETO_TAXA = 3.49
    
    # Taxas Mercado Pago
    taxas = {
        'pix': 0.0099,
        'cartao_30': 0.0398,
        'cartao_14': 0.0449,
        'cartao_now': 0.0498,
        'saldo_30': 0.0399,
        'saldo_14': 0.0449,
        'saldo_now': 0.0499,
        'debito_caixa': 0.0399,
        'open_finance': 0.0,
        'boleto': 'fixa'
    }
    
    # Cálculo do custo variável
    cache_decimal = cache_percent / 100
    custo_variavel = qtd_requests * MULTIPLICADOR * (1 - cache_decimal) * CUSTO_UPSTREAM
    
    # Cálculo do preço
    taxa = taxas[metodo_pagamento]
    
    if taxa == 'fixa':  # Boleto
        preco = (CUSTO_FIXO + custo_variavel + BOLETO_TAXA) / (1 - lucro)
    else:
        preco = (CUSTO_FIXO + custo_variavel) / ((1 - taxa) * (1 - lucro))
    
    return round(preco, 2)

# EXEMPLOS COM CACHE 35%:
# preco_justo(40000, 35, 'pix')       # R$ 114.56
# preco_justo(250000, 35, 'pix')      # R$ 486.78
# preco_justo(600000, 35, 'pix')      # R$ 1107.16

# Com cartão 30 dias:
# preco_justo(40000, 35, 'cartao_30')  # R$ 118.12
# preco_justo(250000, 35, 'cartao_30') # R$ 501.90
# preco_justo(600000, 35, 'cartao_30') # R$ 1141.60
```

---

## 📋 FÓRMULAS SIMPLIFICADAS POR MÉTODO (C = 0.35)

Com 35% de cache, o custo variável é sempre: **`Q × 0.001404`**

### Pix (Recomendado - menor taxa)
```
R = (34.58 + (Q × 0.001404)) / 0.7913
```

### Cartão 30 dias
```
R = (34.58 + (Q × 0.001404)) / 0.7682
```

### Cartão 14 dias
```
R = (34.58 + (Q × 0.001404)) / 0.7641
```

### Cartão/Débito Na hora
```
R = (34.58 + (Q × 0.001404)) / 0.7601
```

### Open Finance (Sem taxa!)
```
R = (34.58 + (Q × 0.001404)) / 0.80
```

### Boleto
```
R = (38.07 + (Q × 0.001404)) / 0.80
```

---

## 🎲 BREAKEVEN ANALYSIS

Qual o % mínimo de cache para lucrar 20% no preço atual?

```
C = 1 - (((R × 0.7921) - 34.58) / (Q × 0.00216))
```

### Cache mínimo necessário (preços atuais):

| Plano | Preço Atual | Requests | Cache Mínimo (Pix) |
|-------|-------------|----------|-------------------|
| **Dev R$79** | R$ 79 | 40.000 | **72.5%** |
| **Enterprise R$349** | R$ 349 | 250.000 | **91.6%** |
| **Gold R$699** | R$ 699 | 600.000 | **93.4%** |

---

## 🔄 COMPARATIVO DE PREÇOS POR CACHE

### Pix - Preço justo para 20% lucro

| Plano | 0% Cache | 35% Cache | 50% Cache | 70% Cache | 90% Cache |
|-------|----------|-----------|-----------|-----------|-----------|
| **Dev** (40k) | R$ 139,92 | **R$ 114,56** | R$ 98,20 | R$ 65,48 | R$ 43,17 |
| **Enterprise** (250k) | R$ 787,22 | **R$ 486,78** | R$ 384,53 | R$ 231,73 | R$ 132,13 |
| **Gold** (600k) | R$ 1.873,54 | **R$ 1.107,16** | R$ 861,74 | R$ 515,00 | R$ 290,27 |

---

## ✅ CONCLUSÃO

### Preços sugeridos para 35% cache + 20% lucro (Pix):

| Plano | Preço Sugerido | Arredondado |
|-------|----------------|-------------|
| **Dev** (40k req) | R$ 114,56 | **R$ 114,90** |
| **Enterprise** (250k req) | R$ 486,78 | **R$ 489,90** |
| **Gold** (600k req) | R$ 1.107,16 | **R$ 1.097,00** |

### Fórmula definitiva com cache 35%:

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│   Custo Fixo = 34.58  (30 + 55/12)                                │
│                                                                    │
│   Com 35% cache: Custo Variável = Q × 0.001404                    │
│                                                                    │
│   Preço = (34.58 + (Q × 0.001404)) / ((1 - T) × 0.80)             │
│                                                                    │
│   Exemplo Pix: R = (34.58 + (Q × 0.001404)) / 0.7913              │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Observação:** Com apenas 35% de cache, os preços precisam ser significativamente maiores que os atuais para manter 20% de lucro. A diferença entre 35% e 90% cache é drástica:
- Dev: R$ 114,56 → R$ 43,17 (-62%)
- Enterprise: R$ 486,78 → R$ 132,13 (-73%)
- Gold: R$ 1.107,16 → R$ 290,27 (-74%)

**Recomendação:** Invista no cache! Cada % a mais de cache hit reduz drasticamente o custo e permite preços mais competitivos.
