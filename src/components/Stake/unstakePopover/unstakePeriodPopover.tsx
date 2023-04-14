import React, { useState } from 'react';
import infoIcon from '../../../assets/images/risklevel.svg';

const UnstakePeriodPopover = () => {
  const [tooltipStatus, setTooltipStatus] = useState(0);

  return (
    <div
      className="relative mt-0 md:mt-0"
      onMouseEnter={() => setTooltipStatus(1)}
      onMouseLeave={() => setTooltipStatus(0)}
    >
      <div className="mr-2 cursor-pointer">
        <img src={infoIcon} alt="info" />
      </div>
      {tooltipStatus === 1 && (
        <div
          role="tooltip"
          className="absolute left-0 z-20 px-3 py-2 ml-8 -mt-12 transition duration-150 ease-in-out shadow-2xl w-64 dark:bg-gray-800 bg-slate-50 rounded-xl"
        >
          <svg
            className="absolute top-0 bottom-0 left-0 h-20 -ml-2 dark:fill-gray-900 fill-slate-50"
            width="9px"
            height="16px"
            viewBox="0 0 9 16"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
          >
            <g id="Page-1" stroke="none" strokeWidth={1} fill="none" fillRule="evenodd">
              <g
                id="Tooltips-"
                transform="translate(-874.000000, -1029.000000)"
                className="dark:fill-gray-800 fill-slate-50"
              >
                <g id="Group-3-Copy-16" transform="translate(850.000000, 975.000000)">
                  <g id="Group-2" transform="translate(24.000000, 0.000000)">
                    <polygon
                      id="Triangle"
                      transform="translate(4.500000, 62.000000) rotate(-90.000000) translate(-4.500000, -62.000000) "
                      points="4.5 57.5 12.5 66.5 -3.5 66.5"
                    />
                  </g>
                </g>
              </g>
            </g>
          </svg>
          <div className="text-sm font-normal text-gray-200 font-poppins dark:text-white-900">
            The unstake period is the amount of time required to fully release your staked tokens. For instance, if the
            unstake period is set to 14 days, then it will take that period for all $RATIO tokens to become unlocked.
            During this time, you won&apos;t earn any rewards, but the staked amount gradually becomes withdrawable over
            the 14-day period.
          </div>
        </div>
      )}{' '}
    </div>
  );
};

export default UnstakePeriodPopover;
