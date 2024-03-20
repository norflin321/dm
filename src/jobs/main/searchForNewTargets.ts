import { TFirestoreDataItem, TAccData, TNewTargetData, TAccName } from '@/types';
import { MIN_PROFIT_PERCENT } from '@/constants';
import { getAggregatedPrices, evaluateForTarget } from '@/utils/other';
import { createTargets, evaluateMyTargets, removeAccTargets } from '@/utils/targets';
import { logTargetsTable } from '@/utils/other/logNewTargets';

export const searchForNewTargets = (
  filtered: { [key: string]: TFirestoreDataItem },
  accsData: TAccData[],
  filteredWithMyTargets: { [key: string]: TFirestoreDataItem }
) => {
  return new Promise<void>(async resolve => {
    console.log('\n-- Search for new targets...');
    const errMsg = '✖ Err: make new targets';

    // evaluate my targets
    const myEvaluatedTargets = await evaluateMyTargets(accsData, filteredWithMyTargets);
    if (myEvaluatedTargets === 'err') {
      resolve();
      return;
    }

    let allNewTargets: TNewTargetData[] = [];

    const aggregatedPrices = await getAggregatedPrices('norflin', Object.keys(filtered));
    if (aggregatedPrices === 'err') {
      resolve();
      return;
    }

    console.log(`filter: ${MIN_PROFIT_PERCENT} <= percent < 40, new price < 400`);

    // loop through each item in aggregatedPrices
    for (const item of aggregatedPrices) {
      try {
        if (item.Orders.Count === 0 || item.Orders.BestPrice === '0') continue;

        const evaluatedItem = evaluateForTarget(item, filtered[item.MarketHashName]);

        const { percent, newPrice, profitAfterSale } = evaluatedItem;
        if (percent >= MIN_PROFIT_PERCENT && percent < 40 && newPrice < 400 && profitAfterSale >= 0.5) {
          allNewTargets.push(evaluatedItem);
        }
      } catch (err) {
        console.log(errMsg, item.MarketHashName, err);
      }
    }

    allNewTargets = allNewTargets.sort((a, b) => b.profitIndex - a.profitIndex);

    console.log(`found: ${allNewTargets.length}`);

    // create object with accounts to destribute new targets between them
    const newTargetsForAccs: { [key: string]: TNewTargetData[] } = {};
    for (const acc of accsData) newTargetsForAccs[acc.accName] = [];

    // distribute new targets between accounts
    for (const newTargetData of allNewTargets) {
      for (const acc of accsData) {
        const targetsLimit = acc.accName === 'norflin' ? 150 : 100;
        const existingTargets = myEvaluatedTargets[acc.accName];
        const existingTargetsCount = Number(acc.targets.total);
        const newTargetsCount = newTargetsForAccs[acc.accName].length;
        let freeSpace = targetsLimit - (existingTargetsCount + newTargetsCount);

        const isEnoughBalance = newTargetData.newPrice <= acc.balance;
        if (!isEnoughBalance) continue;

        const isBetterThenAnyExistingTargets = !!existingTargets.find(
          el => el.profitIndex < newTargetData.profitIndex
        );

        if (freeSpace > 0 || isBetterThenAnyExistingTargets) {
          newTargetsForAccs[acc.accName].push(newTargetData);
          break;
        }
      }
    }

    for (const acc of accsData) {
      const targetsLimit = acc.accName === 'norflin' ? 150 : 100;
      const newTargets = newTargetsForAccs[acc.accName];
      const existingTargetsCount = Number(acc.targets.total);
      const avaliableSpace = targetsLimit - existingTargetsCount;
      let targetsToRemoveCount = 0;

      if (newTargets.length > avaliableSpace) {
        targetsToRemoveCount += newTargets.length - avaliableSpace;
      }

      // prettier-ignore
      console.log( `- ${acc.accName}: ${newTargets.length} new, ${targetsToRemoveCount} remove`);

      if (targetsToRemoveCount > 0) {
        const targetsToRemove = myEvaluatedTargets[acc.accName]
          .sort((a, b) => a.profitIndex - b.profitIndex)
          .slice(0, targetsToRemoveCount)
          .map(el => el.myTargetId);
        await removeAccTargets(acc.accName as TAccName, targetsToRemove);
        await new Promise(r => setTimeout(r, 3 * 1000));
      }

      // logTargetsTable(newTargets);

      newTargets.length > 0 && (await createTargets(acc.accName as TAccName, newTargets));
    }

    resolve();
  });
};
