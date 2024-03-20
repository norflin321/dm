import { TAccData, TAccName, TAccsClosedTargets, TCreateOfferData } from '@/types';
import { MIN_PROFIT_PERCENT } from '@/constants';
import { getAccInventory } from '@/utils/account';
import { getAggregatedPrices, round, substractFee, toLocalDateFormat } from '@/utils/other';
import { createOffers } from '@/utils/offers';

export const makeNewOffers = (
  accsData: TAccData[],
  accsClosedTargets: TAccsClosedTargets,
  firstRun: boolean
): Promise<'err' | void> => {
  return new Promise(async resolve => {
    console.log('\n-- Make new offers...');

    for (const data of accsData) {
      const { accName } = data;
      const errMsg = '✖ Err: make new offers for: ' + accName;
      try {
        console.log(`${accName}...`);

        const accInventoryInMarket = await getAccInventory(accName as TAccName);
        if (accInventoryInMarket === 'err') continue;

        console.log(`- items in inventory: ${accInventoryInMarket.length}`);
        if (accInventoryInMarket.length === 0) continue;

        // get aggregated prices for items
        const titles = accInventoryInMarket.map((el: any) => el.title);
        const aggregatedPrices = await getAggregatedPrices(accName as TAccName, titles);
        if (aggregatedPrices === 'err') continue;

        const offersToCreate: TCreateOfferData[] = [];

        // loop through each item in inventory
        for (const item of accInventoryInMarket) {
          // find purchase data for the item
          const itemPurchaseData = accsClosedTargets[accName].find(el => el.subject === item.title);
          if (!itemPurchaseData) {
            console.log(errMsg, 'cant find purchase data for:', item.title);
            continue;
          }
          const purchasePrice = parseFloat(itemPurchaseData.changes[0].money.amount);

          // count how many minutes since purchase
          const purchaseDate: any = new Date(itemPurchaseData.updatedAt * 1000);
          const minsSincePurchase = round((Date.now() - purchaseDate) / 1000 / 60);

          console.log(`- ${item.title}`);
          console.log(`  Purchased: ${purchasePrice} (${toLocalDateFormat(purchaseDate)})`);

          if (!firstRun && minsSincePurchase > 5) {
            console.log('- not first run, minutes since purchase >', 5);
            continue;
          }

          // find aggregated prices for the item
          const itemAggregatedData = aggregatedPrices.find(el => item.title === el.MarketHashName);
          if (!itemAggregatedData) {
            console.log(errMsg, 'cant find aggregated data for:', item.title);
            continue;
          }
          const marketBestPrice = parseFloat(itemAggregatedData.Offers.BestPrice);

          let newPrice = null;

          // if there is no offers for this item on dmarket, or if best market price
          // for some reason is zero, set new price to purchasePrice + (10% + 7%(fee))
          if (itemAggregatedData.Offers.Count === 0 || marketBestPrice === 0) {
            newPrice = round(purchasePrice + purchasePrice * 0.17);
          } else {
            // or to best market price but a bit less
            newPrice = round(marketBestPrice - 0.01);
          }

          let newPriceMinusFee = substractFee(newPrice);
          let percent = round(((newPriceMinusFee - purchasePrice) / purchasePrice) * 100);

          // if percent from purchasePrice to newPriceMinusFee is less then MIN_PROFIT_PERCENT,
          // then set newPrice to purchasePrice + (10% + 7%(fee))
          if (percent < MIN_PROFIT_PERCENT || percent > 30) {
            newPrice = round(purchasePrice + purchasePrice * 0.17);
            newPriceMinusFee = substractFee(newPrice);
            percent = round(((newPriceMinusFee - purchasePrice) / purchasePrice) * 100);
          }

          console.log(`  Sell price: ${newPrice} (${percent}%)`);

          offersToCreate.push({
            AssetID: item.itemId,
            Price: { Currency: 'USD', Amount: newPrice },
          });
        }

        await createOffers(accName as TAccName, offersToCreate);
      } catch (err) {
        console.log(errMsg, err);
        resolve('err');
      }
    }

    resolve();
  });
};
