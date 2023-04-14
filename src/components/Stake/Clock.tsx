import { useEffect, useState } from 'react';
import { SECONDS_PER_DAY } from '../../constants';
import { StakeStatBox } from './stakeStatBox';

function Clock(props) {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  const getTimeUntil = (deadline) => {
    const deadlineDate = new Date(deadline);
    if (deadlineDate.getTime() < Date.now()) {
      setMinutes(0);
      setHours(0);
      setDays(0);
    } else {
      const time = deadlineDate.getTime() - Date.now();
      setMinutes(Math.floor((time / 1000 / 60) % 60));
      setHours(Math.floor((time / (1000 * 60 * 60)) % 24));
      setDays(Math.floor(time / (1000 * 60 * 60 * 24)));
    }
  };

  useEffect(() => {
    getTimeUntil(props.deadline);
  });

  useEffect(() => {
    const timer = setInterval(() => getTimeUntil(props.deadline), 1000);

    return () => {
      clearInterval(timer);
    };
  }, [props.deadline]);

  return (
    <div>
      <div className="mt-3 flex justify-between gap-5">
        <StakeStatBox title="Days" stat={days.toFixed()} borderStyle="" />
        <StakeStatBox title="Hours" stat={hours.toFixed()} />
        <StakeStatBox title="Minutes" stat={minutes.toFixed()} />
      </div>
    </div>
  );
}

export default Clock;
