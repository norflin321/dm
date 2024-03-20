import { round } from '.';

export const getPercent = (from: number, to: number) => {
  return round(((to - from) / from) * 100);
};
