import { useEffect, useMemo, useState } from 'react';
import StakeFill from '../../assets/images/stake-fill.svg';
import { useStakeInfo, useSubscribeTx } from '../../contexts/state';
import CustomInput from '../CustomInput';
import UnstakePeriodPopover from './unstakePopover';
import { MULTIPLIER_SECONDS, RATIO_MINT_DECIMALS, RATIO_MINT_KEY, SECONDS_PER_DAY } from '../../constants/constants';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import LoadingSpinner from '../../atoms/LoadingSpinner';
import { StakeStatBox } from './stakeStatBox';
import { getAtaTokenBalanceByOwner, isWalletApproveError, toUiAmount } from '../../utils/utils';
import BN from 'bn.js';
import UnstakeModal from './UnstakeModal';
import {
  claim,
  increaseStake,
  unStake,
  stake,
  extendStake,
  restakeStake,
  withdrawStake,
  withdrawAndCloseStake,
  initStake,
  resetFundingTime,
  updateFunding,
  sync,
  addFunding,
} from './utils';
import { toast } from 'react-toastify';
import ExtendStakeModal from './ExtendStakeModal';
import Clock from './Clock';
import { IoArrowBack } from 'react-icons/io5';
import { fetchAxiosWithRetry } from '../../utils/utils';

