export type RatioStaking = {
  version: '0.1.0';
  name: 'ratio_staking';
  instructions: [
    {
      name: 'init';
      docs: ['Initialize the [SettingsAccount](#settings-account).'];
      accounts: [
        {
          name: 'settings';
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
          name: 'rent';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'treasuryTokenAccount';
          type: 'publicKey';
        }
      ];
    },
    {
      name: 'stake';
      docs: [
        'Create a [StakeAccount](#stake-account) and [VaultAccount](#vault-account).',
        'Stake `amount` of [NOS](/tokens/token) tokens for `duration` fo seconds.'
      ];
      accounts: [
        {
          name: 'mint';
          isMut: false;
          isSigner: false;
        },
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
          name: 'stake';
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
          name: 'amount';
          type: 'u64';
        },
        {
          name: 'duration';
          type: 'u128';
        }
      ];
    },
    {
      name: 'unstake';
      docs: ['Start the unstake duration.'];
      accounts: [
        {
          name: 'stake';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'reward';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
        }
      ];
      args: [];
    },
    {
      name: 'restake';
      docs: ['Make a stake active again and reset the unstake time.'];
      accounts: [
        {
          name: 'vault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stake';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
        }
      ];
      args: [];
    },
    {
      name: 'topup';
      docs: ['Top-up `amount` of [NOS](/tokens/token) of a [StakeAccount](#stake-account).'];
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
          name: 'stake';
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
      name: 'extend';
      docs: ['Extend the `duration` of a [StakeAccount](#stake-account).'];
      accounts: [
        {
          name: 'stake';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
        }
      ];
      args: [
        {
          name: 'duration';
          type: 'u64';
        }
      ];
    },
    {
      name: 'close';
      docs: ['Close a [StakeAccount](#stake-account) and [VaultAccount](#vault-account).'];
      accounts: [
        {
          name: 'user';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stake';
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
      name: 'withdraw';
      docs: ['Withdraw  [NOS](/tokens/token) that is released after an [unstake](#unstake)'];
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
          name: 'stake';
          isMut: true;
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
      name: 'slash';
      docs: [
        "Reduce a [StakeAccount](#stake-account)'s [NOS](/tokens/token) tokens.",
        'Slashing is a feature used by the Ratio Protocol to punish bad actors.'
      ];
      accounts: [
        {
          name: 'vault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stake';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'settings';
          isMut: false;
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
      name: 'updateSettings';
      docs: ['Update the Slashing Authority and Token Account.'];
      accounts: [
        {
          name: 'newAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'settings';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: 'settingsAccount';
      docs: ['The `SettingsAccount` struct holds the information about the', 'slashing authority and token account.'];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'authority';
            type: 'publicKey';
          },
          {
            name: 'tokenAccount';
            type: 'publicKey';
          }
        ];
      };
    },
    {
      name: 'stakeAccount';
      docs: ['The `StakeAccount` struct holds all the information for any given stake.'];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'amount';
            type: 'u64';
          },
          {
            name: 'authority';
            type: 'publicKey';
          },
          {
            name: 'duration';
            type: 'u64';
          },
          {
            name: 'timeUnstake';
            type: 'i64';
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
            name: 'xnos';
            type: 'u128';
          }
        ];
      };
    }
  ];
  errors: [
    {
      code: 6000;
      name: 'AmountNotEnough';
      msg: 'This amount is not enough.';
    },
    {
      code: 6001;
      name: 'AlreadyInitialized';
      msg: 'This stake is already running.';
    },
    {
      code: 6002;
      name: 'AlreadyClaimed';
      msg: 'This stake is already claimed.';
    },
    {
      code: 6003;
      name: 'AlreadyStaked';
      msg: 'This stake is already staked.';
    },
    {
      code: 6004;
      name: 'AlreadyUnstaked';
      msg: 'This stake is already unstaked.';
    },
    {
      code: 6005;
      name: 'NotUnstaked';
      msg: 'This stake is not yet unstaked.';
    },
    {
      code: 6006;
      name: 'Locked';
      msg: 'This stake is still locked.';
    },
    {
      code: 6007;
      name: 'DurationTooShort';
      msg: 'This stake duration is not long enough.';
    },
    {
      code: 6008;
      name: 'DurationTooLong';
      msg: 'This stake duration is too long.';
    },
    {
      code: 6009;
      name: 'DoesNotExist';
      msg: 'This stake account does not exist.';
    },
    {
      code: 6010;
      name: 'Decreased';
      msg: 'This stake is not allowed to decrease.';
    },
    {
      code: 6011;
      name: 'HasReward';
      msg: 'This stake still has a reward account.';
    },
    {
      code: 6012;
      name: 'InvalidStakeAccount';
      msg: 'This stake does not belong to the authority.';
    }
  ];
};

