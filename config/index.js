export const PROJECT_NAME = 'Jamii Maternity Hospital';
export const PROJECT_MISSION =
  'Making the pregnancy journey safe and convenient for millions';

export const isDevMode = process.env.NODE_ENV !== 'production';
export const isStorybookMode = process.env.STORYBOOK === 'on'; //$ STORYBOOK=on yarn storybook
export const isTestMode = process.env.NODE_ENV === 'test';
export const lnoApiKeySysOps = process.env.lnoApiKey;
export const loadFallbackData = true;
export const TOKEN_MAX_AGE = 3600 * 10; //10hr
export const COOKIE_CONSENT_MAX_AGE = 3600 * 24 * 365; //1yr
export const JWT_CLAIMS_DURATION = '10hr';
export const ONE_WEEK = 3600 * 24 * 7;
export const PASSWORD_PEEKABOO_TIMEOUT = 39000;

export const USER_MAX_FILE_UPLOAD_LIMIT = 2500;

export const USER_WELCOMED_COOKIE_NAME = 'user-welcomed';
export const COOKIE_CONSENT_COOKIE_NAME = 'cookie-consent'; //for GDPR, CCPA/CPRA and other privacy laws

export const DAYS_TO_TRY_FREEMIUM_TOKEN = 14;
export const ADMIN_ROLE_ID = '(^-^*)'; //todo: set in rolesTable
export const DOCTOR_ROLE_ID = '1';
export const MIDWIFE_ROLE_ID = '2';

export const COLLAPSE_UI_IF_FEATURE_NOT_AVAILABLE = false;
export const ALGOLIA_SEARCH_ENABLED = false;

export const PREVIEW_CRUD_OPS = false;
export const DISPLAY_TERRITORY_NAME_IN_FOOTER = false;

export const CURRENT_YEAR = new Date().getFullYear(); //number
export const CURRENT_MONTH = new Date().getMonth() + 1; //number
export const CURRENT_DAY = new Date().getDate(); //number

export const ORDER_ITEMS_BY_DATE_UPDATED = true; //true && desc, to show latest edits at top

export const PEEKING_PASSWORD_RHS_ENABLED = false;
export const REFRESH_SECONDS = 10;

// we want mocked data either on Storybook or tests
export const isMockedEnvironment = isStorybookMode || isTestMode;

let ngrokSever = 'https://f222-102-135-172-102.ngrok-free.app';
ngrokSever = null;

export const liveServer = 'https://jamii-maternity-hospital.vercel.app';
export const devServer = ngrokSever ?? 'http://localhost:3000';
export const server = isDevMode ? devServer : liveServer;

export const INFO_EMAIL = `info@${liveServer.split(`https://www.`)[1]}`;
export const WHATSAPP_NO = undefined;
export const X_HANDLE = undefined;
export const IG_HANDLE = undefined;

export const logo = `/logo.png`;
export const favicon = logo;

export const generateServerUrl = (page) => `${server}${page}`;

export const SITE_ABOUT = `A web application for automatically assigning clients to nurse midwives based on the total number of clients a nurse midwife currently manages.`;
export const SITE_ABOUT_VERBOSE = `The application also provides a report displaying the current number of clients a nurse midwife is managing, as well as the projected number of clients they will have in two months. Projection is based on the current list of clients. It's important to note that the ${PROJECT_NAME} pregnancy programme can extend up to six months post-pregnancy, but mums may choose to exit earlier. Additionally, mums may join or rejoin at any time, including after giving birth (typically after the fourth week of pregnancy).`;
