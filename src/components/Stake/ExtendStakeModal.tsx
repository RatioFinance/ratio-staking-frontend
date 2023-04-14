import React, { useEffect, useMemo, useState, useContext } from 'react';
import { Modal } from 'react-bootstrap';
import { IoMdClose } from 'react-icons/io';
import { ThemeContext } from '../../contexts/ThemeContext';
import StakeFill from '../../assets/images/stake-fill.svg';
import { StakeStatBox } from './stakeStatBox';

const ExtendStakeModal = ({
  formData,
  setFormData,
  stakeData,
  setStakeData,
  alreadyStakedData,
  onClickExtend,
}: any) => {
  const theme = useContext(ThemeContext);
  const { darkMode } = theme.state;
  const [show, setShow] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [didMount, setDidMount] = useState(false);
  const [extraDays, setExtraDays] = useState(0);
  const [totalUnstakeDays, setTotalExtendDays] = useState(alreadyStakedData.durationDays);
  const [errorString, setErrorString] = useState<string>();

  useEffect(() => {
    setDidMount(true);
    return () => setDidMount(false);
  }, []);

  useEffect(() => {
    if (!show) {
      setExtraDays(0);
      setFormData((formData) => ({
        ...formData,
        extraUnstakeDays: 0,
      }));
    }
    setStakeData((stakeData) => ({
      ...stakeData,
      extendMode: show,
    }));
  }, [show]);

  if (!didMount) {
    return null;
  }

  const onChangeUnstakeDaysValue = (value) => {
    let extraUnstakeDays = Number.parseInt(value);
    if (isNaN(extraUnstakeDays)) extraUnstakeDays = 0;
    const total = extraUnstakeDays + alreadyStakedData.durationDays;
    setTotalExtendDays(total);
    setExtraDays(extraUnstakeDays);
    setFormData((formData) => ({
      ...formData,
      extraUnstakeDays,
    }));
    if (total > 365) {
      setButtonDisabled(true);
      setErrorString('Maximum unstake period is 365 days');
    } else if (extraUnstakeDays === 0) {
      setButtonDisabled(true);
      setErrorString('');
    } else {
      setButtonDisabled(false);
      setErrorString('');
    }
  };

  return (
    <div className="">
      <div
        onClick={() => setShow(!show)}
        className="flex gap-2 text-sm font-normal text-orange-500 underline cursor-pointer hover:opacity-80"
      >
        <span>Extend your unstake period.</span>
      </div>
      <Modal
        show={show}
        onHide={() => {
          setButtonDisabled(true);
          setShow(false);
        }}
        onEntered={() => {
          //   setAmountValue(0);
          //   setDepositAmount('');
          //   setDepositStatus(false);
          setButtonDisabled(false);
        }}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        data-theme={darkMode ? 'dark' : 'light'}
        className={darkMode ? 'dark' : 'light'}
      >
        <Modal.Header className="flex flex-col p-0 border-b rounded-tl-xl rounded-tr-xl bg-white-900 dark:bg-slate-700 border-white-500 dark:border-gray-600">
          <div className="w-full py-6 pb-0 mt-4">
            <IoMdClose
              size={32}
              className="absolute cursor-pointer top-12 right-10 hover:opacity-75 dark:text-white-900"
              onClick={() => {
                setButtonDisabled(true);
                setShow(false);
              }}
            />
            <div className="flex w-100 items-center px-10">
              <img src={StakeFill} />
              <p className="ml-4 text-2xl font-medium font-poppins dark:text-white-900">Extend Unstake Period</p>
            </div>
            <div className="flex flex-col gap-1 w-full mt-6 px-10 py-3 bg-slate-100 dark:bg-slate-800 border-t border-b border-white-400 dark:border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-200 font-poppins dark:text-white-900">Current Unstake Period:</p>
                <p className="text-sm text-gray-200 font-poppins dark:text-white-900">
                  {alreadyStakedData.durationDays.toFixed()} Days
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-200 font-poppins font-regular dark:text-white-900">Days Added:</p>
                <div className="flex items-center border rounded-sm border-white-400 bg-white-700 dark:bg-gray-200 dark:border-gray-600">
                  <input
                    value={extraDays}
                    onChange={(e) => onChangeUnstakeDaysValue(e.target.value)}
                    className="w-8 py-1 text-sm font-medium text-center text-gray-100 border-r rounded-tl-sm rounded-bl-sm bg-white-900 dark:bg-gray-800 dark:text-white-900 focus:outline-none rouneded-xl border-white-500 dark:border-gray-600 font-poppins"
                  />
                  <p className="px-2 text-sm text-gray-200 font-poppins dark:text-white-900"> Days</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-200 font-poppins font-regular dark:text-white-900">
                  New Unstake Period:
                </p>
                <p className="text-sm text-gray-200 font-poppins dark:text-white-900">
                  {totalUnstakeDays.toFixed()} Days
                </p>
              </div>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className="flex flex-col px-10 py-6 pb-10 rounded-bl-xl rounded-br-xl bg-white dark:bg-slate-700">
          <div className="flex justify-between gap-5">
            <StakeStatBox title="$RATIO" stat={alreadyStakedData.amount.toFixed(2)} />
            <StakeStatBox title="Multiplier" stat={stakeData.multiplier.toFixed(2)} />
            <StakeStatBox title="xRATIO" stat={stakeData.xRatio.toFixed(2)} />
          </div>
          <div className="mt-3">
            <p className="text-sm font-poppins text-red-600 dark:text-red-500">{errorString}</p>
          </div>
          <div className="mt-4">
            <button
              disabled={buttonDisabled}
              onClick={() => {
                setShow(false);
                onClickExtend();
              }}
              className="h-14 w-full p-3 text-base font-medium text-white rounded-lg disabled:bg-slate-500 disabled:bg-none disabled:opacity-100 bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 font-poppins hover:opacity-90"
            >
              Confirm Extend
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ExtendStakeModal;
