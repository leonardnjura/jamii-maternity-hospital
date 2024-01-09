import '@fortawesome/fontawesome-svg-core/styles.css';
import { SSRProvider } from '@react-aria/ssr';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import NextNProgress from 'nextjs-progressbar';
import { DataStoreProvider } from '../context/app/DataStore';
import '../styles/globals.css';
import { NextPageWithLayout } from './page';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

interface AppPropsWithLayout extends AppProps {
  Component: NextPageWithLayout;
  session: any;
}

function MyApp({ Component, pageProps, session }: AppPropsWithLayout) {
  const getLayout = Component.getLayout || ((page) => page);
  return (
    <SessionProvider session={session}>
      <SSRProvider>
        <NextNProgress color="#1d4ed8" options={{ showSpinner: false }} />
        <GoogleReCaptchaProvider reCaptchaKey={process.env.recaptchaSiteKey!}>
          <DataStoreProvider>
            {getLayout(<Component {...pageProps} />)}
          </DataStoreProvider>
        </GoogleReCaptchaProvider>
      </SSRProvider>
    </SessionProvider>
  );
}

export default MyApp;
