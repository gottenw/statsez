#!/bin/bash

echo "🧹 Limpando cache..."
rm -rf .next
rm -rf node_modules/.cache

echo "🚀 Iniciando servidor de desenvolvimento..."
npm run dev
