import { GetServerSideProps } from 'next';
import { useContext } from 'react';
import EndpointNotDeployed from '../components/layouts/endpoint-not-deployed/EndpointNotDeployed';
import PrimaryLayout from '../components/layouts/primary/PrimaryLayout';
import SearchResult from '../components/utility/search-result/SearchResult';
import DataStore from '../context/app/DataStore';
import { IUserData } from '../data/types';
import { loadSearchResults } from '../lib/get-search-results';
import {
  determinePlural,
  noSpacesLeadingAndTrailingPlease,
} from '../utils/preops';
import { NextPageWithLayout } from './page';

interface IPageProps {
  searchDataApiResponse: IUserData[];
  q: string;
  isValidQ: boolean;
  mode: string;
}

export const getServerSideProps: GetServerSideProps<IPageProps> = async (
  context
) => {
  let searchDataApiResponse: IUserData[] = [];

  let q = context.query.q as string;
  let mode = context.query.mode as string;

  if (q) {
    q = noSpacesLeadingAndTrailingPlease(q);
  }
  if (mode) {
    mode = noSpacesLeadingAndTrailingPlease(mode);
  }

  const isValidQ = q != null && q.length > 0;

  if (isValidQ) {
    const res = await loadSearchResults(q);

    if (Array.isArray(res)) {
      searchDataApiResponse = res;
    }
  }

  return {
    props: {
      searchDataApiResponse,
      q: q ? q : 'foo', //note: put anything to help serialize, we handle missing query terms elsewhere
      isValidQ,
      mode: mode ? mode : 'foo',
    },
  };
};

const Page: NextPageWithLayout<IPageProps> = ({
  searchDataApiResponse,
  q,
  isValidQ,
  mode,
}) => {
  const { theme, setTheme } = useContext(DataStore);

  const dontRenderPage = !isValidQ;
  const hasResults = searchDataApiResponse.length > 0;
  const plural = determinePlural(searchDataApiResponse.length);

  const articleMode = mode == 'articles';

  return dontRenderPage ? (
    <EndpointNotDeployed
      q="?q="
      customMessage="Pass a query term or use search"
    />
  ) : (
    <section className={'my-page-full'}>
      {hasResults ? (
        <div>
          <p className="my-text-high-contrast italic text-xs">
            Showing {searchDataApiResponse.length} result{plural} for:
          </p>
          <h2 className="my-text-high-contrast-lg font-bold italic pb-8">
            <span className="my-text text-6xl">❞</span>
            {q}
          </h2>

          <div>
            {searchDataApiResponse.map((result, idx) => {
              return <SearchResult key={idx} result={result} mode={mode} />;
            })}
          </div>
          <hr className="my-rule pb-2" />
          <p className="my-text-high-contrast text-right pb-8 italic">
            {searchDataApiResponse.length} result{plural}
          </p>
        </div>
      ) : (
        <p>No results found. </p>
      )}
    </section>
  );
};

export default Page;

Page.getLayout = (page) => {
  return (
    //todo: inject results count
    <PrimaryLayout justify="items-center" titleBar={`Search Results`}>
      {page}
    </PrimaryLayout>
  );
};
