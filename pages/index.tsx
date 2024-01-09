const cookieCutter = require('cookie-cutter');
import { useCookies } from 'react-cookie';

import cookie from 'cookie';
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import PrimaryLayout from '../components/layouts/primary/PrimaryLayout';
import Search from '../components/utility/search/Search';
import {
  PROJECT_MISSION,
  PROJECT_NAME,
  SITE_ABOUT,
  TOKEN_MAX_AGE,
  USER_WELCOMED_COOKIE_NAME,
  logo,
  server,
} from '../config';
import DataStore from '../context/app/DataStore';
import { noSpacesLeadingAndTrailingPlease } from '../utils/preops';

import Link from 'next/link';
import { NextPageWithLayout } from './page';

interface IPageProps {
  redirectPage: string | null;
  isValidRedirectPage: boolean;
  parsedJwt: string | null;
  og_pageUrl: string;
  og_description: string;
  og_pageImage: string;
}

export const getServerSideProps: GetServerSideProps<IPageProps> = async (
  context
) => {
  let redirectPage = context.query.continue as string | null;

  if (redirectPage) {
    redirectPage = noSpacesLeadingAndTrailingPlease(redirectPage);
  } else {
    redirectPage = null; //to help serialize
  }

  let isValidRedirectPage: boolean = redirectPage != null; //todo: validate path

  //NOTE: route here after login to load frontend cookies
  //cookies
  let parsedJwt = '';

  try {
    const parsedCookies = cookie.parse(context.req.headers.cookie!);
    if (parsedCookies?.auth) {
      parsedJwt = parsedCookies.auth;
    }
  } catch (e) {
    console.log(`!!Oops parsing cookie in homepage::${e}`);
  }

  console.log(`!!${PROJECT_NAME} jwt copied from BE cookie:: ${parsedJwt}`);

  ///meta
  let og_pageUrl = `${server}/`;
  let og_description = `${SITE_ABOUT}`;
  let og_pageImage = `${logo}`;

  return {
    props: {
      redirectPage,
      isValidRedirectPage,
      parsedJwt,
      og_pageUrl,
      og_description,
      og_pageImage,
    },
  };
};

const Home: NextPageWithLayout<IPageProps> = ({
  redirectPage,
  isValidRedirectPage,
  parsedJwt,
  og_description,
  og_pageImage,
  og_pageUrl,
}) => {
  const [cuikie, setCuikie] = useCookies(['jwt']); //ui cookie

  const [buttonText, setButtonText] = useState('..');
  const [userWelcomed, setUserWelcomed] = useState(false);

  const { data: session } = useSession(); //google session

  const router = useRouter();

  const { theme, setTheme, authenticated, authenticatedUser } =
    useContext(DataStore);

  //**~~~~~~~~~~~~~~~~~~~~~~~~effect~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  useEffect(() => {
    let surferWelcomed = cookieCutter.get(USER_WELCOMED_COOKIE_NAME); //auto set after user lands on homepage

    if (surferWelcomed) {
      setUserWelcomed(surferWelcomed == 'true');
    }

    const sinkCredentialsStage2 = async () => {
      const jwt = parsedJwt;
      // console.log(`!!parsedJwt==>${jwt}`);

      setCuikie('jwt', jwt, {
        path: '/',
        maxAge: TOKEN_MAX_AGE,
        sameSite: true,
      });
    };

    const determineButtText = () => {
      setButtonText(surferWelcomed == 'true' ? 'Continue' : 'Start');
    };

    sinkCredentialsStage2();
    determineButtText();

    //ante ops..
    if (redirectPage && isValidRedirectPage) {
      gotoPage(redirectPage);
    }
  }, [buttonText, authenticated, authenticatedUser, session]);
  //**~~~~~~~~~~~~~~~~~~~~~~~~effect~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

  const gotoPage = (pg: string) => {
    //put any pg preops in pg, trigger 'em with hook listener..
    router.push(`${pg}`);
  };

  return (
    <section className={`${'my-page-full'} mx-auto text-center`}>
      {!userWelcomed && <div className="vh-0"></div>}

      <h1
        className={`my-text-high-contrast-xl pt-0 mx-auto text-center ${
          !userWelcomed ? `vh-30` : ``
        } `}
      >
        <img
          src={logo}
          alt="Logo"
          className={`w-24 h-auto mt-16 cursor-text`}
        />

        <br />
      </h1>

      <h1 className="my-text-high-contrast-xl">𝕁𝕒𝕞𝕚𝕚 𝕄𝕒𝕥𝕖𝕣𝕟𝕚𝕥𝕪 ℍ𝕠𝕤𝕡𝕚𝕥𝕒𝕝</h1>

      <div>
        <p className="mb-4 text-lg">
          <span>
            <Link
              className="my-link-delicate hover:text-blue-600 sweet-bold"
              href={`/signup`}
              title="Sign up a user and designate midwife nurse role."
            >
              midwife registration
            </Link>
          </span>
          <span>
            {' • '}
            <Link
              className="my-link-delicate hover:text-blue-600 sweet-bold"
              href={`/users`}
              title={`Discover staff and members of ${PROJECT_NAME}.`}
            >
              users
            </Link>
          </span>
          <span>
            {' • '}
            <Link
              className="my-link-delicate hover:text-blue-600 sweet-bold"
              href={`/register-client`}
              title="Register pregnant mums."
            >
              client registration
            </Link>
          </span>
          <span>
            {' • '}
            <Link
              className="my-link-delicate hover:text-blue-600 sweet-bold"
              href={`/stats`}
              title="Midwife and client statistics, summaries, reports & projections."
            >
              stats
            </Link>
          </span>
          <span>
            {' • '}
            <Link
              className="my-link-delicate hover:text-blue-600 sweet-bold"
              href={`/about`}
              title="Read the mission of this hospital."
            >
              about
            </Link>
          </span>
          <span>
            {' • '}
            <Link
              className="my-link-delicate hover:text-blue-600 sweet-bold"
              href={`/feedback`}
              title={`Contact us or leave feedback.`}
            >
              contact
            </Link>
          </span>
        </p>
        <hr className="my-rule py-2" />
        <p className="reading-notes">{PROJECT_MISSION}</p>
        <p>&nbsp;</p>

        <div className="h-16">
          <Search />
        </div>
      </div>
    </section>
  );
};

export default Home;

Home.getLayout = (page) => {
  return (
    <PrimaryLayout
      titleBar="Home"
      pageUrl={page.props['og_pageUrl']}
      description={page.props['og_description']}
      pageImage={page.props['og_pageImage']}
      hideNavbar={true}
    >
      {page}
    </PrimaryLayout>
  );
};
