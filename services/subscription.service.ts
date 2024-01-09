import moment from 'moment';
import { ADMIN_ROLE_ID, DOCTOR_ROLE_ID, MIDWIFE_ROLE_ID } from '../config';
import { IHospitalClient, IUserData } from '../data/types';
import { equalStrings_i } from '../utils/preops';

export const determineIfUserIsAdmin = (user: IUserData) => {
  //---admin
  if (equalStrings_i(user.roleId, ADMIN_ROLE_ID)) {
    return true;
  }
  return false;
};

export const determineIfUserOwnsCard = (user: IUserData, cardEmail: string) => {
  //---own card
  if (equalStrings_i(user.email, cardEmail)) {
    return true;
  }

  return false;
};

export const determineIfFreemiumTokenIsExpired = (user: IUserData) => {
  const daysLeftToExpiry = user.freemiumTokenExpiry
    ? moment(user.freemiumTokenExpiry).diff(moment(), 'days')
    : -1;

  return daysLeftToExpiry < 0;
};

export const determineDaysLeftBeforeClientDischarge = (
  client: IHospitalClient
) => {
  const daysLeftToExpiry = client.hospitalizationExpiry
    ? moment(client.hospitalizationExpiry).diff(moment(), 'days')
    : -1;

  // return daysLeftToExpiry < 0;
  return daysLeftToExpiry;
};

export const determineIfClientDischargeIsDue = (client: IHospitalClient) => {
  const daysLeftToExpiry = client.hospitalizationExpiry
    ? moment(client.hospitalizationExpiry).diff(moment(), 'days')
    : -1;

  return daysLeftToExpiry < 0;
};

export const determineUserTypeName = (roleId: string) => {
  let name = 'user';

  if (roleId == ADMIN_ROLE_ID) {
    name = 'Admin';
  }
  if (roleId == DOCTOR_ROLE_ID) {
    name = 'Doctor';
  }
  if (roleId == MIDWIFE_ROLE_ID) {
    name = 'Midwife';
  }

  return name;
};
