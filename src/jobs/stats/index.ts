import { dmAccounts, firestore, getFirestoreDataFromHeroku } from '@/constants';
import { TAccName } from '@/types';
import { getAccHistory, getAccInventory, getBasicDataForAccounts } from '@/utils/account';
import { getAccOffers } from '@/utils/offers';
import { getDatesDiffInDays, round, toLocalDateFormat } from '@/utils/other';
import { createOnSaleTableItem } from './createOnSaleTableItem';
import { createPurchaseSalePair } from './createPurchaseSalePair';
import { sortHistoryData } from './sortHistoryData';

const magic = async () => {
  const basicAccsData = await getBasicDataForAccounts(dmAccounts);
  let allAccsBalance;
  if (basicAccsData !== 'err') {
    allAccsBalance = 0;
    for (const data of basicAccsData) {
      allAccsBalance += data.balance;
    }
  }

  const firestoreData = await getFirestoreDataFromHeroku();
  if (Object.keys(firestoreData?.items).length === 0 || firestoreData?.updated === 0) {
    console.log(`- No Firestore data!`);
  } else {
    console.log(`- Firestore last update: ${toLocalDateFormat(firestoreData?.updated)}`);
  }

  const howMuchDaysIsLately = 10;
  let allAccsProfit = 0;
  let allAccsProfitLately = 0;
  let bothAccsSeasonDays;
  let somePurchaseDataIsMissing = false;
  let allAccsBalanceInItems = 0;
  let allAccsBalanceInItemsWithProfit = 0;
  let unlistedItemsInInventory = false;

  for (const accName of Object.keys(dmAccounts)) {
    console.log(`\n- ${accName}...`);

    const accInventoryInMarket = await getAccInventory(accName as TAccName);
    if (accInventoryInMarket.length !== 0) {
      unlistedItemsInInventory = true;
    }

    const history = await getAccHistory(accName as TAccName);
    if (history === 'err') {
      console.log('✖ Err, get acc history');
      continue;
    }

    // TRADING_START_DATE is timestamp in epoch format (need to multiply by 1000 to get normal format)
    const TRADING_START_DATE = 1641192668; // example: 1610331050 (11.01.2021) or getFirstPurchaseOnAcc(history)
    if (!TRADING_START_DATE) continue;

    // TRADING_END_DATE is timestamp in already normal format
    const TRADING_END_DATE = Date.now(); // Date.now() or getLastPurchaseOnAcc(history)
    if (!TRADING_END_DATE) continue;
    const isTradingEndDateSetToNow = TRADING_END_DATE === Date.now();

    const { historyOfSells, historyOfCharginFees, historyOfTargetsClosed } = sortHistoryData(
      history,
      TRADING_START_DATE,
      TRADING_END_DATE / 1000
    );

    // ----- Last sales table -----
    const pairs: any[] = [];
    let diffTotal = 0;
    let diffTotalLately = 0;
    for (const sale of historyOfSells) {
      const pair = createPurchaseSalePair(sale, historyOfCharginFees, historyOfTargetsClosed, false);
      if (pair === 'no data') {
        somePurchaseDataIsMissing = true;
        continue;
      }
      pairs.push(pair);
      diffTotal += pair['diff $'];
      const daysSinceSale = getDatesDiffInDays(sale.updatedAt * 1000, Date.now());
      if (daysSinceSale <= howMuchDaysIsLately) {
        diffTotalLately += pair['diff $'];
      }
    }

    const seasonDays = getDatesDiffInDays(TRADING_START_DATE * 1000, TRADING_END_DATE);
    bothAccsSeasonDays = seasonDays;

    const tradingStartLocalFormat = toLocalDateFormat(TRADING_START_DATE * 1000);
    const tradingStartDate = tradingStartLocalFormat.split(',')[0];
    const tradingStartTime = tradingStartLocalFormat.split(',')[1].trim();
    const tradingEndLocalFormat = toLocalDateFormat(TRADING_START_DATE * 1000);
    const tradingEndDate = tradingEndLocalFormat.split(',')[0];
    const tradingEndTime = tradingEndLocalFormat.split(',')[1].trim();

    console.log(
      `Season:`,
      `${tradingStartDate}(${tradingStartTime})`,
      '-',
      `${isTradingEndDateSetToNow ? 'now' : `${tradingEndDate}(${tradingEndTime})`},`,
      `(${seasonDays} days or ${Math.round((seasonDays / 30) * 10) / 10} months)`
    );

    console.log(`Profit: ${round(diffTotal)}`);
    allAccsProfit += diffTotal;
    console.log(`Profit lately: ${round(diffTotalLately)}`);
    allAccsProfitLately += diffTotalLately;

    const numberOfLastSales = 20;
    console.table(pairs.slice(0, numberOfLastSales));

    // ----- On sale table -----
    const offers = await getAccOffers(accName as TAccName);
    if (offers === 'err') {
      console.log('✖ Err, get acc offers');
      continue;
    }

    let spentOnPurchases = 0;
    let currentTotalDiff = 0;
    let onSaleTable: { [key: string]: any }[] = [];

    for (const offer of offers.Items) {
      const offerData = createOnSaleTableItem(offer, historyOfTargetsClosed, firestoreData.items, false);
      currentTotalDiff += offerData['diff $'];
      if (typeof offerData['- $'] === 'number') {
        spentOnPurchases += offerData['- $'];
      } else {
        somePurchaseDataIsMissing = true;
      }
      onSaleTable.push(offerData);
    }
    onSaleTable = onSaleTable.sort((a, b) => b.selling_in_ms - a.selling_in_ms);
    for (const i of onSaleTable) delete i.selling_in_ms;

    console.log('On sale:');
    console.table(onSaleTable);
    console.log(`Spent on purchases: ${round(spentOnPurchases)}`);
    console.log(`Current diff: ${round(currentTotalDiff)}`);

    allAccsBalanceInItems += spentOnPurchases;
    allAccsBalanceInItemsWithProfit += spentOnPurchases + currentTotalDiff;
  }

  // log all accounts info
  console.log('\n');
  console.log('──────────────────────────────────');
  console.log(`${toLocalDateFormat(Date.now())}`);
  console.log(`- Profit`);
  console.log(`   All time: ${round(allAccsProfit)} (-471 spend)`);
  if (bothAccsSeasonDays) {
    console.log(`- Avg per day`);
    // prettier-ignore
    console.log(`   Last ${howMuchDaysIsLately} days: ${round(allAccsProfitLately / howMuchDaysIsLately)}`);
    console.log(`   All time: ${round(allAccsProfit / bothAccsSeasonDays)}`);
  }
  if (allAccsBalance) {
    console.log('- Balance');
    console.log('   Free:', round(allAccsBalance));
    // prettier-ignore
    console.log('   In items:', `${round(allAccsBalanceInItems)} -> ${round(allAccsBalanceInItemsWithProfit)} ${somePurchaseDataIsMissing ? '(some purchase data is missing)' : ''}`);
    // prettier-ignore
    console.log('   Total:', `${round(allAccsBalance + allAccsBalanceInItems)} -> ${round(allAccsBalance + allAccsBalanceInItemsWithProfit)}`);
    if (unlistedItemsInInventory) {
      console.log('- Unlisted items in inventory!');
    }
  }
  console.log('\n');
  firestore.terminate();
};
magic();
