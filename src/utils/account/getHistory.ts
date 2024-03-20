import { TAccName, TGetAccountHistoryRes } from '@/types';
import { dmGet } from '../api';

export const getAccHistory = (accName: TAccName): Promise<'err' | TGetAccountHistoryRes> => {
  return new Promise(async resolve => {
    const errMsg = 'get account history for: ' + accName + ' error, ';
    try {
      const history: TGetAccountHistoryRes = { objects: [], total: 0 };

      const makeRequest = (offset: number, limit: number): Promise<void | 'err'> => {
        return new Promise(async resolve => {
          const res = await dmGet(accName, `/exchange/v1/history?offset=${offset}&limit=${limit}`).catch(
            err => console.log(errMsg, err.error || err)
          );
          if (!res || !res.objects) {
            console.log(errMsg);
            resolve('err');
            return;
          }
          history.objects.push(...res.objects);
          history.total = res.total;
          const objectsLeft = res.total - history.objects.length;
          if (objectsLeft > 0) {
            await makeRequest(history.objects.length, limit);
          }
          resolve();
        });
      };
      await makeRequest(0, 5000);

      if (history.objects.length !== history.total) {
        console.log(errMsg, 'length is not the same with total', history.objects.length, history.total);
        resolve('err');
        return;
      }

      resolve(history);
    } catch (err) {
      console.log(errMsg, err);
      resolve('err');
    }
  });
};
