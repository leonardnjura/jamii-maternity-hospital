import { IHospitalClient, IUserData } from '../../../data/types';
import { IClientCard } from './ClientCard';

const base: IClientCard = {
  client: {} as IHospitalClient,
  idx: 0,
  vanishDeletedCards: false,
  clientListId: '',
};

export const mockClientCardProps = {
  base,
};
