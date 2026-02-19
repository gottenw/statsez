#!/bin/bash
cd "$(dirname "$0")"

# Matar processos antigos
pkill -f "next dev" 2>/dev/null
sleep 1

# Limpar tudo
rm -rf .next
rm -rf node_modules/.cache

echo "🚀 Iniciando..."
npm run dev
