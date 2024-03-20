import { TAccData, TAccName } from '@/types';
import { dmAccounts } from '@/constants';
import { getAccBalance } from '@/utils/account';
import { getAccTargets, removeAccTargets } from '@/utils/targets';
import { getAccOffers } from '@/utils/offers';

const magic = async () => {
  const accsData: TAccData[] = [];
  for (const accName in dmAccounts) {
    const balance = await getAccBalance(accName as TAccName);
    if (balance === 'err') {
      restart();
      return;
    }

    const targets = await getAccTargets(accName as TAccName, 'TargetStatusActive');
    if (targets === 'err') {
      restart();
      return;
    }

    const offers = await getAccOffers(accName as TAccName);
    if (offers === 'err') {
      restart();
      return;
    }

    accsData.push({
      accName: accName,
      balance: balance,
      targets: { items: targets.Items, total: targets.Total },
      offers: { items: offers.Items, total: offers.Total },
    });
  }
  console.log(accsData);

  console.log('Remove all targets...');
  for (const acc of accsData) {
    await removeAccTargets(acc.accName as TAccName, [
      ...Array.from(new Set(acc.targets.items.map(el => el.TargetID))),
    ]);
  }
};
magic();

const restart = () => setTimeout(magic, 10 * 1000);
