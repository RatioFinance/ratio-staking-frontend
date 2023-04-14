import {
  Keypair,
  Commitment,
  Connection,
  PublicKey,
  Transaction,
  TransactionSignature,
  TransactionResponse,
} from '@solana/web3.js';
import { IDL as stakingIDL } from './ratio-staking-idl';
import { IDL as rewardsIDL } from './ratio-rewards-idl';
import { Provider } from '@project-serum/anchor';
import { AnchorProvider as NewAnchorProvider, Program as NewAnchorProgram } from '@project-serum/anchor-v26';
import { REWARD_PROGRAM_ID, STAKE_PROGRAM_ID } from '../constants';
import PromiseAny from 'promise.any';

const commitment: Commitment = 'confirmed';

export async function getStakeProgramInstance(connection: Connection, wallet: any = {}) {
  const provider = new NewAnchorProvider(connection, wallet || {}, Provider.defaultOptions());
  const programId = STAKE_PROGRAM_ID;
  const program = new NewAnchorProgram(stakingIDL, programId, provider);

  return program;
}

export async function getRewardsProgramInstance(connection: Connection, wallet: any = {}) {
  const provider = new NewAnchorProvider(connection, wallet || {}, Provider.defaultOptions());
  const programId = REWARD_PROGRAM_ID;
  const program = new NewAnchorProgram(rewardsIDL, programId, provider);

  return program;
}

// transaction
async function signTransaction(
  connection: Connection,
  wallet: any,
  transaction: Transaction,
  signers: Array<Keypair> = []
) {
  transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
  transaction.setSigners(wallet.publicKey, ...signers.map((s) => s.publicKey));
  if (signers.length > 0) {
    transaction.partialSign(...signers);
  }
  return await wallet.signTransaction(transaction);
}

// transaction
export async function signAllTransaction(
  connection: Connection,
  wallet: any,
  transactions: Transaction[],
  signers: Array<Keypair> = []
): Promise<Transaction[]> {
  for (const transaction of transactions) {
    transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
    transaction.setSigners(wallet.publicKey, ...signers.map((s) => s.publicKey));
    if (signers.length > 0) {
      transaction.partialSign(...signers);
    }
  }
  return await wallet.signAllTransactions(transactions);
}

async function covertToProgramWalletTransaction(
  connection: Connection,
  wallet: any,
  transaction: Transaction,
  signers: Array<Keypair> = []
) {
  transaction.recentBlockhash = (await connection.getRecentBlockhash(commitment)).blockhash;
  transaction.feePayer = wallet.publicKey;
  if (signers.length > 0) {
    transaction = await wallet.convertToProgramWalletTransaction(transaction);
    transaction.partialSign(...signers);
  }
  return transaction;
}

export async function sendSignedTransaction(connection: Connection, signedTransaction: Transaction): Promise<string> {
  const rawTransaction = signedTransaction.serialize();

  const txid: TransactionSignature = await connection.sendRawTransaction(rawTransaction, {
    skipPreflight: true,
    preflightCommitment: commitment,
  });

  return txid;
}
export async function sendTransaction(
  connection: Connection,
  wallet: any,
  transaction: Transaction,
  signers: Array<Keypair> = []
) {
  if (wallet.isProgramWallet) {
    const programWalletTransaction = await covertToProgramWalletTransaction(connection, wallet, transaction, signers);
    return await wallet.signAndSendTransaction(programWalletTransaction);
  } else {
    const signedTransaction = await signTransaction(connection, wallet, transaction, signers);
    return await sendSignedTransaction(connection, signedTransaction);
  }
}

const TX_SEND_OPTIONS = {
  skipPreflight: true,
  preflightCommitment: commitment,
  maxRetries: 2,
};

export function getUnixTs() {
  return new Date().getTime();
}
const wait = (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};
export async function sendAndConfirmTransaction(
  connection: Connection,
  wallet: any,
  transaction: Transaction,
  signers: Array<Keypair> = [],
  timeout = 120_000,
  sendRetries = 40,
  sendInterval = 2000,
  pollInterval = 500
): Promise<[string, any]> {
  const signedTx = await signTransaction(connection, wallet, transaction, signers);
  const rawTx = signedTx.serialize();

  const txId = await connection.sendRawTransaction(rawTx, TX_SEND_OPTIONS);
  let transactionResponse = null;
  const start = getUnixTs();
  let lastSendTimestamp = getUnixTs();
  let retries = 0;

  while (getUnixTs() - start < timeout) {
    const timestamp = getUnixTs();

    if (retries < sendRetries && timestamp - lastSendTimestamp > sendInterval) {
      lastSendTimestamp = timestamp;
      retries += 1;
      await connection.sendRawTransaction(rawTx, TX_SEND_OPTIONS);
    }

    const response: any = await PromiseAny([
      connection.getTransaction(txId, {
        commitment: 'confirmed',
      }),
      wait(5000),
    ]);
    if (response) {
      transactionResponse = response;
      break;
    }

    await wait(pollInterval);
  }
  return [txId, await validateTransactionResponse(transactionResponse)];
}

