import { TAccName, TNewTargetData } from '@/types';
import { chunkBy } from '../other';
import { dmPost } from '../api';
import { createTargetObject } from './createTargetObject';

export const updateAccTargets = (accName: TAccName, data: TNewTargetData[]): Promise<void> => {
  return new Promise(async resolve => {
    const errMsg = '  update targets error ' + accName + ',';

    const dataChunks: TNewTargetData[][] = chunkBy(data, 10);

    const sends = [];
    for (const chunk of dataChunks) {
      const send = dmPost(accName, '/exchange/v1/target/update', {
        force: true,
        targets: chunk.map(el => ({ body: createTargetObject(el), id: el.targetId })),
      })
        .then(res => {
          if (!res || !res.updated) {
            console.log(errMsg, res);
          }
          console.log('  updated:', res.updated.length, 'failed:', res.failedTargets.length);
        })
        .catch(err => console.log(errMsg, err.error));

      sends.push(send);
      await new Promise(r => setTimeout(r, 500));
    }

    await Promise.all(sends);

    resolve();
  });
};
