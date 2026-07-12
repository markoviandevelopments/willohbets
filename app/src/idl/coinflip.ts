/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/coinflip.json`.
 */
export type Coinflip = {
  "address": "BPpvi9mmM8yzVbGofQARnsDjxdvVXioEbE5UB2F24uJb",
  "metadata": {
    "name": "coinflip",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createGame",
      "docs": [
        "Create a new 1v1 game and escrow 0.001 SOL."
      ],
      "discriminator": [
        124,
        69,
        75,
        66,
        184,
        220,
        72,
        206
      ],
      "accounts": [
        {
          "name": "playerA",
          "writable": true,
          "signer": true
        },
        {
          "name": "game",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  97,
                  109,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "playerA"
              },
              {
                "kind": "arg",
                "path": "gameId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "joinGame",
      "docs": [
        "Join an open game with 0.001 SOL; coin flip assigns the 0.002 SOL pot."
      ],
      "discriminator": [
        107,
        112,
        18,
        38,
        56,
        173,
        60,
        128
      ],
      "accounts": [
        {
          "name": "playerB",
          "writable": true,
          "signer": true
        },
        {
          "name": "playerA",
          "writable": true
        },
        {
          "name": "game",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  97,
                  109,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "game.player_a",
                "account": "game"
              },
              {
                "kind": "account",
                "path": "game.game_id",
                "account": "game"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "game",
      "discriminator": [
        27,
        90,
        166,
        125,
        74,
        100,
        121,
        18
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidBetAmount",
      "msg": "Bet amount must be exactly 0.001 SOL"
    },
    {
      "code": 6001,
      "name": "gameNotOpen",
      "msg": "Game is not waiting for an opponent"
    },
    {
      "code": 6002,
      "name": "cannotJoinOwnGame",
      "msg": "Cannot join your own game"
    },
    {
      "code": 6003,
      "name": "alreadyJoined",
      "msg": "Player B already set"
    },
    {
      "code": 6004,
      "name": "insufficientVault",
      "msg": "Insufficient funds in game vault for payout"
    }
  ],
  "types": [
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "playerA",
            "docs": [
              "Creator / first bettor"
            ],
            "type": "pubkey"
          },
          {
            "name": "playerB",
            "docs": [
              "Second bettor (default pubkey until joined)"
            ],
            "type": "pubkey"
          },
          {
            "name": "gameId",
            "docs": [
              "Unique id chosen by player_a (PDA seed)"
            ],
            "type": "u64"
          },
          {
            "name": "betLamports",
            "docs": [
              "Lamports each player bets"
            ],
            "type": "u64"
          },
          {
            "name": "status",
            "docs": [
              "WaitingForPlayer | Settled"
            ],
            "type": {
              "defined": {
                "name": "gameStatus"
              }
            }
          },
          {
            "name": "winner",
            "docs": [
              "Winner after settle (default until settled)"
            ],
            "type": "pubkey"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "gameStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "waitingForPlayer"
          },
          {
            "name": "settled"
          }
        ]
      }
    }
  ]
};
