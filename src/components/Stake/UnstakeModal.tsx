import React, { useEffect, useMemo, useState, useContext } from 'react';
import { Modal } from 'react-bootstrap';
import { IoMdClose } from 'react-icons/io';
import { ThemeContext } from '../../contexts/ThemeContext';
import StakeFill from '../../assets/images/stake-fill.svg';
import Button from '../Button';
import { StakeStatBox } from './stakeStatBox';
import warningIcon from '../../assets/images/warning.svg';

const UnstakeModal = ({ formData, stakeData, alreadyStakedData, onClickUnstake }: any) => {
  const theme = useContext(ThemeContext);
  const { darkMode } = theme.state;
  const [show, setShow] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [didMount, setDidMount] = useState(false);

  useEffect(() => {
    setDidMount(true);
    return () => setDidMount(false);
  }, []);

  if (!didMount) {
    return null;
  }

  return (
    <div className="">
      <button
        // disabled={buttonDisabled}
        className="w-full h-[52px] py-3 text-base font-medium text-blue-300 rounded-lg border-2 border-blue-300 font-poppins hover:opacity-80"
        onClick={() => setShow(!show)}
      >
        Unstake
      </button>
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
          <div className="w-full px-10 py-6 mt-4">
            <IoMdClose
              size={32}
              className="absolute cursor-pointer top-12 right-10 hover:opacity-75 dark:text-white-900"
              onClick={() => {
                setButtonDisabled(true);
                setShow(false);
              }}
            />
            <div className="flex w-100 items-center">
              <img src={StakeFill} />
              <p className="ml-4 text-2xl font-medium font-poppins dark:text-white-900">Unstake $RATIO</p>
            </div>
            <p className="mt-6 mb-2 text-sm text-gray-200 font-semibold font-poppins dark:text-white-900">
              Your Stake:
            </p>
            <div className="flex justify-between gap-5">
              <StakeStatBox title="$RATIO" stat={alreadyStakedData.amount.toFixed(2)} />
              <StakeStatBox title="Multiplier" stat={alreadyStakedData.multiplier.toFixed(2)} />
              <StakeStatBox title="xRATIO" stat={alreadyStakedData.xRatio.toFixed(2)} />
            </div>
          </div>
          <div className="w-full px-10 py-3 bg-slate-100 dark:bg-slate-800 border-t border-b border-white-400 dark:border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-base text-gray-200 font-poppins font-regular dark:text-white-900">Days to unstake:</p>
              <p className="text-base font-semibold text-gray-200 font-poppins dark:text-white-900">
                {alreadyStakedData.durationDays.toFixed()} Days
              </p>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className="flex flex-col px-10 py-6 pb-10 rounded-bl-xl rounded-br-xl bg-white dark:bg-slate-700">
          <div className="p-3 text-sm rounded-lg border border-[#F48C57] text-[#F48C57] bg-orange-50 dark:bg-slate-600">
            <div className="flex items-center gap-3 s">
              <img src={warningIcon} alt="highriskIcon" className="mt-1 w-12" />
              <p className="">Unstaking now will start the unstake period and you will no longer earn rewards.</p>
            </div>
          </div>
          <div className="mt-6">
            <button
              disabled={buttonDisabled}
              onClick={onClickUnstake}
              className="h-14 w-full p-3 text-base font-medium text-white rounded-lg disabled:bg-slate-500 disabled:bg-none disabled:opacity-100 bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 font-poppins hover:opacity-90"
            >
              Confirm Unstake
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default UnstakeModal;
