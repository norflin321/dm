import { TOfferDataForBump } from '@/types';
import { round } from '../other';

export const getNewPriceForOfferBump = (offerDataForBump: TOfferDataForBump) => {
  try {
    const { offerPrice, bestPriceOnMarket, bestPriceAmongAllAccs } = offerDataForBump;
    let newPrice = null;
    let priceEqualize = false;

    if (bestPriceAmongAllAccs === bestPriceOnMarket && offerPrice !== bestPriceAmongAllAccs) {
      newPrice = bestPriceAmongAllAccs;
      priceEqualize = true;
    } else if (bestPriceAmongAllAccs !== bestPriceOnMarket && offerPrice !== bestPriceOnMarket) {
      newPrice = round(bestPriceOnMarket - 0.01);
    }
    return { newPrice, priceEqualize };
  } catch (err) {
    return 'err';
  }
};