async function validateTransactionResponse(transactionResponse: null | TransactionResponse): Promise<any> {
  let _transactionResponse$;

  if (!transactionResponse) {
    return new Error('Transaction was not confirmed');
  }

  if (
    transactionResponse !== null &&
    transactionResponse !== void 0 &&
    (_transactionResponse$ = transactionResponse.meta) !== null &&
    _transactionResponse$ !== void 0 &&
    _transactionResponse$.err
  ) {
    console.log(_transactionResponse$.err);
    return new Error(_transactionResponse$.err.toString());
  }

  return transactionResponse;
}

export async function sendAllTransaction(
  connection: Connection,
  wallet: any,
  transactions: Transaction[],
  signers: Array<Keypair> = []
) {
  const signedTransactions = await signAllTransaction(connection, wallet, transactions, signers);
  const txIds = [];
  for (const signedTransaction of signedTransactions) {
    txIds.push(await sendSignedTransaction(connection, signedTransaction));
  }
  return txIds;
}

async function getFilteredTokenAccountsByOwner(
  connection: Connection,
  programId: PublicKey,
  mint: PublicKey
): Promise<{ context: any; value: [] }> {
  const resp = await (connection as any)._rpcRequest('getTokenAccountsByOwner', [
    programId.toBase58(),
    {
      mint: mint.toBase58(),
    },
    {
      encoding: 'jsonParsed',
    },
  ]);
  if (resp.error) {
    throw new Error(resp.error.message);
  }
  return resp.result;
}

export async function getOneFilteredTokenAccountsByOwner(
  connection: Connection,
  owner: PublicKey,
  mint: PublicKey
): Promise<string> {
  try {
    const tokenAccountList1 = await getFilteredTokenAccountsByOwner(connection, owner, mint);
    const tokenAccountList: any = tokenAccountList1.value.map((item: any) => {
      return item.pubkey;
    });
    let tokenAccount = '';
    for (const item of tokenAccountList) {
      if (item !== null) {
        tokenAccount = item;
      }
    }
    return tokenAccount;
  } catch {
    return '';
  }
  return '';
}

export function getTransactionSize(transaction: Transaction, signers: any = [], hasWallet = true) {
  const signData = transaction.serializeMessage();
  const signatureCount: number[] = [];
  encodeLength(signatureCount, signers.length);
  const transactionLength = signatureCount.length + (signers.length + (hasWallet ? 1 : 0)) * 64 + signData.length;
  return transactionLength;
}

function encodeLength(bytes: Array<number>, len: number) {
  let rem_len = len;
  for (;;) {
    let elem = rem_len & 0x7f;
    rem_len >>= 7;
    if (rem_len === 0) {
      bytes.push(elem);
      break;
    } else {
      elem |= 0x80;
      bytes.push(elem);
    }
  }
}

export async function sendAndConfirmAllTransaction(
  connection: Connection,
  wallet: any,
  transactions: Transaction[],
  signers: Array<Keypair> = [],
  timeout = 120_000,
  sendRetries = 40,
  sendInterval = 2000,
  pollInterval = 500
): Promise<Map<string, any>> {
  const signedTxs = await signAllTransaction(connection, wallet, transactions, signers);
  const result: Map<string, any> = new Map();
  for (const signedTx of signedTxs) {
    const rawTx = signedTx.serialize();

    const txId = await connection.sendRawTransaction(rawTx, TX_SEND_OPTIONS);
    let transactionResponse = null;
    const start = getUnixTs();
    let lastSendTimestamp = getUnixTs();
    let retries = 0;

    while (getUnixTs() - start < timeout) {
      const timestamp = getUnixTs();

      if (retries < sendRetries && timestamp - lastSendTimestamp > sendInterval) {
        lastSendTimestamp = timestamp;
        retries += 1;
        await connection.sendRawTransaction(rawTx, TX_SEND_OPTIONS);
      }

      const response: any = await PromiseAny([
        connection.getTransaction(txId, {
          commitment: 'confirmed',
        }),
        wait(5000),
      ]);
      if (response) {
        transactionResponse = response;
        break;
      }
      await wait(pollInterval);
    }
    result.set(txId, transactionResponse);
  }
  return result;
}
