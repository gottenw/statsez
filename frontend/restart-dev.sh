#!/bin/bash
cd "$(dirname "$0")"

echo "🛑 Parando servidor..."
pkill -f "next dev" 2>/dev/null
sleep 2

echo "🧹 Limpando cache..."
rm -rf .next

echo "🚀 Iniciando servidor..."
npm run dev
