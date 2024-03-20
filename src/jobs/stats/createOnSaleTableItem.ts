import { TFirestoreDataItem, THistoryObject, TOfferItem } from '@/types';
import { fixStrLength, getDatesDiff, round, substractFee, toLocalDateFormat } from '@/utils/other';

export const createOnSaleTableItem = (
  offer: TOfferItem,
  historyOfTargetsClosed: THistoryObject[],
  firestoreDataItems: { [key: string]: TFirestoreDataItem },
  fullName: boolean
) => {
  const purchaseData = historyOfTargetsClosed.find(el => el.subject === offer.Title);
  const purchasePriceStr = purchaseData?.changes[0].money.amount;
  const purchasePrice = purchasePriceStr ? parseFloat(purchasePriceStr) : undefined;
  const sellingPrice = substractFee(offer.Offer.Price.Amount);
  const recentSalesAvgPrice = firestoreDataItems[offer.Title]?.recentAvgPrice || '?';
  const recentSalesCount = firestoreDataItems[offer.Title]?.recentSalesLength || '?';
  return {
    'item title': fullName ? offer.Title : fixStrLength(offer.Title, 40),
    '- $': purchasePrice || '?',
    '- t': purchaseData ? toLocalDateFormat(purchaseData.updatedAt * 1000) : '?',
    t: purchaseData ? getDatesDiff(purchaseData.updatedAt * 1000, Date.now()) : '?',
    '+ $': sellingPrice,
    'diff $': purchasePrice ? round(sellingPrice - purchasePrice) : 0,
    'diff %': purchasePrice ? round(((sellingPrice - purchasePrice) / purchasePrice) * 100) : '?',
    '30d avg $': recentSalesAvgPrice,
    '30d': recentSalesCount,
    selling_in_ms: purchaseData ? purchaseData.updatedAt * 1000 - Date.now() : 0,
  };
};
