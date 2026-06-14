/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/ghost_book.json`.
 */
export type GhostBook = {
  "address": "DBAv87orWGKYgTka13SJdzD4eozyd46wQMCzAjjHqZ5h",
  "metadata": {
    "name": "ghostBook",
    "version": "0.1.0",
    "spec": "0.1.0"
  },
  "instructions": [
    {
      "name": "cancelOrder",
      "discriminator": [
        95,
        129,
        237,
        240,
        8,
        49,
        223,
        132
      ],
      "accounts": [
        {
          "name": "trader",
          "writable": true,
          "signer": true
        },
        {
          "name": "sponsor",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  112,
                  111,
                  110,
                  115,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "trader"
              }
            ]
          }
        },
        {
          "name": "authority",
          "relations": [
            "sponsor"
          ]
        },
        {
          "name": "orderId"
        },
        {
          "name": "order",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  114,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "trader"
              },
              {
                "kind": "account",
                "path": "orderId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "vault",
          "writable": true,
          "address": "MagicVau1t999999999999999999999999999999999"
        },
        {
          "name": "magicProgram",
          "address": "Magic11111111111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "crankMatch",
      "discriminator": [
        147,
        147,
        113,
        6,
        4,
        79,
        241,
        52
      ],
      "accounts": [
        {
          "name": "crank"
        }
      ],
      "args": []
    },
    {
      "name": "delegateSponsor",
      "discriminator": [
        103,
        51,
        15,
        141,
        25,
        188,
        197,
        245
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "sponsor",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  112,
                  111,
                  110,
                  115,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "payer"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "buffer",
          "writable": true
        },
        {
          "name": "delegationRecord",
          "writable": true
        },
        {
          "name": "delegationMetadata",
          "writable": true
        },
        {
          "name": "ownerProgram"
        },
        {
          "name": "delegationProgram"
        }
      ],
      "args": []
    },
    {
      "name": "finalizeSettlement",
      "docs": [
        "Magic Action target — executed on Solana base layer after ER commit"
      ],
      "discriminator": [
        220,
        72,
        152,
        119,
        178,
        196,
        25,
        170
      ],
      "accounts": [
        {
          "name": "dummy"
        }
      ],
      "args": [
        {
          "name": "bidOwner",
          "type": "pubkey"
        },
        {
          "name": "askOwner",
          "type": "pubkey"
        },
        {
          "name": "fillPrice",
          "type": "u64"
        },
        {
          "name": "fillSize",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeCrank",
      "discriminator": [
        101,
        77,
        169,
        235,
        57,
        88,
        240,
        253
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "crankState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  97,
                  110,
                  107,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "magicProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initializeMarket",
      "discriminator": [
        35,
        35,
        189,
        193,
        155,
        48,
        170,
        203
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "authority"
        },
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "baseMint"
              },
              {
                "kind": "arg",
                "path": "quoteMint"
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
          "name": "baseMint",
          "type": "pubkey"
        },
        {
          "name": "quoteMint",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "initializeSponsor",
      "discriminator": [
        195,
        73,
        6,
        160,
        234,
        169,
        243,
        179
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "authority"
        },
        {
          "name": "sponsor",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  112,
                  111,
                  110,
                  115,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "authority"
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
    },
    {
      "name": "placeOrder",
      "discriminator": [
        51,
        194,
        155,
        175,
        109,
        130,
        96,
        106
      ],
      "accounts": [
        {
          "name": "trader",
          "writable": true,
          "signer": true
        },
        {
          "name": "sponsor",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  112,
                  111,
                  110,
                  115,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "trader"
              }
            ]
          }
        },
        {
          "name": "authority",
          "relations": [
            "sponsor"
          ]
        },
        {
          "name": "orderId"
        },
        {
          "name": "order",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  114,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "trader"
              },
              {
                "kind": "account",
                "path": "orderId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "vault",
          "writable": true,
          "address": "MagicVau1t999999999999999999999999999999999"
        },
        {
          "name": "magicProgram",
          "address": "Magic11111111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "side",
          "type": {
            "defined": {
              "name": "side"
            }
          }
        },
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "size",
          "type": "u64"
        }
      ]
    },
    {
      "name": "processUndelegation",
      "discriminator": [
        196,
        28,
        41,
        206,
        48,
        37,
        51,
        167
      ],
      "accounts": [
        {
          "name": "baseAccount",
          "writable": true
        },
        {
          "name": "buffer"
        },
        {
          "name": "payer",
          "writable": true
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "accountSeeds",
          "type": {
            "vec": "bytes"
          }
        }
      ]
    },
    {
      "name": "settleMatch",
      "discriminator": [
        71,
        124,
        117,
        96,
        191,
        217,
        116,
        24
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "bidOwner"
        },
        {
          "name": "askOwner"
        },
        {
          "name": "bidOrder",
          "writable": true
        },
        {
          "name": "askOrder",
          "writable": true
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "bidTokenAccount",
          "writable": true
        },
        {
          "name": "askTokenAccount",
          "writable": true
        },
        {
          "name": "quoteVault",
          "writable": true
        },
        {
          "name": "baseVault",
          "writable": true
        },
        {
          "name": "magicContext"
        },
        {
          "name": "magicProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "bidTimestamp",
          "type": "i64"
        },
        {
          "name": "askTimestamp",
          "type": "i64"
        }
      ]
    },
    {
      "name": "undelegateSponsor",
      "discriminator": [
        223,
        227,
        185,
        69,
        225,
        30,
        87,
        106
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
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
      "name": "market",
      "discriminator": [
        219,
        190,
        213,
        55,
        0,
        227,
        198,
        154
      ]
    },
    {
      "name": "sponsor",
      "discriminator": [
        19,
        128,
        115,
        109,
        118,
        109,
        66,
        213
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "orderNotMatched",
      "msg": "Order not matched — prices do not cross"
    },
    {
      "code": 6001,
      "name": "unauthorized",
      "msg": "Unauthorized — you do not own this order"
    },
    {
      "code": 6002,
      "name": "orderAlreadyFilled",
      "msg": "Order already filled — cannot cancel"
    },
    {
      "code": 6003,
      "name": "invalidOrderParams",
      "msg": "Price or size cannot be zero"
    },
    {
      "code": 6004,
      "name": "insufficientSponsorLamports"
    },
    {
      "code": 6005,
      "name": "sponsorNotDelegated"
    }
  ],
  "types": [
    {
      "name": "market",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "baseMint",
            "type": "pubkey"
          },
          {
            "name": "quoteMint",
            "type": "pubkey"
          },
          {
            "name": "totalVolume",
            "type": "u64"
          },
          {
            "name": "totalMatches",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "side",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "bid"
          },
          {
            "name": "ask"
          }
        ]
      }
    },
    {
      "name": "sponsor",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "orderCount",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
