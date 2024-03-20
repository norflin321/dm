import { TNewTargetData } from '@/types';

export const logTargetsTable = (targets: TNewTargetData[]) => {
  let table = [];
  for (const target of targets) {
    table.push({
      name: target.name,
      'best o': target.bestOfferPrice,
      esp: target.estimatedSellingPrice,
      'best t': target.bestTargetPrice,
      profit: target.profitAfterSale,
      '%': target.percent,
      '30d': target.firestoreData.recentSalesLength,
      '30d avg': target.firestoreData.recentAvgPrice,
      INDEX: target.profitIndex,
    });
  }
  console.table(table);
};
