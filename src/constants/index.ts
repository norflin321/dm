export const DEV = process.env.NODE_ENV === 'development';
export const PROD = process.env.NODE_ENV === 'production';
export const ACTIVE = process.env.ACTIVE === 'true';

export const MIN_PROFIT_PERCENT = 3;

export * from './dmAccounts';
export * from './firebase';
