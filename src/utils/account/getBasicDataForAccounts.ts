import { TAccData, TAccName, TAccounts } from '@/types';
import { getAccOffers } from '../offers';
import { formatAccName } from '../other/formatAccName';
import { getAccTargets } from '../targets';
import { getAccBalance } from './getBalance';

export const getBasicDataForAccounts = (accounts: TAccounts): Promise<TAccData[] | 'err'> => {
  return new Promise(async resolve => {
    try {
      console.log('-- Get basic data...');
      const basicData: TAccData[] = [];
      for (const accName of Object.keys(accounts)) {
        const balancePromise = getAccBalance(accName as TAccName);
        const targetsPromise = getAccTargets(accName as TAccName, 'TargetStatusActive');
        const offersPromise = getAccOffers(accName as TAccName);

        await Promise.all([balancePromise, targetsPromise, offersPromise]).then(results => {
          const balance = results[0];
          const targets = results[1];
          const offers = results[2];
          if (balance === 'err' || targets === 'err' || offers === 'err') {
            resolve('err');
            return;
          }
          basicData.push({
            accName: accName,
            balance: balance,
            targets: { items: targets.Items, total: targets.Total },
            offers: { items: offers.Items, total: offers.Total },
          });
          console.log(
            `- ${formatAccName(accName)} balance: ${balance}, targets: ${targets.Total}, offers: ${
              offers.Total
            }`
          );
        });
      }
      resolve(basicData);
    } catch (err) {
      resolve('err');
    }
  });
};
