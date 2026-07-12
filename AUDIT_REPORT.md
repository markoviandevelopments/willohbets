# WillohBets Devnet Audit Report

**Generated:** 2026-07-12T01:05:52.496Z
**Program ID:** `BPpvi9mmM8yzVbGofQARnsDjxdvVXioEbE5UB2F24uJb`
**RPC:** `https://api.devnet.solana.com`
**IDL:** `/home/preston/Desktop/willohbets/target/idl/coinflip.json`
**Contract value:** 1000000 lamports (0.001 SOL)

## 1. Market & Vault PDAs

| Item | Value |
|------|-------|
| Market PDA seed | `willoh_market` |
| Market PDA | `8ELjMxYQz62owCvvE8Trz7jyVGhB3ADSdysExqmBhAPq` |
| Market bump (derived) | 255 |
| Vault PDA seed | `willoh_vault` |
| Vault PDA | `7j9CKe2awWNyNzTKLo8iQjqQ1GNe1hwqDUXTgav8PtK1` |
| Vault bump (derived) | 252 |

### Market Account State

| Field | Value |
|-------|-------|
| authority | `3Srgo4o59BYx6zEyhNUJkMXVmCrQyYJ19gCp1YDgStiZ` |
| next_bet_id | 4 |
| next_order_id | 5 |
| bump | 255 |
| vault_bump | 252 |
| vault SOL balance | 1.006300880 SOL (1006300880 lamports) |

## 2. On-Chain Accounts

Program owns **27** accounts. Decoded: **3** Bet, **6** Order, **2** Position (v2), **2** Market. Legacy/unknown: **14**.

### 2.0 Multiple Market Accounts

| pubkey | authority | next_bet_id | next_order_id | bump | vault_bump | is_canonical_PDA |
|--------|-----------|-------------|---------------|------|------------|------------------|
| `8ELjMxYQz62owCvvE8Trz7jyVGhB3ADSdysExqmBhAPq` | `3Srgo4o5…StiZ` | 4 | 5 | 255 | 252 | ✅ |
| `8fSUf4dfkx4viKAoUpS9h6y7KQuEhiSwwGrGqvpq7WgD` | `3Srgo4o5…StiZ` | 1 | 768 | 0 | 249 | ❌ |

### 2.1 Bets

| bet_id | name | status | outcome | creator | created_ts | settled_ts | pubkey |
|--------|------|--------|---------|---------|------------|------------|--------|
| 1 | "Will WillohBets launch successfully?" | settled | yes | `3Srgo4o5…StiZ` | 1783814913 | 1783815444 | `J6rRk3np1KEVQjuEQWsYGAtWs4zcYkes6MMF9wvT1Tfk` |
| 2 | "Test" | settled | yes | `91XfsdkY…yk8U` | 1783815262 | 1783815333 | `6sKpdsxawir1wcizTHUTTR9ov13SNtSGvXtcXaqSkGgc` |
| 3 | "Will Bitcoin be above $63,839 at 7:30 PM CST?" | settled | no | `91XfsdkY…yk8U` | 1783815559 | 1783816698 | `3fdP98oBEGtrZRAooLEbmmf4cfUtM3HvvY4mwcF9M47q` |

### 2.2 Orders

| order_id | bet_id | side | price_bps | qty_total | qty_remaining | escrow | status | owner | pubkey |
|----------|--------|------|-----------|-----------|---------------|--------|--------|-------|--------|
| 1 | 1 | yes | 5500 | 3 | 0 | 0 | filled | `3Srgo4o5…StiZ` | `8nA7qqyLCVGGdLrVSnxRSq4rd2d8tFLNXdHgAYXZfTbc` |
| 1 | 2 | yes | 5000 | 1000 | 0 | 0 | filled | `91XfsdkY…yk8U` | `DR3RWLsAEGiffqs6HqxaAhAorm9B9DXJs5HZ9hPUBiKN` |
| 2 | 1 | yes | 5000 | 100 | 99 | 49500000 | open | `91XfsdkY…yk8U` | `4PKTueqQzYj6WtEYKi1zWkg68M3N8SF4mmu56RXX1qvA` |
| 2 | 3 | yes | 5300 | 1000 | 0 | 0 | filled | `91XfsdkY…yk8U` | `4iHhg6BVwsXC1RnTg6jQUZ4wWHrxzLcpUTz8KGG33nNv` |
| 3 | 3 | yes | 6400 | 100 | 8 | 5120000 | open | `91XfsdkY…yk8U` | `FHUymzriYwH8oHeJQ94U7FrDLd29V7wcur2QaKAvgqyk` |
| 4 | 3 | no | 2900 | 100 | 1 | 290000 | open | `91XfsdkY…yk8U` | `Fp234yo4YkWAPq3L3qgTkK1sFizc1Cu4f5xX6QpPxH7c` |

### 2.3 Positions (v2 with cost basis)

| bet_id | owner | yes_contracts | no_contracts | yes_cost | no_cost | claimed | pubkey |
|--------|-------|---------------|--------------|----------|---------|---------|--------|
| 3 | `3ZuVcp3CxQRbSCKGrTRtBns3S3NMuMQpYVC2ctCW298P` | 99 | 92 | 70290000 | 33120000 | true | `2ccxZUaUy3j8kz7yqLxjDND2kUNs4rNYPJ2pV8R8S3FV` |
| 3 | `91XfsdkYoV8gpVYmBwrjhWetsoWXqcoEMxzW3Qkqyk8U` | 92 | 99 | 58880000 | 28710000 | true | `6Am599aA6YA6o2F9U4jSapXb1tGtsbkoR6YbeozMg2Ws` |

### 2.4 Legacy / Unknown Program Accounts

| type | pubkey | discriminator | data_len | note |
|------|--------|---------------|----------|------|
| unknown | `2QBUkF7d2rqu6puKivNsxhYbVzvnPR4kFnkXrKrCkEwf` | `1b5aa67d4a647912` | 122 | not in current IDL |
| Position(legacy?) | `2hoskZgs9fqEaEMLzNCaDDQ4GpmALcV9oZxghp6QSLpW` | `aabc8fe47a40f7d0` | 66 | The value of "offset" is out of range. It must be >= 0 and <= 57. Received 72 |
| Position(legacy?) | `2yF8QPLV1ApwisY3vHw5hooPq7hvrdGB8HdLhihNJK8h` | `aabc8fe47a40f7d0` | 66 | The value of "offset" is out of range. It must be >= 0 and <= 57. Received 72 |
| unknown | `4C8iMfBvYYSA4g7pRxBFEkRiQqDWuHkCxxDy3s4QyeTw` | `1b5aa67d4a647912` | 122 | not in current IDL |
| Position(legacy?) | `7KAvXwParLZvJrc76aeFP8BnvVj7TRC9neKDpKDJFwAj` | `aabc8fe47a40f7d0` | 66 | The value of "offset" is out of range. It must be >= 0 and <= 57. Received 72 |
| Position(legacy?) | `7MRaXYaV7MqR2qEwzXKg2d3pBXezfRDtqKE8uVkcKhUv` | `aabc8fe47a40f7d0` | 66 | The value of "offset" is out of range. It must be >= 0 and <= 57. Received 72 |
| Position(legacy?) | `B5jwUPRpH5hyhrxUQovhTsLB74v2dBnpiZcWSxN4mqLB` | `aabc8fe47a40f7d0` | 66 | The value of "offset" is out of range. It must be >= 0 and <= 57. Received 72 |
| unknown | `BJTB7JU7j1Ha6YGH6BzvMJnqbCr8PkGrAvj1RreyD357` | `1b5aa67d4a647912` | 122 | not in current IDL |
| Position(legacy?) | `BdJzZ3a4UScKF1i4ZE86cmU26wmgM7gpQ7wV9mYt6BQn` | `aabc8fe47a40f7d0` | 66 | The value of "offset" is out of range. It must be >= 0 and <= 57. Received 72 |
| unknown | `Cnw3G5XSZWPHT9gK6LiSrucS2Zxr3TY6M93UzZqoVkQp` | `1b5aa67d4a647912` | 122 | not in current IDL |
| unknown | `Cz5UfqWf2svdVccwEGVq6gVQG7Kgh1pChYo544SUi83B` | `577fa533494e74ae` | 51 | not in current IDL |
| Position(legacy?) | `E29AJWefLvBFcSoAvUjn81xZNcnnqptk9cEaydbL7qNb` | `aabc8fe47a40f7d0` | 66 | The value of "offset" is out of range. It must be >= 0 and <= 57. Received 72 |
| unknown | `FWbWZHfptEyGP51AEM8QMJBmd7pBDhVz6A8zpn7Jq4K8` | `1b5aa67d4a647912` | 122 | not in current IDL |
| Position(legacy?) | `Ho8kMSytQ9nJ3ZqmPx51BfvDNGSmfVQXMZjDcRZxKx8X` | `aabc8fe47a40f7d0` | 66 | The value of "offset" is out of range. It must be >= 0 and <= 57. Received 72 |

## 3. Integrity Verification

### 3.1 Per-Bet Integrity Summary

