import { FUNDING_RATE, RATIO_MINT_DECIMALS, SECONDS_PER_DAY } from '../../../constants';
import * as anchor from '@project-serum/anchor';
import { stakeState } from './types';
import { PublicKey, Transaction } from '@solana/web3.js';
import { sendTransaction } from '../../../utils/rf-web3';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { addZeros } from '../../../utils/utils';

export async function initStake(stakeState: stakeState, wallet: WalletContextState) {
  const transaction = new Transaction();
  transaction.add(await stakeInitIx(stakeState));
  transaction.add(await rewardsInitIx(stakeState));
  const txHash = await sendTransaction(stakeState.stakeProgram.provider.connection, wallet, transaction);

  return txHash.toString();
}

export async function updateFunding(
  stakeState: stakeState,
  fundingRate: number = FUNDING_RATE,
  wallet: WalletContextState
) {
  const transaction = await stakeState.rewardProgram.methods
    .updateFundingRate(addZeros(fundingRate, 6))
    .accounts(stakeState.accounts)
    .transaction();

  const txHash = await sendTransaction(stakeState.stakeProgram.provider.connection, wallet, transaction);

  return txHash.toString();
}

export async function resetFundingTime(stakeState: stakeState, wallet: WalletContextState) {
  const transaction = await stakeState.rewardProgram.methods
    .resetFundingTime()
    .accounts(stakeState.accounts)
    .transaction();

  const txHash = await sendTransaction(stakeState.stakeProgram.provider.connection, wallet, transaction);

  return txHash.toString();
}

export async function stake(stakeState: stakeState, amount: number, durationDays: number, wallet: WalletContextState) {
  const transaction = new Transaction();
  transaction.add(await addFundingIx(stakeState));
  transaction.add(stakeIx(stakeState, amount, durationDays));
  transaction.add(enterIx(stakeState));
  const txHash = await sendTransaction(stakeState.stakeProgram.provider.connection, wallet, transaction);

  return txHash.toString();
}

export async function claim(stakeState: stakeState, wallet: WalletContextState) {
  const transaction = new Transaction();
  transaction.add(await addFundingIx(stakeState));
  transaction.add(claimIx(stakeState));
  const txHash = await sendTransaction(stakeState.stakeProgram.provider.connection, wallet, transaction);

  return txHash.toString();
}

export async function sync(stakeState: stakeState, wallet: WalletContextState) {
  const transaction = new Transaction();
  transaction.add(await addFundingIx(stakeState));
  transaction.add(syncIx(stakeState));
  const txHash = await sendTransaction(stakeState.stakeProgram.provider.connection, wallet, transaction);

  return txHash.toString();
}

export async function addFunding(stakeState: stakeState, wallet: WalletContextState) {
  const transaction = new Transaction();
  transaction.add(await addFundingIx(stakeState));
  const txHash = await sendTransaction(stakeState.stakeProgram.provider.connection, wallet, transaction);

  return txHash.toString();
}

export async function increaseStake(stakeState: stakeState, amount: number, wallet: WalletContextState) {
  const transaction = new Transaction();
  transaction.add(await addFundingIx(stakeState));
  transaction.add(increaseStakeIx(stakeState, amount));
  transaction.add(syncIx(stakeState));
  const txHash = await sendTransaction(stakeState.stakeProgram.provider.connection, wallet, transaction);

  return txHash.toString();
}

export async function extendStake(stakeState: stakeState, durationDays: number, wallet: WalletContextState) {
  const transaction = new Transaction();
  transaction.add(await addFundingIx(stakeState));
  transaction.add(extendStakeIx(stakeState, durationDays));
  transaction.add(syncIx(stakeState));
  const txHash = await sendTransaction(stakeState.stakeProgram.provider.connection, wallet, transaction);

  return txHash.toString();
}

export async function restakeStake(stakeState: stakeState, wallet: WalletContextState) {
  const transaction = new Transaction();
  transaction.add(await addFundingIx(stakeState));
  transaction.add(restakeIx(stakeState));
  transaction.add(enterIx(stakeState));
  const txHash = await sendTransaction(stakeState.stakeProgram.provider.connection, wallet, transaction);

  return txHash.toString();
}

export async function unStake(stakeState: stakeState, wallet: WalletContextState) {
  const transaction = new Transaction();
  transaction.add(await addFundingIx(stakeState));
  transaction.add(claimIx(stakeState));
  transaction.add(closeRewardIx(stakeState));
  transaction.add(unStakeIx(stakeState));
  const txHash = await sendTransaction(stakeState.stakeProgram.provider.connection, wallet, transaction);

  return txHash.toString();
}

