import * as anchor from '@project-serum/anchor-v26';
import { IdlAccounts } from '@project-serum/anchor-v26';
import { Account } from '@solana/spl-token-v2';
import { RatioRewards } from '../../../utils/ratio-rewards-idl';
import { RatioStaking } from '../../../utils/ratio-staking-idl';

export type stakeState = {
  stakeProgram: anchor.Program<RatioStaking>;
  rewardProgram: anchor.Program<RatioRewards>;
  reflection: IdlAccounts<RatioRewards>['reflectionAccount'];
  reward: IdlAccounts<RatioRewards>['rewardAccount'];
  stake: IdlAccounts<RatioStaking>['stakeAccount'];
  stakeVault: Account;
  settings: IdlAccounts<RatioStaking>['settingsAccount'];
  accounts: any;
} | null;
