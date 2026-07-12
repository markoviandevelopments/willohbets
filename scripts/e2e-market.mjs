/**
 * Smoke test: init → open round → place YES → fill as NO → (optional settle after wait)
 */
import { readFileSync } from 'fs'
import { homedir } from 'os'
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js'
import anchor from '@coral-xyz/anchor'
const { AnchorProvider, BN, Program, Wallet } = anchor

const RPC = process.env.RPC_URL || 'https://api.devnet.solana.com'
const idl = JSON.parse(
  readFileSync(new URL('../target/idl/coinflip.json', import.meta.url), 'utf8'),
)
const PROGRAM_ID = new PublicKey(idl.address)

function loadKeypair(path) {
  return Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(readFileSync(path, 'utf8'))),
  )
}

function pda(seeds) {
  return PublicKey.findProgramAddressSync(seeds, PROGRAM_ID)
}

const connection = new Connection(RPC, 'confirmed')
const a = loadKeypair(`${homedir()}/recovered-phrase-wallet.json`)
const b = Keypair.generate()

// fund B
{
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
  const tx = new Transaction({ feePayer: a.publicKey, blockhash, lastValidBlockHeight }).add(
    SystemProgram.transfer({
      fromPubkey: a.publicKey,
      toPubkey: b.publicKey,
      lamports: 0.05 * LAMPORTS_PER_SOL,
    }),
  )
  tx.sign(a)
  const sig = await connection.sendRawTransaction(tx.serialize())
  await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight })
  console.log('Funded B', b.publicKey.toBase58())
}

const progA = new Program(idl, new AnchorProvider(connection, new Wallet(a), { commitment: 'confirmed' }))
const progB = new Program(idl, new AnchorProvider(connection, new Wallet(b), { commitment: 'confirmed' }))

const [marketPda] = pda([Buffer.from('market')])
const [vaultPda] = pda([Buffer.from('vault')])

let market
try {
  market = await progA.account.market.fetch(marketPda)
  console.log('Market exists, round', market.currentRoundId.toString(), 'settled', market.currentRoundSettled)
} catch {
  console.log('Initializing market…')
  await progA.methods
    .initializeMarket()
    .accounts({
      authority: a.publicKey,
      market: marketPda,
      vault: vaultPda,
      systemProgram: SystemProgram.programId,
    })
    .rpc()
  market = await progA.account.market.fetch(marketPda)
  console.log('Initialized')
}

// If open unsettled round exists and not ended, use it; else open new if settled
if (!market.currentRoundSettled) {
  const rid = market.currentRoundId.toNumber()
  const [rPda] = pda([Buffer.from('round'), new BN(rid).toArrayLike(Buffer, 'le', 8)])
  const r = await progA.account.round.fetch(rPda)
  const now = Math.floor(Date.now() / 1000)
  if (now >= r.endTs.toNumber()) {
    console.log('Settling stale round…')
    // fake end price slightly up
    await progA.methods
      .settleRound(r.startPriceE8.add(new BN(1)))
      .accounts({ settler: a.publicKey, market: marketPda, round: rPda })
      .rpc()
    market = await progA.account.market.fetch(marketPda)
  } else {
    console.log('Using open round', rid)
  }
}

if (market.currentRoundSettled) {
  const next = market.currentRoundId.toNumber() + 1
  const [rPda] = pda([Buffer.from('round'), new BN(next).toArrayLike(Buffer, 'le', 8)])
  // ~100k * 1e8
  const start = new BN('10000000000000') // $100,000 with 1e8
  console.log('Opening round', next)
  await progA.methods
    .openRound(start)
    .accounts({
      payer: a.publicKey,
      market: marketPda,
      round: rPda,
      systemProgram: SystemProgram.programId,
    })
    .rpc()
  market = await progA.account.market.fetch(marketPda)
}

const rid = market.currentRoundId.toNumber()
const orderId = market.nextOrderId.toNumber()
const [rPda] = pda([Buffer.from('round'), new BN(rid).toArrayLike(Buffer, 'le', 8)])
const [oPda] = pda([
  Buffer.from('order'),
  new BN(rid).toArrayLike(Buffer, 'le', 8),
  new BN(orderId).toArrayLike(Buffer, 'le', 8),
])

console.log('Placing YES x3 @ 55%')
await progA.methods
  .placeOrder({ yes: {} }, new BN(5500), new BN(3))
  .accounts({
    owner: a.publicKey,
    market: marketPda,
    round: rPda,
    order: oPda,
    vault: vaultPda,
    systemProgram: SystemProgram.programId,
  })
  .rpc()

const [makerPos] = pda([
  Buffer.from('position'),
  new BN(rid).toArrayLike(Buffer, 'le', 8),
  a.publicKey.toBuffer(),
])
const [takerPos] = pda([
  Buffer.from('position'),
  new BN(rid).toArrayLike(Buffer, 'le', 8),
  b.publicKey.toBuffer(),
])

console.log('B fills 2 contracts (takes NO side)')
await progB.methods
  .fillOrder(new BN(2))
  .accounts({
    taker: b.publicKey,
    maker: a.publicKey,
    market: marketPda,
    round: rPda,
    order: oPda,
    makerPosition: makerPos,
    takerPosition: takerPos,
    vault: vaultPda,
    systemProgram: SystemProgram.programId,
  })
  .rpc()

const order = await progA.account.order.fetch(oPda)
const posA = await progA.account.position.fetch(makerPos)
const posB = await progA.account.position.fetch(takerPos)
console.log('Order remaining', order.qtyRemaining.toString(), 'status', order.status)
console.log('A yes/no', posA.yesContracts.toString(), posA.noContracts.toString())
console.log('B yes/no', posB.yesContracts.toString(), posB.noContracts.toString())
console.log('OK')
