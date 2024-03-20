import { TAccName, TAggregatedPrice, TAggregatedPricesObj } from '@/types';
import { chunkBy } from '.';
import { dmGet } from '../api';

export const getAggregatedPrices = (
  accName: TAccName,
  titles: string[]
): Promise<'err' | TAggregatedPrice[]> => {
  return new Promise(async resolve => {
    const errMsg = 'get aggregated prices error ' + accName;
    try {
      const allAggregatedTitles: TAggregatedPrice[] = [];

      const uniqueTitles = [...Array.from(new Set(titles))];

      // if (titles.length !== uniqueTitles.length) {
      //   const nonUniqueCount = titles.length - uniqueTitles.length;
      //   console.log('in get aggregated prices, titles has ' + nonUniqueCount + ' non-unique items');
      // }

      const chunks = chunkBy(uniqueTitles, 100);

      for (const chunk of chunks) {
        const res = await dmGet(accName, '/price-aggregator/v1/aggregated-prices', {
          Titles: chunk,
          Limit: 100,
          Offset: 0,
        }).catch(err => console.log(errMsg, err.error));

        if (!res || res.Error !== null || res.AggregatedTitles.length === 0) {
          console.log(errMsg);
        } else {
          allAggregatedTitles.push(...res.AggregatedTitles);
        }
      }

      resolve(allAggregatedTitles);
    } catch (err) {
      console.log(errMsg, err);
      resolve('err');
    }
  });
};

export const convertAggregatedPricesToObject = (arr: TAggregatedPrice[]) => {
  const obj: TAggregatedPricesObj = {};
  for (const i of arr) {
    obj[i.MarketHashName] = { Offers: i.Offers, Orders: i.Orders };
  }
  return obj;
};