| bet_id | name | status | outcome | YES | NO | YES=NO? | yes_cost | no_cost | total_cost | matched_pot | cost_ok? | open_escrow | positions | claimed | unclaimed_winners |
|--------|------|--------|---------|-----|----|---------|----------|---------|------------|-------------|----------|-------------|-----------|---------|-------------------|
| 1 | "Will WillohBets launch successfully?" | settled | yes | 0 | 0 | ✅ | 0 | 0 | 0 | 0 | ✅ | 49500000 | 0 | 0 | 0 |
| 2 | "Test" | settled | yes | 0 | 0 | ✅ | 0 | 0 | 0 | 0 | ✅ | 0 | 0 | 0 | 0 |
| 3 | "Will Bitcoin be above $63,839 at 7:30 PM CST?" | settled | no | 191 | 191 | ✅ | 129170000 | 61830000 | 191000000 | 191000000 | ✅ | 5410000 | 2 | 2 | 0 |

### 3.2 Vault Reconciliation (v2-only view — incomplete)

| Component | Lamports | SOL |
|-----------|----------|-----|
| Open order escrow | 54910000 | 0.054910000 |
| Matched pot (open bets) | 0 | 0.000000000 |
| Unclaimed payouts (settled, v2 only) | 0 | 0.000000000 |
| **Expected vault (v2 only)** | **54910000** | **0.054910000** |
| **Actual vault** | **1006300880** | **1.006300880** |
| Diff (actual − v2-expected) | 951390880 | 0.951390880 |

### 3.2b Vault Reconciliation (including manually decoded legacy positions)

Legacy Position accounts use the same Anchor discriminator as v2 but `data_len=66` (no cost-basis fields) and **different PDA seeds** (pre-`willoh_pos_v2`). Current `claim` only derives `willoh_pos_v2`, so these balances are **orphaned from the claim path**.

| Legacy position | bet_id | owner | yes | no | claimed | win side if outcome | claimable via v2? |
|-----------------|--------|-------|-----|----|---------|---------------------|-------------------|
| `2hoskZgs…SLpW` | 1 | `3ZuVcp3C…298P` | 0 | 2 | false | NO (loser; bet1=YES) | no |
| `7MRaXYaV…KhUv` | 1 | `2qhSu6LN…wxdr` | 0 | 2 | false | loser | no |
| `B5jwUPRp…mqLB` | 1 | `3Srgo4o5…StiZ` | 3 | 0 | false | **YES winner ×3** | **orphaned** |
| `E29AJWef…7qNb` | 1 | `91XfsdkY…yk8U` | 1 | 0 | false | **YES winner ×1** | **orphaned** |
| `2yF8QPLV…JK8h` | 2 | `91XfsdkY…yk8U` | 1000 | 0 | **true** | YES (already claimed 1 SOL) | n/a |
| `BdJzZ3a4…6BQn` | 2 | `3ZuVcp3C…298P` | 0 | 1000 | false | loser | no |
| `7KAvXwPa…FwAj` | 3 | `91XfsdkY…yk8U` | 1000 | 0 | false | loser (bet3=NO) | no |
| `Ho8kMSyt…Kx8X` | 3 | `3ZuVcp3C…298P` | 0 | 1000 | false | **NO winner ×1000** | **orphaned** |

| Component | Lamports | SOL |
|-----------|----------|-----|
| Open order escrow (still cancellable) | 54910000 | 0.054910000 |
| Orphaned unclaimed winners (legacy) | 1004000000 | 1.004000000 |
| … bet1 YES winners (4 contracts) | 4000000 | 0.004000000 |
| … bet3 NO winner (1000 contracts) | 1000000000 | 1.000000000 |
| **Economic liability total** | **1058910000** | **1.058910000** |
| **Actual vault** | **1006300880** | **1.006300880** |
| **Vault shortfall vs liability** | **−52609120** | **−0.052609120** |

> **Interpretation:** ~0.951 SOL of the vault is explained by orphaned legacy winning contracts (especially 1000 NO on bet 3) plus open escrow. After including those liabilities, the vault is still **~0.0526 SOL short** of full payout coverage — a solvency concern if a migration/claim path for legacy positions is ever added without recapitalizing.

### 3.2c Open orders on settled bets

`settle_bet` does **not** cancel resting orders. `cancel_order` does **not** require the bet to still be open, so makers can still recover escrow after settlement.

| order_id | bet_id | bet status | qty_remaining | escrow_lamports | recoverable via cancel? |
|----------|--------|------------|---------------|-----------------|-------------------------|
| 2 | 1 | settled | 99 | 49500000 | yes |
| 3 | 3 | settled | 8 | 5120000 | yes |
| 4 | 3 | settled | 1 | 290000 | yes |

### 3.3 Integrity Issues

- Vault imbalance (v2-only model): actual 1006300880 vs expected 54910000 (diff +951390880) — explained largely by legacy orphaned pots
- Vault shortfall vs full (v2+legacy) liability: **−52609120 lamports (−0.052609120 SOL)**
- 3 open orders remain on settled bets (escrow still locked until cancel)
- Bet 1 & 2 have **zero** v2 positions; all position state is legacy-only
- Bet 3 has **both** legacy (1000/1000) and v2 (191/191) position sets for the same logical users (seed migration split state)

## 4. Transaction Fee Analysis

Found **42** recent signatures.

### 4.1 All Recent Program Transactions

