/**
 * End-to-end smoke test on devnet using the deploy wallet + a second keypair.
 * Run: node scripts/e2e-devnet.mjs
 */
import { readFileSync } from 'fs'
import { homedir } from 'os'
import { Connection, Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js'
import anchor from '@coral-xyz/anchor'
const { AnchorProvider, BN, Program, Wallet } = anchor

const RPC = process.env.RPC_URL || 'https://api.devnet.solana.com'
const idl = JSON.parse(readFileSync(new URL('../target/idl/coinflip.json', import.meta.url), 'utf8'))
const PROGRAM_ID = new PublicKey(idl.address)

function loadKeypair(path) {
  const secret = JSON.parse(readFileSync(path, 'utf8'))
  return Keypair.fromSecretKey(Uint8Array.from(secret))
}

function gamePda(playerA, gameId) {
  const buf = Buffer.alloc(8)
  buf.writeBigUInt64LE(BigInt(gameId))
  return PublicKey.findProgramAddressSync(
    [Buffer.from('game'), playerA.toBuffer(), buf],
    PROGRAM_ID,
  )
}

const connection = new Connection(RPC, 'confirmed')
const playerA = loadKeypair(`${homedir()}/recovered-phrase-wallet.json`)
const playerB = Keypair.generate()

console.log('Program:', PROGRAM_ID.toBase58())
console.log('Player A:', playerA.publicKey.toBase58())
console.log('Player B:', playerB.publicKey.toBase58())

// Fund player B from A
const fundSig = await connection.requestAirdrop(playerB.publicKey, 0.05 * LAMPORTS_PER_SOL).catch(() => null)
if (fundSig) {
  await connection.confirmTransaction(fundSig, 'confirmed')
  console.log('Airdrop to B ok')
} else {
  // Manual transfer if airdrop fails
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
  const tx = new Transaction({
    feePayer: playerA.publicKey,
    blockhash,
    lastValidBlockHeight,
  }).add(
    SystemProgram.transfer({
      fromPubkey: playerA.publicKey,
      toPubkey: playerB.publicKey,
      lamports: 0.05 * LAMPORTS_PER_SOL,
    }),
  )
  tx.sign(playerA)
  const sig = await connection.sendRawTransaction(tx.serialize())
  await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, 'confirmed')
  console.log('Funded B via transfer:', sig)
}

const balA0 = await connection.getBalance(playerA.publicKey)
const balB0 = await connection.getBalance(playerB.publicKey)
console.log('Balances before:', balA0 / LAMPORTS_PER_SOL, balB0 / LAMPORTS_PER_SOL)

const walletA = new Wallet(playerA)
const providerA = new AnchorProvider(connection, walletA, { commitment: 'confirmed' })
const programA = new Program(idl, providerA)

const gameId = Date.now() % 1_000_000_000
const [pda] = gamePda(playerA.publicKey, gameId)
console.log('Creating game', gameId, 'pda', pda.toBase58())

const createSig = await programA.methods
  .createGame(new BN(gameId))
  .accounts({
    playerA: playerA.publicKey,
    game: pda,
    systemProgram: SystemProgram.programId,
  })
  .rpc()
console.log('create_game:', createSig)

const walletB = new Wallet(playerB)
const providerB = new AnchorProvider(connection, walletB, { commitment: 'confirmed' })
const programB = new Program(idl, providerB)

const joinSig = await programB.methods
  .joinGame()
  .accounts({
    playerB: playerB.publicKey,
    playerA: playerA.publicKey,
    game: pda,
    systemProgram: SystemProgram.programId,
  })
  .rpc()
console.log('join_game:', joinSig)

const game = await programB.account.game.fetch(pda)
console.log('Status:', game.status)
console.log('Winner:', game.winner.toBase58())
console.log('Player A:', game.playerA.toBase58())
console.log('Player B:', game.playerB.toBase58())

const balA1 = await connection.getBalance(playerA.publicKey)
const balB1 = await connection.getBalance(playerB.publicKey)
console.log('Balances after:', balA1 / LAMPORTS_PER_SOL, balB1 / LAMPORTS_PER_SOL)
console.log('Delta A (SOL):', (balA1 - balA0) / LAMPORTS_PER_SOL)
console.log('Delta B (SOL):', (balB1 - balB0) / LAMPORTS_PER_SOL)
console.log('OK')
