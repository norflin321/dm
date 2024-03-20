import rp from 'request-promise-native';
import nacl from 'tweetnacl';

import { dmAccounts } from '@/constants';
import { TAccName } from '@/types';

const byteToHexString = (uint8arr: Uint8Array) => {
  if (!uint8arr) {
    return '';
  }

  let hexStr = '';
  const radix = 16;
  const magicNumber = 0xff;
  for (let i = 0; i < uint8arr.length; i++) {
    let hex = (uint8arr[i] & magicNumber).toString(radix);
    hex = hex.length === 1 ? '0' + hex : hex;
    hexStr += hex;
  }

  return hexStr;
};

const hexStringToByte = (str: string) => {
  if (typeof str !== 'string') {
    throw new TypeError('Wrong data type passed to convertor. Hexadecimal string is expected');
  }
  const twoNum = 2;
  const radix = 16;
  const uInt8arr = new Uint8Array(str.length / twoNum);
  for (let i = 0, j = 0; i < str.length; i += twoNum, j++) {
    uInt8arr[j] = parseInt(str.substr(i, twoNum), radix);
  }
  return uInt8arr;
};

const sign = (string: string, secretKey: string) => {
  const signatureBytes = nacl.sign(
    new TextEncoder().encode(string),
    hexStringToByte(secretKey)
  );
  return byteToHexString(signatureBytes).substr(0, 128);
};

const serialize = (obj: any, prefix?: any): string => {
  let str = [],
    p;
  for (p in obj) {
    if (obj.hasOwnProperty(p)) {
      let k = prefix ? prefix + '[' + p + ']' : p,
        v = obj[p];
      str.push(
        v !== null && typeof v === 'object'
          ? serialize(v, k)
          : encodeURIComponent(k) + '=' + encodeURIComponent(v)
      );
    }
  }
  return str.join('&');
};

// DM GET
export const dmGet = async (
  accName: TAccName,
  uri: string,
  querys?: { [key: string]: any },
  timeout?: number
) => {
  let queryStr = '';
  if (querys) {
    queryStr = '?' + serialize(querys).replace(/'/g, '%27');
  }

  let publicKey,
    secretKey = '';
  if (accName !== '') {
    publicKey = dmAccounts[accName].publicKey;
    secretKey = dmAccounts[accName].secretKey;
  }

  const timestamp = Math.floor(new Date().getTime() / 1000);
  const method = 'GET';

  let signature = '';
  if (accName !== '') {
    signature = sign(method + uri + queryStr + timestamp, secretKey);
  }

  const options = {
    method: method,
    uri: 'https://api.dmarket.com' + uri + queryStr,
    ...(accName !== '' && {
      headers: {
        'X-Api-Key': publicKey,
        'X-Request-Sign': 'dmar ed25519 ' + signature,
        'X-Sign-Date': timestamp,
        'Content-Type': 'application/json',
      },
    }),
    json: true,
    timeout: timeout || 10 * 1000,
  };
  return rp(options);
};

// DM POST
export const dmPost = async (accName: TAccName, uri: string, body: any) => {
  let publicKey,
    secretKey = '';
  if (accName !== '') {
    publicKey = dmAccounts[accName].publicKey;
    secretKey = dmAccounts[accName].secretKey;
  }

  const timestamp = Math.floor(new Date().getTime() / 1000);
  const method = 'POST';
  const signature = sign(method + uri + JSON.stringify(body) + timestamp, secretKey);

  const options = {
    method: method,
    uri: 'https://api.dmarket.com' + uri,
    ...(accName !== '' && {
      headers: {
        'X-Api-Key': publicKey,
        'X-Request-Sign': 'dmar ed25519 ' + signature,
        'X-Sign-Date': timestamp,
        'Content-Type': 'application/json',
      },
    }),
    body: body,
    json: true,
    timeout: 10 * 1000,
  };
  return rp(options);
};
