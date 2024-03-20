import { TAccName, TGetAccTargetsRes } from '@/types';
import { dmGet } from '../api';

export const getAccTargets = (
  accName: TAccName,
  targetStatus: string
): Promise<'err' | TGetAccTargetsRes> => {
  return new Promise(async resolve => {
    const errMsg = 'get account offers error ' + accName;
    try {
      const res = await dmGet(accName, '/marketplace-api/v1/user-targets', {
        GameId: 'a8db',
        'BasicFilters.Status': targetStatus,
        Limit: 500,
      }).catch(err => console.log(errMsg, err.error));

      if (res.Items.length !== +res.Total) {
        console.log('targets length is not the same with total targets');
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
