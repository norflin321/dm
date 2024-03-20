import { TAccName, TNewTargetData } from '@/types';
import { chunkBy } from '../other';
import { dmPost } from '../api';

export const createTargets = (accName: TAccName, data: TNewTargetData[]): Promise<void> => {
  return new Promise(async resolve => {
    const errMsg = '  create targets error ' + accName + ',';
    const dataChunks: TNewTargetData[][] = chunkBy(data, 10);
    const sends = [];
    for (const chunk of dataChunks) {
      console.log('  create', chunk.length, 'targets');
      const payload = {
        GameID: 'a8db',
        Targets: chunk.map(el => ({
          Amount: '1',
          Price: {
            Currency: 'USD',
            Amount: el.newPrice,
          },
          Title: el.name,
        })),
      };
      const send = dmPost(accName, '/marketplace-api/v1/user-targets/create', payload)
        .then(res => {
          if (!res?.Result) {
            console.log('  targets creation err');
            return;
          }
          const failed = res.Result.filter((el: any) => !el.Successful);
          if (failed.length > 0) {
            console.log('  not all targets created:', failed);
            return;
          }
          if (res.Result.length !== chunk.length) {
            console.log(
              '  not all targets created lengths is not the same',
              chunk.length,
              res.Result.length
            );
            return;
          }
          console.log('  successfully created', res.Result.length, 'targets');
        })
        .catch(err => console.log(errMsg, err.error));
      sends.push(send);
      await new Promise(r => setTimeout(r, 500));
    }
    await Promise.all(sends);
    resolve();
  });
};
