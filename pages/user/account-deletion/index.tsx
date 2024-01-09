import {
  GoogleAuthProvider,
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';

import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GetServerSideProps } from 'next';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import PrimaryLayout from '../../../components/layouts/primary/PrimaryLayout';
import { PROJECT_NAME, lnoApiKeySysOps, logo, server } from '../../../config';
import { fbAuth } from '../../../config/db';
import DataStore from '../../../context/app/DataStore';
import { validateInputAgainstHash } from '../../../lib/get-hash';
import {
  deleteUserCookie,
  deleteUser_SelfAccountDeletion,
} from '../../../lib/get-users';
import {
  constainsSubstring_i,
  noSpacesLeadingAndTrailingPlease,
  slugify,
  wait,
} from '../../../utils/preops';
import { NextPageWithLayout } from '../../page';

interface IPageProps {
  og_pageUrl: string;
  og_description: string;
  og_pageImage: string;
  appName: string;
  email: string;
  uid: string;
  mode: string;
  passHash: string;
}

export const getServerSideProps: GetServerSideProps<IPageProps> = async (
  context
) => {
  ///meta
  let og_pageUrl = `${server}/user/account-deletion/${slugify(PROJECT_NAME)}`;
  let og_description = `A/c deletion for ${PROJECT_NAME}`;
  let og_pageImage = `${logo}`;

  let appName = context.query.appName as string;
  let email = context.query.email as string;
  let uid = context.query.uid as string;
  let mode = context.query.mode as string;
  let passHash = context.query.passHash as string; //encrypted password

  const auth = getAuth();

  // var user = auth.currentUser;

  if (appName) {
    appName = noSpacesLeadingAndTrailingPlease(appName);
  }
  if (email) {
    email = noSpacesLeadingAndTrailingPlease(email);
  }
  if (uid) {
    uid = noSpacesLeadingAndTrailingPlease(uid);
  }
  if (mode) {
    mode = noSpacesLeadingAndTrailingPlease(mode);
  }
  if (passHash) {
    passHash = noSpacesLeadingAndTrailingPlease(passHash);
  }

  return {
    props: {
      og_pageUrl,
      og_description,
      og_pageImage,
      appName: appName ?? null,
      email: email ?? null,
      uid: uid ?? null,
      mode: mode ?? null,
      passHash: passHash ?? null,
    },
  };
};

