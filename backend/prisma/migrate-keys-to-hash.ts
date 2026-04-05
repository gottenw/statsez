/**
 * Script de migração: converte API keys de plain text para SHA-256 hash.
 *
 * Executar UMA VEZ antes de deployar a nova versão:
 *   npx tsx prisma/migrate-keys-to-hash.ts
 *
 * IMPORTANTE: Após executar, as keys raw não podem ser recuperadas.
 * Os usuários precisarão rotacionar suas keys para obter uma nova.
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

function hashApiKey(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex')
}

async function main() {
  const keys = await prisma.apiKey.findMany()

  console.log(`Encontradas ${keys.length} keys para migrar.`)

  let migrated = 0
  let skipped = 0

  for (const key of keys) {
    // Se já parece ser um hash SHA-256 (64 hex chars), pula
    if (/^[a-f0-9]{64}$/.test(key.key)) {
      skipped++
      continue
    }

    const hashed = hashApiKey(key.key)

    await prisma.apiKey.update({
      where: { id: key.id },
      data: { key: hashed }
    })

    migrated++
    console.log(`  [${migrated}] Key ${key.id}: ${key.key.substring(0, 16)}... → ${hashed.substring(0, 16)}...`)
  }

  console.log(`\nMigração concluída: ${migrated} migradas, ${skipped} já eram hash.`)
  console.log('AVISO: Os usuários precisarão rotacionar suas keys para obter novas credenciais.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
