import {
  TAccData,
  TFirestoreDataItem,
  TEvaluateMyTargestRes,
  TAggregatedPrice,
  TEvaluateForTargetRes,
  TTargetItem,
} from '@/types';
import { evaluateForTarget, getAggregatedPrices } from '../other';

export const evaluateMyTargets = (
  accsData: TAccData[],
  filtered: { [key: string]: TFirestoreDataItem }
): Promise<TEvaluateMyTargestRes | 'err'> => {
  return new Promise(async resolve => {
    const retData: TEvaluateMyTargestRes = {};
    for (const acc of accsData) retData[acc.accName] = [];

    for (const acc of accsData) {
      const errMsg = '✖ Err: evaluate my targets ' + acc.accName + ',';
      try {
        const accTargetsObj: { [key: string]: TTargetItem } = {};
        for (const target of acc.targets.items) {
          accTargetsObj[target.Title] = target;
        }
        const targetsTitles = Object.keys(accTargetsObj);

        if (targetsTitles.length === 0) continue;

        const aggrPrices = await getAggregatedPrices('rqqrfmityu', targetsTitles);
        if (aggrPrices === 'err') {
          resolve('err');
          return;
        }
        const aggrPricesObj: { [key: string]: TAggregatedPrice } = {};
        for (const aggrPrice of aggrPrices) {
          aggrPricesObj[aggrPrice.MarketHashName] = { ...aggrPrice };
        }

        let evaluatedItems = [];
        for (const target of acc.targets.items) {
          if (!filtered[target.Title]) continue;
          if (!aggrPricesObj[target.Title]) continue;
          const evaluatedItem = evaluateForTarget(aggrPricesObj[target.Title], filtered[target.Title]);
          const myTargetId = accTargetsObj[target.Title].TargetID;
          evaluatedItems.push({ ...evaluatedItem, myTargetId });
        }
        evaluatedItems = evaluatedItems.sort((a, b) => b.profitIndex - a.profitIndex);
        retData[acc.accName] = evaluatedItems;
      } catch (e) {
        console.log(errMsg, e);
        resolve('err');
        return;
      }
    }
    resolve(retData);
  });
};
