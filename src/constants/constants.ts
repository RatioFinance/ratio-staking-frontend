export const REFRESH_TIME_INTERVAL = +(process.env.REACT_APP_REFRESH_TIME_INTERVAL || 60_000);
export const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:3001';

export const WRAPPED_SOL_MINT = 'So11111111111111111111111111111111111111112';
export const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
export const USDC_MINT_DECIMALS = 6;

export const RATIO_MINT_KEY = 'ratioMVg27rSZbSvBopUvsdrGUzeALUfFma61mpxc8J';
export const RATIO_MINT_DECIMALS = 6;

// Stake Specific
export const STAKE_PROGRAM_ID = process.env.STAKE_PROGRAM_ID || '2YRmpDfPE619v42fgKwA7hSrcoUavNwcMfbcCToVj2qL';
export const REWARD_PROGRAM_ID = process.env.REWARD_PROGRAM_ID || 'EkDHzRjupQbP2YayEN5j99D1482JbPxWLTz8MxzF7meN';
export const SECONDS_PER_DAY = 24 * 60 * 60;
export const MULTIPLIER_SECONDS = (SECONDS_PER_DAY * 365) / 3; // 4 months
export const FUNDING_RATE = 0.00317097919;
