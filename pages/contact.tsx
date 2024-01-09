const QRCode = require('qrcode');

import { useContext, useEffect, useState } from 'react';
import PrimaryLayout from '../components/layouts/primary/PrimaryLayout';
import { ICaptchaScore, IMessageData } from '../data/types';
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
import { useRouter } from 'next/router';
import * as yup from 'yup';
import Loader from '../components/utility/loader/Loader';
import { INFO_EMAIL } from '../config';
import DataStore from '../context/app/DataStore';
import { verifyIfUserIsABot } from '../lib/get-captcha';
import { createSurferMessage } from '../lib/get-surfermessages';

export interface IPageProps {}

export const getServerSideProps: GetServerSideProps<IPageProps> = async (
  context
) => {
  return {
    props: {},
  };
};

const Page: NextPageWithLayout<IPageProps> = () => {
  //reCAPTCHA monitors bot behavior silently..
  const { executeRecaptcha } = useGoogleReCaptcha();

  const router = useRouter();
  const { theme, setTheme } = useContext(DataStore);

  const [message, setMessage] = useState('');
  const [icon, setIcon] = useState(faUser);
  const [iconColor, setIconColor] = useState('blue');
  const [doingThings, setDoingThings] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedSuccessfully, setSubmittedSuccessfully] = useState(false);

  const [emailInfoQrCodeDataUrl, setEmailInfoQrCodeDataUrl] = useState('');

  ////init contacts
  const infoEmail = INFO_EMAIL;

  //**~~~~~~~forget getServerSideProps use hooks in extension for next export~~~~~~*/
  useEffect(() => {
    QRCode.toDataURL(infoEmail, function (err: any, url: any) {
      // console.log(`\n\n!!qrcode says data url::`, url);
      setEmailInfoQrCodeDataUrl(url);
    });
  }, []);
  //**~~~~~~~forget getServerSideProps use hooks in extension for next export~~~~~~*/

  const formik = useFormik({
    initialValues: {
      email: '',
      firstname: '',
      lastname: '',
      surferMessage: '',
    },
    onSubmit: () => {
      setMessage(`Submitted`);
      setSubmitted(true);
      setIcon(faHourglass);
      handleSendMessage();
    },
    validationSchema: yup.object({
      email: yup
        .string()
        .email('must be a valid email')
        .required('email is required'),
      firstname: yup.string().trim().required('firstname is required'),
      lastname: yup.string().trim().optional(),
      surferMessage: yup.string().trim().required('message is required'),
    }),
  });

  async function handleSendMessage() {
    //firebase op/////////
    setDoingThings(true);

    let reqBody: IMessageData = {
      email: formik.values.email,
      firstName: formik.values.firstname,
      lastName: formik.values.lastname,
      surferMessage: formik.values.surferMessage,
      surferCountry: '-',
    };

    // console.log(`!!fb creatiy req::${JSON.stringify(reqBody)}`);
    const resBody = await createSurferMessage(reqBody, false);
    const rawData = await resBody.json();
    // console.log(
    //   `!!fb creatiy res::${JSON.stringify(rawData)} httpStatus::${
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
      setSubmittedSuccessfully(true);

      const messageId = rawData['data']._id;

      console.log(`messageRef`, messageId);
    }
    setMessage(`${rawData['message']}`);

    setDoingThings(false);
    //firebase op/////////
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
      const action = rawData['data'].action;
      const score = rawData['data'].score;
      const dateOfBotChallenge = rawData['data'].challenge_ts;
      const host = rawData['data'].hostname;
      const success = rawData['data'].success;

      const userSiteBehaviour: ICaptchaScore = {
        action,
        dateOfBotChallenge,
        host,
        score,
        success,
      };

      console.log(`!!score::${score}`);

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

  return (
    <section className={'my-page-full'}>
      <div className="mx-auto text-center pt-10">
        {/* <h1 className="my-page-title">Contact Us</h1> */}

        <div className="text-xs mt-4 mb-4">
          {!submittedSuccessfully ? (
            <>
              <a href={`mailto:${infoEmail}`} className="my-link-silent">
                Send Email
              </a>
              ?
              {emailInfoQrCodeDataUrl && (
                <div className="flex flex-col justify-center items-center">
                  <img
                    className="m-1 object-cover rounded-md border-2 shadow-none" // className="m-1 border-none"
                    src={emailInfoQrCodeDataUrl}
                    alt="qr__image"
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <span className="text-yellow-600">Thank you</span>
              <hr className="my-rule mt-4 mb-4 " />
            </>
          )}
        </div>

        <div className="text-base mt-12 mb-4" hidden={!submitted}>
          <FontAwesomeIcon
            icon={icon}
            style={{ fontSize: 40 }}
            className={`text-${iconColor}-600`}
          />
        </div>

        <p>
          {!doingThings ? (
            <span>{message}</span>
          ) : (
            <Loader
              loading={doingThings}
              standbyNotes={''}
              absoluteItems="Sending message.."
            />
          )}
        </p>
        <form
          hidden={submittedSuccessfully}
          className="w-72 sm:w-80"
          onSubmit={(e) => {
            // formik.handleSubmit

            e.preventDefault();

            handleSubmitWithRecaptcha();
          }}
        >
          <div className="mb-3">
            <input
              autoFocus={true}
              type="text"
              name="firstname"
              className="duo rounded-md border-2 w-72 sm:w-80 h-10 px-3 mt-2  text-zinc-600"
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
              className="duo rounded-md border-2 w-72 sm:w-80 h-10 px-3 mt-2  text-zinc-600"
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
              className="duo rounded-md border-2 w-72 sm:w-80 h-10 px-3 mt-2  text-zinc-600"
              placeholder="email*"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.errors.email && formik.touched.email && (
              <div className="text-danger">{formik.errors.email}</div>
            )}
          </div>
          <div className="mb-3">
            <textarea
              name="surferMessage"
              className="duo rounded-md border-2 w-72 sm:w-80 h-32 px-3 mt-2  text-zinc-600 pt-2 "
              placeholder="your message*"
              value={formik.values.surferMessage}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.errors.surferMessage && formik.touched.surferMessage && (
              <div className="text-danger">{formik.errors.surferMessage}</div>
            )}
          </div>
          <button
            type="submit"
            className="my-btn rounded-full w-72 sm:w-80"
            disabled={doingThings}
          >
            Send
          </button>{' '}
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
  return <PrimaryLayout titleBar="Contact Us">{page}</PrimaryLayout>;
};
