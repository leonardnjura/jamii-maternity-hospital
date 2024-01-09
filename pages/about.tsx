import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import PrimaryLayout from '../components/layouts/primary/PrimaryLayout';
import { SITE_ABOUT, SITE_ABOUT_VERBOSE, logo, server } from '../config';
import DataStore from '../context/app/DataStore';

import Link from 'next/link';
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
  let og_pageUrl = `${server}/about`;
  let og_description = `${SITE_ABOUT}`;
  let og_pageImage = `${logo}`;

  return {
    props: {
      og_pageUrl,
      og_description,
      og_pageImage,
    },
  };
};

const About: NextPageWithLayout<IPageProps> = ({
  og_description,
  og_pageImage,
  og_pageUrl,
}) => {
  const router = useRouter();
  const { theme, setTheme } = useContext(DataStore);

  const [clients, setClients] = useState([]);

  //**run effect!~~~~~~~~~~~~~*/
  useEffect(() => {}, []);
  //**run effect!~~~~~~~~~~~~~*/

  return (
    <section className={'my-page-full'}>
      <h1 className="my-page-title">About</h1>
      <p>{SITE_ABOUT}</p>
      <p>{SITE_ABOUT_VERBOSE}</p>

      <div className="mb-4">&nbsp;</div>

      <div className="text-xs nunito font-extralight text-slate-400">
        <hr className="my-bar pb-2" />
        {/* <Link className="my-link-delicate" href={`/register`}>
          Register as nursing midwife here
        </Link> */}
      </div>
    </section>
  );
};

export default About;

About.getLayout = (page) => {
  return (
    <PrimaryLayout
      titleBar="About"
      pageUrl={page.props['og_pageUrl']}
      description={page.props['og_description']}
      pageImage={page.props['og_pageImage']}
    >
      {page}
    </PrimaryLayout>
  );
};
