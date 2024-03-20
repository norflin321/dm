import { TAccName } from '@/types';
import { dmGet } from '../api';

export const getAccInventory = (accName: TAccName): Promise<'err' | any> => {
  return new Promise(async resolve => {
    const errMsg = '✖ Err, get account inventory for: ' + accName;
    try {
      const res = await dmGet(accName, '/exchange/v1/user/items', {
        gameId: 'a8db',
        currency: 'USD',
        limit: 100,
      }).catch(err => console.log(errMsg, err.error || err));

      if (!res || !res.objects) {
        console.log(errMsg);
        resolve('err');
        return;
      }

      if (res.error) {
        console.log(errMsg, res.error, res.message);
        resolve('err');
        return;
      }

      let items = res.objects.filter((el: any) => el.inMarket);

      resolve(items);
    } catch (err) {
      console.log(errMsg, err);
      resolve('err');
    }
  });
};
