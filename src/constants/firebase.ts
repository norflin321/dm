import { TFirestoreDataItem } from '@/types';
import firebase from 'firebase';
import rp from 'request-promise-native';

const firebaseConfig = {
  apiKey: 'AIzaSyAPZD4J7xt9841YR3KUcGvfU0O5LB7-LEs',
  authDomain: 'dmparser-87819.firebaseapp.com',
  projectId: 'dmparser-87819',
  storageBucket: 'dmparser-87819.appspot.com',
  messagingSenderId: '520280690024',
  appId: '1:520280690024:web:60a355d4e0398460715add',
};

firebase.initializeApp(firebaseConfig);
export const firestore = firebase.firestore();
export const firestoreDb = firestore.collection('db').doc('db');

export const getFirestoreDataFromHeroku = (): Promise<{
  items: { [key: string]: TFirestoreDataItem };
  // errors: any;
  updated: any;
}> => {
  return rp({
    method: 'GET',
    uri: 'https://dmarket-csgoitems-parser.herokuapp.com/db',
    json: true,
    timeout: 10 * 1000,
  }).catch(err => console.log('Get firestore data from heroku error:', err));
};
