import { NextPageContext } from 'next';
import Link from 'next/link';
import Router from 'next/router';
import { useContext, useEffect } from 'react';
import ProfileCard from '../../components/cards/profile/ProfileCard';
import NotFound from '../../components/layouts/not-found/NotFound';
import PrimaryLayout from '../../components/layouts/primary/PrimaryLayout';
import { lnoApiKeySysOps, logo, server } from '../../config';
import DataStore from '../../context/app/DataStore';
import { IUserData } from '../../data/types';
import {
  determineIfUserIsAdmin,
  determineIfUserOwnsCard,
} from '../../services/subscription.service';
import { equalStrings_i } from '../../utils/preops';
import { NextPageWithLayout } from '../page';

export interface IPageProps {
  userDataApiResponse: IUserData;
}

const Page: NextPageWithLayout<IPageProps> = ({ userDataApiResponse }) => {
  const {
    theme,
    setTheme,
    authenticated,
    authenticatedUser,
    gotoPageStateOr_Blank,
    gotoSignIn,
  } = useContext(DataStore);

  //**~~~~~~~~~~~~~~~~~~~~~~~~effect~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  useEffect(() => {}, []);
  //**~~~~~~~~~~~~~~~~~~~~~~~~effect~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

  const gotoPage = (pg: string) => {
    Router.push(`${pg}`);
  };

  // const authorizedToViewOneProfile =
  //   equalStrings_i(authenticatedUser.email, userDataApiResponse.email) ||
  //   determineIfUserIsAdmin(authenticatedUser);

  const authorizedToViewOneProfile = true;

  const authorizedAsSelf = equalStrings_i(
    authenticatedUser.email,
    userDataApiResponse.email
  );

  const authorizedAsAdmin = determineIfUserIsAdmin(authenticatedUser);

  const dontRenderPage = userDataApiResponse._id == null;

  return dontRenderPage ? (
    <NotFound customMessage="Item not found" />
  ) : (
    <section className={'my-page-full'}>
      <h1 className="my-page-title">Profile</h1>
      <div>
        <hr className={`my-rule mt-2 mb-4`} />
        <div className={`mt-4 mb-4 my-sub-title-faded`} id={''}>
          {authorizedAsSelf ? (
            <>MY PROFILE</>
          ) : (
            <>
              USER{` `}
              PROFILE
            </>
          )}

          {authorizedAsAdmin && (
            <>
              {' | '}
              <Link
                className="hover:underline hover:cursor-pointer"
                href={`/users`}
              >
                SEE ALL
              </Link>
            </>
          )}
        </div>
      </div>

      {authorizedToViewOneProfile ? (
        <ProfileCard
          // key={idx}
          mainSite={true}
          profile={userDataApiResponse}
          idx={0}
          vanishDeletedCards={true}
          highlightCard={true}
          popableCard={false}
          largeNotes={true}
          userCanPutProfile={
            determineIfUserIsAdmin(authenticatedUser) ||
            determineIfUserOwnsCard(
              authenticatedUser,
              userDataApiResponse.email
            )
          }
          userCanDeleteProfile={
            determineIfUserIsAdmin(authenticatedUser) &&
            !determineIfUserOwnsCard(
              authenticatedUser,
              userDataApiResponse.email
            ) //cannot delete own unless action is allowed && goes to a/c deletion ui page
          }
        />
      ) : (
        <>
          <div
            className={`text-2xl text-red-600 opacity-20 hover:opacity-100 old-stamper -rotate-12 -mt-0 pb-8`}
          >
            {authenticated && (
              <a className="cursor-pointer" onClick={() => gotoSignIn()}>
                {`[Classified]`}
              </a>
            )}
          </div>
        </>
      )}
    </section>
  );
};

Page.getInitialProps = async (context: NextPageContext) => {
  let userDataApiResponse: IUserData = {} as IUserData;

  let q = context.query.id as string | null;

  let isValidQ: boolean = false;
  let isValidIsoCode: boolean = false;

  ///meta
  let og_pageUrl = `${server}/user/${q}`;
  let og_description = `--User profile.`;
  let og_pageImage = `${logo}`;

  if (q) {
    //validate q
    isValidQ = q != null && q.length > 0;
  }

  if (isValidQ) {
    const cookie = context.req?.headers.cookie as string; //any BE cookies herre.. FE just checking

    //API:probe has data---------------------------------------------------
    //❕cookie sets authentication, ❗crudKey sets authorization
    //❕another authorization tier that avails features is not handled here, it'd have preempted redundant api fetches.. tricky situation: read state with authorization stacks
    const rawRes = await fetch(`${server}/api/users/${q}`, {
      headers: { cookie: cookie!, crudKey: lnoApiKeySysOps! },
    });

    const rawData = await rawRes.json();
    // console.log(
    //   `!!fb gettiy res::${JSON.stringify(rawData)} httpStatus::${rawRes.status}`
    // );
    let dbItem: IUserData = rawData['data'];
    //❕cookie sets authentication, ❗crudKey sets authorization
    //API:probe has data---------------------------------------------------

    //UI--auth if api declines and retake pg
    if (rawRes.status === 401 && !context.req) {
      console.log(`!!api cookie headers missing:: case 1`); //logs in FE with state pg load
      Router.replace(`${server}/signin?continue=${og_pageUrl}`);
      return {
        userDataApiResponse,
      };
    }
    if (rawRes.status === 401 && context.req) {
      console.log(`!!api cookie headers missing:: case 2`); //logs in BE with hard pg load
      context.res?.writeHead(302, {
        Location: `${server}/signin?continue=${og_pageUrl}`,
      });
      context.res?.end();
      return {
        userDataApiResponse,
      };
    }
    //UI--auth if api declines and retake pg

    if (dbItem) {
      userDataApiResponse = dbItem;
    }
  }

  return {
    userDataApiResponse,
  };
};

export default Page;

Page.getLayout = (page) => {
  return (
    <PrimaryLayout
      //titleBar={`${page.props['userDataApiResponse'].firstName ?? 'User'}`}
      titleBar={`User`}
      pageUrl={page.props['og_pageUrl']} //todo: no-crawl
      description={page.props['og_description']} //todo: no-crawl
      pageImage={page.props['og_pageImage']} //todo: no-crawl
    >
      {page}
    </PrimaryLayout>
  );
};
