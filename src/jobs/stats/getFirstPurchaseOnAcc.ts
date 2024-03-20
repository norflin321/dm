import { TGetAccountHistoryRes } from '@/types';

export const getFirstPurchaseOnAcc = (accHistory: TGetAccountHistoryRes) => {
  const accHistoryCopy = { ...accHistory };
  const items = accHistoryCopy.objects.sort((a, b) => a.updatedAt - b.updatedAt);
  for (const item of items) {
    if (item.status === 'success' && item.action === 'Target Closed') {
      return item.updatedAt;
    }
  }
  console.log('✖ Err: get first purchase on acc, no purchases on account');
};
