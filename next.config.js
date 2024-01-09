/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'localhost',
      'i.pravatar.cc',
      'avatars.dicebear.com',
      'lh3.googleusercontent.com',
    ],
  },
  // Error: i18n support is not compatible with next export [during extension build]
  i18n: {
    locales: ['en', 'pt-BR'],
    defaultLocale: 'en',
    // localeDetection: false,
  },
  devIndicators: {
    buildActivity: false, //build loading indicator
  },
  compiler: {
    styledComponents: true,
  },
  webpack: (config) => {
    config.resolve.fallback = { tls: false, fs: false, net: false };

    return config;
  },
  async rewrites() {
    //loads index page contents onto the missing contacts route ie does not alter url
    return [
      {
        source: '/contact',
        destination: '/',
      },
    ];
  },
  async redirects() {
    //re-routes to this existing page ie handles typos or lazy types
    return [
      {
        source: '/register',
        destination: '/signup',
        permanent: true, // triggers 308
      },
      {
        source: '/registration',
        destination: '/signup',
        permanent: true, // triggers 308
      },
      {
        source: '/login',
        destination: '/signin',
        permanent: true, // triggers 308
      },
      {
        source: '/logout',
        destination: '/signout',
        permanent: true, // triggers 308
      },
      {
        source: '/users/:id',
        destination: '/user/:id',
        permanent: true, // triggers 308
      },
      {
        source: '/feedback',
        destination: '/contact',
        permanent: true, // triggers 308
      },
    ];
  },

  staticPageGenerationTimeout: 1000,
  env: {
    //access .env variables on FE(camelCase).. BE can acces 'em raw(UPPER_CASE), :)
    algoliaApplicationId: process.env.ALGOLIA_APPLICATION_ID,
    algoliaApiKey: process.env.ALGOLIA_API_KEY,
    lnoApiKey: process.env.LNO_API_KEY,
    firebaseServiceAccountKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
    firebaseApiKey: process.env.FIREBASE_API_KEY,
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
    firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: process.env.FIREBASE_APP_ID,
    firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID,
    recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY,
    recaptchaSecret: process.env.RECAPTCHA_SECRET,
  },
  // webpackDevMiddleware: (config) => { //NEXT 13 warns about this
  //   //docker
  //   config.watchOptions = {
  //     poll: 1000,
  //     aggregateTimeout: 300,
  //   };
  //   return config;
  // },
};

module.exports = nextConfig;
