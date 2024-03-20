import { dmAccounts } from '@/constants';
import { TAccName } from '@/types';
import { getAccHistory, getBasicDataForAccounts } from '@/utils/account';
import { round } from '@/utils/other';
import { sortHistoryData } from '../stats/sortHistoryData';

const magic = async () => {
  const basicAccsData = await getBasicDataForAccounts(dmAccounts);
  if (basicAccsData === 'err') return;

  const items: {
    [key: string]: {
      totalProfit: number;
      timesSold: number;
    };
  } = {};

  for (const accName of Object.keys(dmAccounts)) {
    const history = await getAccHistory(accName as TAccName);
    if (history === 'err') continue;

    const sortedHistory = sortHistoryData(history, 0, Date.now());
    const { historyOfSells, historyOfCharginFees, historyOfTargetsClosed } = sortedHistory;

    for (const sale of historyOfSells) {
      const purchaseIndex = historyOfTargetsClosed.findIndex(el => el.subject === sale.subject);
      if (purchaseIndex < 0) continue;
      const purchase = historyOfTargetsClosed[purchaseIndex];
      historyOfTargetsClosed.splice(purchaseIndex, 1);
      const saleFee = historyOfCharginFees.find(
        el => el.subject === sale.subject && el.updatedAt === sale.updatedAt
      );
      if (!saleFee) continue;
      const salePrice = parseFloat(sale.changes[0].money.amount);
      const saleFeePrice = parseFloat(saleFee.changes[0].money.amount);
      const purchasePrice = parseFloat(purchase.changes[0].money.amount);
      const profit = round(salePrice - saleFeePrice - purchasePrice);
      // if (sale.subject === '★ Hand Wraps | Slaughter (Well-Worn)') {
      //   console.log(profit);
      // }
      if (!items[sale.subject]) {
        items[sale.subject] = { totalProfit: profit, timesSold: 1 };
      } else {
        items[sale.subject].totalProfit = round(items[sale.subject].totalProfit + profit);
        items[sale.subject].timesSold += 1;
      }
    }
  }

  const itemsArr: {
    title: string;
    totalProfit: number;
    timesSold: number;
  }[] = [];
  for (const title in items) itemsArr.push({ title, ...items[title] });
  console.log('Results sorted by total profit:');
  console.table([...itemsArr].sort((a, b) => b.totalProfit - a.totalProfit).slice(0, 100));
  console.log('Results sorted by times sold:');
  console.table([...itemsArr].sort((a, b) => b.timesSold - a.timesSold).slice(0, 100));
};
magic();
