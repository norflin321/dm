import { TAccName } from '@/types';
import { dmGet } from '../api';
import { round } from '../other';

export const getAccBalance = (accName: TAccName): Promise<'err' | number> => {
  return new Promise(async resolve => {
    const errMsg = 'get account balance error ' + accName;
    try {
      const res = await dmGet(accName, '/account/v1/balance').catch(err =>
        console.log('get account balance err: ', err.error)
      );

      if (!res || !res.usd) {
        console.log('get account balance err');
        resolve('err');
        return;
      }

      resolve(round(parseFloat(res.usd) / 100));
    } catch (err) {
      console.log(errMsg, err);
      resolve('err');
    }
  });
};