const StakeComponent = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { stakeState, toggleStakeRefresh } = useStakeInfo();
  const subscribeTx = useSubscribeTx();
  const [inputValue, setInputValue] = useState(0);

  const loading = false;
  const [executeLoading, setExecuteLoading] = useState(false);
  const [executeEnabled, setExecuteEnabled] = useState(false);
  const [errorString, setErrorString] = useState<string>();
  const [localRefresh, setLocalRefresh] = useState(false);
  const [ratioBalance, setRatioBalance] = useState(0);
  const [usdValue, setUsdValue] = useState(0);

  const [formData, setFormData] = useState({
    amount: 0,
    unstakeDays: 14,
    extraUnstakeDays: 0,
  });
  const [stakeData, setStakeData] = useState({
    multiplier: 0,
    xRatio: 0,
    dailyRewards: 0,
    apy: 0,
    userHasStakedBefore: false,
    topupStakeMode: false,
    unstakeMode: false,
    extendMode: false,
    fullWithdrawMode: false,
    timeOfFullUnstake: 0,
    withdrawableBalance: 0,
    withdrawnBalance: 0,
  });

  const [alreadyStakedData, setAlreadyStakedData] = useState({
    amount: 0,
    multiplier: 0,
    xRatio: 0,
    durationDays: 0,
    pendingRewards: 0,
  });

  useEffect(() => {
    let totalAmount = formData.amount; //temp value for adding up total amount in topUp mode
    // Check if stake account exists
    if (stakeState?.stake) {
      // Check if on unstake mode
      if (stakeState.stake.timeUnstake.toNumber() !== 0) {
        const timeOfFullUnstake =
          (stakeState.stake.duration.toNumber() + stakeState.stake.timeUnstake.toNumber()) * 1000;
        const nowInSeconds = Date.now() / 1000;
        const emission = stakeState.stake.amount.toNumber() / stakeState.stake.duration.toNumber();
        const timeElapsed = nowInSeconds - stakeState.stake.timeUnstake.toNumber();
        const tokensReleased = timeElapsed * emission;
        const withdrawn = stakeState.stake.amount.toNumber() - Number(stakeState.stakeVault.amount);
        const withdrawableBalance = toUiAmount(
          Math.min(tokensReleased - withdrawn, Number(stakeState.stakeVault.amount)),
          RATIO_MINT_DECIMALS
        );
        if (timeOfFullUnstake < nowInSeconds * 1000) {
          setStakeData((stakeData) => ({
            ...stakeData,
            fullWithdrawMode: true,
          }));
        }
        setStakeData((stakeData) => ({
          ...stakeData,
          unstakeMode: true,
          timeOfFullUnstake: timeOfFullUnstake,
          withdrawableBalance,
          withdrawnBalance: toUiAmount(withdrawn, RATIO_MINT_DECIMALS),
        }));
      } else {
        setStakeData((stakeData) => ({
          ...stakeData,
          unstakeMode: false,
        }));
      }
      // Check if on topup mode
      if (stakeData.topupStakeMode) {
        // If topUp, increase amount by already staked amount
        totalAmount += alreadyStakedData.amount;
      }
      const alreadyStakedAmount = toUiAmount(stakeState.stake.amount.toNumber(), RATIO_MINT_DECIMALS);
      const alreadyStakedDurationDays = Math.trunc(stakeState.stake.duration.toNumber() / SECONDS_PER_DAY);
      const alreadyStakedxRatio = toUiAmount(stakeState.stake.xnos.toNumber(), RATIO_MINT_DECIMALS);
      let totalXnos = parseFloat(stakeState.reflection.totalXnos.toString());
      const timeElapsedFromLastFunding = Date.now() / 1000 - stakeState.reflection.lastFundingTime.toNumber();
      const estimatedFunding = timeElapsedFromLastFunding * stakeState.reflection.fundingRate;
      totalXnos += estimatedFunding;

      const rate = BN.min(stakeState.reflection.totalReflection.div(new BN(totalXnos)), stakeState.reflection.rate);
      const pendingRewards = toUiAmount(
        stakeState.reward?.reflection.div(rate).sub(stakeState.reward?.xnos).toNumber(),
        RATIO_MINT_DECIMALS
      );
      setAlreadyStakedData((alreadyStakedData) => ({
        ...alreadyStakedData,
        amount: alreadyStakedAmount,
        durationDays: alreadyStakedDurationDays,
        xRatio: alreadyStakedxRatio,
        pendingRewards,
      }));
      setStakeData((stakeData) => ({
        ...stakeData,
        userHasStakedBefore: true,
      }));
    } else {
      setStakeData((stakeData) => ({
        ...stakeData,
        userHasStakedBefore: false,
        unstakeMode: false,
      }));
    }

    let unstakeTime: number;
    if (stakeData?.userHasStakedBefore) {
      unstakeTime = stakeState.stake?.duration.toNumber();
      if (!stakeData.topupStakeMode) {
        totalAmount = alreadyStakedData.amount;
      }
      totalAmount = totalAmount === 0 ? alreadyStakedData.amount : totalAmount;
      const multiplier = unstakeTime / MULTIPLIER_SECONDS;
      const xRatio = totalAmount + totalAmount * multiplier;
      setAlreadyStakedData((alreadyStakedData) => ({
        ...alreadyStakedData,
        multiplier: 1 + multiplier,
        xRatio,
      }));
      if (stakeData.extendMode) {
        // Extend Stake Mode
        unstakeTime = (alreadyStakedData.durationDays + formData.extraUnstakeDays) * SECONDS_PER_DAY;
        totalAmount = alreadyStakedData.amount;
      }
    } else {
      unstakeTime = formData.unstakeDays * SECONDS_PER_DAY;
    }

    const multiplier = unstakeTime / MULTIPLIER_SECONDS;
    const xRatio = totalAmount + totalAmount * multiplier;
    if (stakeState?.reflection) {
      let totalXnos = parseFloat(stakeState.reflection.totalXnos.toString());
      if (stakeState.stake && stakeState.stake.xnos) {
        totalXnos -= stakeState.stake.xnos.toNumber();
      }
      const timeElapsedFromLastFunding = Date.now() / 1000 - stakeState.reflection.lastFundingTime.toNumber();
      const estimatedFunding = timeElapsedFromLastFunding * stakeState.reflection.fundingRate;
      totalXnos += estimatedFunding;
      const estimatedDailyRewards =
        ((xRatio * 1e6) / (totalXnos + xRatio * 1e6)) * ((stakeState.reflection.fundingRate / 1e6) * SECONDS_PER_DAY);
      const apy = ((estimatedDailyRewards * 365) / totalAmount) * 100;
      setStakeData((stakeData) => ({
        ...stakeData,
        apy,
        dailyRewards: estimatedDailyRewards,
      }));
    }
    setStakeData((stakeData) => ({
      ...stakeData,
      multiplier: multiplier + 1,
      xRatio,
    }));
  }, [wallet, formData, stakeState, stakeState?.reward, localRefresh]);

  const toggleRefresh = () => {
    const timeout = setTimeout(() => {
      toggleStakeRefresh();
      setLocalRefresh((refresh) => !refresh);
    }, 1000);
    return () => {
      clearTimeout(timeout);
    };
  };

  useEffect(() => {
    (async () => {
      if (wallet.publicKey) {
        const ratioPrice = (
          await fetchAxiosWithRetry('https://api.coingecko.com/api/v3/simple/price?ids=ratio-finance&vs_currencies=usd')
        ).data['ratio-finance']['usd'];
        const ratioBalance = (await getAtaTokenBalanceByOwner(connection, wallet.publicKey!, RATIO_MINT_KEY)) / 1e6;
        const usdValue = ratioBalance * ratioPrice;
        setRatioBalance(ratioBalance);
        setUsdValue(usdValue);
      }
    })();
    const interval = setInterval(async () => {
      setLocalRefresh((refresh) => !refresh);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [connection, wallet, wallet.publicKey]);

  const onChangeAmountValue = (value) => {
    const parsedValue = value.replace(',', '.').replace(/[^0-9.]/g, '');
    let amount = Number.parseFloat(parsedValue);
    if (isNaN(amount)) amount = 0.0;
    if (amount === 0) {
      setExecuteEnabled(false);
    } else {
      setExecuteEnabled(true);
    }
    if (amount <= ratioBalance) {
      setInputValue(parsedValue);
      setFormData((formData) => ({
        ...formData,
        amount,
      }));
    }
  };

  const onChangeUnstakeDaysValue = (value) => {
    let unstakeDays = Number.parseInt(value);
    if (isNaN(unstakeDays)) unstakeDays = 0;
    setFormData((formData) => ({
      ...formData,
      unstakeDays,
    }));
    if (unstakeDays < 14) {
      setExecuteEnabled(false);
      setErrorString('Minimum unstake period is 14 days');
    } else if (unstakeDays > 365) {
      setExecuteEnabled(false);
      setErrorString('Maximum unstake period is 365 days');
    } else {
      setExecuteEnabled(true);
      setErrorString('');
    }
  };

  const onClickAddToStake = () => {
    setStakeData((stakeData) => ({
      ...stakeData,
      topupStakeMode: true,
    }));
  };

  const onClickBackToStakedScreen = () => {
    setStakeData((stakeData) => ({
      ...stakeData,
      topupStakeMode: false,
    }));
  };

  const onClickClaim = async () => {
    await claim(stakeState, wallet)
      .then((txHash: string) => {
        subscribeTx(
          txHash,
          () => toast.info('Claim Transaction Sent'),
          () => toast.success('Claim Confirmed.'),
          () => toast.error('Claim Transaction Failed')
        );
      })
      .catch((e) => {
        console.log(e);
        if (isWalletApproveError(e)) toast.warn('Wallet is not approved!');
        else toast.error('Transaction Error!');
      })
      .finally(() => {
        console.log('Toggling Stake Refresh');
        toggleRefresh();
      });
  };

  const onClickIncreaseStake = async () => {
    await increaseStake(stakeState, formData.amount, wallet)
      .then((txHash: string) => {
        subscribeTx(
          txHash,
          () => toast.info('Increase Stake Transaction Sent'),
          () => toast.success('Increase Stake Confirmed.'),
          () => toast.error('Increase Stake Transaction Failed')
        );
      })
      .catch((e) => {
        console.log(e);
        if (isWalletApproveError(e)) toast.warn('Wallet is not approved!');
        else toast.error('Transaction Error!');
      })
      .finally(() => {
        toggleRefresh();
        setStakeData((stakeData) => ({
          ...stakeData,
          topupStakeMode: false,
        }));
      });
  };

  const onClickUnStake = async () => {
    await unStake(stakeState, wallet)
      .then((txHash: string) => {
        subscribeTx(
          txHash,
          () => toast.info('Unstake Transaction Sent'),
          () => {
            toast.success('Unstake Confirmed.');
            setStakeData((stakeData) => ({
              ...stakeData,
              unstakeMode: true,
              timeOfFullUnstake:
                (stakeState.stake.duration.toNumber() + stakeState.stake.timeUnstake.toNumber()) * 1000,
            }));
          },
          () => toast.error('Unstake Transaction Failed')
        );
      })
      .catch((e) => {
        console.log(e);
        if (isWalletApproveError(e)) toast.warn('Wallet is not approved!');
        else toast.error('Transaction Error!');
      })
      .finally(() => {
        toggleRefresh();
      });
  };

  const onClickStake = async () => {
    await stake(stakeState, formData.amount, formData.unstakeDays, wallet)
      .then((txHash: string) => {
        subscribeTx(
          txHash,
          () => toast.info('Stake Transaction Sent'),
          () => {
            toast.success('Stake Confirmed.');
            setStakeData((stakeData) => ({
              ...stakeData,
              userHasStakedBefore: true,
            }));
          },
          () => toast.error('Stake Transaction Failed')
        );
      })
      .catch((e) => {
        console.log(e);
        if (isWalletApproveError(e)) toast.warn('Wallet is not approved!');
        else toast.error('Transaction Error!');
      })
      .finally(() => {
        toggleRefresh();
      });
  };

  const onClickExtend = async () => {
    await extendStake(stakeState, formData.extraUnstakeDays, wallet)
      .then((txHash: string) => {
        subscribeTx(
          txHash,
          () => toast.info('Extend Transaction Sent'),
          () => {
            toast.success('Extend Confirmed.');
            setFormData((formData) => ({
              ...formData,
              extraUnstakeDays: 0,
            }));
          },
          () => toast.error('Stake Transaction Failed')
        );
      })
      .catch((e) => {
        console.log(e);
        if (isWalletApproveError(e)) toast.warn('Wallet is not approved!');
        else toast.error('Transaction Error!');
      })
      .finally(() => {
        toggleRefresh();
      });
  };

  const onClickRestake = async () => {
    await restakeStake(stakeState, wallet)
      .then((txHash: string) => {
        subscribeTx(
          txHash,
          () => toast.info('Restake Transaction Sent'),
          () => {
            toast.success('Restake Confirmed.');
            setStakeData((stakeData) => ({
              ...stakeData,
              unstakeMode: false,
            }));
          },
          () => toast.error('Stake Transaction Failed')
        );
      })
      .catch((e) => {
        console.log(e);
        if (isWalletApproveError(e)) toast.warn('Wallet is not approved!');
        else toast.error('Transaction Error!');
      })
      .finally(() => {
        toggleRefresh();
      });
  };

  const onClickWithdraw = async () => {
    if (stakeData.fullWithdrawMode) {
      await withdrawAndCloseStake(stakeState, wallet)
        .then((txHash: string) => {
          subscribeTx(
            txHash,
            () => toast.info('Withdraw & Close Transaction Sent'),
            () => {
              toast.success('Withdraw & Close Transaction Confirmed.');
            },
            () => toast.error('Withdraw & Close Transaction Failed')
          );
        })
        .catch((e) => {
          console.log(e);
          if (isWalletApproveError(e)) toast.warn('Wallet is not approved!');
          else toast.error('Transaction Error!');
        })
        .finally(() => {
          toggleRefresh();
        });
    } else {
      await withdrawStake(stakeState, wallet)
        .then((txHash: string) => {
          subscribeTx(
            txHash,
            () => toast.info('Withdraw Transaction Sent'),
            () => {
              toast.success('Withdraw Confirmed.');
            },
            () => toast.error('Withdraw Transaction Failed')
          );
        })
        .catch((e) => {
          console.log(e);
          if (isWalletApproveError(e)) toast.warn('Wallet is not approved!');
          else toast.error('Transaction Error!');
        })
        .finally(() => {
          toggleRefresh();
        });
    }
  };

  // const onClickInit = async () => {
  //   await initStake(stakeState, wallet);
  // };

  // const onClickResetFundingTime = async () => {
  //   await resetFundingTime(stakeState, wallet);
  // };

  // const onClickUpdateFundingRate = async () => {
  //   await updateFunding(stakeState, 0, wallet);
  // };

  // const onClickSync = async () => {
  //   await sync(stakeState, wallet);
  // };

  // const onClickAddFunding = async () => {
  //   await addFunding(stakeState, wallet);
  // };

  return !stakeState ? (
    <div className="flex items-center justify-center min-h-[50vh]">
      <LoadingSpinner className="spinner-border-lg text-primary" />
    </div>
  ) : (
    <div className="mx-6 xl:mx-14 min-h-[70vh] pb-20 dark:bg-gray-900 bg-white-900 flex flex-col items-center ">
      <p className="mb-6 text-3xl font-medium text-gray-200 font-poppins dark:text-white-900">Stake</p>
      <div className="w-full sm:w-[500px] flex flex-col">
        {stakeData.unstakeMode ? (
          // Unstaked Mode
          <div className="border border-solid border-white-400 rounded-lg ">
            <div className="p-8">
              <div className="flex w-100 items-center">
                <img src={StakeFill} />
                <p className="ml-4 text-2xl font-medium font-poppins dark:text-white-900">Stake $RATIO</p>
              </div>
              <p className="mt-6 mb-2 text-sm text-gray-200 font-semibold font-poppins dark:text-white-900">
                Your Stake:
              </p>
              <div className="mt-4 flex flex-col sm:flex-row justify-between gap-5">
                <StakeStatBox title="$RATIO" stat={alreadyStakedData.amount.toFixed(2)} />
                <StakeStatBox title="Multiplier" stat={alreadyStakedData.multiplier.toFixed(2)} />
                <StakeStatBox title="xRATIO" stat={alreadyStakedData.xRatio.toFixed(2)} />
              </div>
            </div>
            <div className="px-8 py-5 bg-slate-100 dark:bg-slate-800 border-t border-b border-white-400 dark:border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-200 font-poppins font-regular dark:text-white-900">Unstake Period: </p>
                <div className="flex justify-end gap-3 items-center">
                  <p className="text-sm font-semibold text-gray-200 font-poppins dark:text-white-900">
                    {alreadyStakedData.durationDays.toFixed()}
                  </p>
                </div>
              </div>

              <div className="flex flex-col">
                <p className="mt-3 text-sm text-gray-200 font-semibold font-poppins dark:text-white-900">Time Left:</p>
                <Clock deadline={stakeData.timeOfFullUnstake} />
              </div>
            </div>
            <div className="px-8 py-4 pb-6 flex flex-col gap-3 justify-between">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-200 font-poppins font-regular dark:text-white-900">
                  Unlocked Balance:{' '}
                </p>
                <div className="flex justify-end gap-3 items-center">
                  <p className="text-sm font-semibold text-gray-200 font-poppins dark:text-white-900">
                    {stakeData.withdrawableBalance.toFixed(4)}
                  </p>
                </div>
              </div>
              <div className="flex justify-between gap-5">
                <button
                  disabled={executeLoading}
                  onClick={onClickRestake}
                  className="w-full h-[52px] py-3 text-base font-medium text-white rounded-lg bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 font-poppins hover:opacity-90"
                >
                  Restake
                </button>
                <button
                  disabled={executeLoading}
                  onClick={onClickWithdraw}
                  className="w-full h-[52px] py-3 text-base font-medium text-blue-300 border-2 border-blue-300 rounded-lg disabled:opacity-60 disabled:text-gray-100 disabled:bg-none disabled:border-2 disabled:border-gray-500  to-blue-400 font-poppins hover:opacity-90"
                >
                  {stakeData.fullWithdrawMode ? 'Withdraw & Close' : 'Withdraw'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {stakeData.userHasStakedBefore && !stakeData.topupStakeMode ? (
              // Already Staked Screen
              <div className="flex flex-col gap-3">
                <div className="border border-solid border-white-400 rounded-lg ">
                  <div className="p-8">
                    <div className="flex w-100 items-center">
                      <img src={StakeFill} />
                      <p className="ml-4 text-2xl font-medium font-poppins dark:text-white-900">Stake $RATIO</p>
                    </div>
                    <p className="mt-6 mb-2 text-sm text-gray-200 font-semibold font-poppins dark:text-white-900">
                      Your Stake:
                    </p>
                    <div className="mt-4 flex flex-col sm:flex-row justify-between gap-5">
                      <StakeStatBox title="$RATIO" stat={alreadyStakedData.amount.toFixed(2)} />
                      <StakeStatBox title="Multiplier" stat={alreadyStakedData.multiplier.toFixed(2)} />
                      <StakeStatBox title="xRATIO" stat={alreadyStakedData.xRatio.toFixed(2)} />
                    </div>
                  </div>
                  <div className="px-8 py-5 bg-slate-100 dark:bg-slate-800 border-t border-b border-white-400 dark:border-gray-200">
                    <div className="flex justify-between items-center">
                      <p className="text-base text-gray-200 font-poppins font-regular dark:text-white-900">
                        $RATIO Earned:{' '}
                      </p>
                      <div className="flex justify-end gap-3 items-center">
                        <button
                          onClick={onClickClaim}
                          className="rounded-xl border border-green-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-normal text-green-400 cursor-pointer hover:text-white-900 hover:bg-green-400 dark:hover:text-green-400 dark:hover:opacity-70"
                        >
                          <span>Claim</span>
                        </button>
                        <p className="text-base font-semibold text-gray-200 font-poppins dark:text-white-900 transition duration-200 ease-in-out">
                          {alreadyStakedData.pendingRewards ? alreadyStakedData.pendingRewards.toFixed(4) : 0}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="px-8 pt-7 pb-5">
                    <div className="flex justify-between gap-5">
                      <button
                        disabled={executeLoading}
                        onClick={onClickAddToStake}
                        className="w-full h-[52px] py-3 text-base font-medium text-white rounded-lg bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 font-poppins hover:opacity-90"
                      >
                        Add to Stake
                      </button>
                      <div className="w-full flex flex-col">
                        <UnstakeModal
                          formData={formData}
                          stakeData={stakeData}
                          alreadyStakedData={alreadyStakedData}
                          onClickUnstake={onClickUnStake}
                        />
                        <p className="mt-2 text-center text-sm text-gray-200 font-poppins dark:text-white-900">
                          Unstake period of <strong>{alreadyStakedData.durationDays.toFixed()}</strong> days
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-1 py-4 bg-gradient-to-r dark:from-gray-200 from-orange-200/60 to-orange-200/30 dark:to-gray-200/30 font-poppins underline-offset-4">
                    {alreadyStakedData.durationDays < 365 ? (
                      <ExtendStakeModal
                        formData={formData}
                        setFormData={setFormData}
                        stakeData={stakeData}
                        setStakeData={setStakeData}
                        alreadyStakedData={alreadyStakedData}
                        onClickExtend={onClickExtend}
                      />
                    ) : (
                      <span className="text-sm font-normal text-gray-100 dark:text-gray-50">
                        Maximum unstake duration selected!
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-1 px-4 flex flex-col gap-3 items-center font-poppins">
                  <div className="w-full flex pb-2 justify-between text-sm text-gray-100 border-b border-gray-700/30">
                    Stake Account
                    <a
                      href={`https://explorer.solana.com/address/${stakeState?.accounts?.stake?.toString()}/anchor-account`}
                      className="hover:no-underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <div className="text-blue-300/70 cursor-pointer hover:text-blue-300">View on Solana Explorer</div>
                    </a>
                  </div>
                  <div className="w-full flex pb-2 justify-between text-sm text-gray-100 border-b border-gray-700/30">
                    Stake Vault
                    <a
                      href={`https://explorer.solana.com/address/${stakeState?.accounts?.vault?.toString()}`}
                      className="hover:no-underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <div className="text-blue-300/70 cursor-pointer hover:text-blue-300">View on Solana Explorer</div>
                    </a>
                  </div>
                  <div className="w-full flex justify-between text-sm text-gray-100">
                    Reward Account
                    <a
                      href={`https://explorer.solana.com/address/${stakeState?.accounts?.reward?.toString()}/anchor-account`}
                      className="hover:no-underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <div className="text-blue-300/70 cursor-pointer hover:text-blue-300">View on Solana Explorer</div>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              // First Time Staking or Topup
              <div className="border border-solid border-white-400 rounded-lg">
                <div className="p-8 pb-0">
                  <div className="flex w-100 items-center">
                    <img src={StakeFill} />
                    <p className="ml-4 text-2xl font-medium font-poppins dark:text-white-900">Stake $RATIO</p>
                  </div>
                </div>
                {/* Show this only for topup mode */}
                {stakeData.topupStakeMode && (
                  <div className="mt-4 px-8 py-3 bg-slate-100 dark:bg-slate-800 border-t border-b border-white-400 dark:border-gray-200">
                    <div className="flex flex-1 justify-between gap-3 items-center">
                      <IoArrowBack
                        size={20}
                        className="-ml-5 cursor-pointer hover:opacity-75 dark:text-white-900 text-gray-200"
                        onClick={onClickBackToStakedScreen}
                      />
                      <div className="w-full flex justify-between items-center">
                        <p className="text-base text-gray-200 font-poppins font-regular dark:text-white-900">
                          Already Staked:
                        </p>
                        <p className="text-base font-semibold text-gray-200 font-poppins dark:text-white-900">
                          {alreadyStakedData.amount.toFixed(2)} $RATIO
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="px-8 py-8 border-b border-white-400 dark:border-gray-200">
                  <p className="mb-2 text-sm text-gray-200 font-regular font-poppins dark:text-white-900">
                    How much <strong>$RATIO</strong> would you like to stake?
                  </p>
                  <CustomInput
                    appendStr="Max"
                    initValue={0}
                    appendValueStr={ratioBalance.toFixed(2)}
                    tokenStr="RATIO"
                    onTextChange={(value) => {
                      onChangeAmountValue(value);
                    }}
                    maxValue={Number(ratioBalance.toFixed(2))}
                    value={inputValue}
                  />
                  <div className="flex flex-col sm:flex-row justify-between items-center">
                    <div className="w-full sm:w-auto px-2 sm:px-0 flex justify-between sm:justify-start gap-1 mt-1">
                      <p className="text-base text-gray-200 font-poppins font-regular dark:text-white-900">
                        USD Value:{' '}
                      </p>
                      <p className="text-base font-medium text-gray-200 font-poppins dark:text-white-900">
                        {usdValue.toFixed(2)}
                      </p>
                    </div>
                    <div className="w-full sm:w-auto px-2 sm:px-0 flex justify-between sm:justify-end gap-1 mt-1">
                      <p className="text-base text-gray-200 font-poppins font-regular dark:text-white-900">Balance: </p>
                      <p className="text-base font-medium text-gray-200 font-poppins dark:text-white-900">
                        {ratioBalance.toFixed(2)} $RATIO
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-center">
                    <p className="text-base text-gray-200 font-poppins font-regular dark:text-white-900">APY: </p>
                    <p className="text-base font-medium text-gray-200 font-poppins dark:text-white-900">
                      {stakeData.apy ? stakeData.apy.toFixed(1) : '00'}%
                    </p>
                  </div>
                  {/* Hide on topup mode */}
                  {!stakeData.topupStakeMode && (
                    <div className="mt-3 flex justify-between items-center">
                      <p className="text-base text-gray-200 font-poppins font-regular dark:text-white-900">
                        Unstake Period:{' '}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border rounded-sm border-white-400 bg-white-700 dark:bg-gray-200 dark:border-gray-600">
                          <input
                            value={formData.unstakeDays}
                            onChange={(e) => onChangeUnstakeDaysValue(e.target.value)}
                            className="w-8 py-1 text-sm font-medium text-center text-gray-100 border-r rounded-tl-sm rounded-bl-sm bg-white-900 dark:bg-gray-800 dark:text-white-900 focus:outline-none rouneded-xl border-white-500 dark:border-gray-600 font-poppins"
                          />
                          <p className="px-2 text-sm text-gray-200 font-poppins dark:text-white-900">Days</p>
                        </div>
                        <UnstakePeriodPopover />
                      </div>
                    </div>
                  )}

                  <div className="mt-5 flex flex-col sm:flex-row justify-between gap-5">
                    <StakeStatBox title="Multiplier" stat={stakeData.multiplier.toFixed(2)} />
                    <StakeStatBox title="xRATIO" stat={stakeData.xRatio.toFixed(2)} />
                    <StakeStatBox title="Expected Rewards" stat={stakeData.dailyRewards.toFixed(2)} desc="Daily" />
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-poppins text-red-600 dark:text-red-500">{errorString}</p>
                  </div>
                  <div className="mt-5">
                    <button
                      disabled={!executeEnabled || loading || executeLoading}
                      onClick={stakeData.topupStakeMode ? onClickIncreaseStake : onClickStake}
                      className="w-full py-3 text-base font-medium text-white rounded-lg disabled:bg-slate-500 disabled:bg-none disabled:opacity-100 bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 font-poppins hover:opacity-90"
                    >
                      {loading || executeLoading ? (
                        <LoadingSpinner className="spinner-border-lg text-info" />
                      ) : (
                        <span>
                          {wallet.connected
                            ? stakeData.topupStakeMode
                              ? 'Increase Stake'
                              : 'Stake'
                            : 'Connect your wallet'}
                        </span>
                      )}
                    </button>
                    {/* Admin controls */}
                    {/* <button
                      onClick={onClickInit}
                      className="w-full py-3 text-base font-medium text-white rounded-lg disabled:bg-slate-500 disabled:bg-none disabled:opacity-100 bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 font-poppins hover:opacity-90"
                    >
                      Init
                    </button>
                    <button
                      onClick={onClickResetFundingTime}
                      className="w-full py-3 text-base font-medium text-white rounded-lg disabled:bg-slate-500 disabled:bg-none disabled:opacity-100 bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 font-poppins hover:opacity-90"
                    >
                      reset funding time
                    </button>
                    <button
                      onClick={onClickUpdateFundingRate}
                      className="w-full py-3 text-base font-medium text-white rounded-lg disabled:bg-slate-500 disabled:bg-none disabled:opacity-100 bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 font-poppins hover:opacity-90"
                    >
                      Update funding rate
                    </button>
                    <button
                      onClick={onClickAddFunding}
                      className="w-full py-3 text-base font-medium text-white rounded-lg disabled:bg-slate-500 disabled:bg-none disabled:opacity-100 bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 font-poppins hover:opacity-90"
                    >
                      add funding
                    </button> */}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StakeComponent;