| # | signature | slot | blockTime (UTC) | ix | err | fee_lamports | fee_SOL | fee_payer | fee_payer_Δ | economic_spent | economic_recv | vault_Δ | fee% outflow | fee% economic | fee% /contract |
|---|-----------|------|-----------------|----|-----|--------------|---------|-----------|-------------|----------------|---------------|---------|--------------|---------------|----------------|
| 1 | `5Qu5pKN5HMCZE9vsEzBdLXXAFE8KRqn4osGqoLbTEQ7DweQe9nCmoCF5aqoHqSkJTrwvsrRQNjdYLAWEd2kA4K2Q` | 475635036 | 2026-07-12T00:55:53.000Z | claim | ok | 5000 | 0.000005000 | `3ZuVcp3C…298P` | 91995000 | 0 | 92000000 | -92000000 | n/a | n/a | 0.5000% |
| 2 | `fj5B1F48DpU7A7Ln9RkyQbq2DcWuPDCvVddqikwdTGcKQcsRnntkiNXY178aRYgrrFAsEqtBrWvsNPDk5xp5jtg` | 475634908 | 2026-07-12T00:55:05.000Z | claim | ok | 5000 | 0.000005000 | `91XfsdkY…yk8U` | 98995000 | 0 | 99000000 | -99000000 | n/a | n/a | 0.5000% |
| 3 | `3cq2m3uZ51a93XXe7qFq7x43pchytfodzdSRcEABjKANVjLVwygktuSbxCKcBf23zWzU6Cwr1bhCNkSy7L7MDuEX` | 475632246 | 2026-07-12T00:38:18.000Z | settle_bet | ok | 5000 | 0.000005000 | `91XfsdkY…yk8U` | -5000 | 0 | 0 | 0 | 100.0000% | n/a | 0.5000% |
| 4 | `3phZEgmCbQZhSVcVvoqCG17cehFziKdC7pegZ3S6BaFfdikUhmDSFWpbq8tLL68AX6n2ELzy9aeDnWgaSxVLpAGF` | 475630028 | 2026-07-12T00:24:19.000Z | fill_order | ok | 5000 | 0.000005000 | `3ZuVcp3C…298P` | -70295000 | 70290000 | 0 | 70290000 | 0.0071% | 0.0071% | 0.5000% |
| 5 | `iuDxL2FknR7iyF4TVdPrDHsUqM2L3NxhKA9smcri6hozstMeEUnMZUSQNR2sJnKYwjmsPaMxgZ6mM331sN7sVB9` | 475630002 | 2026-07-12T00:24:09.000Z | fill_order | ok | 5000 | 0.000005000 | `3ZuVcp3C…298P` | -36048200 | 36043200 | 0 | 33120000 | 0.0139% | 0.0139% | 0.5000% |
| 6 | `bgEHausrZmdtVchW9aNupoyYjwHYyBfDxqhGpJp7JcJ2jEPkzAytz47ZmRbTcwYDxrvhPneBKUmCRaHwnRrVJc2` | 475629942 | 2026-07-12T00:23:46.000Z | place_order | ok | 5000 | 0.000005000 | `91XfsdkY…yk8U` | -30529240 | 30524240 | 0 | 29000000 | 0.0164% | 0.0164% | 0.5000% |
| 7 | `64XWdym3tPkE4jJrVrJSeDDx87KygDoLzNkWuBoPBuLdhgqRoCTh7n2PcVDTprMDh7pF5xQiyLr1MtiDQptsSMEW` | 475629892 | 2026-07-12T00:23:27.000Z | unknown | ok | 5134 | 0.000005134 | `3Srgo4o5…StiZ` | 2490985826 | 0 | 2490990960 | 0 | n/a | n/a | 0.5134% |
| 8 | `4rDeUN6zEZWHS1P6H4rhfmRxZ97DfKuM7XbywXPYemVJ4csc5hsCdy9bq1hhcmoT8bQreofEA1TnxXuCgxhopp9d` | 475629875 | 2026-07-12T00:23:20.000Z | place_order | ok | 5000 | 0.000005000 | `91XfsdkY…yk8U` | -65529240 | 65524240 | 0 | 64000000 | 0.0076% | 0.0076% | 0.5000% |
| 9 | `3KUetkm5S3wyscNog8wtAHuHryXP2T8FDDoyvwTRXgKewdw1pKPzqmk4UxkTKYUUYn3CbKgqd41pbbuk9TnAHQK5` | 475629830 | 2026-07-12T00:23:04.000Z | unknown | ok | 5000 | 0.000005000 | `3Srgo4o5…StiZ` | -348005000 | 348000000 | 0 | 0 | 0.0014% | 0.0014% | 0.5000% |
| 10 | `2VLx8sHd6JkyYYiLutYFQPUyQadHECfNNs2fBHZyJ4VFcDKTRDFR2neyffx4sQ8ocU6j2LJQPG2shi9Dp5vq3nWy` | 475629456 | 2026-07-12T00:20:42.000Z | fill_order | ok | 5000 | 0.000005000 | `3ZuVcp3C…298P` | -472705480 | 472700480 | 0 | 470000000 | 0.0011% | 0.0011% | 0.5000% |
| 11 | `4agwGYd8jDwi4FRNZWKaoTSsBoWuKFmG9fGSZuyhhx7foELHPXoB2zz5xMoFXdCCrNA99FcE1TaypKTEebuHFC4R` | 475629405 | 2026-07-12T00:20:22.000Z | place_order | ok | 5000 | 0.000005000 | `91XfsdkY…yk8U` | -531529240 | 531524240 | 0 | 530000000 | 0.0009% | 0.0009% | 0.5000% |
| 12 | `2d1DWhp9UnHeNSvZHqj1A3Q448AUrmoZWAi1yq64S1BMwiB3WyoeSEDknkBpvfHxFJkFsae7E2siSp7WeWhBtiuh` | 475629237 | 2026-07-12T00:19:19.000Z | create_bet | ok | 5000 | 0.000005000 | `91XfsdkY…yk8U` | -1835480 | 1830480 | 0 | 0 | 0.2724% | 0.2732% | 0.5000% |
| 13 | `3zAQuPPWDy5cnxFNye4JcSAH9WUMjCjTcTBvQxhWTtFRRafakmZRRwwSV2V5b8XKkzoGmecB5SBpoPkkXKoVakuB` | 475628934 | 2026-07-12T00:17:24.000Z | settle_bet | ok | 5000 | 0.000005000 | `91XfsdkY…yk8U` | -5000 | 0 | 0 | 0 | 100.0000% | n/a | 0.5000% |
| 14 | `jc1UfhxMMu9bw3Z5qB36ibfG3UE3uEAXHLfT1KyJztu23pBTHCAqNCAtK7QS3Rt4XSJr3AGPssYMqLJKXv3qNye` | 475628693 | 2026-07-12T00:15:53.000Z | claim | ok | 5000 | 0.000005000 | `91XfsdkY…yk8U` | 999995000 | 0 | 1000000000 | -1000000000 | n/a | n/a | 0.5000% |
| 15 | `mU3R4wi5SJgbPM7W7e9AU3g9YJJD88EN2qZqNEccPuhRnRt3E97YqTtRqgXviKno52d14PUZwzFuJuYzacuBor2` | 475628640 | 2026-07-12T00:15:33.000Z | settle_bet | ok | 5000 | 0.000005000 | `91XfsdkY…yk8U` | -5000 | 0 | 0 | 0 | 100.0000% | n/a | 0.5000% |
| 16 | `3fprZMuuCpEoz57LaHzWzkd2QXn2GSGGS2stBPCJyajqGpN2GaKpW3ryaxk8PEV16jn4o9pvGCL4Re9NFztLRFv1` | 475628598 | 2026-07-12T00:15:17.000Z | fill_order | ok | 5000 | 0.000005000 | `3ZuVcp3C…298P` | -502705480 | 502700480 | 0 | 500000000 | 0.0010% | 0.0010% | 0.5000% |
| 17 | `VdNKfSfzDzayjeKViYSeoK2Bkb9zxzWvFMWJKSqJQKQedfxKv2BSEHES5jpRwVqdeaZgVeb91vK2MWsKuzoGnXP` | 475628507 | 2026-07-12T00:14:43.000Z | place_order | ok | 5000 | 0.000005000 | `91XfsdkY…yk8U` | -501529240 | 501524240 | 0 | 500000000 | 0.0010% | 0.0010% | 0.5000% |
| 18 | `2Feg5YDTppa9r1NvxqNVZtybJYJNwofmUCdmFG7Lb1sUxmWc1hqt3KfVnMLogZriNHZCN3YdUDPvJMCXhMPVuWwK` | 475628450 | 2026-07-12T00:14:22.000Z | create_bet | ok | 5000 | 0.000005000 | `91XfsdkY…yk8U` | -1835480 | 1830480 | 0 | 0 | 0.2724% | 0.2732% | 0.5000% |
| 19 | `5WFTovwCHDGfJabL968zd3MSv8s9ZuLJjbvQPpgrJkA6QSf4q9G6zPmCrtwkgmZH9HCKQmy7EhNZnoVvqMwwiSJi` | 475627534 | 2026-07-12T00:08:33.000Z | create_bet | ok | 5000 | 0.000005000 | `3Srgo4o5…StiZ` | -1835480 | 1830480 | 0 | 0 | 0.2724% | 0.2732% | 0.5000% |
| 20 | `5DgC8j51Y4JYgqTpzMkjraGMYtyN9GjrYruhphRUqL1AmgtJBzQv5KKB4KEPLq9pRhkUjYX3Ba3TWAG1iCyum3VG` | 475627532 | 2026-07-12T00:08:32.000Z | initialize_market | ok | 5000 | 0.000005000 | `3Srgo4o5…StiZ` | -2190440 | 2185440 | 0 | 890880 | 0.2283% | 0.2288% | 0.5000% |
| 21 | `5j7WtKDhaPZgYogpqDfiKTeyBg957vje7gYQJ8ED71sm8nTkgAScvxtqT9iTHKm1ykioWoUrTwPzhDJKi7FovPA5` | 475627349 | 2026-07-12T00:07:23.000Z | unknown | ok | 5027 | 0.000005027 | `3Srgo4o5…StiZ` | 2480016973 | 0 | 2480022000 | 0 | n/a | n/a | 0.5027% |
| 22 | `41rp7wPMT2aiM66sPoyRYbR3iC4PcDuPxWirh4svBreuRiKyp6S5e1a2brPbusR5ALRo7ufRXgUqPB2Z8AcSqatX` | 475627331 | 2026-07-12T00:07:16.000Z | unknown | ok | 10054 | 0.000010054 | `3Srgo4o5…StiZ` | -2551914934 | 2551904880 | 0 | 0 | 0.0004% | 0.0004% | 1.0054% |
| 23 | `4wFmuYuEPN8evtkukFtwgaiXRcRkA3a9Rrs5oac3Jkb65VzBCnKQ86rWgjMunsLKNrpiegdYWYsbATKrFxMViPoS` | 475625768 | 2026-07-11T23:57:26.000Z | fill_order | ok | 5000 | 0.000005000 | `3ZuVcp3C…298P` | -1855240 | 1850240 | 0 | 0 | 0.2695% | 0.2702% | 0.5000% |
| 24 | `4Cz3sMLT9dJAgA2P9nCZJRxxQzX5dtPcs9mMygFc8Td6crgtTiiVqgS4QVKWh4x5KwRJDTP6ztx5FAWPDabiEVTW` | 475625757 | 2026-07-11T23:57:22.000Z | fill_order | ok | 5000 | 0.000005000 | `3ZuVcp3C…298P` | -1805240 | 1800240 | 0 | 0 | 0.2770% | 0.2777% | 0.5000% |
| 25 | `Wn8Ywgb42dNKaWPvTiSjNdDuGa5sm1GndCKX2hEfb7ai8haR5XvaoyWqZ4UDDE2LHCDF21fmciiZrDowAA4m7Az` | 475625695 | 2026-07-11T23:56:58.000Z | place_order | ok | 5000 | 0.000005000 | `91XfsdkY…yk8U` | -51529240 | 51524240 | 0 | 0 | 0.0097% | 0.0097% | 0.5000% |
| 26 | `58DzPiRdnKKzeJj5mY3z7XUQuDztasvw6fPy659iCGJHqoAHyLgMpUe2RzdBrN5Ehq3HMd2qZpNCYf81Mt5qi1wb` | 475625328 | 2026-07-11T23:54:38.000Z | fill_order | ok | 5000 | 0.000005000 | `2qhSu6LN…wxdr` | -3605480 | 3600480 | 0 | 0 | 0.1387% | 0.1389% | 0.5000% |
| 27 | `3ZV1GXPkPtszE1wZB3FXXw9BvF4wxfLLmYM3WmuRhHaJLGmKgMmFCT1HSeSQnfqc8cf746qfGUEiDQtraEk8v9xa` | 475625327 | 2026-07-11T23:54:38.000Z | place_order | ok | 5000 | 0.000005000 | `3Srgo4o5…StiZ` | -3179240 | 3174240 | 0 | 0 | 0.1573% | 0.1575% | 0.5000% |
| 28 | `2oBsXMwooehsrsd2qZ1CjAyvaWi46iNr93rKpRBFujg1sEfZ4ynBvADo2rBBoJS27U3Sp5TFBjEQ6jyvAEhFCiub` | 475625325 | 2026-07-11T23:54:37.000Z | open_round | ok | 5000 | 0.000005000 | `3Srgo4o5…StiZ` | -1250840 | 1245840 | 0 | 0 | 0.3997% | 0.4013% | 0.5000% |
| 29 | `32w5Hvya9kkoYgUR11mXqX4Wt4cF1LVdJnocwjTGFMtcjZjZbtxSzZNXQdU7PbwYoW2hqy7AWcnuDQVoFyZtgALr` | 475625323 | 2026-07-11T23:54:37.000Z | initialize_market | ok | 5000 | 0.000005000 | `3Srgo4o5…StiZ` | -2197400 | 2192400 | 0 | 0 | 0.2275% | 0.2281% | 0.5000% |
| 30 | `4G8xygLwfoseUKnyL3adm2CKiD7QW5opJPdDbXNH16PDDTPgFm4i2FDWbt919jMij2qEvpRG5RWAq7vkuxczuRFp` | 475625160 | 2026-07-11T23:53:35.000Z | unknown | ok | 5027 | 0.000005027 | `3Srgo4o5…StiZ` | 2408134093 | 0 | 2408139120 | 0 | n/a | n/a | 0.5027% |
| 31 | `27bJtdJwuAKLqpNyDwUrevhZHufJ1niq2SuXfYETug9SuLgHgstdZgporbWuUg5a6EWewagRpwTXKsq5SvoeSXK4` | 475625140 | 2026-07-11T23:53:27.000Z | unknown | ok | 10054 | 0.000010054 | `3Srgo4o5…StiZ` | -3273472054 | 3273462000 | 0 | 0 | 0.0003% | 0.0003% | 1.0054% |
| 32 | `veR1nCHVFFsbvZipVYXGDfa6dvVaWsraBNKDAxsNPn6cSLsik9JiuwEwyuUNL813VT1y6j3G62LeRUguygXv5kr` | 475614452 | 2026-07-11T22:46:00.000Z | join_game | ok | 5000 | 0.000005000 | `91XfsdkY…yk8U` | 995000 | 0 | 1000000 | 0 | n/a | n/a | 0.5000% |
| 33 | `4Eov7iGhgBotHiJ646wSUFnGG3Rcud2p1JT6J4bpY6E8D1eaSEAzEqN6nns6ySopKT1cZNWSqHdZ5FeVNC6kmQDX` | 475614440 | 2026-07-11T22:45:55.000Z | create_game | ok | 5000 | 0.000005000 | `3ZuVcp3C…298P` | -2745000 | 2740000 | 0 | 0 | 0.1821% | 0.1825% | 0.5000% |
| 34 | `4N46vYsgYzSjj3DVhDnZfGMNxL356SJCgqf1Qqe8ifP85qjMijrXPdj8LTf6Zg7b9VyWCGoCv7g51271fvBUyk9w` | 475614359 | 2026-07-11T22:45:25.000Z | join_game | ok | 5000 | 0.000005000 | `91XfsdkY…yk8U` | -1005000 | 1000000 | 0 | 0 | 0.4975% | 0.5000% | 0.5000% |
| 35 | `654c2E19LAM2WRXSuf8gXTZmEQvfUF4tNAJCXgYPWANF19shcx3eV5bWAgwsMQUnWjCEABHgpv9orXuZdA6pKMPa` | 475614329 | 2026-07-11T22:45:13.000Z | create_game | ok | 5000 | 0.000005000 | `3ZuVcp3C…298P` | -2745000 | 2740000 | 0 | 0 | 0.1821% | 0.1825% | 0.5000% |
| 36 | `5o4E4HbeGmkAzgPYCoWQwXgj7EoPqB9tV5p8Aao7Ni8Joe48e2XwHTksEhEn1yjU7curZi8iUBcVdnexs3eVYbcL` | 475614241 | 2026-07-11T22:44:40.000Z | join_game | ok | 5000 | 0.000005000 | `3ZuVcp3C…298P` | -1005000 | 1000000 | 0 | 0 | 0.4975% | 0.5000% | 0.5000% |
| 37 | `2n19VSUcQHFSZbg2gRK5kyKWc9oE54b34F3C369cLjYujWrFst2WFbcudPMzV1R1MzSxwxvi9i5gbeDzy67TkAeJ` | 475614195 | 2026-07-11T22:44:23.000Z | create_game | ok | 5000 | 0.000005000 | `91XfsdkY…yk8U` | -2745000 | 2740000 | 0 | 0 | 0.1821% | 0.1825% | 0.5000% |
| 38 | `JbL246vi9M5rRcgLc8uc2sFvA9yqFfuJvKE4i9XjTTfXv2zCaBB4QYyLLSuoWHmekbrcM991HGH6WZ56DRpfYFV` | 475614023 | 2026-07-11T22:43:18.000Z | join_game | ok | 5000 | 0.000005000 | `3ZuVcp3C…298P` | -1005000 | 1000000 | 0 | 0 | 0.4975% | 0.5000% | 0.5000% |
| 39 | `iCsTQAN7RQVWKwqoHMWisbJwFqPdZppGuFRh3D86E9pPpD1YPg7ufWi54SXyhDMzrCgAd4rh8yWBuYCXhmkghU1` | 475612242 | 2026-07-11T22:32:00.000Z | create_game | ok | 5000 | 0.000005000 | `91XfsdkY…yk8U` | -2745000 | 2740000 | 0 | 0 | 0.1821% | 0.1825% | 0.5000% |
| 40 | `4BW5oknfLNWGSdkVBRaWgPidYNGqhGbxVvhEwkDZsgfp7bGVqgzBqtCg1tGaCyhpEmiKDzkhCy5kVrofn1cGtV4i` | 475610655 | 2026-07-11T22:21:59.000Z | join_game | ok | 5000 | 0.000005000 | `48VHrwGJ…UJy2` | -1005000 | 1000000 | 0 | 0 | 0.4975% | 0.5000% | 0.5000% |
| 41 | `56W86FmzacC8JUUNZKuExkfmxfTzuk4UZ3VBnyEPyiBFyUgRfF9CBMWPT8HHjTTJnsfmj8MsbZuD48Gs3pet9ypq` | 475610653 | 2026-07-11T22:21:59.000Z | create_game | ok | 5000 | 0.000005000 | `3Srgo4o5…StiZ` | -2745000 | 2740000 | 0 | 0 | 0.1821% | 0.1825% | 0.5000% |
| 42 | `5piD81ZkTuogLHAbg3V7vBA7CMYui4geFTjcPkKxH7nNtBv84WrpBzUfFKThoXGb7bUXkRxt6xtwvwPKbfboC4Kk` | 475610490 | 2026-07-11T22:20:56.000Z | unknown | ok | 10030 | 0.000010030 | `3Srgo4o5…StiZ` | -1151470 | 1141440 | 0 | 0 | 0.8711% | 0.8787% | 1.0030% |

