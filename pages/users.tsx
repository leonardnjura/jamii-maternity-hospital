import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';
import PrimaryLayout from '../components/layouts/primary/PrimaryLayout';
import { PROJECT_NAME, logo, server } from '../config';
import DataStore from '../context/app/DataStore';

import { NextPageWithLayout } from './page';
import UsersTab from '../components/utility/tabs/users-tab/UsersTab';

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
  let og_pageUrl = `${server}/users`;
  let og_description = `Members and Staff of ${PROJECT_NAME}`;
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

  //**run effect!~~~~~~~~~~~~~*/
  useEffect(() => {}, []);
  //**run effect!~~~~~~~~~~~~~*/

  return (
    <section className={'my-page-full'}>
      <h1 className="my-page-title">Users</h1>
      <UsersTab />
    </section>
  );
};

export default Page;

Page.getLayout = (page) => {
  return (
    <PrimaryLayout
      titleBar="Users"
      pageUrl={page.props['og_pageUrl']}
      description={page.props['og_description']}
      pageImage={page.props['og_pageImage']}
    >
      {page}
    </PrimaryLayout>
  );
};