const Page: NextPageWithLayout<IPageProps> = ({
  og_description,
  og_pageImage,
  og_pageUrl,
  appName,
  email,
  uid,
  mode,
  passHash,
}) => {
  const router = useRouter();
  const { theme, setTheme, gotoSignIn, gotoSignOut } = useContext(DataStore);

  const [userTypedPassword, setUserTypedPassword] = useState('');
  const [passHashVerified, setPassHashVerified] = useState(false);
  const [deletionInProgress, setDeletionInProgress] = useState(false);

  const [accountDeleted, setAccountDeleted] = useState(false);

  useEffect(() => {}, []);

  const deleteAc = async (credential: any) => {
    setDeletionInProgress(true);
    ////

    //DANGER ZONE!
    const rpt = await deleteUser_SelfAccountDeletion(
      credential.user.email!,
      lnoApiKeySysOps!
    );

    if (rpt) {
      // console.log(`!!new/copy id::${rpt['_id']}`)
      // console.log(`!!old/deleted id::${rpt['_id_deleted']}`)

      //pause..
      await wait(15000);

      //1. clear auth cookies..
      await deleteUserCookie();

      //2. clear auth provider sessions..
      signOut({
        callbackUrl: `${server}/`,
      });

      //3. route to..
      router.push(`${server}/`);
    }

    console.log(
      `!!user email ${credential.user.email} of uid::${credential.user.uid} --deleted`
    );

    setDeletionInProgress(false);
    ////
  };

  const continueWithPassword = async () => {
    let uid = null;
    let credential = null;

    let password = userTypedPassword;
    let passwordVerified = false;

    // const passHash = await generateHash('User*@1234');
    console.log(`!!passHash::${passHash}`);

    passwordVerified = await validateInputAgainstHash(
      userTypedPassword,
      passHash
    );

    setPassHashVerified(passwordVerified);

    if (passwordVerified) {
      try {
        credential = await signInWithEmailAndPassword(fbAuth, email, password);

        deleteAc(credential);
      } catch (e) {
        console.log(`!!Oops on continueWithPassword::${e}`);

        if (constainsSubstring_i('auth/invalid-login-credentials', `${e}`)) {
          gotoSignIn();
        }
      }
    }
  };

  const continueWithGooglePopup = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const credential = await signInWithPopup(fbAuth, provider);

      deleteAc(credential);
    } catch (e) {
      console.log(`!!Oops on continueWithGooglePopup::${e}`);
    }
  };

  return (
    <section className={'my-page-full'}>
      {mode == 'success' || accountDeleted ? (
        <>
          <div className="mt-12 mb-4 text-center" hidden={false}>
            <FontAwesomeIcon
              icon={faCheck}
              style={{ fontSize: 40 }}
              className={`text-zinc-300`}
            />
            <p className={`text-base text-red-600`}>
              Account successfuly deleted
            </p>
            <p>{`This has terminated your ${
              appName ? `${appName.toLowerCase()} ` : ``
            }user account forever and you'll neither be able to sign in nor see associated data`}</p>

            <p className="mb-4">&nbsp;</p>
            <button
              className="my-btn rounded-full w-72 sm:w-80"
              onClick={() => gotoSignOut()}
            >
              Okay
            </button>
          </div>
        </>
      ) : (
        <>
          <h1 className="my-page-title text-red-600">Account Deletion</h1>

          {email && passHash ? (
            <>
              {/* <p className='text-xs text-zinc-200 resposta uppercase'>{email}</p> */}
              {/*  <p>Password hash: {passHash}</p> 
                
              </p>
              <p>*/}

              <div>
                <p>Let us confirm that it is really you</p>
                <p className="mb-4">
                  <small>
                    Password verified:{' '}
                    <span
                      className={`${
                        passHashVerified ? `text-green-600` : `text-red-600`
                      }`}
                    >
                      {passHashVerified ? 'True' : 'False'}
                    </span>
                  </small>
                </p>

                <p className={`text-base text-blue-600`}>Enter your password</p>
                <div className="mb-3">
                  <input
                    type="text"
                    name="email"
                    className="duo rounded-md border-2 w-72 sm:w-80 h-10 px-3 mt-2  text-zinc-600"
                    placeholder="password*"
                    value={userTypedPassword}
                    onChange={(e) => {
                      setUserTypedPassword(e.target.value);
                    }}
                  />
                </div>

                <div className="mb-3">
                  <button
                    className="my-btn rounded-full w-72 sm:w-80"
                    onClick={() => continueWithPassword()}
                    disabled={
                      userTypedPassword.trim().length == 0 || deletionInProgress
                    }
                  >
                    {deletionInProgress ? `Deleting..` : `Confirm Password`}
                  </button>
                </div>
              </div>

              <hr className="my-rule" />

              <p className={`text-base text-blue-600`}>Or</p>
            </>
          ) : (
            <></>
          )}

          <div className="mb-3">
            <a
              onClick={() => continueWithGooglePopup()}
              className="my-link-silent"
            >
              Continue with <span className="text-blue-500">G</span>
              <span className="text-red-600">o</span>
              <span className="text-yellow-500">o</span>
              <span className="text-blue-500">g</span>
              <span className="text-green-700">l</span>
              <span className="text-red-600">e</span>
            </a>
            ?
          </div>
        </>
      )}
    </section>
  );
};

export default Page;

Page.getLayout = (page) => {
  return (
    <PrimaryLayout
      titleBar="A/c Deletion"
      pageUrl={page.props['og_pageUrl']}
      description={page.props['og_description']}
      pageImage={page.props['og_pageImage']}
    >
      {page}
    </PrimaryLayout>
  );
};
