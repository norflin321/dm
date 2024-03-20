import { TAccName, TGetAccOffersRes } from '@/types';
import { dmGet } from '../api';

export const getAccOffers = (accName: TAccName): Promise<'err' | TGetAccOffersRes> => {
  return new Promise(async resolve => {
    const errMsg = 'get account offers error ' + accName;
    try {
      const res = await dmGet(accName, '/marketplace-api/v1/user-offers', {
        GameId: 'a8db',
        Limit: 500,
      }).catch(err => console.log(errMsg, err.error));

      if (res.Items.length !== +res.Total) {
        console.log('offers length is not the same with total offers');
        console.log('length:', res.Items.length, ' total:', res.Total);
      }

      if (!res || !res.Items) {
        console.log(errMsg);
        resolve('err');
      } else {
        resolve(res);
      }
    } catch (err) {
      console.log(errMsg, err);
      resolve('err');
    }
  });
};