### 4.2 Economic Activity Detail

| signature | ix | fee_lamports | fee_SOL | economic_spent_SOL | economic_recv_SOL | fee % of outflow | fee % of economic | fee % of 1 contract | vault_Δ_SOL |
|-----------|----|--------------|---------|--------------------|--------------------|------------------|-------------------|---------------------|-------------|
| `5Qu5pKN5HMCZE9vsEzBdLXXAFE8KRqn4osGqoLbTEQ7DweQe9nCmoCF5aqoHqSkJTrwvsrRQNjdYLAWEd2kA4K2Q` | claim | 5000 | 0.000005000 | 0.000000000 | 0.092000000 | n/a | n/a | 0.5000% | -0.092000000 |
| `fj5B1F48DpU7A7Ln9RkyQbq2DcWuPDCvVddqikwdTGcKQcsRnntkiNXY178aRYgrrFAsEqtBrWvsNPDk5xp5jtg` | claim | 5000 | 0.000005000 | 0.000000000 | 0.099000000 | n/a | n/a | 0.5000% | -0.099000000 |
| `3cq2m3uZ51a93XXe7qFq7x43pchytfodzdSRcEABjKANVjLVwygktuSbxCKcBf23zWzU6Cwr1bhCNkSy7L7MDuEX` | settle_bet | 5000 | 0.000005000 | 0.000000000 | 0.000000000 | 100.0000% | n/a | 0.5000% | 0.000000000 |
| `3phZEgmCbQZhSVcVvoqCG17cehFziKdC7pegZ3S6BaFfdikUhmDSFWpbq8tLL68AX6n2ELzy9aeDnWgaSxVLpAGF` | fill_order | 5000 | 0.000005000 | 0.070290000 | 0.000000000 | 0.0071% | 0.0071% | 0.5000% | 0.070290000 |
| `iuDxL2FknR7iyF4TVdPrDHsUqM2L3NxhKA9smcri6hozstMeEUnMZUSQNR2sJnKYwjmsPaMxgZ6mM331sN7sVB9` | fill_order | 5000 | 0.000005000 | 0.036043200 | 0.000000000 | 0.0139% | 0.0139% | 0.5000% | 0.033120000 |
| `bgEHausrZmdtVchW9aNupoyYjwHYyBfDxqhGpJp7JcJ2jEPkzAytz47ZmRbTcwYDxrvhPneBKUmCRaHwnRrVJc2` | place_order | 5000 | 0.000005000 | 0.030524240 | 0.000000000 | 0.0164% | 0.0164% | 0.5000% | 0.029000000 |
| `4rDeUN6zEZWHS1P6H4rhfmRxZ97DfKuM7XbywXPYemVJ4csc5hsCdy9bq1hhcmoT8bQreofEA1TnxXuCgxhopp9d` | place_order | 5000 | 0.000005000 | 0.065524240 | 0.000000000 | 0.0076% | 0.0076% | 0.5000% | 0.064000000 |
| `2VLx8sHd6JkyYYiLutYFQPUyQadHECfNNs2fBHZyJ4VFcDKTRDFR2neyffx4sQ8ocU6j2LJQPG2shi9Dp5vq3nWy` | fill_order | 5000 | 0.000005000 | 0.472700480 | 0.000000000 | 0.0011% | 0.0011% | 0.5000% | 0.470000000 |
| `4agwGYd8jDwi4FRNZWKaoTSsBoWuKFmG9fGSZuyhhx7foELHPXoB2zz5xMoFXdCCrNA99FcE1TaypKTEebuHFC4R` | place_order | 5000 | 0.000005000 | 0.531524240 | 0.000000000 | 0.0009% | 0.0009% | 0.5000% | 0.530000000 |
| `2d1DWhp9UnHeNSvZHqj1A3Q448AUrmoZWAi1yq64S1BMwiB3WyoeSEDknkBpvfHxFJkFsae7E2siSp7WeWhBtiuh` | create_bet | 5000 | 0.000005000 | 0.001830480 | 0.000000000 | 0.2724% | 0.2732% | 0.5000% | 0.000000000 |
| `3zAQuPPWDy5cnxFNye4JcSAH9WUMjCjTcTBvQxhWTtFRRafakmZRRwwSV2V5b8XKkzoGmecB5SBpoPkkXKoVakuB` | settle_bet | 5000 | 0.000005000 | 0.000000000 | 0.000000000 | 100.0000% | n/a | 0.5000% | 0.000000000 |
| `jc1UfhxMMu9bw3Z5qB36ibfG3UE3uEAXHLfT1KyJztu23pBTHCAqNCAtK7QS3Rt4XSJr3AGPssYMqLJKXv3qNye` | claim | 5000 | 0.000005000 | 0.000000000 | 1.000000000 | n/a | n/a | 0.5000% | -1.000000000 |
| `mU3R4wi5SJgbPM7W7e9AU3g9YJJD88EN2qZqNEccPuhRnRt3E97YqTtRqgXviKno52d14PUZwzFuJuYzacuBor2` | settle_bet | 5000 | 0.000005000 | 0.000000000 | 0.000000000 | 100.0000% | n/a | 0.5000% | 0.000000000 |
| `3fprZMuuCpEoz57LaHzWzkd2QXn2GSGGS2stBPCJyajqGpN2GaKpW3ryaxk8PEV16jn4o9pvGCL4Re9NFztLRFv1` | fill_order | 5000 | 0.000005000 | 0.502700480 | 0.000000000 | 0.0010% | 0.0010% | 0.5000% | 0.500000000 |
| `VdNKfSfzDzayjeKViYSeoK2Bkb9zxzWvFMWJKSqJQKQedfxKv2BSEHES5jpRwVqdeaZgVeb91vK2MWsKuzoGnXP` | place_order | 5000 | 0.000005000 | 0.501524240 | 0.000000000 | 0.0010% | 0.0010% | 0.5000% | 0.500000000 |
| `2Feg5YDTppa9r1NvxqNVZtybJYJNwofmUCdmFG7Lb1sUxmWc1hqt3KfVnMLogZriNHZCN3YdUDPvJMCXhMPVuWwK` | create_bet | 5000 | 0.000005000 | 0.001830480 | 0.000000000 | 0.2724% | 0.2732% | 0.5000% | 0.000000000 |
| `5WFTovwCHDGfJabL968zd3MSv8s9ZuLJjbvQPpgrJkA6QSf4q9G6zPmCrtwkgmZH9HCKQmy7EhNZnoVvqMwwiSJi` | create_bet | 5000 | 0.000005000 | 0.001830480 | 0.000000000 | 0.2724% | 0.2732% | 0.5000% | 0.000000000 |
| `5DgC8j51Y4JYgqTpzMkjraGMYtyN9GjrYruhphRUqL1AmgtJBzQv5KKB4KEPLq9pRhkUjYX3Ba3TWAG1iCyum3VG` | initialize_market | 5000 | 0.000005000 | 0.002185440 | 0.000000000 | 0.2283% | 0.2288% | 0.5000% | 0.000890880 |
| `4wFmuYuEPN8evtkukFtwgaiXRcRkA3a9Rrs5oac3Jkb65VzBCnKQ86rWgjMunsLKNrpiegdYWYsbATKrFxMViPoS` | fill_order | 5000 | 0.000005000 | 0.001850240 | 0.000000000 | 0.2695% | 0.2702% | 0.5000% | 0.000000000 |
| `4Cz3sMLT9dJAgA2P9nCZJRxxQzX5dtPcs9mMygFc8Td6crgtTiiVqgS4QVKWh4x5KwRJDTP6ztx5FAWPDabiEVTW` | fill_order | 5000 | 0.000005000 | 0.001800240 | 0.000000000 | 0.2770% | 0.2777% | 0.5000% | 0.000000000 |
| `Wn8Ywgb42dNKaWPvTiSjNdDuGa5sm1GndCKX2hEfb7ai8haR5XvaoyWqZ4UDDE2LHCDF21fmciiZrDowAA4m7Az` | place_order | 5000 | 0.000005000 | 0.051524240 | 0.000000000 | 0.0097% | 0.0097% | 0.5000% | 0.000000000 |
| `58DzPiRdnKKzeJj5mY3z7XUQuDztasvw6fPy659iCGJHqoAHyLgMpUe2RzdBrN5Ehq3HMd2qZpNCYf81Mt5qi1wb` | fill_order | 5000 | 0.000005000 | 0.003600480 | 0.000000000 | 0.1387% | 0.1389% | 0.5000% | 0.000000000 |
| `3ZV1GXPkPtszE1wZB3FXXw9BvF4wxfLLmYM3WmuRhHaJLGmKgMmFCT1HSeSQnfqc8cf746qfGUEiDQtraEk8v9xa` | place_order | 5000 | 0.000005000 | 0.003174240 | 0.000000000 | 0.1573% | 0.1575% | 0.5000% | 0.000000000 |
| `32w5Hvya9kkoYgUR11mXqX4Wt4cF1LVdJnocwjTGFMtcjZjZbtxSzZNXQdU7PbwYoW2hqy7AWcnuDQVoFyZtgALr` | initialize_market | 5000 | 0.000005000 | 0.002192400 | 0.000000000 | 0.2275% | 0.2281% | 0.5000% | 0.000000000 |

