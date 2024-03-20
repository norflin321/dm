import { DEV, PROD, ACTIVE, dmAccounts } from '@/constants';
import { getBasicDataForAccounts } from '@/utils/account';
import { bumpOffers } from './bumpOffers';
import { startExpress } from '@/utils/other/express';
import { makeNewOffers } from './makeNewOffers';
import { filterFirebaseForNewTargets } from './filterFirebaseForNewTargets';
import { searchForNewTargets } from './searchForNewTargets';

startExpress();

let firstRun = true;

const main = async () => {
  console.log('\n\n');
  console.log('>------------------------------------------------<');

  const accsData = await getBasicDataForAccounts(dmAccounts);
  if (accsData === 'err') {
    restart();
    return;
  }

  const bumpOffersRes = await bumpOffers(accsData);
  if (bumpOffersRes === 'err') {
    restart();
    return;
  }

  await makeNewOffers(accsData, bumpOffersRes.accsClosedTargets, firstRun);

  const filterFirebaseForNewTargetsRes = await filterFirebaseForNewTargets(accsData);
  if (filterFirebaseForNewTargetsRes === 'err') {
    restart();
    return;
  }
  const { filtered, filteredWithMyTargets } = filterFirebaseForNewTargetsRes;

  if (Object.keys(filtered).length > 0) {
    await searchForNewTargets(filtered, accsData, filteredWithMyTargets);
  }

  console.log('Done!');
  await new Promise(r => setTimeout(r, 5 * 1000));
  firstRun = false;
  main();
};

if (DEV) {
  main();
} else if (PROD && ACTIVE) {
  main();
}

const restart = () => setTimeout(main, 10 * 1000);
