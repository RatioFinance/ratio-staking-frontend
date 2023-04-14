import { SignatureResult } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import React, { useEffect, useState } from 'react';
import { RATIO_MINT_KEY } from '../constants';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

import {
  getATAKey,
  getFundingPDA,
  getReflectionPDA,
  getRewardPDA,
  getRewardVaultPDA,
  getSettingsPDA,
  getStakePDA,
  getStakingVaultPDA,
} from '../utils/ratio-pda';
import { getRewardsProgramInstance, getStakeProgramInstance } from '../utils/rf-web3';
import { getAccount } from '@solana/spl-token-v2';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { stakeState } from '../components/Stake/utils/types';
import { sleep } from '../utils/utils';

interface RFStateConfig {
  subscribeTx: (txHash: string, onTxSent?: any, onTxSuccess?: any, onTxFailed?: any) => void;
  stakeState: stakeState;
  toggleStakeRefresh: () => void;
}

const RFStateContext = React.createContext<RFStateConfig>({
  subscribeTx: () => {},
  stakeState: null,
  toggleStakeRefresh: () => {},
});

export function RFStateProvider({ children = undefined as any }) {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [stakeState, setStakeState] = useState<stakeState>(null);

  const [stakeRefresh, setStakeRefresh] = useState(false);

  const subscribeTx = async (txHash: string, onTxSent: any, onTxSuccess: any, onTxFailed: any) => {
    if (txHash) {
      onTxSent();
      console.log('Sent tx: ', txHash);
    } else {
      onTxFailed();
      return;
    }
    // connection.confirmTransaction();
    connection.onSignature(
      txHash,
      async function (signatureResult: SignatureResult) {
        console.log('onProcessed');
        if (!signatureResult.err) {
          onTxSuccess();
        } else {
          onTxFailed();
        }
      },
      'processed'
    );
  };

  const updateStakeState = async () => {
    const stakeProgram = await getStakeProgramInstance(connection, wallet);
    const rewardProgram = await getRewardsProgramInstance(connection, wallet);

    const mint = new anchor.web3.PublicKey(RATIO_MINT_KEY);
    const reflectionPDA = getReflectionPDA();
    const fundingPDA = getFundingPDA();
    const rewardVaultPDA = getRewardVaultPDA();
    const settingsPDA = getSettingsPDA();
    const reflection = await rewardProgram.account.reflectionAccount.fetchNullable(reflectionPDA);
    const settings = await stakeProgram.account.settingsAccount.fetchNullable(settingsPDA);

    if (wallet?.connected) {
      const rewardPDA = getRewardPDA(wallet?.publicKey);
      const stakeVaultPDA = getStakingVaultPDA(wallet?.publicKey);
      const stakePDA = getStakePDA(wallet?.publicKey);
      let stakeVault;
      try {
        const stake = await stakeProgram.account.stakeAccount.fetchNullable(stakePDA);
        try {
          stakeVault = await getAccount(connection, stakeVaultPDA);
        } catch (e) {
          stakeVault = null;
        }

        const accounts = {
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          stakingProgram: stakeProgram.programId,
          rewardsProgram: rewardProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          authority: wallet.publicKey,
          payer: wallet.publicKey,
          mint: mint,
          user: getATAKey(wallet.publicKey, mint),
          reflection: reflectionPDA,
          reward: rewardPDA,
          stake: stakePDA,
          settings: settingsPDA,
          funding: fundingPDA,
          rewardVault: rewardVaultPDA,
          vault: stakeVaultPDA,
        };

        setStakeState(() => ({
          stakeProgram,
          rewardProgram,
          reflection,
          settings,
          reward: null,
          stake,
          accounts,
          stakeVault,
        }));

        try {
          const reward = await rewardProgram.account.rewardAccount.fetchNullable(rewardPDA);
          setStakeState(() => ({
            stakeProgram,
            rewardProgram,
            reflection,
            settings,
            stake,
            accounts,
            stakeVault,
            reward,
          }));
        } catch (e) {
          console.log('No Reward Account found for the user');
          setStakeState(() => ({
            stakeProgram,
            rewardProgram,
            reflection,
            settings,
            stake,
            accounts,
            stakeVault,
            reward: null,
          }));
        }
        return;
      } catch (e) {
        console.log('No Staking Records found for the user');
        setStakeState((prev) => ({
          ...prev,
          stake: null,
        }));
        return;
      }
    }
    setStakeState(() => ({
      stakeProgram,
      rewardProgram,
      reflection,
      settings,
      accounts: null,
      reward: null,
      stake: null,
      stakeVault: null,
    }));
  };

  useEffect(() => {
    (async () => {
      console.log('------Updating Stake State-------');
      await updateStakeState();
      await sleep(800);
      console.log('******Updated Stake State******');
    })();
  }, [wallet, stakeRefresh]);

  return (
    <RFStateContext.Provider
      value={{
        subscribeTx,
        stakeState,
        toggleStakeRefresh: () => setStakeRefresh((prev) => !prev),
      }}
    >
      {children}
    </RFStateContext.Provider>
  );
}

export function useSubscribeTx() {
  const context = React.useContext(RFStateContext);

  return context.subscribeTx;
}

export function useStakeInfo() {
  const context = React.useContext(RFStateContext);

  return {
    stakeState: context.stakeState,
    toggleStakeRefresh: context.toggleStakeRefresh,
  };
}