### 4.3 Fee Aggregates by Instruction Type

| instruction | count | errors | total_fee_lamports | avg_fee | total_economic_spent | fee% of economic (agg) |
|-------------|-------|--------|--------------------|---------|----------------------|------------------------|
| fill_order | 7 | 0 | 35000 | 5000 | 1088985120 | 0.0032% |
| unknown | 7 | 0 | 50326 | 7189 | 6174508320 | 0.0008% |
| place_order | 6 | 0 | 30000 | 5000 | 1183795440 | 0.0025% |
| join_game | 5 | 0 | 25000 | 5000 | 4000000 | 0.6250% |
| create_game | 5 | 0 | 25000 | 5000 | 13700000 | 0.1825% |
| claim | 3 | 0 | 15000 | 5000 | 0 | n/a |
| settle_bet | 3 | 0 | 15000 | 5000 | 0 | n/a |
| create_bet | 3 | 0 | 15000 | 5000 | 5491440 | 0.2732% |
| initialize_market | 2 | 0 | 10000 | 5000 | 4377840 | 0.2284% |
| open_round | 1 | 0 | 5000 | 5000 | 1245840 | 0.4013% |

## 5. Per-Bet Detailed Summary

### Bet 1: "Will WillohBets launch successfully?"

- **Status:** settled
- **Outcome:** yes
- **Orders:** 2 | **Positions (v2):** 0 | **Positions (legacy):** 4
- **v2 YES/NO:** 0/0 (no v2 book)
- **Legacy YES/NO:** 4/4 (balanced) — winners YES×4 **orphaned / unclaimed**
- **Matched pot (legacy):** 4_000_000 lamports (0.004 SOL)
- **Open escrow:** 49500000 (order 2: 99 remaining @ 5000 bps) — still cancellable
- **v2 Claimed:** 0/0 | **Legacy unclaimed winners:** 4 contracts

