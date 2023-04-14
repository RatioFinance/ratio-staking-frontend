import { Connection, PublicKey } from '@solana/web3.js';
import { TokenAmount } from './safe-math';
import axios from 'axios';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// shorten the checksummed version of the input address to have 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Get a random number between a min and a max
 * @param {number} min
 * @param {number} max
 * @returns {any}
 */
// const randomInteger = (min: number, max: number) => {
//   return Math.floor(Math.random() * (max - min + 1)) + min;
// };

export const isWalletApproveError = (e: any) => {
  return e && (e.code === 4001 || e.code === -32603);
};

export const toUiAmount = (inputNumber: number | string, numDecimals: number) => {
  return +new TokenAmount(inputNumber, numDecimals).fixed();
};

export const addZeros = (inputNumber: number, numDecimals: number) => {
  if (numDecimals >= 100) throw new Error('Must be < 100 decimal places');
  return inputNumber * 10 ** numDecimals;
};

export const fetchAxiosWithRetry = async (url: string, maxRetry = 3) => {
  let count = 0;
  let error = undefined;
  while (count < maxRetry) {
    try {
      return await axios.get(url);
    } catch (e) {
      error = e;
      count++;
    }
  }
  throw error;
};

/**
 *
 * @param connection
 * @param owner
 */
export async function getAtaTokenBalanceByOwner(
  connection: Connection,
  owner: PublicKey | string,
  mint: PublicKey | string
) {
  const ataKey = getAssociatedTokenAddressSync(new PublicKey(mint), new PublicKey(owner), true);
  try {
    return parseInt((await connection.getTokenAccountBalance(ataKey)).value.amount);
  } catch (e) {
    return 0;
  }
}
