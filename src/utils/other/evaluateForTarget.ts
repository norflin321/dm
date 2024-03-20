import { TAggregatedPrice, TEvaluateForTargetRes, TFirestoreDataItem } from '@/types';
import { round, substractFee } from '.';

export const evaluateForTarget = (
  item: TAggregatedPrice,
  firestoreItemData: TFirestoreDataItem
): TEvaluateForTargetRes => {
  const bestTargetPrice = round(parseFloat(item.Orders.BestPrice));
  const bestOfferPrice = round(parseFloat(item.Offers.BestPrice));
  const recentAvgPrice = firestoreItemData.recentAvgPrice;

  let esp;
  if (item.Offers.Count === 0 || item.Offers.BestPrice === '0') {
    esp = substractFee(recentAvgPrice);
  } else if (bestOfferPrice < recentAvgPrice) {
    esp = substractFee(bestOfferPrice);
  } else {
    esp = substractFee(recentAvgPrice);
  }

  const newPrice = round(bestTargetPrice + 0.01);
  const percent = round(((esp - newPrice) / newPrice) * 100);
  const profitAfterSale = round(esp - newPrice);
  const profitIndex = round(profitAfterSale * firestoreItemData.recentSalesLength);

  return {
    name: item.MarketHashName,
    bestOfferPrice,
    bestTargetPrice,
    estimatedSellingPrice: esp,
    newPrice,
    percent,
    profitAfterSale,
    firestoreData: firestoreItemData,
    profitIndex,
  };
};
