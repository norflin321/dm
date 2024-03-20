import { TAccData, TRevenue } from '@/types';
import { round } from '.';
import { formatAccName } from './formatAccName';

export const logRevenue = (revenue: TRevenue, accsData: TAccData[]) => {
  console.log('\n-- Revenue...');
  for (const accName in revenue) {
    const offersPurchased = round(revenue[accName].allOffersPurchasedFor);
    const offersCurrent = round(revenue[accName].allOffersOnSaleFor);
    const accBalance = accsData.find(el => el.accName === accName)?.balance;
    if (!accBalance) continue;

    const formatedAccName = formatAccName(accName);
    const currentAndBalance = round(offersCurrent + accBalance);
    console.log(
      `- ${formatedAccName} purchased: ${offersPurchased}, current: ${offersCurrent}, current + balance: ${currentAndBalance}`
    );
  }
};
