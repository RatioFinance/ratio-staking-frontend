import { useEffect, useState } from 'react';

import { WalletAdapterNetwork, WalletError } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider as ReactUIWalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
  CoinbaseWalletAdapter,
  GlowWalletAdapter,
  BackpackWalletAdapter,
  ExodusWalletAdapter,
  Coin98WalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { FC, ReactNode, useCallback, useMemo } from 'react';
import { AutoConnectProvider, useAutoConnect } from './AutoConnectProvider';
import { NetworkConfigurationProvider, useNetworkConfiguration } from './NetworkConfigurationProvider';

import axios from 'axios';

export interface Rpc {
  name: string;
  url: string;
  weight: number;
}

type ENV = 'mainnet-beta' | 'testnet' | 'devnet' | 'localnet';

export const SOLANA_CLUSTER: ENV = 'mainnet-beta';

const STRATEGY: 'speed' | 'weight' | 'queue' = 'queue';

const ENDPOINTS = [
  {
    name: 'Main RPC',
    url: process.env.REACT_APP_PUBLIC_SOLANA_RPC_URL,
    weight: 80,
  },
  {
    name: 'Extr Node RPC Balancer',
    url: 'https://solana-mainnet.rpc.extrnode.com',
    weight: 50,
  },
  {
    name: 'Metaplex RPC',
    url: 'https://api.metaplex.solana.com',
    weight: 10,
  },
  {
    name: 'Project Serum RPC',
    url: 'https://solana-api.projectserum.com',
    weight: 10,
  },
  {
    name: 'Project Serum RPC',
    url: 'https://solana-api.tt-prod.net',
    weight: 10,
  },
  {
    name: 'Mainnet Beta RPC',
    url: 'https://api.mainnet-beta.solana.com',
    weight: 10,
  },
];

async function getEpochInfo(rpcURL: string) {
  const url = new URL(rpcURL);
  const hostURL = url.href.replace(`${url.username}:${url.password}@`, '');
  const data = { jsonrpc: '2.0', id: 1, method: 'getEpochInfo' };
  const headers: any = {};
  if (url.username) {
    headers['Authorization'] = 'Basic ' + Buffer.from(`${url.username}:${url.password}`).toString('base64');
  }
  return axios.post(hostURL, data, {
    headers,
  });
}

function getWeightEndpoint(endpoints: Rpc[]) {
  let pointer = 0;
  const random = Math.random() * 100;
  let lastEndpoint = endpoints[0];

  for (const endpoint of endpoints) {
    if (random > pointer + endpoint.weight) {
      pointer += pointer + endpoint.weight;
    } else if (random >= pointer && random < pointer + endpoint.weight) {
      lastEndpoint = endpoint;
      break;
    } else {
      lastEndpoint = endpoint;
      break;
    }
  }

  return lastEndpoint;
}

async function getFastEndpoint(endpoints: Rpc[]) {
  return await Promise.any(endpoints.map((endpoint) => getEpochInfo(endpoint.url).then(() => endpoint)));
}
async function getFirstEndpoint(endpoints: Rpc[]) {
  for (const endpoint of endpoints) {
    try {
      await getEpochInfo(endpoint.url);
      return endpoint;
    } catch {
      console.log(`Can't use ${endpoint.url}`);
    }
  }
  return endpoints[0];
}
async function getBestEndpoint(endpoints: Rpc[], strategy) {
  let endpoint;
  if (strategy === 'speed') {
    endpoint = await getFastEndpoint(endpoints);
  } else if (strategy === 'weight') {
    endpoint = getWeightEndpoint(endpoints);
  } else if (strategy === 'queue') {
    endpoint = await getFirstEndpoint(endpoints);
  }
  return endpoint;
}

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { autoConnect } = useAutoConnect();
  const { networkConfiguration } = useNetworkConfiguration();
  const network = networkConfiguration as WalletAdapterNetwork;

  // You can also provide a custom RPC endpoint
  // const endpoint = useMemo(() => process.env.REACT_APP_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network), [network]);

  const [endpoint, setEndpoint] = useState<Rpc>(null);

  useEffect(() => {
    getBestEndpoint(ENDPOINTS, STRATEGY).then((endpoint) => {
      setEndpoint(endpoint);
    });
  }, []);

  const { connection, config }: any = useMemo(() => {
    if (endpoint) {
      const url = new URL(endpoint.url || clusterApiUrl(network));
      const hostURL = url.href.replace(`${url.username}:${url.password}@`, '');
      const headers: any = {};
      if (url.username) {
        headers['Authorization'] = 'Basic ' + Buffer.from(`${url.username}:${url.password}`).toString('base64');
      }
      return {
        connection: hostURL,
        config: {
          commitment: 'processed',
          httpHeaders: headers,
          wsEndpoint: url.href.replace('https', 'wss'),
        },
      };
    } else {
      return {
        connection: null,
        config: null,
      };
    }
  }, [endpoint, network]);

  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new CoinbaseWalletAdapter(),
    new GlowWalletAdapter(),
    new BackpackWalletAdapter(),
    new TorusWalletAdapter(),
    new LedgerWalletAdapter(),
    new ExodusWalletAdapter(),
    new Coin98WalletAdapter(),
  ];

  const onError = useCallback((error: WalletError) => {
    console.error(error);
  }, []);

  return (
    // TODO: updates needed for updating and referencing endpoint: wallet adapter rework
    <>
      {connection && (
        <ConnectionProvider endpoint={connection} config={config}>
          <WalletProvider wallets={wallets} onError={onError} autoConnect={autoConnect}>
            <ReactUIWalletModalProvider>{children}</ReactUIWalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      )}
    </>
  );
};

export const ContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
      <NetworkConfigurationProvider>
        <AutoConnectProvider>
          <WalletContextProvider>{children}</WalletContextProvider>
        </AutoConnectProvider>
      </NetworkConfigurationProvider>
    </>
  );
};
