import { WannaSearch } from '../../../data/enums';
import { ISearch } from './Search';

const base: ISearch = {
  routeTo: WannaSearch.Users,
};

export const mockSearchProps = {
  base,
};
