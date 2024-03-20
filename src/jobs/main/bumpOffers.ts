import {
  TAccData,
  TUpdateOfferData,
  TOfferItem,
  TAccName,
  TAccsClosedTargets,
  TRevenue,
  TBumpStatistic,
} from '@/types';
import { getAggregatedPrices, substractFee } from '@/utils/other';
import { getAccHistory } from '@/utils/account';
import { MIN_PROFIT_PERCENT } from '@/constants';
import { getOfferDataForBump, updateOffersPrices } from '@/utils/offers';
import { filterClosedTargets } from '@/utils/targets';
import { convertAggregatedPricesToObject } from '@/utils/other/getAggregatedPrices';
import { getNewPriceForOfferBump } from '@/utils/offers/getNewPriceForOfferBump';
import { getPercent } from '@/utils/other/getPercent';
import { logBumpStatistic } from '@/utils/other/logBumpStatistic';
import { logRevenue } from '@/utils/other/logRevenue';

export const bumpOffers = (
  accsData: TAccData[]
): Promise<'err' | { accsClosedTargets: TAccsClosedTargets }> => {
  return new Promise(async resolve => {
    try {
      const revenue: TRevenue = {};
      const offersToUpdate: { [key: string]: TUpdateOfferData[] } = {};
      const allOffersOfAllAccs: TOfferItem[] = [];
      const accsClosedTargets: TAccsClosedTargets = {};

      for (const { offers, accName } of accsData) {
        offersToUpdate[accName] = [];
        accsClosedTargets[accName] = [];
        allOffersOfAllAccs.push(...offers.items);
        revenue[accName] = {
          allOffersPurchasedFor: 0,
          allOffersOnSaleFor: 0,
        };
      }
      console.log('\n-- Bump offers...');

      /*   - loop through each account, START -   */
      for (const data of accsData) {
        const { accName, offers } = data;
        const errMsg = `✖ Err: bump offers for: ${accName},`;
        try {
          console.log(`${accName}...`);

          // get closed targets history
          const accHistory = await getAccHistory(accName as TAccName);
          if (accHistory === 'err') continue;
          accsClosedTargets[accName] = filterClosedTargets(accHistory.objects);

          if (offers.items.length === 0) {
            console.log('no offers');
            continue;
          }

          // get aggregated prices for offers
          const offersTitles = offers.items.map(el => el.Title);
          const aggregatedPrices = await getAggregatedPrices(accName as TAccName, offersTitles);
          if (aggregatedPrices === 'err') {
            resolve('err');
            return;
          }
          const aggregatedPricesObj = convertAggregatedPricesToObject(aggregatedPrices);

          // statistic
          const bumpStatistic: TBumpStatistic = {
            total: [],
            best: [],
            normal: [],
            noprofit: [],
            nobump: [],
          };

          /*   - loop through each offer , START -   */
          for (const offer of offers.items) {
            bumpStatistic['total'].push(offer.Title);

            // all necessary data
            const offerDataForBump = getOfferDataForBump(
              offer,
              accsClosedTargets[accName],
              aggregatedPricesObj,
              allOffersOfAllAccs
            );
            if (offerDataForBump === 'err') {
              console.log(errMsg, offer.Title);
              continue;
            }
            const { purchasePrice, offerPrice, bestPriceOnMarket, daysSincePurchase } = offerDataForBump;

            // revenue
            revenue[accName].allOffersPurchasedFor += purchasePrice;
            revenue[accName].allOffersOnSaleFor += substractFee(offerPrice);

            // check if the offer has the best price on market
            if (offerPrice <= bestPriceOnMarket) {
              bumpStatistic['best'].push({ offer, offerDataForBump });
              continue;
            }

            // decide if offer needs price-equalize or normal bump, set newPrice
            const newPriceForOfferBump = getNewPriceForOfferBump(offerDataForBump);
            if (newPriceForOfferBump === 'err') {
              console.log(errMsg, offer.Title, 'new price err');
              continue;
            }
            const { newPrice } = newPriceForOfferBump;
            if (!newPrice) {
              console.log(errMsg, offer.Title, 'new price is null');
              continue;
            }

            // get percent from purchase price to new price minus fee
            const percent = getPercent(purchasePrice, substractFee(newPrice));

            // if non of below condition is true, then dont bump
            if (percent >= MIN_PROFIT_PERCENT - 0.5) {
              bumpStatistic['normal'].push(offer.Title);
            } else if (daysSincePurchase >= 30 && percent >= 0) {
              bumpStatistic['noprofit'].push(offer.Title);
            } else {
              bumpStatistic['nobump'].push({ offer, offerDataForBump, newPrice, percent });
              continue;
            }

            offersToUpdate[accName].push({
              OfferID: offer.Offer.OfferID,
              AssetID: offer.AssetID,
              Price: { Currency: 'USD', Amount: newPrice },
            });
          }
          /*   - loop through each offer, END -   */

          logBumpStatistic(bumpStatistic, false, false);
        } catch (err) {
          console.log(errMsg, err);
          resolve('err');
          return;
        }
      }
      /*   - loop through each account, END -   */

      // make request to update prices
      for (const accName in offersToUpdate) {
        console.log(`update ${offersToUpdate[accName].length} offers, for ${accName}...`);
        if (offersToUpdate[accName].length > 0) {
          await updateOffersPrices(accName as TAccName, offersToUpdate[accName]);
        }
      }

      // logRevenue(revenue, accsData);

      resolve({ accsClosedTargets });
      return;
    } catch (err) {
      console.log('- bump and make offers error', err);
      resolve('err');
    }
  });
};