| order_id | side | price_bps | price% | qty_total | qty_rem | filled | escrow | status | owner |
|----------|------|-----------|--------|-----------|---------|--------|--------|--------|-------|
| 1 | yes | 5500 | 55.00% | 3 | 0 | 3 | 0 | filled | `3Srgo4o5…StiZ` |
| 2 | yes | 5000 | 50.00% | 100 | 99 | 1 | 49500000 | open | `91XfsdkY…yk8U` |

### Bet 2: "Test"

- **Status:** settled
- **Outcome:** yes
- **Orders:** 1 | **Positions (v2):** 0 | **Positions (legacy):** 2
- **Legacy YES/NO:** 1000/1000 (balanced)
- **Matched pot:** 1_000_000_000 lamports (1.0 SOL)
- **Winner claimed:** YES owner `91XfsdkY…` claimed 1.0 SOL (legacy position `claimed=true`)
- **Loser:** `3ZuVcp3C…` holds 1000 NO unclaimed (correctly $0 payout)
- **Open escrow:** 0

| order_id | side | price_bps | price% | qty_total | qty_rem | filled | escrow | status | owner |
|----------|------|-----------|--------|-----------|---------|--------|--------|--------|-------|
| 1 | yes | 5000 | 50.00% | 1000 | 0 | 1000 | 0 | filled | `91XfsdkY…yk8U` |

### Bet 3: "Will Bitcoin be above $63,839 at 7:30 PM CST?"

- **Status:** settled
- **Outcome:** no
- **Orders:** 3 | **Positions (v2):** 2 | **Positions (legacy):** 2
- **v2 YES/NO:** 191/191 ✅ | **cost=pot:** 191_000_000 ✅ | **both v2 positions claimed**
- **Legacy YES/NO:** 1000/1000 — NO winner `3ZuVcp3C…` ×1000 **orphaned unclaimed (~1 SOL)**
- **True matched volume:** 1191 contracts / 1.191 SOL pot (legacy 1000 + v2 191)
- **Open escrow:** 5_410_000 (orders 3 & 4 still open on settled bet)

| order_id | side | price_bps | price% | qty_total | qty_rem | filled | escrow | status | owner |
|----------|------|-----------|--------|-----------|---------|--------|--------|--------|-------|
| 2 | yes | 5300 | 53.00% | 1000 | 0 | 1000 | 0 | filled | `91XfsdkY…yk8U` |
| 3 | yes | 6400 | 64.00% | 100 | 8 | 92 | 5120000 | open | `91XfsdkY…yk8U` |
| 4 | no | 2900 | 29.00% | 100 | 1 | 99 | 290000 | open | `91XfsdkY…yk8U` |

| owner | yes | no | yes_cost | no_cost | avg_yes | avg_no | claimed |
|-------|-----|----|----------|---------|---------|--------|---------|
| `3ZuVcp3C…298P` | 99 | 92 | 70290000 | 33120000 | 71.00% | 36.00% | true |
| `91XfsdkY…yk8U` | 92 | 99 | 58880000 | 28710000 | 64.00% | 29.00% | true |

## 6. Per-Trade Instance Summary

### 6.1 fill_order transactions (recent sample)

| # | signature | slot | fee_lamports | fee_SOL | economic_spent | vault_Δ | fee% economic | fee% /contract |
|---|-----------|------|--------------|---------|----------------|---------|---------------|----------------|
| 1 | `3phZEgmCbQZhSVcVvoqCG17cehFziKdC7pegZ3S6BaFfdikUhmDSFWpbq8tLL68AX6n2ELzy9aeDnWgaSxVLpAGF` | 475630028 | 5000 | 0.000005000 | 70290000 (0.070290000 SOL) | 70290000 | 0.0071% | 0.5000% |
| 2 | `iuDxL2FknR7iyF4TVdPrDHsUqM2L3NxhKA9smcri6hozstMeEUnMZUSQNR2sJnKYwjmsPaMxgZ6mM331sN7sVB9` | 475630002 | 5000 | 0.000005000 | 36043200 (0.036043200 SOL) | 33120000 | 0.0139% | 0.5000% |
| 3 | `2VLx8sHd6JkyYYiLutYFQPUyQadHECfNNs2fBHZyJ4VFcDKTRDFR2neyffx4sQ8ocU6j2LJQPG2shi9Dp5vq3nWy` | 475629456 | 5000 | 0.000005000 | 472700480 (0.472700480 SOL) | 470000000 | 0.0011% | 0.5000% |
| 4 | `3fprZMuuCpEoz57LaHzWzkd2QXn2GSGGS2stBPCJyajqGpN2GaKpW3ryaxk8PEV16jn4o9pvGCL4Re9NFztLRFv1` | 475628598 | 5000 | 0.000005000 | 502700480 (0.502700480 SOL) | 500000000 | 0.0010% | 0.5000% |
| 5 | `4wFmuYuEPN8evtkukFtwgaiXRcRkA3a9Rrs5oac3Jkb65VzBCnKQ86rWgjMunsLKNrpiegdYWYsbATKrFxMViPoS` | 475625768 | 5000 | 0.000005000 | 1850240 (0.001850240 SOL) | 0 | 0.2702% | 0.5000% |
| 6 | `4Cz3sMLT9dJAgA2P9nCZJRxxQzX5dtPcs9mMygFc8Td6crgtTiiVqgS4QVKWh4x5KwRJDTP6ztx5FAWPDabiEVTW` | 475625757 | 5000 | 0.000005000 | 1800240 (0.001800240 SOL) | 0 | 0.2777% | 0.5000% |
| 7 | `58DzPiRdnKKzeJj5mY3z7XUQuDztasvw6fPy659iCGJHqoAHyLgMpUe2RzdBrN5Ehq3HMd2qZpNCYf81Mt5qi1wb` | 475625328 | 5000 | 0.000005000 | 3600480 (0.003600480 SOL) | 0 | 0.1389% | 0.5000% |

### 6.2 State-Based Trade Reconstruction (from order fills)

| order_id | bet_id | side | price_bps | qty_filled | maker_cost_est | taker_cost_est | pot_est | full_contract_pot | dust | status |
|----------|--------|------|-----------|------------|----------------|----------------|---------|-------------------|------|--------|
| 1 | 1 | yes | 5500 | 3 | 1650000 | 1350000 | 3000000 | 3000000 | 0 | filled |
| 1 | 2 | yes | 5000 | 1000 | 500000000 | 500000000 | 1000000000 | 1000000000 | 0 | filled |
| 2 | 1 | yes | 5000 | 1 | 500000 | 500000 | 1000000 | 1000000 | 0 | open |
| 2 | 3 | yes | 5300 | 1000 | 530000000 | 470000000 | 1000000000 | 1000000000 | 0 | filled |
| 3 | 3 | yes | 6400 | 92 | 58880000 | 33120000 | 92000000 | 92000000 | 0 | open |
| 4 | 3 | no | 2900 | 99 | 28710000 | 70290000 | 99000000 | 99000000 | 0 | open |

## 7. Bugs & Inconsistencies

### CRITICAL

- **`settle_bet` has no authorization check:** Any signer can settle any open bet to Yes/No/Void (`programs/coinflip/src/instructions/settle_bet.rs` — `settler` is an unconstrained `Signer`). A griefing attacker can settle markets early or with the wrong outcome and permanently mis-allocate the pot. **Fix:** require `settler == market.authority` and/or `bet.creator`, optionally with a timelock/oracle.
- **Position seed migration orphans funds:** Program now uses `willoh_pos_v2` PDAs with cost-basis fields (82 bytes). Eight legacy Position accounts (66 bytes, old seed) still hold real contract balances. Current `claim` cannot address them. Example: `Ho8kMSyt…` holds **1000 unclaimed NO** on settled bet 3 (~**1.0 SOL** economic claim) that the UI/program cannot pay. Users with only legacy positions on bets 1–2 similarly cannot claim via v2.
- **Vault shortfall vs full liability:** After counting open escrow + orphaned legacy winning contracts, vault is **−0.052609120 SOL short**. Adding a legacy claim path without topping up the vault could brick claims (insufficient funds).

### HIGH

