import { useContext, useEffect, useState } from 'react';
import PrimaryLayout from '../components/layouts/primary/PrimaryLayout';
import { ICaptchaScore, IUserData } from '../data/types';
import { signupUser } from '../lib/get-users';
import { NextPageWithLayout } from './page';

import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

import {
  faCheck,
  faHourglass,
  faUser,
  faWarning,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useFormik } from 'formik';
import { GetServerSideProps } from 'next';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useCookies } from 'react-cookie';
import * as yup from 'yup';
import Loader from '../components/utility/loader/Loader';
import {
  ONE_WEEK,
  PASSWORD_PEEKABOO_TIMEOUT,
  PEEKING_PASSWORD_RHS_ENABLED,
  server,
} from '../config';
import DataStore from '../context/app/DataStore';
import { verifyIfUserIsABot } from '../lib/get-captcha';
import {
  constainsSubstring_i,
  noSpacesLeadingAndTrailingPlease,
} from '../utils/preops';
const cookieCutter = require('cookie-cutter');

export interface IPageProps {
  redirectPage: string | null;
  isValidRedirectPage: boolean;
}

export const getServerSideProps: GetServerSideProps<IPageProps> = async (
  context
) => {
  let redirectPage = context.query.continue as string | null;

  if (
    redirectPage &&
    !constainsSubstring_i('signup', redirectPage) &&
    !constainsSubstring_i('signin', redirectPage)
  ) {
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
  //reCAPTCHA monitors bot behavior silently..
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [cuikie, setCuikie] = useCookies(['user']);
  const router = useRouter();
  const {
    theme,
    setTheme,
    gotoSignOut,
    setAuthenticated,
    setAuthenticatedUser,
    newSignInPreops,
    gotoSignIn,
  } = useContext(DataStore);

  const [message, setMessage] = useState('');
  const [icon, setIcon] = useState(faUser);
  const [iconColor, setIconColor] = useState('blue');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  //**~~~~~~~forget getServerSideProps use hooks in extension for next export~~~~~~*/
  useEffect(() => {}, []);
  //**~~~~~~~forget getServerSideProps use hooks in extension for next export~~~~~~*/

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      firstname: '',
      lastname: '',
    },
    onSubmit: () => {
      setMessage(`Submitted`);
      setSubmitted(true);
      setIcon(faHourglass);
      handleSignup();
    },
    validationSchema: yup.object({
      email: yup
        .string()
        .email('must be a valid email')
        .required('email is required'),
      password: yup
        .string()
        .trim()
        .required('password is required')
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
          'must contain at least 8 characters, one uppercase, one lowercase, one number and one special character'
        ),
      firstname: yup.string().trim().required('firstname is required'),
      lastname: yup.string().trim().optional(),
    }),
  });

  function togglePasswordVisibility() {
    if (!isPasswordVisible) {
      activatePasswordPeekabooTimeout();
    }
    setIsPasswordVisible(!isPasswordVisible);
  }

  function activatePasswordPeekabooTimeout() {
    setTimeout(function () {
      setIsPasswordVisible(false);
    }, PASSWORD_PEEKABOO_TIMEOUT);
  }

  async function handleSignup() {
    //firebase signup/////////
    setAuthenticating(true);

    let reqBody: IUserData = {
      email: formik.values.email,
      password: formik.values.password,
      firstName: formik.values.firstname,
      lastName: formik.values.lastname,
    };

    // console.log(`!!fb signup req::${JSON.stringify(reqBody)}`);
    // ❗❗note: backend will auto assign freemium tokens, :)
    const resBody = await signupUser(reqBody, false);
    const rawData = await resBody.json();
    // console.log(
    //   `!!fb signup res::${JSON.stringify(rawData)} httpStatus::${
    //     resBody.status
    //   }`
    // );

    let someHttpErrorExists = resBody.status != 201;

    if (someHttpErrorExists) {
      setIcon(faWarning);
      setIconColor('red');
    } else {
      setIcon(faCheck);
      setIconColor('green');
      const uid = rawData['data']._id;
      const user: IUserData = rawData['data'];
      setAuthenticated(true);
      setAuthenticatedUser(user);
      newSignInPreops(user);

      //route to cookie page..
      sinkCredentialsStage1(user);
    }
    setMessage(`${rawData['message']}`);

    setAuthenticating(false);
    //firebase signup/////////
  }

  async function handleSubmitWithRecaptcha() {
    let verified = false;
    let verifiedDeVerdad = false;
    //if the component is not mounted yet
    if (!executeRecaptcha) {
      return;
    }
    // behaviour token
    const token = await executeRecaptcha('onSubmit');
    // validate user behaviour
    const res = await verifyIfUserIsABot(token, false);

    let rawData = await res.json();
    // console.log(`!!rawData`, rawData);
    // console.log(`!!rawData status`, res.status);

    verified = rawData['data'].success;
    console.log(`!!captcha verified::${verified}`);

    if (verified) {
      const userSiteBehaviour: ICaptchaScore = {
        action: rawData['data'].action,
        dateOfBotChallenge: rawData['data'].challenge_ts,
        host: rawData['data'].hostname,
        score: rawData['data'].score,
        success: rawData['data'].success,
      };

      console.log(`!!score::${userSiteBehaviour.score}`);

      // console.log(
      //   `!!userSiteBehaviour::${JSON.stringify(userSiteBehaviour)}`
      // );

      verifiedDeVerdad =
        userSiteBehaviour.success && userSiteBehaviour.score > 0.5;
      // console.log(`!!verifiedDeVerdad::${verifiedDeVerdad}`);
    }

    if (verified) {
      // human..
      console.log(`!!human ✓`);

      formik.handleSubmit();
    } else {
      // bot..
      console.log(`!!bot 🚫`);
      setIcon(faWarning);
      setIconColor('red');
      setMessage('Are you a bot?');
    }
  }

  const gotoHomePageWithState = async () => {
    {
      router.push(`${server}/`);
    }
  };

  const gotoPersonalPageWithState = async (uid: string) => {
    {
      router.push(`${server}/user/${uid}`);
    }
  };

  const gotoSignInWithCredentials = async () => {
    router.push(`${server}/signin`);
  };

  const gotoSignInWithGoogle = async () => {
    signIn('google', {
      callbackUrl: `${server}/oauth-continue${
        redirectPage ? `?continue=${redirectPage}` : ``
      }`,
    });
  };

  const sinkCredentialsStage1 = async (user: IUserData) => {
    //SIMPLE COOKIE:fun math
    cookieCutter.set('tabs-timer', ONE_WEEK);

    //NOTE:
    //we route to homepage to use getserversideprops to copy just created hidden secure server side 'auth' cookie
    //we'll copy cookie jwt to another FE/UI cookie to create the adDsession accross all tabs
    //nextjs oauth session providers[google, etc] suck big time with my api/ui credentials signin. Plus I dont wanna create a credentials signin as a provider as it sucks too
    //todo: remove entire func if redudant, ie if its guaranteed all logins including nextjs oauth calls home page to create the FE/UI cookie
    // gotoHomePageWithState();//todo: refactore api, signup kinda misses setting headers, we force signin after newly created a/c, :|
    gotoHomePageWithState();
  };

  return (
    <section className={'my-page-full'}>
      <div className="mx-auto text-center pt-10">
        <h1 className="my-page-title">Sign Up</h1>

        <div className="text-xs mt-4 mb-4">
          <a
            onClick={() => gotoSignInWithCredentials()}
            className="my-link-silent"
          >
            Sign in with Email
          </a>
          ?{' '}
          <a onClick={() => gotoSignInWithGoogle()} className="my-link-silent">
            Sign in with <span className="text-blue-500">G</span>
            <span className="text-red-600">o</span>
            <span className="text-yellow-500">o</span>
            <span className="text-blue-500">g</span>
            <span className="text-green-700">l</span>
            <span className="text-red-600">e</span>
          </a>
          ?
        </div>

        <div className="text-base mt-12 mb-4" hidden={!submitted}>
          <FontAwesomeIcon
            icon={icon}
            style={{ fontSize: 40 }}
            className={`text-${iconColor}-600`}
          />
        </div>

        <p>
          {!authenticating ? (
            <span>{message}</span>
          ) : (
            <Loader
              loading={authenticating}
              standbyNotes={''}
              absoluteItems="Signing you up.."
            />
          )}
        </p>
        <form
          //hidden={submitted}
          className="w-72 sm:w-80"
          onSubmit={(e) => {
            // formik.handleSubmit

            e.preventDefault();

            handleSubmitWithRecaptcha();
          }}
        >
          <div className="mb-3">
            <input
              type="text"
              name="firstname"
              className="duo rounded-full border-2 w-72 sm:w-80 h-10 px-3 mt-2  text-zinc-600"
              placeholder="firstname*"
              value={formik.values.firstname}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.errors.firstname && formik.touched.firstname && (
              <div className="text-danger">{formik.errors.firstname}</div>
            )}
          </div>

          <div className="mb-3">
            <input
              type="text"
              name="lastname"
              className="duo rounded-full border-2 w-72 sm:w-80 h-10 px-3 mt-2  text-zinc-600"
              placeholder="lastname"
              value={formik.values.lastname}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.errors.lastname && formik.touched.lastname && (
              <div className="text-danger">{formik.errors.lastname}</div>
            )}
          </div>

          <div className="mb-3">
            <input
              type="text"
              name="email"
              className="duo rounded-full border-2 w-72 sm:w-80 h-10 px-3 mt-2  text-zinc-600"
              placeholder="email*"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.errors.email && formik.touched.email && (
              <div className="text-danger">{formik.errors.email}</div>
            )}
          </div>

          <div className="mb-3 relative">
            <input
              type={isPasswordVisible ? 'text' : 'password'}
              name="password"
              className="duo rounded-full border-2 w-72 sm:w-80 h-10 px-3 mt-2  text-zinc-600"
              placeholder="password*"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {PEEKING_PASSWORD_RHS_ENABLED && (
              <button
                className={`absolute inset-y-0 right-0 ${
                  formik.errors.password ? `-mt-8` : `-mt-4`
                }  flex items-center px-4 text-slate-400 hover:text-slate-400`}
                type="button"
                onClick={togglePasswordVisibility}
              >
                {!isPasswordVisible ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            )}
            {formik.errors.password && formik.touched.password && (
              <div className="text-danger">{formik.errors.password}</div>
            )}
            <label className="flex items-center mt-2 pl-4">
              <input
                type="checkbox"
                className="mr-2 w-4 h-4"
                checked={isPasswordVisible}
                onChange={togglePasswordVisibility}
              />
              <span className="text-xs">Show password</span>
            </label>
          </div>

          <button type="submit" className="my-btn rounded-full w-72 sm:w-80">
            Sign Up
          </button>
          {/* reCAPTCHA footer================================================= */}
          <div className="mt-4 w-72 sm:w-80">
            <small>
              This site is protected by reCAPTCHA and the Google{' '}
              <a
                className="my-link"
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noreferrer"
              >
                Privacy Policy
              </a>{' '}
              and{' '}
              <a
                className="my-link"
                href="https://policies.google.com/terms"
                target="_blank"
                rel="noreferrer"
              >
                Terms of Service
              </a>{' '}
              apply.
            </small>
          </div>
          {/* reCAPTCHA footer================================================= */}
        </form>
      </div>
    </section>
  );
};

export default Page;

Page.getLayout = (page) => {
  return <PrimaryLayout titleBar="Sign Up">{page}</PrimaryLayout>;
};
