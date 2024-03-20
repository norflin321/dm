import { evaluateForTarget } from './evaluateForTarget';
import { getAggregatedPrices } from './getAggregatedPrices';

// round number for two number after dot
const round = (n: number) => Math.round(n * 100) / 100;

// substract 7% fee
const substractFee = (n: number) => round(n - (n / 100) * 7);

type TTimestamp = number;

const toLocalDateFormat = (date: TTimestamp | Date) => {
  return new Date(date).toLocaleString('ru-RU', {
    timeZone: 'Europe/Moscow',
    year: '2-digit',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
};

export const getDatesDiffInDays = (older: TTimestamp, newer: TTimestamp) => {
  return round((newer - (older as any)) / 1000 / 60 / 60 / 24);
};

export const getDatesDiff = (older: TTimestamp, newer: TTimestamp) => {
  let seconds = Math.floor((newer - (older as any)) / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  let days = Math.floor(hours / 24);

  hours = hours - days * 24;
  minutes = minutes - days * 24 * 60 - hours * 60;
  seconds = seconds - days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60;

  const d = days > 0 ? `${days}d ` : '';
  return d + `${hours}h`;
};

const chunkBy = (arr: any[], chunkSize: number): any[] => {
  return [].concat.apply(
    [],
    // @ts-ignore
    arr.map((_, i) => (i % chunkSize ? [] : [arr.slice(i, i + chunkSize)]))
  );
};

export const fixStrLength = (str: string, maxLength: number) => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

export { round, substractFee, toLocalDateFormat, chunkBy, evaluateForTarget, getAggregatedPrices };
