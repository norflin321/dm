import { TAccName, TCreateOfferData } from '@/types';
import { chunkBy } from '../other';
import { dmPost } from '../api';

export const createOffers = (accName: TAccName, data: TCreateOfferData[]): Promise<void> => {
  return new Promise(async resolve => {
    const errMsg = '✖ Err: create offers ' + accName;

    const dataChunks: TCreateOfferData[][] = chunkBy(data, 10);

    const sends = [];
    for (const chunk of dataChunks) {
      console.log(`- create ${chunk.length} offers...`);

      const send = dmPost(accName, '/marketplace-api/v1/user-offers/create', { Offers: chunk })
        .then(res => {
          if (res.error) {
            console.log(errMsg, res.error, res.message);
            return;
          }
          if (!res.Result) {
            console.log(errMsg);
            return;
          }

          if (res.Result.length === chunk.length) {
            console.log(`  successfully created ${res.Result.length}`);
          } else {
            console.log(errMsg, 'Result length is not the same as chunk length');
            console.log('Result length:', res.Result.length, ' Chunk length:', chunk.length);
          }
        })
        .catch(err => console.log(errMsg, err.error));

      sends.push(send);
      await new Promise(r => setTimeout(r, 500));
    }

    await Promise.all(sends);

    resolve();
  });
};
