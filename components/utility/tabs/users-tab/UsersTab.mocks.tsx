import { IUserData } from '../../../../data/types';
import { IUsersTab } from './UsersTab';

const base: IUsersTab = {
  userOfInterest: {} as IUserData,
};

export const mockUsersTabProps = {
  base,
};
