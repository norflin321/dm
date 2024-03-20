import { TNewTargetData } from '@/types';
import { round, substractFee } from '../other';

export const createTargetObject = (data: TNewTargetData) => {
  const imageBaseUrl = 'https://steamcommunity-a.akamaihd.net/economy/image/';
  const payload = {
    amount: 1,
    gameId: 'a8db',
    price: { amount: round(data.newPrice * 100).toString(), currency: 'USD' },
    attributes: {
      // category: data.firestoreData.category,
      gameId: 'a8db',
      // exterior: data.firestoreData.exterior,
      // categoryPath: data.firestoreData.categoryPath,
      // name: data.firestoreData.name,
      // image: imageBaseUrl + data.firestoreData.image,
      title: data.name,
      // ownerGets: {
      //   amount: round(substractFee(data.newPrice) * 100).toString(),
      //   currency: 'USD',
      // },
    },
  };
  // if (payload.attributes.exterior === 'undefined') {
  //   // @ts-ignore
  //   delete payload.attributes.exterior;
  // }
  return payload;
};
