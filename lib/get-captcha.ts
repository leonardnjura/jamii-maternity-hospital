import { server } from '../config';
import { stripFields } from '../data/my-schemas';

/** */
export async function verifyIfUserIsABot(
  token: string,
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    /**Google: Are you a Human, Agent: I try to be*/
    const res = await fetch(
      `${server}/api/verifycaptcha?secret=${process.env
        .recaptchaSecret!}&token=${token}`
    );
    //**pure res or processed to tsobj*/
    if (!returnProcessedData) return res;

    let rawData = await res.json();

    console.log(`!!recaptcha score data::`, rawData);
    // console.log(`!!score > 0.5`, rawData['data'].score > 0.5)

    if (excludeFields != null) {
      return JSON.parse(stripFields(rawData['data'], excludeFields));
    }
    return rawData['data'];
  } catch (e) {
    console.log(`!!Oops on verifyIfUserIsABot():: ${e}`);
    return null;
  }
}
