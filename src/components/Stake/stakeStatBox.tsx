type StakeStatBoxProps = {
  title: string;
  stat: string;
  desc?: string;
  borderStyle?: string;
};

export const StakeStatBox = ({ title, stat, desc, borderStyle }: StakeStatBoxProps) => {
  return (
    <div
      className={`h-[70px] w-full sm:w-1/3 rounded-lg border border-white-400 flex flex-col justify-around items-center py-2 ${borderStyle}`}
    >
      <p className={`${desc ? 'mt-1.5' : ''}  text-xs text-gray-200 font-poppins font-regular dark:text-white-900`}>
        {title}
      </p>
      <p className="text-xl text-[#F48C57] font-poppins font-semibold dark:text-white-900">{stat}</p>
      <p className="text-[10px] text-gray-100 font-poppins font-regular dark:text-white-900">{desc}</p>
    </div>
  );
};
