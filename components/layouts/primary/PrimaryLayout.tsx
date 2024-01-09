const cookieCutter = require('cookie-cutter');

import Head from 'next/head';
import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';
import {
  PROJECT_MISSION,
  PROJECT_NAME,
  REFRESH_SECONDS,
  favicon,
  lnoApiKeySysOps,
} from '../../../config';
import DataStore from '../../../context/app/DataStore';
import { IUserData } from '../../../data/types';
import { createUserCookie } from '../../../lib/get-users';
import { b64_to_utf8, constainsSubstring_i } from '../../../utils/preops';
import Footer from '../../navigation/footer/Footer';
import Header from '../../navigation/header/Header';

export interface IPrimaryLayout {
  children: React.ReactNode;
  justify?: 'items-start' | 'items-center' | 'items-end';
  titleBar: string;
  description?: string;
  pageUrl?: string;
  pageImage?: string;
  hideNavbar?: boolean;
  hideFooter?: boolean;
}

const PrimaryLayout: React.FC<IPrimaryLayout> = ({
  children,
  justify = 'items-center',
  titleBar,
  description,
  pageUrl,
  pageImage,
  hideNavbar,
  hideFooter = false,
}) => {
  const router = useRouter();

  const {
    theme,
    setTheme,
    gotoSignIn,
    setAuthenticated,
    setAuthenticatedUser, //note: only primary layout and auth pages set this, we sync ui from known places, :)
    setCurrentPath,
  } = useContext(DataStore);

  //**~~~~~~~~~~~~~~~~~~~~~~~~effect~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  useEffect(() => {
    //path..
    let path = router.asPath;
    if (!constainsSubstring_i(`/signin`, path)) {
      setCurrentPath(path);
    }
    // console.log(`!!currentPath::${path}`);

    //loopers..
    let ok2Loop = true; //loop frequency 1000ms
    if (ok2Loop) {
      const interval = setInterval(() => {
        listenToCookies();
      }, REFRESH_SECONDS * 1000);

      //cleanup
      return () => clearInterval(interval);
    }
  }, [router.asPath]); //<====NOTE: dont listen to anything more in this hook
  //**~~~~~~~~~~~~~~~~~~~~~~~~effect~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

  const extractFullUserObjectFromJwt = async (jwt: string) => {
    let user: IUserData = {} as IUserData;
    if (jwt && jwt.trim() !== '') {
      //create user object with _id
      //if _id doesn't exist in jwt from somewherre call fb signin/signup

      const decodedParts = jwt.split('.').length; //todo: break if invalid string
      // console.log(`!!decodedParts:: ${decodedParts}`);
      try {
        const jwtPayload = JSON.parse(window.atob(jwt.split('.')[1]));
        const iat = jwtPayload.iat;
        const expiry = jwtPayload.exp;
        const now = Math.floor(new Date().getTime() / 1000);

        const _id = jwtPayload._id;
        const email = jwtPayload.email;
        const password = jwtPayload.password;
        const roleId = jwtPayload.roleId;
        const paywallId = jwtPayload.paywallId;
        const firstName = jwtPayload.firstName;
        const lastName = jwtPayload.lastName;
        const avatar = b64_to_utf8(jwtPayload.avatar);

        // console.log(`\n\n`)
        // console.log(`!!jwt _id::${_id}`);
        // console.log(`!!jwt email::${email}`);
        // console.log(`!!jwt password::${password}`);
        // console.log(`!!jwt firstName::${firstName}`);
        // console.log(`!!jwt lastName::${lastName}`);
        // console.log(`!!jwt avatar::${avatar}`);
        // console.log(`!!jwt roleId::${roleId}`);

        const freemiumTokenExpiry = jwtPayload.freemiumTokenExpiry;

        user = {
          _id,
          email,
          password,
          roleId,
          firstName,
          lastName,
          avatar,
          freemiumTokenExpiry,
        };

        const idMissing = jwtPayload._id == undefined;

        if (idMissing) {
          console.log(`!!jwt _id missing`);
          gotoSignIn();
        }
      } catch (e) {
        console.log(`Ayayai on splitting token::${e}`);
      }
    }

    return user;
  };

  const listenToCookies = async () => {
    ///checks if jwt cookie exists
    ///extends jwt life
    ///updates authenticated/authenticatedUser hooks
    // console.log(`!!listening to cookies every ${REFRESH_SECONDS}s`);

    let cookieExistsAndIsValid = false;
    let user: IUserData = {} as IUserData;

    const jwt = cookieCutter.get('jwt');
    // console.log(`!!jwt cut in cookie::${jwt}`);

    if (jwt && jwt.trim() !== '') {
      const decodedParts = jwt.split('.').length; //todo: break if invalid string
      // console.log(`!!decodedParts:: ${decodedParts}`);
      try {
        const jwtPayload = JSON.parse(window.atob(jwt.split('.')[1]));
        const iat = jwtPayload.iat;
        const expiry = jwtPayload.exp;
        const now = Math.floor(new Date().getTime() / 1000);

        // console.log(`jwt in cookie iat::${iat}`);
        // console.log(`jwt in cookie exp::${expiry}`);
        const expired = now >= expiry;
        cookieExistsAndIsValid = !expired;
        // console.log(`!!jwt expired::${expired}`);

        setAuthenticated(cookieExistsAndIsValid); //whomever[this/signin/signup] sets it first, hooks will read instantly for ui display
        if (!expired) {
          const timeLeft = expiry - now;
          const uidMissing = jwtPayload._id == undefined;
          // console.log(`jwt _id::${jwtPayload._id}`);
          // console.log(`jwt _id missing::${uidMissing}`);
          // console.log(`jwt email::${jwtPayload.email}`);
          // console.log(`jwt in cookie expires in::${timeLeft}s`);

          user = await extractFullUserObjectFromJwt(jwt);

          setAuthenticatedUser(user);
          // console.log(`jwt _id::${user._id}`);

          if (timeLeft < 60 * 5) {
            console.log(`!!extending FE cookie life~~~~~~~~~~~`);
            extendJwtLife(user); //useless unless we route to home page to copy BE cookie
          }
        } else {
          console.log(`jwt in cookie now expired`);
          //gotoSignIn(); //annoys but makes sense as user was logged in

          //quikfix: alloc longer jwt life say 1hr to 10hr
        }
      } catch (e) {
        console.log(`Ayayai on splitting token::${e}`, jwt);
      }
    }

    //COOKIE FUN:----------------------------------------------------------------

    //COOKIE FUN:----------------------------------------------------------------
  };

  const extendJwtLife = async (user: IUserData) => {
    //refresh BE cookie/////////
    if (user.email) {
      let reqBody = user;

      // console.log(`!!cookie req via adDrefresh::${JSON.stringify(reqBody)}`);
      const resBody = await createUserCookie(reqBody, lnoApiKeySysOps!);
      // console.log(`!!cookie res via adDrefresh::${JSON.stringify(resBody)}`);
    }
    //refresh BE cookie/////////
  };
  // const crawlPage = titleBar == 'Home' ? false : true;
  const crawlPage = true;

  const determineFullTitleBar = `${
    titleBar == 'Home'
      ? `Welcome to ${PROJECT_NAME}`
      : `${titleBar} • ${PROJECT_NAME}` //•//·
  }`;

  const determineDescription = `${description ?? PROJECT_MISSION}`;

  return (
    <>
      <Head>
        <link rel="icon" href={favicon} />
        <title>{determineFullTitleBar}</title>
        <meta name="description" content={determineDescription} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${titleBar}`} />
        <meta property="og:url" content={`${pageUrl}`} />
        <meta property="og:description" content={determineDescription} />
        <meta property="og:image" content={`${pageImage}`} />
        <meta property="og:image:width" content="200" />
        <meta property="og:image:height" content="200" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        {/*todo:company handle-- <meta name="twitter:site" content="@cccxxx" />*/}
        {/*todo:author handle-- <meta name="twitter:creator" content="@aaaxxx" />  */}

        {/* Facebook */}
        <meta property="fb:app_id" content="1138339653718156" />

        {/* VALIDATE (or COMPOSE MSG TO PREVIEW) */}
        {/* https://cards-dev.twitter.com/validator */}
        {/* https://developers.facebook.com/tools/debug/ */}

        {/* No index */}
        {!crawlPage && <meta name="robots" content="noindex"></meta>}

        {/* Others */}
        <meta
          name="google-site-verification"
          content="3mH6hzH6B9NTS4_dlIoLTiUS4Bua6pJkPc_E3GxLPsw"
        />
        <meta charSet="utf-8" />
      </Head>
      <div
        className={`min-h-screen flex flex-col ${justify} bg-white dark:bg-zinc-900 dark:text-white `}
      >
        {!hideNavbar && <Header />}
        <main className="px-5">{children}</main>
        <div className="m-auto" />

        <Footer hideFooter={hideFooter} />
      </div>
    </>
  );
};

export default PrimaryLayout;
