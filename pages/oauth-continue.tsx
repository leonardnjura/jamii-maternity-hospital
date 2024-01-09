const cookieCutter = require('cookie-cutter');

import { useContext, useEffect, useState } from 'react';
import PrimaryLayout from '../components/layouts/primary/PrimaryLayout';
import { NextPageWithLayout } from './page';

import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GetServerSideProps } from 'next';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { server } from '../config';
import DataStore from '../context/app/DataStore';
import { IUserData } from '../data/types';
import { createUserCookieOauthUser } from '../lib/get-users';
import { noSpacesLeadingAndTrailingPlease } from '../utils/preops';

//we need this page to use hard routing option for oauth logins; not needed for credentials logins
//homepage sets BE cookie through getserverside props; a simple nextjs redirect would not have done the trick
//todo: refactor this?

export interface IPageProps {
  redirectPage: string | null;
  isValidRedirectPage: boolean;
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

  return {
    props: {
      redirectPage,
      isValidRedirectPage,
    },
  };
};

const Page: NextPageWithLayout<IPageProps> = ({
  redirectPage,
  isValidRedirectPage,
}) => {
  const router = useRouter();

  const {
    theme,
    setTheme,
    setAuthenticated,
    setAuthenticatedUser,
    newSignInPreops,
  } = useContext(DataStore);

  const [userCookieCalled, setUserCookieCalled] = useState(false);
  const [welcomeFirstName, setWelcomeFirstName] = useState('');
  const [welcomeAvatarUrl, setWelcomeAvatarUrl] = useState('');

  const { data: session } = useSession(); //google session

  //**~~~~~~~~~~~~~~~~~~~~~~~~effect~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  useEffect(() => {
    harmornizeOauthUser();
  }, [session]);
  //**~~~~~~~~~~~~~~~~~~~~~~~~effect~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

  const harmornizeOauthUser = async () => {
    if (session) {
      ////prepare oauth fields==============================================
      // console.log(`!!oauth-continue use effect called::${session.user?.email}`);
      let oauthEmail = session.user?.email;
      let names = session.user?.name;
      let avatar = session.user?.image;

      let firstName = names;
      let lastName = '';

      var nameArr = names?.split(' ');

      if (nameArr) {
        firstName = nameArr[0];

        if (nameArr.length > 1) {
          lastName = nameArr[1];
        }
      }

      let oauthUser: IUserData = {
        email: oauthEmail!,
        firstName: firstName!,
        lastName: lastName!,
        avatar: avatar!,
      };

      ////prepare oauth fields==============================================
      setAuthenticated(true); //quick boolean hook for ui
      setWelcomeFirstName(firstName!);
      setWelcomeAvatarUrl(avatar!);

      let uid: string;
      let user: IUserData = {} as IUserData;

      //check vital as fb check  to scan existing records is beaten by state refreshes, hence duplicates
      //create user in db if not exists..
      if (!userCookieCalled) {
        let cookiedUser: IUserData = await createUserCookieOauthUser(oauthUser);
        if (cookiedUser) {
          uid = cookiedUser._id!;
          user = cookiedUser;
        }
        setAuthenticatedUser(user);
        newSignInPreops(user);

        setUserCookieCalled(true);
      }

      await router.replace(
        `${server}/${redirectPage ? `?continue=${redirectPage}` : ``}`
      );
      // router.reload(); //to restart index pg effect with headers that copies BE cookie
    }
  };

  const gotoSignInWithGoogle = async () => {
    signIn('google', {
      callbackUrl: `${server}/oauth-continue${
        redirectPage ? `?continue=${redirectPage}` : ``
      }`,
    });
  };

  const ok2DisplayWelcomeAvatar = false;

  return (
    <section className={'my-page-full'}>
      <div className="mx-auto text-center mt-14">
        {ok2DisplayWelcomeAvatar ? (
          <div className="text-base mt-4 mb-4">
            {welcomeAvatarUrl ? (
              <img
                src={welcomeAvatarUrl}
                alt="card__image"
                referrerPolicy="no-referrer"
                className="w-40 h-auto rounded-md mx-auto bg-transparent"
              />
            ) : (
              <>
                <FontAwesomeIcon
                  icon={faUser}
                  style={{ fontSize: 40 }}
                  className={`text-blue-600`}
                />
              </>
            )}
          </div>
        ) : (
          <p className="cite-spacer">&nbsp;</p>
        )}

        <h1 className="my-page-title">
          Hi, <span className="font-mono">{welcomeFirstName}</span>
        </h1>

        <div className="text-xs mt-4 mb-4">
          {session ? (
            <a
              href={`${server}/${
                redirectPage ? `?continue=${redirectPage}` : ``
              }`}
              className="my-link-silent"
            >
              {/* Click here to continue */}
              Redirecting..
            </a>
          ) : (
            <a
              onClick={() => gotoSignInWithGoogle()}
              className="my-link-silent"
            >
              Sign in with Google
            </a>
          )}

          <p className="cite-spacer">&nbsp;</p>
        </div>
      </div>
    </section>
  );
};

export default Page;

Page.getLayout = (page) => {
  return <PrimaryLayout titleBar="Sign In">{page}</PrimaryLayout>;
};
