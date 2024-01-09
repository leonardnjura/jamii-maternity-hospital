import { IUserData } from '../../../data/types';
import { IUserRoleType } from './UserRoleType';

const base: IUserRoleType = {
  user: {} as IUserData,
};

export const mockUserRoleTypeProps = {
  base,
};