export const IDL: RatioStaking = {
  version: '0.1.0',
  name: 'ratio_staking',
  instructions: [
    {
      name: 'init',
      docs: ['Initialize the [SettingsAccount](#settings-account).'],
      accounts: [
        {
          name: 'settings',
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
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'treasuryTokenAccount',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'stake',
      docs: [
        'Create a [StakeAccount](#stake-account) and [VaultAccount](#vault-account).',
        'Stake `amount` of [NOS](/tokens/token) tokens for `duration` fo seconds.',
      ],
      accounts: [
        {
          name: 'mint',
          isMut: false,
          isSigner: false,
        },
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
          name: 'stake',
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
          name: 'amount',
          type: 'u64',
        },
        {
          name: 'duration',
          type: 'u128',
        },
      ],
    },
    {
      name: 'unstake',
      docs: ['Start the unstake duration.'],
      accounts: [
        {
          name: 'stake',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'reward',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: 'restake',
      docs: ['Make a stake active again and reset the unstake time.'],
      accounts: [
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stake',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: 'topup',
      docs: ['Top-up `amount` of [NOS](/tokens/token) of a [StakeAccount](#stake-account).'],
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
          name: 'stake',
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
      name: 'extend',
      docs: ['Extend the `duration` of a [StakeAccount](#stake-account).'],
      accounts: [
        {
          name: 'stake',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'duration',
          type: 'u64',
        },
      ],
    },
    {
      name: 'close',
      docs: ['Close a [StakeAccount](#stake-account) and [VaultAccount](#vault-account).'],
      accounts: [
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stake',
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
      name: 'withdraw',
      docs: ['Withdraw  [NOS](/tokens/token) that is released after an [unstake](#unstake)'],
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
          name: 'stake',
          isMut: true,
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
      name: 'slash',
      docs: [
        "Reduce a [StakeAccount](#stake-account)'s [NOS](/tokens/token) tokens.",
        'Slashing is a feature used by the Ratio Protocol to punish bad actors.',
      ],
      accounts: [
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stake',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'settings',
          isMut: false,
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
      name: 'updateSettings',
      docs: ['Update the Slashing Authority and Token Account.'],
      accounts: [
        {
          name: 'newAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'settings',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: 'settingsAccount',
      docs: ['The `SettingsAccount` struct holds the information about the', 'slashing authority and token account.'],
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'authority',
            type: 'publicKey',
          },
          {
            name: 'tokenAccount',
            type: 'publicKey',
          },
        ],
      },
    },
    {
      name: 'stakeAccount',
      docs: ['The `StakeAccount` struct holds all the information for any given stake.'],
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'amount',
            type: 'u64',
          },
          {
            name: 'authority',
            type: 'publicKey',
          },
          {
            name: 'duration',
            type: 'u64',
          },
          {
            name: 'timeUnstake',
            type: 'i64',
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
            name: 'xnos',
            type: 'u128',
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: 'AmountNotEnough',
      msg: 'This amount is not enough.',
    },
    {
      code: 6001,
      name: 'AlreadyInitialized',
      msg: 'This stake is already running.',
    },
    {
      code: 6002,
      name: 'AlreadyClaimed',
      msg: 'This stake is already claimed.',
    },
    {
      code: 6003,
      name: 'AlreadyStaked',
      msg: 'This stake is already staked.',
    },
    {
      code: 6004,
      name: 'AlreadyUnstaked',
      msg: 'This stake is already unstaked.',
    },
    {
      code: 6005,
      name: 'NotUnstaked',
      msg: 'This stake is not yet unstaked.',
    },
    {
      code: 6006,
      name: 'Locked',
      msg: 'This stake is still locked.',
    },
    {
      code: 6007,
      name: 'DurationTooShort',
      msg: 'This stake duration is not long enough.',
    },
    {
      code: 6008,
      name: 'DurationTooLong',
      msg: 'This stake duration is too long.',
    },
    {
      code: 6009,
      name: 'DoesNotExist',
      msg: 'This stake account does not exist.',
    },
    {
      code: 6010,
      name: 'Decreased',
      msg: 'This stake is not allowed to decrease.',
    },
    {
      code: 6011,
      name: 'HasReward',
      msg: 'This stake still has a reward account.',
    },
    {
      code: 6012,
      name: 'InvalidStakeAccount',
      msg: 'This stake does not belong to the authority.',
    },
  ],
};
