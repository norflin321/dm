import { dmAccounts, firestore, getFirestoreDataFromHeroku } from '@/constants';
import { getBasicDataForAccounts } from '@/utils/account';
import { logTargetsTable } from '@/utils/other/logNewTargets';
import { evaluateMyTargets } from '@/utils/targets';

const magic = async () => {
  const basicAccsData = await getBasicDataForAccounts(dmAccounts);
  if (basicAccsData === 'err') {
    console.log(`- Get basic accs data err!`);
    return;
  }

  const firestoreData = await getFirestoreDataFromHeroku();
  if (Object.keys(firestoreData?.items).length === 0 || firestoreData?.updated === 0) {
    console.log(`- No Firestore data!`);
    return;
  }

  const myEvaluatedTargets = await evaluateMyTargets(basicAccsData, firestoreData.items);
  if (myEvaluatedTargets === 'err') {
    console.log(`- Evaluate my targets err!`);
    return;
  }

  console.log('\n');
  for (const accName in myEvaluatedTargets) {
    console.log(`${accName}:`);
    logTargetsTable(myEvaluatedTargets[accName]);
  }

  firestore.terminate();
};
magic();
