import { useRouter } from 'next/router';
import { useContext } from 'react';
import DataStore from '../../../context/app/DataStore';

import Link from 'next/link';
import { MouseEvent, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import {
  COOKIE_CONSENT_COOKIE_NAME,
  COOKIE_CONSENT_MAX_AGE,
} from '../../../config';
const cookieCutter = require('cookie-cutter');

export interface ICookieConsentButton
  extends React.ComponentPropsWithoutRef<'button'> {
  continueText?: string;
}

const CookieConsentButton: React.FC<ICookieConsentButton> = ({
  className,
  continueText = 'I Accept All Cookies',
  ...buttonProps
}) => {
  const router = useRouter();
  const { theme, setTheme } = useContext(DataStore);

  const [cuikie, setCuikie] = useCookies([COOKIE_CONSENT_COOKIE_NAME]); //ui cookie

  const [cookieConsentIsTrue, setCookieConsentIsTrue] = useState(true);

  useEffect(() => {
    let surferConsentedCookieUsageBefore = cookieCutter.get(
      COOKIE_CONSENT_COOKIE_NAME
    ); //set manually by a 'YES' button or auto if they continue using site after visiting it for the first time

    // console.log(
    //   `!!surferConsentedCookieUsageBefore`,
    //   surferConsentedCookieUsageBefore === 'true'
    // );

    setCookieConsentIsTrue(surferConsentedCookieUsageBefore === 'true');
  }, []);

  const onClickContinueButton = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!cookieConsentIsTrue) {
      let surferHasConsented = true;

      setCuikie(COOKIE_CONSENT_COOKIE_NAME, surferHasConsented, {
        path: '/',
        maxAge: COOKIE_CONSENT_MAX_AGE,
        sameSite: true,
      });

      setCookieConsentIsTrue(surferHasConsented);
    }
  };

  if (cookieConsentIsTrue) {
    return null;
  }

  return (
    <section
      className={`fixed bottom-0 left-0
       w-full p-4 bg-slate-900 dark:bg-gray-800`}
    >
      <div className="flex flex-row justify-between pt-4">
        <div className="nunito text-slate-400 font-extralight">
          <hr className="my-bar-blue mt-0 mb-1" />

          <p className="pr-2">
            <small>
              We use cookies to improve functionality and performance of this
              site. By continuing to browse this site, you consent to the use of
              cookies.
            </small>{' '}
            <small>
              By using our website, you agree to our{' '}
              <Link
                className="my-link-silent cursor-pointer"
                href="/privacy-policy"
              >
                Privacy Policy
              </Link>
            </small>
          </p>
        </div>
        <div>
          <span className="inline-block sm:px-4 px-0 relative">
            {/* <span className="absolute -top-4 -right-0 -rotate-45">
              🍪 <span className="text-2xl">🍪</span>
            </span> */}
            <button
              className="my-btn py-2 rounded-full w-44 sm:w-44 text-slate-500 bg-zinc-100 hover:bg-zinc-200 border-none focus:ring-slate-400 hover:text-blue-600"
              onClick={onClickContinueButton}
            >
              I Accept All Cookies
            </button>
          </span>
        </div>
      </div>
    </section>
  );
};

export default CookieConsentButton;
