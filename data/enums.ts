/***********************************/
export enum WannaSearch {
  Users,
  OtherItems,
}

//wannasearch helpers
const users = 'users';
const otherItems = 'otherItems';

export const WannaSearchString = {
  users,
  otherItems,
};
/***********************************/

export enum Availability {
  ALL,
  ADMIN,
}

export const decodeEnumAvailability = (
  enumThing: Availability,
  pricingLabel: boolean = false
) => {
  let decoded: string = 'unknown';

  switch (enumThing) {
    case Availability.ALL:
      decoded = 'ALL';
      break;
    case Availability.ADMIN:
      decoded = pricingLabel ? 'ADMIN' : 'ADMIN';
      break;
    default:
  }

  return decoded;
};
