import { TGetAccountHistoryRes } from '@/types';

export const getLastPurchaseOnAcc = (accHistory: TGetAccountHistoryRes) => {
  const accHistoryCopy = { ...accHistory };
  const items = accHistoryCopy.objects.sort((a, b) => b.updatedAt - a.updatedAt);
  for (const item of items) {
    if (item.status === 'success' && item.action === 'Target Closed') {
      return item.updatedAt * 1000;
    }
  }
  console.log('✖ Err: get last purchase on acc, no purchases on account');
};
