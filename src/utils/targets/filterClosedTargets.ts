import { THistoryObject } from '@/types';

export const filterClosedTargets = (accHistoryObjects: THistoryObject[]) => {
  return accHistoryObjects.filter(
    el =>
      el.type === 'target_closed' && el.action === 'Target Closed' && el.status === 'success'
  );
};