- **Legacy Position accounts share v2 discriminator but smaller layout:** 8 accounts have Position discriminator `aabc8fe47a40f7d0` but `data_len=66` (v2 expects 82). Invisible to Anchor `Position` decode / client `account.position.all()`.
- **Split double-books on bet 3:** Same traders have both a legacy 1000-contract book **and** a v2 191-contract book. Integrity checks on v2-only data show YES=NO=191 and cost=pot, which looks healthy but **understates** true matched volume (1191 contracts / 1.191 SOL pot).
- **Duplicate global `order_id` values across bets:** order_id `1` appears on bets 1 and 2; order_id `2` on bets 1 and 3. PDA is `(bet_id, order_id)` so accounts don’t collide, but the global counter was clearly reset (two Market accounts; redeploy/re-init). Complicates off-chain indexing that assumes globally unique order ids.
- **`create_bet` is permissionless:** Anyone can create bets and advance `next_bet_id` (may be intentional, but combined with permissionless settle it is dangerous).

### MEDIUM

- **Multiple Market accounts exist:** 2 Market accounts under program; only `8ELjMxYQz62owCvvE8Trz7jyVGhB3ADSdysExqmBhAPq` is the canonical `willoh_market` PDA. Extra market `8fSUf4dfkx4v…` has nonsensical counters (`next_order_id=768`, `bump=0`) — likely garbage/partial decode of a non-canonical account with the Market discriminator or an aborted init.
- **Unknown/legacy account discriminators under program:** 5× disc `1b5aa67d4a647912` len=122 (old coinflip/game layout?); 1× disc `577fa533494e74ae` len=51. Leftovers from prior program versions still owned by the same program id.
- **Bet account count != next_bet_id:** found 3 bets (ids 1..3), `next_bet_id=4` — **bet_id 0 is missing** (never created or closed). Not necessarily insolvent, but gaps should be documented.
- **`settle_bet` leaves resting orders open:** Escrow remains locked until makers call `cancel_order`. Prefer auto-cancel/refund remaining escrow inside `settle_bet` (or a permissionless `sweep_order` after settle).
- **Void claim pays `contracts * CONTRACT/2`, not cost basis:** Economically correct for complementary prices that sum to 100%, but ignores floor-division dust and any future non-complementary pricing.

### LOW

- **Integer division dust on fills:** `maker_portion` and `taker_escrow` each floor-divide; their sum can be 0–1 lamport short of `fill_qty * CONTRACT_LAMPORTS` per fill. Observed dust on reconstructed fills in this sample was **0** (prices/quantities divided evenly), but the code path remains vulnerable for awkward `price_bps` values.
- **Historical instruction surface still in signature history:** `create_game` / `join_game` / `open_round` appear in the last 50 txs (prior program binary). Clients must not assume all program logs are prediction-market ops.

### INFO

- **Base fee is almost always 5000 lamports (0.000005 SOL)** on successful market ops ≈ **0.50% of one contract** (1_000_000 lamports).
- **Fee as % of economic spend** is tiny on large fills/places (0.001–0.02%) but rises to ~0.27% on `create_bet` (rent-only) and 100% of outflow on fee-only `settle_bet`.
- **High fee vs economic spend** is expected when economic spend is account rent only (create_bet, initialize_market).

## 8. Executive Summary

| Metric | Value |
|--------|-------|
| Program | `BPpvi9mmM8yzVbGofQARnsDjxdvVXioEbE5UB2F24uJb` |
| Market PDA | `8ELjMxYQz62owCvvE8Trz7jyVGhB3ADSdysExqmBhAPq` |
| Vault PDA | `7j9CKe2awWNyNzTKLo8iQjqQ1GNe1hwqDUXTgav8PtK1` |
| Vault balance | 1.006300880 SOL (1006300880 lamports) |
| Bets (decoded) | 3 (ids 1–3, all **settled**) |
| Orders (decoded) | 6 (3 still **open** with escrow on settled bets) |
| Positions v2 (decoded) | 2 (both bet 3, both **claimed**) |
| Legacy positions (manual decode) | 8 (4 unclaimed winners orphaned) |
| Legacy/unknown accounts | 14 |
| Market accounts | 2 |
| Recent txs analyzed | 42 |
| Economic market txs | 24 |
| fill_order in sample | 7 |
| YES=NO on v2 books | ✅ bet 3 balanced @ 191 |
| Cost basis = matched pot (v2) | ✅ 191_000_000 = 191_000_000 |
| Vault vs open-escrow-only | +0.951 SOL (legacy pots) |
| Vault vs full liability | **−0.0526 SOL shortfall** |
| Top severity findings | Permissionless settle; orphaned legacy positions; vault shortfall |

### Recommended remediations (priority order)

1. **Gate `settle_bet`** to `market.authority` (and/or creator) immediately before any mainnet deploy.
2. **Migration instruction** for legacy positions → v2 (or a one-shot `claim_legacy`) + **recapitalize vault** by ≥0.0526 SOL (plus any future dust).
3. On settle, **auto-cancel open orders** and refund remaining escrow.
4. Remove or ignore non-canonical Market / old game accounts; document program upgrade history.
5. Consider making `create_bet` authority-gated if markets are curated.

## Appendix A: Full Transaction Signatures

