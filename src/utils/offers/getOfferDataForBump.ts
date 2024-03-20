import { TAggregatedPricesObj, THistoryObject, TOfferDataForBump, TOfferItem } from '@/types';
import { round } from '../other';

export const getOfferDataForBump = (
  offer: TOfferItem,
  accClosedTargets: THistoryObject[],
  aggregatedPricesObj: TAggregatedPricesObj,
  allOffersOfAllAccs: TOfferItem[]
): TOfferDataForBump | 'err' => {
  try {
    const purchaseData = accClosedTargets.find(el => el.subject === offer.Title);
    const aggregatedPrices = aggregatedPricesObj[offer.Title];
    const bestPriceOnMarket = parseFloat(aggregatedPrices.Offers.BestPrice);

    if (!purchaseData || bestPriceOnMarket === 0) {
      return 'err';
    }

    const purchasePrice = parseFloat(purchaseData.changes[0].money.amount);
    const offerPrice = offer.Offer.Price.Amount;

    // get the best price among all my accounts
    const bestPriceAmongAllAccs = allOffersOfAllAccs
      .filter(el => el.Title === offer.Title)
      .sort((a, b) => {
        return a.Offer.Price.Amount - b.Offer.Price.Amount;
      })[0].Offer.Price.Amount;

    const purchaseDate = new Date(purchaseData.updatedAt * 1000);
    const daysSincePurchase = round((Date.now() - (purchaseDate as any)) / 1000 / 60 / 60 / 24);

    return {
      purchasePrice,
      offerPrice,
      bestPriceOnMarket,
      bestPriceAmongAllAccs,
      daysSincePurchase,
    };
  } catch (err) {
    return 'err';
  }
};
