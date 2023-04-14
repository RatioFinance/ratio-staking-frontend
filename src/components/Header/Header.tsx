import classNames from 'classnames';
import { shortenAddress } from '../../utils/utils';
import { useWallet } from '@solana/wallet-adapter-react';
import SwitchButton from '../SwitchButton';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Header = () => {
  const wallet = useWallet();
  const { connected } = useWallet();

  return (
    <div className="flex items-center justify-end px-6 py-6 w-100">
      <div className="justify-end gap-4 xl:flex xl:items-center lg:block w-100">
        <div className="flex items-center justify-end gap-3 lg:order-last">
          <SwitchButton />
          <WalletMultiButton
            className={classNames(
              '!py-[1.7rem] md:mr-4 rounded-[0.5rem]',
              connected
                ? "bg-white-900 dark:bg-gray-900 dark:text-white-900 dark:border-gray-200 text-gray-200 border border-solid border-white-500 before:content-['Connected_Wallet'] before:absolute before:-top-2 before:left-1.5 before:text-slate-400 before:font-poppins before:text-xs before:font-normal before:bg-white before:px-1.5 before:dark:bg-gray-900 before:dark:text-white-900 before:bg-white-900"
                : 'button button--blue'
            )}
          >
            {!connected ? 'Connect Wallet' : shortenAddress(`${wallet?.publicKey}`)}
          </WalletMultiButton>
        </div>
      </div>
    </div>
  );
};

export default Header;