1. `5Qu5pKN5HMCZE9vsEzBdLXXAFE8KRqn4osGqoLbTEQ7DweQe9nCmoCF5aqoHqSkJTrwvsrRQNjdYLAWEd2kA4K2Q` — **claim** fee=5000 Δpayer=91995000
2. `fj5B1F48DpU7A7Ln9RkyQbq2DcWuPDCvVddqikwdTGcKQcsRnntkiNXY178aRYgrrFAsEqtBrWvsNPDk5xp5jtg` — **claim** fee=5000 Δpayer=98995000
3. `3cq2m3uZ51a93XXe7qFq7x43pchytfodzdSRcEABjKANVjLVwygktuSbxCKcBf23zWzU6Cwr1bhCNkSy7L7MDuEX` — **settle_bet** fee=5000 Δpayer=-5000
4. `3phZEgmCbQZhSVcVvoqCG17cehFziKdC7pegZ3S6BaFfdikUhmDSFWpbq8tLL68AX6n2ELzy9aeDnWgaSxVLpAGF` — **fill_order** fee=5000 Δpayer=-70295000
5. `iuDxL2FknR7iyF4TVdPrDHsUqM2L3NxhKA9smcri6hozstMeEUnMZUSQNR2sJnKYwjmsPaMxgZ6mM331sN7sVB9` — **fill_order** fee=5000 Δpayer=-36048200
6. `bgEHausrZmdtVchW9aNupoyYjwHYyBfDxqhGpJp7JcJ2jEPkzAytz47ZmRbTcwYDxrvhPneBKUmCRaHwnRrVJc2` — **place_order** fee=5000 Δpayer=-30529240
7. `64XWdym3tPkE4jJrVrJSeDDx87KygDoLzNkWuBoPBuLdhgqRoCTh7n2PcVDTprMDh7pF5xQiyLr1MtiDQptsSMEW` — **unknown** fee=5134 Δpayer=2490985826
8. `4rDeUN6zEZWHS1P6H4rhfmRxZ97DfKuM7XbywXPYemVJ4csc5hsCdy9bq1hhcmoT8bQreofEA1TnxXuCgxhopp9d` — **place_order** fee=5000 Δpayer=-65529240
9. `3KUetkm5S3wyscNog8wtAHuHryXP2T8FDDoyvwTRXgKewdw1pKPzqmk4UxkTKYUUYn3CbKgqd41pbbuk9TnAHQK5` — **unknown** fee=5000 Δpayer=-348005000
10. `2VLx8sHd6JkyYYiLutYFQPUyQadHECfNNs2fBHZyJ4VFcDKTRDFR2neyffx4sQ8ocU6j2LJQPG2shi9Dp5vq3nWy` — **fill_order** fee=5000 Δpayer=-472705480
11. `4agwGYd8jDwi4FRNZWKaoTSsBoWuKFmG9fGSZuyhhx7foELHPXoB2zz5xMoFXdCCrNA99FcE1TaypKTEebuHFC4R` — **place_order** fee=5000 Δpayer=-531529240
12. `2d1DWhp9UnHeNSvZHqj1A3Q448AUrmoZWAi1yq64S1BMwiB3WyoeSEDknkBpvfHxFJkFsae7E2siSp7WeWhBtiuh` — **create_bet** fee=5000 Δpayer=-1835480
13. `3zAQuPPWDy5cnxFNye4JcSAH9WUMjCjTcTBvQxhWTtFRRafakmZRRwwSV2V5b8XKkzoGmecB5SBpoPkkXKoVakuB` — **settle_bet** fee=5000 Δpayer=-5000
14. `jc1UfhxMMu9bw3Z5qB36ibfG3UE3uEAXHLfT1KyJztu23pBTHCAqNCAtK7QS3Rt4XSJr3AGPssYMqLJKXv3qNye` — **claim** fee=5000 Δpayer=999995000
15. `mU3R4wi5SJgbPM7W7e9AU3g9YJJD88EN2qZqNEccPuhRnRt3E97YqTtRqgXviKno52d14PUZwzFuJuYzacuBor2` — **settle_bet** fee=5000 Δpayer=-5000
16. `3fprZMuuCpEoz57LaHzWzkd2QXn2GSGGS2stBPCJyajqGpN2GaKpW3ryaxk8PEV16jn4o9pvGCL4Re9NFztLRFv1` — **fill_order** fee=5000 Δpayer=-502705480
17. `VdNKfSfzDzayjeKViYSeoK2Bkb9zxzWvFMWJKSqJQKQedfxKv2BSEHES5jpRwVqdeaZgVeb91vK2MWsKuzoGnXP` — **place_order** fee=5000 Δpayer=-501529240
18. `2Feg5YDTppa9r1NvxqNVZtybJYJNwofmUCdmFG7Lb1sUxmWc1hqt3KfVnMLogZriNHZCN3YdUDPvJMCXhMPVuWwK` — **create_bet** fee=5000 Δpayer=-1835480
19. `5WFTovwCHDGfJabL968zd3MSv8s9ZuLJjbvQPpgrJkA6QSf4q9G6zPmCrtwkgmZH9HCKQmy7EhNZnoVvqMwwiSJi` — **create_bet** fee=5000 Δpayer=-1835480
20. `5DgC8j51Y4JYgqTpzMkjraGMYtyN9GjrYruhphRUqL1AmgtJBzQv5KKB4KEPLq9pRhkUjYX3Ba3TWAG1iCyum3VG` — **initialize_market** fee=5000 Δpayer=-2190440
21. `5j7WtKDhaPZgYogpqDfiKTeyBg957vje7gYQJ8ED71sm8nTkgAScvxtqT9iTHKm1ykioWoUrTwPzhDJKi7FovPA5` — **unknown** fee=5027 Δpayer=2480016973
22. `41rp7wPMT2aiM66sPoyRYbR3iC4PcDuPxWirh4svBreuRiKyp6S5e1a2brPbusR5ALRo7ufRXgUqPB2Z8AcSqatX` — **unknown** fee=10054 Δpayer=-2551914934
23. `4wFmuYuEPN8evtkukFtwgaiXRcRkA3a9Rrs5oac3Jkb65VzBCnKQ86rWgjMunsLKNrpiegdYWYsbATKrFxMViPoS` — **fill_order** fee=5000 Δpayer=-1855240
24. `4Cz3sMLT9dJAgA2P9nCZJRxxQzX5dtPcs9mMygFc8Td6crgtTiiVqgS4QVKWh4x5KwRJDTP6ztx5FAWPDabiEVTW` — **fill_order** fee=5000 Δpayer=-1805240
25. `Wn8Ywgb42dNKaWPvTiSjNdDuGa5sm1GndCKX2hEfb7ai8haR5XvaoyWqZ4UDDE2LHCDF21fmciiZrDowAA4m7Az` — **place_order** fee=5000 Δpayer=-51529240
26. `58DzPiRdnKKzeJj5mY3z7XUQuDztasvw6fPy659iCGJHqoAHyLgMpUe2RzdBrN5Ehq3HMd2qZpNCYf81Mt5qi1wb` — **fill_order** fee=5000 Δpayer=-3605480
27. `3ZV1GXPkPtszE1wZB3FXXw9BvF4wxfLLmYM3WmuRhHaJLGmKgMmFCT1HSeSQnfqc8cf746qfGUEiDQtraEk8v9xa` — **place_order** fee=5000 Δpayer=-3179240
28. `2oBsXMwooehsrsd2qZ1CjAyvaWi46iNr93rKpRBFujg1sEfZ4ynBvADo2rBBoJS27U3Sp5TFBjEQ6jyvAEhFCiub` — **open_round** fee=5000 Δpayer=-1250840
29. `32w5Hvya9kkoYgUR11mXqX4Wt4cF1LVdJnocwjTGFMtcjZjZbtxSzZNXQdU7PbwYoW2hqy7AWcnuDQVoFyZtgALr` — **initialize_market** fee=5000 Δpayer=-2197400
30. `4G8xygLwfoseUKnyL3adm2CKiD7QW5opJPdDbXNH16PDDTPgFm4i2FDWbt919jMij2qEvpRG5RWAq7vkuxczuRFp` — **unknown** fee=5027 Δpayer=2408134093
31. `27bJtdJwuAKLqpNyDwUrevhZHufJ1niq2SuXfYETug9SuLgHgstdZgporbWuUg5a6EWewagRpwTXKsq5SvoeSXK4` — **unknown** fee=10054 Δpayer=-3273472054
32. `veR1nCHVFFsbvZipVYXGDfa6dvVaWsraBNKDAxsNPn6cSLsik9JiuwEwyuUNL813VT1y6j3G62LeRUguygXv5kr` — **join_game** fee=5000 Δpayer=995000
33. `4Eov7iGhgBotHiJ646wSUFnGG3Rcud2p1JT6J4bpY6E8D1eaSEAzEqN6nns6ySopKT1cZNWSqHdZ5FeVNC6kmQDX` — **create_game** fee=5000 Δpayer=-2745000
34. `4N46vYsgYzSjj3DVhDnZfGMNxL356SJCgqf1Qqe8ifP85qjMijrXPdj8LTf6Zg7b9VyWCGoCv7g51271fvBUyk9w` — **join_game** fee=5000 Δpayer=-1005000
35. `654c2E19LAM2WRXSuf8gXTZmEQvfUF4tNAJCXgYPWANF19shcx3eV5bWAgwsMQUnWjCEABHgpv9orXuZdA6pKMPa` — **create_game** fee=5000 Δpayer=-2745000
36. `5o4E4HbeGmkAzgPYCoWQwXgj7EoPqB9tV5p8Aao7Ni8Joe48e2XwHTksEhEn1yjU7curZi8iUBcVdnexs3eVYbcL` — **join_game** fee=5000 Δpayer=-1005000
37. `2n19VSUcQHFSZbg2gRK5kyKWc9oE54b34F3C369cLjYujWrFst2WFbcudPMzV1R1MzSxwxvi9i5gbeDzy67TkAeJ` — **create_game** fee=5000 Δpayer=-2745000
38. `JbL246vi9M5rRcgLc8uc2sFvA9yqFfuJvKE4i9XjTTfXv2zCaBB4QYyLLSuoWHmekbrcM991HGH6WZ56DRpfYFV` — **join_game** fee=5000 Δpayer=-1005000
39. `iCsTQAN7RQVWKwqoHMWisbJwFqPdZppGuFRh3D86E9pPpD1YPg7ufWi54SXyhDMzrCgAd4rh8yWBuYCXhmkghU1` — **create_game** fee=5000 Δpayer=-2745000
40. `4BW5oknfLNWGSdkVBRaWgPidYNGqhGbxVvhEwkDZsgfp7bGVqgzBqtCg1tGaCyhpEmiKDzkhCy5kVrofn1cGtV4i` — **join_game** fee=5000 Δpayer=-1005000
41. `56W86FmzacC8JUUNZKuExkfmxfTzuk4UZ3VBnyEPyiBFyUgRfF9CBMWPT8HHjTTJnsfmj8MsbZuD48Gs3pet9ypq` — **create_game** fee=5000 Δpayer=-2745000
42. `5piD81ZkTuogLHAbg3V7vBA7CMYui4geFTjcPkKxH7nNtBv84WrpBzUfFKThoXGb7bUXkRxt6xtwvwPKbfboC4Kk` — **unknown** fee=10030 Δpayer=-1151470

## Appendix B: Full Account Pubkeys

### Bets
- bet 1: `J6rRk3np1KEVQjuEQWsYGAtWs4zcYkes6MMF9wvT1Tfk`
- bet 2: `6sKpdsxawir1wcizTHUTTR9ov13SNtSGvXtcXaqSkGgc`
- bet 3: `3fdP98oBEGtrZRAooLEbmmf4cfUtM3HvvY4mwcF9M47q`

### Orders
- order 1 (bet 1): `8nA7qqyLCVGGdLrVSnxRSq4rd2d8tFLNXdHgAYXZfTbc`
- order 1 (bet 2): `DR3RWLsAEGiffqs6HqxaAhAorm9B9DXJs5HZ9hPUBiKN`
- order 2 (bet 1): `4PKTueqQzYj6WtEYKi1zWkg68M3N8SF4mmu56RXX1qvA`
- order 2 (bet 3): `4iHhg6BVwsXC1RnTg6jQUZ4wWHrxzLcpUTz8KGG33nNv`
- order 3 (bet 3): `FHUymzriYwH8oHeJQ94U7FrDLd29V7wcur2QaKAvgqyk`
- order 4 (bet 3): `Fp234yo4YkWAPq3L3qgTkK1sFizc1Cu4f5xX6QpPxH7c`

### Positions
- pos bet 3 owner 3ZuVcp3CxQRbSCKGrTRtBns3S3NMuMQpYVC2ctCW298P: `2ccxZUaUy3j8kz7yqLxjDND2kUNs4rNYPJ2pV8R8S3FV`
- pos bet 3 owner 91XfsdkYoV8gpVYmBwrjhWetsoWXqcoEMxzW3Qkqyk8U: `6Am599aA6YA6o2F9U4jSapXb1tGtsbkoR6YbeozMg2Ws`

---
*End of audit report. Generated by /tmp/audit.mjs against devnet.*
