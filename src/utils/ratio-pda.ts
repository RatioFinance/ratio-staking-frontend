import { PublicKey } from '@solana/web3.js';
import { utils } from '@project-serum/anchor';
import { RATIO_MINT_KEY, REWARD_PROGRAM_ID, STAKE_PROGRAM_ID } from '../constants';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token-v2';

const FUNDING_SEED = 'funding';
const REFLECTION_SEED = 'reflection';
const STAKE_SEED = 'stake';
const SETTINGS_SEED = 'settings';
const VAULT_STAKE_SEED = 'vault';
const REWARD_SEED = 'reward';
const STAKING_MINT_KEY = new PublicKey(RATIO_MINT_KEY);

export const getPda = (seeds: Buffer[], programId: PublicKey | string) => {
  return utils.publicKey.findProgramAddressSync(seeds, new PublicKey(programId));
};

export const getATAKey = (owner: string | PublicKey, mint: string | PublicKey) => {
  const [ata] = getPda(
    [new PublicKey(owner).toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), new PublicKey(mint).toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  return ata;
};

// Ratio Staking PDAs
export const getReflectionPDA = () => {
  const [pda] = getPda([Buffer.from(REFLECTION_SEED)], REWARD_PROGRAM_ID);
  return pda;
};

export const getRewardPDA = (user: PublicKey) => {
  const [pda] = getPda([Buffer.from(REWARD_SEED), user.toBuffer()], REWARD_PROGRAM_ID);
  return pda;
};

export const getFundingPDA = () => {
  const [pda] = getPda([Buffer.from(FUNDING_SEED)], REWARD_PROGRAM_ID);
  return pda;
};

export const getRewardVaultPDA = () => {
  const [pda] = getPda([STAKING_MINT_KEY.toBuffer()], REWARD_PROGRAM_ID);
  return pda;
};

export const getStakingVaultPDA = (user: PublicKey) => {
  const [pda] = getPda([Buffer.from(VAULT_STAKE_SEED), STAKING_MINT_KEY.toBuffer(), user.toBuffer()], STAKE_PROGRAM_ID);
  return pda;
};

export const getSettingsPDA = () => {
  const [pda] = getPda([Buffer.from(SETTINGS_SEED)], STAKE_PROGRAM_ID);
  return pda;
};

export const getStakePDA = (user: PublicKey) => {
  const [pda] = getPda([Buffer.from(STAKE_SEED), STAKING_MINT_KEY.toBuffer(), user.toBuffer()], STAKE_PROGRAM_ID);
  return pda;
};
