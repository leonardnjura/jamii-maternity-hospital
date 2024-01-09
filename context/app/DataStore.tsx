import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { ReactNode, createContext, useState } from 'react';
import { generateServerUrl, server } from '../../config';
import { IUserData } from '../../data/types';
import { deleteUserCookie } from '../../lib/get-users';

import { constainsSubstring_i } from '../../utils/preops';

export const DEFAULT_FLAG_HOVER_DELAY = 2 * 1000; //seconds
export const LONG_FLAG_HOVER_DELAY = 15 * 60 * 1000; //seconds
export const VANISH_FLAG_HOVER_DELAY = 499; //seconds

interface IContext {
  gotoPageStateOr_Blank: (mainSite: boolean, pg: string) => void;
  newSignInPreops: (user: IUserData) => void;
  gotoSignIn: (mainSite?: boolean, redirectPage?: string) => void;
  gotoSignOut: (mainSite?: boolean, redirectPage?: string) => void;
  theme: string;
  setTheme: (str: string) => void;
  authenticated: boolean;
  setAuthenticated: (data: boolean) => void;
  checkingUserAuthorizations: boolean;
  setCheckingUserAuthorizations: (data: boolean) => void;
  authenticatedUser: IUserData;
  setAuthenticatedUser: (data: IUserData) => void; //note: only primary layout sets this, so it can determine _id from fb withou crazy fetches
  algoliaSearchResults: IUserData[];
  setAlgoliaSearchResults: (data: IUserData[]) => void;
  currentPath: string;
  setCurrentPath: (data: string) => void;
}

const defaultContextData: IContext = {
  gotoPageStateOr_Blank: () => undefined,
  newSignInPreops: () => undefined,
  gotoSignIn: () => undefined,
  gotoSignOut: () => undefined,
  theme: 'light',
  setTheme: () => undefined,
  authenticated: false,
  setAuthenticated: () => undefined,
  checkingUserAuthorizations: true, //tru preferred
  setCheckingUserAuthorizations: () => undefined,
  authenticatedUser: {} as IUserData,
  setAuthenticatedUser: () => undefined,
  algoliaSearchResults: [],
  setAlgoliaSearchResults: () => undefined,
  currentPath: '/',
  setCurrentPath: () => undefined,
};

const DataStore = createContext<IContext>(defaultContextData);

export const DataStoreProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { data: session } = useSession(); //google session

  const router = useRouter();

  const gotoPageStateOr_Blank = (mainSite: boolean, pg: string) => {
    const generatedLocalUrl = generateServerUrl(pg);
    if (mainSite) {
      router.push(generatedLocalUrl);
    } else {
      window.open(generatedLocalUrl, '_blank');
    }
  };

  const newSignInPreops = async (user: IUserData) => {};

  const gotoSignIn = async (
    mainSite: boolean = true,
    redirectPage?: string
  ) => {
    {
      let currentPathHerre = router.asPath;
      let currentPathHerreContainsAuthChainUrls =
        constainsSubstring_i('/signin', currentPathHerre) ||
        constainsSubstring_i('/oauth-continue', currentPathHerre);

      if (!currentPathHerreContainsAuthChainUrls) {
        //check infinite loops on standby by primary layout until user logs in - if we need to re alloc vanished jwt
        if (mainSite) {
          router.push(
            `${server}/signin${
              redirectPage
                ? `?continue=${redirectPage}`
                : `?continue=${currentPath}`
            }`
          );
        } else {
          window.open(
            `${server}/signin${
              redirectPage
                ? `?continue=${redirectPage}`
                : `?continue=${currentPath}`
            }`,
            '_blank'
          );
        }
      }
    }
  };

  const gotoSignOut = async (
    mainSite: boolean = true,
    redirectPage?: string
  ) => {
    {
      //1. clear auth cookies..
      await deleteUserCookie();

      //2. clear auth provider sessions..
      signOut({
        callbackUrl: `${server}/`,
      });
      //3. route to..
      router.push(redirectPage ? `${redirectPage}` : `${server}/`);
    }
  };

  const [theme, _setTheme] = useState(defaultContextData.theme);
  const [authenticated, _setAuthenticated] = useState(
    defaultContextData.authenticated
  );
  const [checkingUserAuthorizations, _setCheckingUserAuthorizations] = useState(
    defaultContextData.checkingUserAuthorizations
  );
  const [authenticatedUser, _setAuthenticatedUser] = useState(
    defaultContextData.authenticatedUser
  );
  const [algoliaSearchResults, _setAlgoliaSearchResults] = useState(
    defaultContextData.algoliaSearchResults
  );
  const [currentPath, _setCurrentPath] = useState(
    defaultContextData.currentPath
  );

  const setTheme = (data: string) => _setTheme(data);
  const setAuthenticated = (data: boolean) => _setAuthenticated(data);
  const setCheckingUserAuthorizations = (data: boolean) =>
    _setCheckingUserAuthorizations(data);
  const setAuthenticatedUser = (data: IUserData) => _setAuthenticatedUser(data);
  const setAlgoliaSearchResults = (data: IUserData[]) =>
    _setAlgoliaSearchResults(data);
  const setCurrentPath = (data: string) => _setCurrentPath(data);

  return (
    <DataStore.Provider
      value={{
        gotoPageStateOr_Blank,
        newSignInPreops,
        gotoSignIn,
        gotoSignOut,
        theme,
        setTheme,
        authenticated,
        setAuthenticated,
        checkingUserAuthorizations,
        setCheckingUserAuthorizations,
        authenticatedUser,
        setAuthenticatedUser,
        algoliaSearchResults,
        setAlgoliaSearchResults,
        currentPath,
        setCurrentPath,
      }}
    >
      {children}
    </DataStore.Provider>
  );
};

export default DataStore;
