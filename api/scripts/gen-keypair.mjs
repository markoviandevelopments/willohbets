/**
 * Generate api/agent-keypair.json if missing and print the pubkey.
 */
import { existsSync, writeFileSync, readFileSync, mkdirSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'
import { Keypair } from '@solana/web3.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outPath = resolve(
  process.env.WILLOHBETS_KEYPAIR_PATH ||
    join(__dirname, '..', 'agent-keypair.json'),
)

if (existsSync(outPath)) {
  const secret = Uint8Array.from(JSON.parse(readFileSync(outPath, 'utf8')))
  const kp = Keypair.fromSecretKey(secret)
  console.log('Keypair already exists:', outPath)
  console.log('Public key:', kp.publicKey.toBase58())
  process.exit(0)
}

mkdirSync(dirname(outPath), { recursive: true })
const kp = Keypair.generate()
writeFileSync(outPath, JSON.stringify(Array.from(kp.secretKey)))
console.log('Wrote keypair:', outPath)
console.log('Public key:', kp.publicKey.toBase58())
console.log('Fund this pubkey with devnet SOL before trading.')
