import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Modal } from '@nextui-org/react';
import React, { useContext, useEffect, useState } from 'react';
import DataStore from '../../../context/app/DataStore';
import { WannaSearch, WannaSearchString } from '../../../data/enums';
import SearchResult from '../search-result/SearchResult';
import { ALGOLIA_SEARCH_ENABLED } from '../../../config';
import { IUserData } from '../../../data/types';
import { getLocalSearchResultsUsers } from '../../../services/search.service';

const algoliasearch = require('algoliasearch');

const client = algoliasearch(
  process.env.algoliaApplicationId,
  process.env.algoliaApiKey
);
const index = client.initIndex('countries');

export interface ISearch {
  routeTo?: WannaSearch;
  searchText?: string;
  mainSite?: boolean;
}

const Search: React.FC<ISearch> = ({
  routeTo,
  searchText,
  mainSite = true,
}) => {
  const defaultSearchTerm: string = '';
  const {
    theme,
    setTheme,
    algoliaSearchResults,
    setAlgoliaSearchResults,

    authenticatedUser,
    gotoPageStateOr_Blank,
  } = useContext(DataStore);

  const [searchTerm, setSearchTerm] = useState(defaultSearchTerm);
  const [mode, setMode] = useState(WannaSearchString.users);
  const [visible, setVisible] = useState(false);

  const handler = () => setVisible(true);
  const closeHandler = () => {
    setVisible(false);
  };

  useEffect(() => {
    const checkStatusOfThings = async () => {
      if (routeTo == WannaSearch.Users) {
        setMode(WannaSearchString.users);
      }

      if (routeTo == WannaSearch.OtherItems) {
        setMode(WannaSearchString.otherItems);
      }
    };
    checkStatusOfThings();
  }, [routeTo]);

  const searchAlgolia = async (searchTerm: string) => {
    var hits = (await index.search(`${searchTerm}`)).hits;

    //did we index raw json on algolia? if yes prepare it*************
    let searchResults: IUserData[] = [];
    const rawItems = hits;

    for (let i = 0; i < rawItems.length; i++) {
      let result = rawItems[i];

      if (result != null) {
        searchResults.push(result);
      }
    }
    setAlgoliaSearchResults(searchResults);
    //did we index raw json on algolia? if yes prepare it*************
  };

  const searchLocal = async (searchTerm: string) => {
    let searchResults = await getLocalSearchResultsUsers(searchTerm);
    setAlgoliaSearchResults(searchResults);
  };

  const searchResultsNotEmpty =
    algoliaSearchResults && algoliaSearchResults.length > 0 && searchTerm;

  return (
    <>
      <a
        className={`my-link-nav ${
          routeTo ? 'text-slate-400 dark:text-zinc-700' : ''
        }`}
        title={`Search ${mode}..`}
      >
        <FontAwesomeIcon
          icon={faSearch}
          style={{ fontSize: 20 }}
          className=""
          onClick={handler}
        />
        {searchText && <span className="pl-1">{searchText}</span>}
      </a>

      <Modal
        //closeButton
        blur
        aria-labelledby="modal-title"
        open={visible}
        onClose={closeHandler}
        className="m-2"
      >
        <Modal.Header>
          <div className="duo text-black text-lg font-bold pt-4">
            <a
              onClick={
                searchResultsNotEmpty
                  ? () => {
                      closeHandler();
                      gotoPageStateOr_Blank(
                        mainSite,
                        `/results?q=${searchTerm}&mode=${mode}`
                      );
                    }
                  : () => {}
              }
            >
              <FontAwesomeIcon
                icon={faSearch}
                style={{ fontSize: 30 }}
                className={`${searchResultsNotEmpty ? `my-link` : ``}`}
              />
            </a>
            <br />
          </div>
        </Modal.Header>
        <Modal.Body>
          <form
            className="flex flex-row items-center gap-x-5"
            onSubmit={(e) => {
              e.preventDefault();

              if (routeTo == WannaSearch.Users) {
                searchLocal(searchTerm);
              } else {
                //if other modes..
                searchLocal(searchTerm);
              }
            }}
          >
            <input
              autoFocus
              type="text"
              className="duo rounded-full border-2 w-80 sm:w-128 h-10 px-3"
              value={searchTerm}
              placeholder={`Search ${mode}..`}
              onChange={(e) => {
                setSearchTerm(e.target.value);

                searchLocal(searchTerm);
                console.log(`!!searching with algolia disabled`);
              }}
            />
            {/* <button type="submit" className="btn-primary rounded-full">
              Search
            </button> */}
          </form>
          <div>
            {algoliaSearchResults?.map((result, idx) => {
              return (
                <SearchResult
                  key={idx}
                  result={result}
                  mode={mode}
                  onClickPreops={() => {
                    closeHandler();
                  }}
                />
              );
            })}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Search;
