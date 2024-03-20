import { THistoryObject } from '@/types';
import { fixStrLength, getDatesDiff, round, toLocalDateFormat } from '@/utils/other';

export const createPurchaseSalePair = (
  sale: THistoryObject,
  historyOfCharginFees: THistoryObject[],
  historyOfTargetsClosed: THistoryObject[],
  fullName: boolean
) => {
  // purchase data
  const purchase = historyOfTargetsClosed.find(el => el.subject === sale.subject);
  if (purchase === undefined) {
    console.log('no purchase data!');
    return 'no data';
  }
  const purchasePrice = parseFloat(purchase.changes[0].money.amount);
  const purchaseHumanDate = toLocalDateFormat(purchase.updatedAt * 1000);

  // sale data
  const saleFee = historyOfCharginFees.find(
    el => el.subject === sale.subject && el.updatedAt === sale.updatedAt
  );
  if (saleFee === undefined) {
    console.log('no fee data!');
    return 'no data';
  }
  const salePrice = parseFloat(sale.changes[0].money.amount);
  const saleFeePrice = parseFloat(saleFee.changes[0].money.amount);
  const saleFeePercent = Math.round((saleFeePrice / salePrice) * 100);
  const salePriceMinusFee = round(salePrice - saleFeePrice);
  const saleHumanDate = toLocalDateFormat(sale.updatedAt * 1000);

  // save pair
  const title = sale.subject;
  const diff = round(salePriceMinusFee - purchasePrice);
  const diffPerent = round((salePriceMinusFee / purchasePrice) * 100 - 100);
  const diffTime = getDatesDiff(purchase.updatedAt * 1000, sale.updatedAt * 1000);

  return {
    'item title': fullName ? title : fixStrLength(title, 40),
    '- $': purchasePrice,
    '- t': purchaseHumanDate,
    '+ $': salePriceMinusFee,
    '+ t': saleHumanDate,
    'diff $': diff,
    'diff %': diffPerent,
    'diff t': diffTime,
    'fee %': saleFeePercent,
  };
};
