import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import PrimaryLayout from '../components/layouts/primary/PrimaryLayout';
import { PROJECT_NAME, logo, server } from '../config';
import DataStore from '../context/app/DataStore';

import StatsTab from '../components/utility/tabs/stats-tab/StatsTab';
import { NextPageWithLayout } from './page';

interface IPageProps {
  og_pageUrl: string;
  og_description: string;
  og_pageImage: string;
}

export const getServerSideProps: GetServerSideProps<IPageProps> = async ({
  query,
  res,
}) => {
  ///meta
  let og_pageUrl = `${server}/stats`;
  let og_description = `Midwife and client statistics, summaries, reports & projections at ${PROJECT_NAME}`;
  let og_pageImage = `${logo}`;

  return {
    props: {
      og_pageUrl,
      og_description,
      og_pageImage,
    },
  };
};

const Page: NextPageWithLayout<IPageProps> = ({
  og_description,
  og_pageImage,
  og_pageUrl,
}) => {
  const router = useRouter();
  const { theme, setTheme, authenticatedUser } = useContext(DataStore);

  const [clients, setClients] = useState([]);

  //**run effect!~~~~~~~~~~~~~*/
  useEffect(() => {}, []);
  //**run effect!~~~~~~~~~~~~~*/

  return (
    <section className={'my-page-full'}>
      <h1 className="my-page-title">Stats</h1>
      <p>{og_description}</p>
      <StatsTab midwifeOfInterest={authenticatedUser} />
    </section>
  );
};

export default Page;

Page.getLayout = (page) => {
  return (
    <PrimaryLayout
      titleBar="Stats"
      pageUrl={page.props['og_pageUrl']}
      description={page.props['og_description']}
      pageImage={page.props['og_pageImage']}
    >
      {page}
    </PrimaryLayout>
  );
};
