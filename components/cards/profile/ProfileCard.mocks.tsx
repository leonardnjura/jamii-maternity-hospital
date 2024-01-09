import { IUserData } from '../../../data/types';
import { IProfileCard } from './ProfileCard';

const base: IProfileCard = {
  profile: {} as IUserData,
  idx: 0,
  mainSite: false,
  vanishDeletedCards: false,
};

export const mockProfileCardProps = {
  base,
};
