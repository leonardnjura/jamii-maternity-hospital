import { useRouter } from 'next/router';
import { useContext } from 'react';
import DataStore from '../../../context/app/DataStore';
import { WannaSearchString } from '../../../data/enums';
import { IUserData } from '../../../data/types';

export interface ISearchResult {
  result: IUserData;
  mode: string;
  onClickPreops?: () => void;
}

const SearchResult: React.FC<ISearchResult> = ({
  onClickPreops = () => undefined,
  result,
  mode,
}) => {
  const router = useRouter();
  const { theme, setTheme, gotoPageStateOr_Blank } = useContext(DataStore);

  const { _id, firstName, lastName, email } = result;

  const gotoPage = (pg: string) => {
    router.push(`${pg}`);
  };

  return (
    <>
      {mode == WannaSearchString.users ? (
        <>
          <a
            className={`my-popsicle-link-search`}
            onClick={() => {
              onClickPreops();
              gotoPage(`/user/${_id}`);
            }}
          >
            {firstName!.toLowerCase()}:{_id}
          </a>
        </>
      ) : mode == WannaSearchString.users ? (
        <>
          <a
            className={`my-popsicle-link-search`}
            onClick={() => {
              onClickPreops();
              gotoPage(`/user/${_id}`);
            }}
          >
            {firstName!.toLowerCase()}:{_id}
          </a>
        </>
      ) : mode == WannaSearchString.otherItems ? (
        <>
          <a
            className={`my-popsicle-link-search`}
            onClick={() => {
              onClickPreops();
              gotoPage(`/user/${_id}`);
            }}
          >
            {firstName!.toLowerCase()}:{_id}
          </a>
        </>
      ) : (
        <a
          className={`my-popsicle-link-search`}
          onClick={() => {
            onClickPreops();
            gotoPage(`/user/${_id}`);
          }}
        >
          {firstName!.toLowerCase()}:{_id}
        </a>
      )}
    </>
  );
};

export default SearchResult;
