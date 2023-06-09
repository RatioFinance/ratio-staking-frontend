export type RatioRewards = {
  version: '0.1.0';
  name: 'ratio_rewards';
  instructions: [
    {
      name: 'init';
      docs: ['Initialize the [ReflectionAccount](#reflection-account) and [VaultAccount](#vault-account).'];
      accounts: [
        {
          name: 'mint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'reflection';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'vault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'funding';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'fundingRate';
          type: 'f64';
        }
      ];
    },
    {
      name: 'updateFundingRate';
      docs: ['Update funding rate. Can be only called by the authority stored in the reflection account.'];
      accounts: [
        {
          name: 'reflection';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        }
      ];
      args: [
        {
          name: 'fundingRate';
          type: 'f64';
        }
      ];
    },
    {
      name: 'resetFundingTime';
      docs: ['Reset funding time. Can be only called by the authority stored in the reflection account.'];
      accounts: [
        {
          name: 'reflection';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        }
      ];
      args: [];
    },
    {
      name: 'enter';
      docs: ['Initialize a [RewardsAccount](#rewards-account).'];
      accounts: [
        {
          name: 'reflection';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stake';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'reward';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: 'addFee';
      docs: ['Send [NOS](/tokens/token) to the [VaultAccount](#vault-account).'];
      accounts: [
        {
          name: 'user';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'reflection';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'vault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        }
      ];
    },
    {
      name: 'addFunding';
      docs: [
        'Send estimated funding amount for the time elapsed from last funding time. [funding] -> [vault_account]. Can be called by anyone'
      ];
      accounts: [
        {
          name: 'funding';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'reflection';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'vault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: 'claim';
      docs: ['Claim rewards from a [RewardsAccount](#rewards-account) and [VaultAccount](#vault-account).'];
      accounts: [
        {
          name: 'user';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'vault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'reflection';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'reward';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stake';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: 'sync';
      docs: ['Re-calculate reflection points.'];
      accounts: [
        {
          name: 'reward';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stake';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'reflection';
          isMut: true;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: 'close';
      docs: ['Close a [RewardsAccount](#rewards-account).'];
      accounts: [
        {
          name: 'reflection';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'reward';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: 'reflectionAccount';
      docs: ['The `ReflectionAccount` struct holds all the information on the reflection pool.'];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'authority';
            type: 'publicKey';
          },
          {
            name: 'rate';
            type: 'u128';
          },
          {
            name: 'totalReflection';
            type: 'u128';
          },
          {
            name: 'totalXnos';
            type: 'u128';
          },
          {
            name: 'vault';
            type: 'publicKey';
          },
          {
            name: 'vaultBump';
            type: 'u8';
          },
          {
            name: 'lastFundingTime';
            type: 'i64';
          },
          {
            name: 'fundingRate';
            type: 'f64';
          },
          {
            name: 'fundingBump';
            type: 'u8';
          }
        ];
      };
    },
    {
      name: 'rewardAccount';
      docs: ['The `RewardAccount` struct holds all the information for any given user account.'];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'authority';
            type: 'publicKey';
          },
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'reflection';
            type: 'u128';
          },
          {
            name: 'xnos';
            type: 'u128';
          }
        ];
      };
    }
  ];
};

export const IDL: RatioRewards = {
  version: '0.1.0',
  name: 'ratio_rewards',
  instructions: [
    {
      name: 'init',
      docs: ['Initialize the [ReflectionAccount](#reflection-account) and [VaultAccount](#vault-account).'],
      accounts: [
        {
          name: 'mint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'reflection',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'funding',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'fundingRate',
          type: 'f64',
        },
      ],
    },
    {
      name: 'updateFundingRate',
      docs: ['Update funding rate. Can be only called by the authority stored in the reflection account.'],
      accounts: [
        {
          name: 'reflection',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'fundingRate',
          type: 'f64',
        },
      ],
    },
    {
      name: 'resetFundingTime',
      docs: ['Reset funding time. Can be only called by the authority stored in the reflection account.'],
      accounts: [
        {
          name: 'reflection',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: 'enter',
      docs: ['Initialize a [RewardsAccount](#rewards-account).'],
      accounts: [
        {
          name: 'reflection',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stake',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'reward',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'addFee',
      docs: ['Send [NOS](/tokens/token) to the [VaultAccount](#vault-account).'],
      accounts: [
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'reflection',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'addFunding',
      docs: [
        'Send estimated funding amount for the time elapsed from last funding time. [funding] -> [vault_account]. Can be called by anyone',
      ],
      accounts: [
        {
          name: 'funding',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'reflection',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'claim',
      docs: ['Claim rewards from a [RewardsAccount](#rewards-account) and [VaultAccount](#vault-account).'],
      accounts: [
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'reflection',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'reward',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stake',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'sync',
      docs: ['Re-calculate reflection points.'],
      accounts: [
        {
          name: 'reward',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stake',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'reflection',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'close',
      docs: ['Close a [RewardsAccount](#rewards-account).'],
      accounts: [
        {
          name: 'reflection',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'reward',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: 'reflectionAccount',
      docs: ['The `ReflectionAccount` struct holds all the information on the reflection pool.'],
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'authority',
            type: 'publicKey',
          },
          {
            name: 'rate',
            type: 'u128',
          },
          {
            name: 'totalReflection',
            type: 'u128',
          },
          {
            name: 'totalXnos',
            type: 'u128',
          },
          {
            name: 'vault',
            type: 'publicKey',
          },
          {
            name: 'vaultBump',
            type: 'u8',
          },
          {
            name: 'lastFundingTime',
            type: 'i64',
          },
          {
            name: 'fundingRate',
            type: 'f64',
          },
          {
            name: 'fundingBump',
            type: 'u8',
          },
        ],
      },
    },
    {
      name: 'rewardAccount',
      docs: ['The `RewardAccount` struct holds all the information for any given user account.'],
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'authority',
            type: 'publicKey',
          },
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'reflection',
            type: 'u128',
          },
          {
            name: 'xnos',
            type: 'u128',
          },
        ],
      },
    },
  ],
};
