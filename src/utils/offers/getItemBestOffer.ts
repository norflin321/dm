import { TAccName, TItem } from '@/types';
import { dmGet } from '../api';

export const getItemBestOffer = (accName: TAccName, title: string): Promise<'err' | TItem> => {
  return new Promise(async resolve => {
    const errMsg = 'get item best offer error ' + accName;
    try {
      const res = await dmGet(accName, '/exchange/v1/market/items', {
        gameId: 'a8db',
        title: title,
        orderBy: 'price',
        orderDir: 'asc',
        currency: 'USD',
        limit: 1,
        types: 'dmarket',
      }).catch(err => console.log(errMsg, err.error));

      if (!res || !res.objects || res.objects.length === 0) {
        console.log(errMsg);
        resolve('err');
      } else {
        resolve(res.objects[0]);
      }
    } catch (err) {
      console.log(errMsg, err);
      resolve('err');
    }
  });
};
