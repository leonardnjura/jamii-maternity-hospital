const cookieCutter = require('cookie-cutter');

import { useContext, useState } from 'react';
import PrimaryLayout from '../components/layouts/primary/PrimaryLayout';
import { NextPageWithLayout } from './page';

import { faSignOut } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import DataStore from '../context/app/DataStore';

//we need this page to  clear all cookies and nextauth sessions
//if user cannot immediately see signout in the footer spray, they can slash type it in url location

export interface IPageProps {}

const Page: NextPageWithLayout<IPageProps> = (context) => {
  const router = useRouter();
  const { theme, setTheme, gotoSignOut } = useContext(DataStore);

  const [message, setMessage] = useState('');

  return (
    <section className={'my-page-full'}>
      <div className="mx-auto text-center mt-14">
        <div className="text-base mt-4 mb-4">
          <FontAwesomeIcon
            icon={faSignOut}
            style={{ fontSize: 40 }}
            className={`text-blue-600`}
          />
        </div>
        <h1 className="my-page-title">Sign Out</h1>

        <div className="text-xs mt-4 mb-4">
          <a onClick={() => gotoSignOut()} className="my-link-silent">
            Click here to continue
          </a>

          <p>{message}</p>

          <p className="cite-spacer">&nbsp;</p>
        </div>
      </div>
    </section>
  );
};

export default Page;

Page.getLayout = (page) => {
  return <PrimaryLayout titleBar="Sign Out">{page}</PrimaryLayout>;
};
