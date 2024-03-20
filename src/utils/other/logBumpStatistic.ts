import { TBumpStatistic } from '@/types';
import { substractFee } from '.';
import { getPercent } from './getPercent';

const printTableOfBest = (data: any) => {
  let table = [];
  for (const i of data) {
    table.push({
      Best: i.offer.Title,
      purchase: i.offerDataForBump.purchasePrice,
      current: i.offerDataForBump.offerPrice,
      currentAfterFee: substractFee(i.offerDataForBump.offerPrice),
      percent: getPercent(i.offerDataForBump.purchasePrice, substractFee(i.offerDataForBump.offerPrice)),
      days: i.offerDataForBump.daysSincePurchase,
    });
  }
  table = table.sort((a, b) => b.percent - a.percent);
  console.table(table);
};

const printTableOfNobump = (data: any) => {
  let table = [];
  for (const i of data) {
    table.push({
      'No Bump': i.offer.Title,
      purchase: i.offerDataForBump.purchasePrice,
      current: i.offerDataForBump.offerPrice,
      new: i.newPrice,
      newAfterFee: substractFee(i.newPrice),
      percent: i.percent,
      days: i.offerDataForBump.daysSincePurchase,
    });
  }
  table = table.sort((a, b) => b.percent - a.percent);
  console.table(table);
};

export const logBumpStatistic = (
  bumpStatistic: TBumpStatistic,
  logNoBump: boolean,
  logBest: boolean
) => {
  console.log(
    `- total: ${bumpStatistic['total'].length}, best: ${bumpStatistic['best'].length}, normal: ${bumpStatistic['normal'].length}, noprofit: ${bumpStatistic['noprofit'].length}, nobump: ${bumpStatistic['nobump'].length}`
  );

  if (logBest) printTableOfBest(bumpStatistic['best']);
  if (logNoBump) printTableOfNobump(bumpStatistic['nobump']);
};
