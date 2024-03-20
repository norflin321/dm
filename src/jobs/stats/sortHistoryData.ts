import { TGetAccountHistoryRes } from '@/types';

export const sortHistoryData = (history: TGetAccountHistoryRes, timeStart: number, timeEnd: number) => {
  const historyOfSells = [];
  const historyOfCharginFees = [];
  const historyOfTargetsClosed = [];
  for (const i of history.objects) {
    if (i.updatedAt > timeStart && i.updatedAt < timeEnd && i.status === 'success') {
      if (i.type === 'sell') {
        historyOfSells.push(i);
      } else if (i.type === 'charging_fee') {
        historyOfCharginFees.push(i);
      } else if (i.type === 'target_closed') {
        historyOfTargetsClosed.push(i);
      }
    }
  }
  return { historyOfSells, historyOfCharginFees, historyOfTargetsClosed };
};
