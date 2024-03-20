import { getFirestoreDataFromHeroku } from '@/constants';
import { TAccData, TFilterFirebaseForNewTargetsRes, TFirestoreDataItem } from '@/types';
import { toLocalDateFormat } from '@/utils/other';

export const filterFirebaseForNewTargets = (
  accsData: TAccData[]
): Promise<TFilterFirebaseForNewTargetsRes | 'err'> => {
  return new Promise(async resolve => {
    try {
      console.log('\n-- Get firebase...');

      const firestoreData = await getFirestoreDataFromHeroku();
      if (!firestoreData || !firestoreData.items || Object.keys(firestoreData.items).length === 0) {
        console.log('✖ Err: firestore no data');
        resolve('err');
        return;
      }

      // prettier-ignore
      console.log(`- items: ${Object.keys(firestoreData.items).length}, updated: ${toLocalDateFormat(firestoreData.updated)}`)

      if (accsData.filter(acc => acc.balance > 1).length === 0) {
        console.log('- All accounts has < 1$ on balance');
        resolve('err');
        return;
      }

      // collect all offers and targest from all accounts
      const allTargets = [];
      const allOffers = [];
      for (const data of accsData) {
        allTargets.push(...data.targets.items);
        allOffers.push(...data.offers.items);
      }

      // filter items from firestore
      const filtered: { [key: string]: TFirestoreDataItem } = {};
      const filteredWithMyTargets: { [key: string]: TFirestoreDataItem } = {};

      // set and log filter conditions
      const minRecentSalesLength = 2;
      const minRecentAvgPrice = 2;

      // prettier-ignore
      console.log(`filter: sales in 30 days >= ${minRecentSalesLength}, avg price >= ${minRecentAvgPrice}`)

      for (const name in firestoreData.items) {
        const item = firestoreData.items[name];
        const alreadyHaveTarget = allTargets.find(el => el.Title === name);
        const alreadyHaveOffer = allOffers.find(el => el.Title === name);
        if (
          item.recentSalesLength >= minRecentSalesLength &&
          item.recentAvgPrice >= minRecentAvgPrice &&
          !alreadyHaveOffer
        ) {
          filteredWithMyTargets[name] = item;
          if (!alreadyHaveTarget) {
            filtered[name] = item;
          }
        }
      }

      console.log(`filtered: ${Object.keys(filtered).length}`);

      resolve({ filtered, filteredWithMyTargets });
    } catch (err) {
      console.log('✖ Err: firestore get data ', err);
      resolve('err');
      return;
    }
  });
};
