import { TAccName } from '@/types';
import { chunkBy } from '../other';
import { dmGet, dmPost } from '../api';

// prettier-ignore
const getTargetsForFixUrl = '/exchange/v1/user/targets?side=user&orderBy=updated&orderDir=desc&title=&priceFrom=0&priceTo=0&treeFilters=&gameId=a8db&cursor=&limit=100&currency=USD&platform=browser';

export const removeAccTargets = (accName: TAccName, targetsIds: string[]): Promise<'err' | void> => {
  return new Promise(async resolve => {
    const errMsg = '  remove acc targets error ' + accName + ',';
    try {
      const failedTargetsIds: string[] = [];
      const chunks: string[][] = chunkBy(targetsIds, 10);
      const sends = [];
      for (const chunk of chunks) {
        const send = dmPost(accName, '/marketplace-api/v1/user-targets/delete', {
          Targets: chunk.map(el => ({ TargetID: el })),
        })
          .then(res => {
            if (!res || !res.Result) {
              console.log(errMsg);
            }
            if (res.error) {
              console.log(errMsg, res.error, res.message);
            }
            let successes = 0;
            let fails = 0;
            for (const r of res.Result) {
              if (r.Successful) {
                successes++;
              } else {
                failedTargetsIds.push(r.DeleteTarget.TargetID);
                fails++;
              }
            }
            console.log('  successes:', successes, 'fails:', fails);
          })
          .catch(err => console.log(errMsg, err.error));
        sends.push(send);
        await new Promise(r => setTimeout(r, 500));
      }
      await Promise.all(sends);
      if (failedTargetsIds.length > 0) {
        console.log('  retrying to remove targets with web api:', failedTargetsIds.length);
        await removeAccTargetsWebApi(accName, failedTargetsIds);
      }
      resolve();
    } catch (err) {
      console.log(errMsg, err);
      resolve('err');
    }
  });
};

export const removeAccTargetsWebApi = (
  accName: TAccName,
  targetsIds: string[]
): Promise<'err' | void> => {
  return new Promise(async resolve => {
    await dmGet(accName, getTargetsForFixUrl); // it fixes bug with non removable tagets
    const errMsg = '  remove acc targets web api error ' + accName + ',';
    try {
      const chunks: string[][] = chunkBy(targetsIds, 10);
      const sends = [];
      for (const chunk of chunks) {
        const send = dmPost(accName, '/exchange/v1/target/delete', {
          force: true,
          targetIds: chunk,
        })
          .then(res => {
            // console.log(res);
            console.log(`  failes: ${res.failed?.length}`);
          })
          .catch(err => console.log(errMsg, err.error));
        sends.push(send);
        await new Promise(r => setTimeout(r, 500));
      }
      await Promise.all(sends);
      resolve();
    } catch (err) {
      console.log(errMsg, err);
      resolve('err');
    }
  });
};
