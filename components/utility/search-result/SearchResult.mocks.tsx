import { IUserData } from '../../../data/types';
import { ISearchResult } from './SearchResult';

const base: ISearchResult = {
  result: {} as IUserData,
  mode: '',
};

export const mockSearchResultProps = {
  base,
};
