import { ACTIVE, DEV, PROD, dmAccounts, getFirestoreDataFromHeroku } from '@/constants';
import { TFirestoreData } from '@/types';
import { getBasicDataForAccounts } from '@/utils/account';
import { toLocalDateFormat } from '@/utils/other';
import { bumpAndRemoveTargets } from './bumpAndRemoveTargets';
import { startExpress } from '@/utils/other/express';

startExpress();

let firestoreData: TFirestoreData;
let updateFirestoreDataCounter = 10;

const magic = async () => {
  console.log('\n\n');
  try {
    const accsData = await getBasicDataForAccounts(dmAccounts);
    if (accsData === 'err') {
      restart();
      return;
    }

    // get items from firestore
    if (updateFirestoreDataCounter >= 10) {
      updateFirestoreDataCounter = 0;
      console.log('\n' + '-- Get firestore data...');
      firestoreData = await getFirestoreDataFromHeroku();
      console.log('Updated:', toLocalDateFormat(firestoreData.updated));
      console.log('Items:', Object.keys(firestoreData.items).length);
    } else {
      updateFirestoreDataCounter += 1;
    }

    if (accsData[0].targets.total === '0' && accsData[1].targets.total === '0') {
      console.log('no targets');
      restart();
      return;
    }

    if (!firestoreData || !firestoreData.items || Object.keys(firestoreData.items).length === 0) {
      console.log('✖ Err: firestore no data');
      restart();
      return;
    }

    console.log('\n' + '-- Bump and remove targets...');
    await bumpAndRemoveTargets(accsData, firestoreData);

    magic();
  } catch (err) {
    console.log('magic try catch err:', err);
    restart();
    return;
  }
};

if (DEV) {
  magic();
} else if (PROD && ACTIVE) {
  magic();
}

const restart = () => setTimeout(magic, 10 * 1000);
