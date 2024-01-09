const cookieCutter = require('cookie-cutter');

import { doc, onSnapshot } from 'firebase/firestore';
import { dbois } from '../../../config/db';

import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip } from '@nextui-org/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import DataStore from '../../../context/app/DataStore';
import { IUserData } from '../../../data/types';
import { equalStrings_i, titleCasePlease } from '../../../utils/preops';

export interface IAuthButton extends React.ComponentPropsWithoutRef<'button'> {
  mainSite?: boolean;
  isFlat: boolean;
  signedInDisplayText?: string;
  signedInToSeeText?: string;
  redirectPage?: string;
}

const AuthButton: React.FC<IAuthButton> = ({
  className,
  signedInDisplayText,
  signedInToSeeText,
  mainSite = true,
  isFlat,
  redirectPage,
  ...buttonProps
}) => {
  const router = useRouter();

  const {
    theme,
    setTheme,
    currentPath,
    gotoSignIn,
    gotoSignOut,
    authenticated,
    authenticatedUser,
    setAuthenticatedUser,
    gotoPageStateOr_Blank,
    setCheckingUserAuthorizations,
  } = useContext(DataStore);

  const [lastUserEmail, setlastUserEmail] = useState('_email');
  const [refreshDone, setRefreshDone] = useState(false);

  const { data: session } = useSession(); //google session

  useEffect(() => {
    refreshUserAuthorizations();

    //streams..
    listenToFbDocument_profile(authenticatedUser);
  }, [authenticatedUser.email]);

  const refreshUserAuthorizations = async () => {
    setCheckingUserAuthorizations(true);
    ////
    // console.log(`!!refresh user authorizations..`);

    if (
      !equalStrings_i(authenticatedUser.email, lastUserEmail) ||
      !refreshDone
    ) {
      setlastUserEmail(authenticatedUser.email);
      setRefreshDone(true);
    }
    setCheckingUserAuthorizations(false);
    ////
  };

  const determineRoleIdFromJwt = () => {
    const jwt = cookieCutter.get('jwt');

    let roleId = undefined;
    if (jwt && jwt.trim() !== '') {
      try {
        const jwtPayload = JSON.parse(window.atob(jwt.split('.')[1]));
        roleId = jwtPayload.roleId;

        // console.log(`\n\n`);
        // console.log(`!!jwt roleId::${roleId}`);
      } catch (e) {
        console.log(`Ayayai on splitting token extractRoleIdFromJwt()::${e}`);
      }
    }

    return roleId;
  };

  const determinePaywallIdFromJwt = () => {
    const jwt = cookieCutter.get('jwt');

    let paywallId = undefined;
    if (jwt && jwt.trim() !== '') {
      try {
        const jwtPayload = JSON.parse(window.atob(jwt.split('.')[1]));
        paywallId = jwtPayload.paywallId;
      } catch (e) {
        console.log(
          `Ayayai on splitting token extractPaywallIdFromJwt()::${e}`
        );
      }
    }

    return paywallId;
  };

  const listenToFbDocument_profile = (user: IUserData) => {
    if (user._id) {
      const fbCollection = `profiles`;
      const fbDocId = `${user._id}`;
      const lastRoleId = `${user.roleId}`;

      onSnapshot(
        doc(dbois, fbCollection, fbDocId),
        async (doc: { data: () => any }) => {
          // console.log(`!!onsnapshot ${fbCollection}::`, doc.data());
          let snapshotObj: IUserData = doc.data();
          if (snapshotObj) {
            snapshotObj._id = user._id;
            setAuthenticatedUser(snapshotObj);

            const jwtRoleId = determineRoleIdFromJwt();
            const jwtPaywallId = determinePaywallIdFromJwt();

            //wait for jwt to be set
            if (
              jwtRoleId &&
              snapshotObj.roleId &&
              !equalStrings_i(snapshotObj.roleId, jwtRoleId)
            ) {
              gotoSignIn();
            }
          }
        }
      );
    }
  };

  if (isFlat) {
    if (authenticated) {
      const avatarUrl = authenticatedUser.avatar;

      return (
        <Tooltip
          content={
            <div className="flex flex-row my-text">
              <a
                className="cursor-pointer"
                onClick={() => {
                  gotoPageStateOr_Blank(
                    mainSite,
                    `/user/${authenticatedUser._id}`
                  );
                }}
              >
                {' '}
                {avatarUrl ? (
                  <img
                    className="h-12 w-12 object-cover rounded-full"
                    referrerPolicy="no-referrer"
                    src={`${avatarUrl}`}
                    alt=""
                  />
                ) : (
                  <>
                    <FontAwesomeIcon
                      icon={faUser}
                      style={{ fontSize: 25 }}
                      className={`text-blue-600 hover:text-blue-700`}
                    />{' '}
                  </>
                )}
              </a>

              <div className="text-xs ml-2 mr-2">
                <h4 className="tooltip-header text-zinc-700">
                  <span className="resposta font-semibold text-sm">
                    {authenticatedUser.firstName
                      ? titleCasePlease(`${authenticatedUser.firstName}`)
                      : ``}{' '}
                    {authenticatedUser.lastName
                      ? titleCasePlease(`${authenticatedUser.lastName}`)
                      : ``}
                  </span>
                </h4>
                <span className="hover:text-blue-600">
                  {authenticatedUser.email}
                </span>{' '}
                |{' '}
                <a
                  onClick={() => gotoSignOut()}
                  className=" hover:text-red-600 cursor-pointer"
                >
                  Sign Out
                </a>
              </div>
            </div>
          }
          placement="right"
        >
          <p className="duo text-xs">
            <span className=" hover:text-blue-600">
              {signedInDisplayText ?? 'Sign Out'}
            </span>
          </p>
        </Tooltip>
      );
    } else {
      return (
        <p className="text-xs duo">
          {signedInToSeeText}{' '}
          <a
            onClick={() => gotoSignIn(mainSite, redirectPage)}
            className=" hover:text-blue-600 cursor-pointer"
          >
            Sign In
          </a>{' '}
        </p>
      );
    }
  } else {
    if (authenticated) {
      return <></>;
    } else {
      return (
        <a
          className="my-link-nav"
          onClick={
            authenticated
              ? () => gotoSignOut(mainSite, redirectPage)
              : () => gotoSignIn(mainSite, redirectPage)
          }
        >
          Sign In
        </a>
      );
    }
  }
};

export default AuthButton;