export async function withdrawStake(stakeState: stakeState, wallet: WalletContextState) {
  const transaction = new Transaction();
  transaction.add(await addFundingIx(stakeState));
  transaction.add(withdrawStakeIx(stakeState));
  const txHash = await sendTransaction(stakeState.stakeProgram.provider.connection, wallet, transaction);

  return txHash.toString();
}

export async function withdrawAndCloseStake(stakeState: stakeState, wallet: WalletContextState) {
  const transaction = new Transaction();
  transaction.add(await addFundingIx(stakeState));
  transaction.add(withdrawStakeIx(stakeState));
  transaction.add(closeStakeIx(stakeState));
  const txHash = await sendTransaction(stakeState.stakeProgram.provider.connection, wallet, transaction);

  return txHash.toString();
}

export function claimIx(stakeState: stakeState) {
  const ix = stakeState.rewardProgram.instruction.claim({
    accounts: {
      ...stakeState.accounts,
      vault: stakeState.accounts.rewardVault,
    },
  });
  return ix;
}

export function syncIx(stakeState: stakeState) {
  const ix = stakeState.rewardProgram.instruction.sync({
    accounts: {
      ...stakeState.accounts,
    },
  });
  return ix;
}

export function closeRewardIx(stakeState: stakeState) {
  const ix = stakeState.rewardProgram.instruction.close({
    accounts: {
      ...stakeState.accounts,
    },
  });
  return ix;
}

export function enterIx(stakeState: stakeState) {
  const ix = stakeState.rewardProgram.instruction.enter({
    accounts: {
      ...stakeState.accounts,
    },
  });
  return ix;
}

export function increaseStakeIx(stakeState: stakeState, amount: number) {
  const nativeAmount = new anchor.BN(addZeros(amount, RATIO_MINT_DECIMALS));
  const ix = stakeState.stakeProgram.instruction.topup(nativeAmount, {
    accounts: {
      ...stakeState.accounts,
    },
  });
  return ix;
}

export function extendStakeIx(stakeState: stakeState, durationDays: number) {
  const durationSeconds = new anchor.BN(durationDays * SECONDS_PER_DAY);

  const ix = stakeState.stakeProgram.instruction.extend(durationSeconds, {
    accounts: {
      ...stakeState.accounts,
    },
  });
  return ix;
}

export function unStakeIx(stakeState: stakeState) {
  const ix = stakeState.stakeProgram.instruction.unstake({
    accounts: {
      ...stakeState.accounts,
    },
  });
  return ix;
}

export function closeStakeIx(stakeState: stakeState) {
  const ix = stakeState.stakeProgram.instruction.close({
    accounts: {
      ...stakeState.accounts,
    },
  });
  return ix;
}

export function withdrawStakeIx(stakeState: stakeState) {
  const ix = stakeState.stakeProgram.instruction.withdraw({
    accounts: {
      ...stakeState.accounts,
    },
  });
  return ix;
}

export function restakeIx(stakeState: stakeState) {
  const ix = stakeState.stakeProgram.instruction.restake({
    accounts: {
      ...stakeState.accounts,
    },
  });
  return ix;
}

export function stakeIx(stakeState: stakeState, amount: number, durationDays: number) {
  const nativeAmount = new anchor.BN(addZeros(amount, RATIO_MINT_DECIMALS));
  const durationSeconds = new anchor.BN(durationDays * SECONDS_PER_DAY);
  const ix = stakeState.stakeProgram.instruction.stake(nativeAmount, durationSeconds, {
    accounts: {
      ...stakeState.accounts,
    },
  });
  return ix;
}

export async function stakeInitIx(stakeState: stakeState) {
  console.log(stakeState.accounts);
  const ix = await stakeState.stakeProgram.methods
    .init(stakeState.accounts.user)
    .accounts(stakeState.accounts)
    .instruction();
  console.log('Init settings:', stakeState.accounts.settings.toString());
  return ix;
}

export async function rewardsInitIx(stakeState: stakeState) {
  const funding_rate = 0;
  const ix = await stakeState.rewardProgram.methods
    .init(funding_rate)
    .accounts({
      ...stakeState.accounts,
      vault: stakeState.accounts.rewardVault,
    })
    .instruction();

  console.log('Init reflection:', stakeState.accounts.reflection.toString());
  return ix;
}

export async function addFundingIx(stakeState: stakeState) {
  const ix = await stakeState.rewardProgram.methods
    .addFunding()
    .accounts({
      ...stakeState.accounts,
      vault: stakeState.accounts.rewardVault,
      adilVault: new PublicKey('GfgKwS9EFXsp7p1jeU8ax7ivGftdy6y3Y5m6Hk3zUCTk'),
    })
    .instruction();

  return ix;
}
