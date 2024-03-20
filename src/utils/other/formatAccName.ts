import { TAccName } from '@/types';

export const formatAccName = (accName: TAccName | string) => {
  if (accName === 'norflin') {
    return 'norflin:   ';
  }
  return accName + ':';
};
