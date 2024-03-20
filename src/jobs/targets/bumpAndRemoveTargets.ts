import { TAccData, TFirestoreData, TAccName } from '@/types';
import { MIN_PROFIT_PERCENT } from '@/constants';
import { getAggregatedPrices, evaluateForTarget, round } from '@/utils/other';
import { getAccTargets, removeAccTargets, updateAccTargets } from '@/utils/targets';

export const bumpAndRemoveTargets = (
  accsData: TAccData[],
  firestoreData: TFirestoreData
): Promise<'err' | void> => {
  return new Promise(async resolve => {
    try {
      /*   **** loop through each account, START ****   */
      for (const { accName, targets, offers } of accsData) {
        const errMsg = '  bump and remove targets for: ' + accName + ' error,';
        try {
          const targetsToRemove = [];
          const targetsToUpdate = [];

          console.log('\n' + accName + '...');

          // if account has active targets
          if (targets.items.length > 0) {
            // get aggregated prices for all active targets
            const titles = targets.items.map(el => el.Title);
            const aggregatedPrices = await getAggregatedPrices(accName as TAccName, titles);
            if (aggregatedPrices === 'err') {
              resolve();
              return;
            }

            // convert them into object, so i dont have to use array.find
            const aggregatedPricesObj: { [key: string]: any } = {};
            for (const i of aggregatedPrices) {
              aggregatedPricesObj[i.MarketHashName] = i;
            }

            /*   ** loop through each active target, START **   */
            for (const target of targets.items) {
              try {
                // if item is no longer in firestoreData, then push him to targetsToRemove
                if (!firestoreData.items[target.Title]) {
                  console.log('remove: ' + target.Title, 'no longer in firestoreData');
                  targetsToRemove.push(target);
                  continue;
                }

                const aggrPrices = aggregatedPricesObj[target.Title];

                // skip item, if it has no targets, it should have atleast mine, but in case of error
                if (aggrPrices.Orders.Count === 0 || aggrPrices.Orders.BestPrice === '0') continue;

                const myTargetPrice = target.Price.Amount;

                // evaluate item
                const evaluatedItem = evaluateForTarget(aggrPrices, firestoreData.items[target.Title]);

                // check if my target price became not profitable enough, in case of estimated selling
                // price change
                const percentFromMyTargetPriceToESP = round(
                  ((evaluatedItem.estimatedSellingPrice - myTargetPrice) / myTargetPrice) * 100
                );
                if (percentFromMyTargetPriceToESP < MIN_PROFIT_PERCENT) {
                  console.log(
                    'remove: ' + target.Title,
                    'became not profitable',
                    myTargetPrice,
                    percentFromMyTargetPriceToESP
                  );
                  targetsToRemove.push(target);
                  continue;
                }

                // remove target if i have more then one target for this item in this account,
                // and if already didnt remove one target for this item
                if (
                  targets.items.filter(el => el.Title === target.Title).length > 1 &&
                  !targetsToRemove.find(el => el.Title === target.Title)
                ) {
                  console.log('remove: ' + target.Title, 'duplicate targets');
                  targetsToRemove.push(target);
                  continue;
                }

                // check if i already have an offer for this item on this account,
                // and if already didnt remove one target for this item
                if (
                  offers.items.find(el => el.Title === target.Title) &&
                  !targetsToRemove.find(el => el.Title === target.Title)
                ) {
                  console.log('remove: ' + target.Title, 'already have an offer');
                  targetsToRemove.push(target);
                  continue;
                }

                // check if my price is the best then skip,
                if (evaluatedItem.bestTargetPrice === myTargetPrice) {
                  continue;
                }

                // if not then need update, but before need to check if new price is profitable enough,
                // if it is then update
                if (
                  evaluatedItem.percent >= MIN_PROFIT_PERCENT &&
                  evaluatedItem.percent <= 50 &&
                  evaluatedItem.newPrice < 600 &&
                  evaluatedItem.newPrice !== target.Price.Amount
                ) {
                  targetsToUpdate.push({ ...evaluatedItem, targetId: target.TargetID });
                  continue;
                }

                if (evaluatedItem.bestTargetPrice > myTargetPrice) {
                  console.log(
                    '-- remove: ' + target.Title,
                    '\n Best target price: ' + evaluatedItem.bestTargetPrice,
                    '\n My target price: ' + myTargetPrice,
                    '\n Percent from new price to esp: ' + evaluatedItem.percent,
                    '\n'
                  );
                  targetsToRemove.push(target);
                }
              } catch (err) {
                console.log(errMsg, target.Title, err);
              }
            }
            /*   ** loop through each active target, END **   */
          }

          // get my inactive targets and push them to targetToRemoveIds array
          const inactiveTargets = await getAccTargets(accName as TAccName, 'TargetStatusInactive');
          if (inactiveTargets === 'err') {
            resolve();
            return;
          }
          for (const inactiveTarget of inactiveTargets.Items) {
            console.log('remove: ' + inactiveTarget.Title, 'target is inactive');
            targetsToRemove.push(inactiveTarget);
          }

          // make request to remove targets
          console.log('- remove:', targetsToRemove.length);
          if (targetsToRemove.length > 0) {
            await removeAccTargets(accName as TAccName, [
              ...Array.from(new Set(targetsToRemove.map(el => el.TargetID))),
            ]);
          }

          // make request to update targets
          console.log('- update:', targetsToUpdate.length);
          targetsToUpdate.length > 0 && (await updateAccTargets(accName as TAccName, targetsToUpdate));
        } catch (err) {
          console.log(errMsg, err);
          resolve('err');
          return;
        }
      }
      /*   **** loop through each account, END ****   */

      resolve();
    } catch (err) {
      console.log('  bump and remove targets error', err);
      resolve('err');
    }
  });
};
