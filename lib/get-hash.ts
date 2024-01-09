import { server } from '../config';
import { stripFields } from '../data/my-schemas';

export async function generateHash(
  input: string,
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    const res = await fetch(`${server}/api/hash?input=${input}`);
    //**pure res or processed to tsobj*/
    if (!returnProcessedData) return res;

    let rawData = await res.json();

    if (excludeFields != null) {
      return JSON.parse(stripFields(rawData['data'], excludeFields));
    }
    return rawData['data'];
  } catch (e) {
    console.log(`!!Ayayai on generateHash():: ${e}`);
    return null;
  }
}

export async function validateInputAgainstHash(
  input: string,
  hash: string,
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    const res = await fetch(
      `${server}/api/hash/validate?input=${input}&hash=${hash}`
    );
    //**pure res or processed to tsobj*/
    if (!returnProcessedData) return res;

    let rawData = await res.json();

    if (excludeFields != null) {
      return JSON.parse(stripFields(rawData['data'], excludeFields));
    }
    return rawData['data'];
  } catch (e) {
    console.log(`!!Ayayai on validateHash():: ${e}`);
    return null;
  }
}
