const QRCode = require('qrcode');

import { useContext, useEffect, useState } from 'react';
import PrimaryLayout from '../components/layouts/primary/PrimaryLayout';
import { ICaptchaScore, IHospitalClient } from '../data/types';
import { NextPageWithLayout } from './page';

import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

import {
  faCheck,
  faHourglass,
  faUser,
  faUserPlus,
  faWarning,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useFormik } from 'formik';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as yup from 'yup';
import Loader from '../components/utility/loader/Loader';
import { PROJECT_MISSION, PROJECT_NAME, lnoApiKeySysOps } from '../config';
import DataStore from '../context/app/DataStore';
import { verifyIfUserIsABot } from '../lib/get-captcha';
import { createClient } from '../lib/get-clients';

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
  const [handlerMedicUrl, setHandlerMedicUrl] = useState('');
  const [handlerMedicNames, setHandlerMedicNames] = useState('');
  const [icon, setIcon] = useState(faUser);
  const [iconColor, setIconColor] = useState('blue');
  const [doingThings, setDoingThings] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedSuccessfully, setSubmittedSuccessfully] = useState(false);

  //**~~~~~~~forget getServerSideProps use hooks in extension for next export~~~~~~*/
  useEffect(() => {}, []);
  //**~~~~~~~forget getServerSideProps use hooks in extension for next export~~~~~~*/

  const formik = useFormik({
    initialValues: {
      email: '',
      firstname: '',
      lastname: '',
      clientNotes: '',
      hospitalizationDays: '',
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
      // clientNotes: yup.string().trim().required('client notes are required'),
      clientNotes: yup.string().trim().optional(),
    }),
  });

  async function handleSendMessage() {
    //firebase op/////////
    setDoingThings(true);

    let reqBody: IHospitalClient = {
      clientEmail: formik.values.email,
      firstName: formik.values.firstname,
      lastName: formik.values.lastname,
      notes: formik.values.clientNotes,
      hospitalizationDays: Number(formik.values.hospitalizationDays),
    };

    console.log(`!!fb creatiy req::${JSON.stringify(reqBody)}`);
    const resBody = await createClient(reqBody, lnoApiKeySysOps!, false);
    const rawData = await resBody.json();
    console.log(
      `!!fb creatiy res::${JSON.stringify(rawData)} httpStatus::${
        resBody.status
      }`
    );

    let someHttpErrorExists = resBody.status != 201; //‼️CREATED

    if (someHttpErrorExists) {
      setIcon(faWarning);
      setIconColor('red');
      setMessage(`${rawData['message']}`);
    } else {
      setIcon(faCheck);
      setIconColor('green');
      setSubmittedSuccessfully(true);
      setMessage(`${rawData['message']}`);

      const messageId = rawData['data']._id;

      console.log(`docRef`, messageId);

      //grab assigned midwife details
      setHandlerMedicUrl(`/user/${rawData['data']['handlerMedicId']}`);
      setHandlerMedicNames(`${rawData['verbose']['medicNames']}`);
    }

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
        <h1 className="my-page-title">Client Registration</h1>

        <div className="text-xs mt-4 mb-4">
          {!submittedSuccessfully ? (
            <></>
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
            <>
              <span>{message}</span>

              {handlerMedicNames && (
                <span className="font-semibold">
                  <br />
                  <br />
                  Midwife:{' '}
                  <Link
                    className="resposta my-link-dotted cursor-pointer"
                    href={handlerMedicUrl}
                    title={`Midwife ${handlerMedicNames} has been auto-assigned to handle newly registred client ${formik.values.firstname} ${formik.values.lastname} at ${PROJECT_NAME}`}
                  >
                    {handlerMedicNames.split(' ')[0]}
                  </Link>
                </span>
              )}
            </>
          ) : (
            <Loader
              loading={doingThings}
              standbyNotes={''}
              absoluteItems="Registering client.."
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
              name="clientNotes"
              className="duo rounded-md border-2 w-72 sm:w-80 h-32 px-3 mt-2  text-zinc-600 pt-2 "
              placeholder="client notes"
              value={formik.values.clientNotes}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.errors.clientNotes && formik.touched.clientNotes && (
              <div className="text-danger">{formik.errors.clientNotes}</div>
            )}
          </div>
          <div className="mb-3">
            <input
              type="text"
              name="hospitalizationDays"
              className="duo rounded-md border-2 w-72 sm:w-80 h-10 px-3 mt-2  text-zinc-600"
              placeholder="hospitalization days*"
              value={formik.values.hospitalizationDays}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.errors.hospitalizationDays &&
              formik.touched.hospitalizationDays && (
                <div className="text-danger">
                  {formik.errors.hospitalizationDays}
                </div>
              )}
          </div>
          <button
            type="submit"
            className="my-btn rounded-full w-72 sm:w-80"
            disabled={doingThings}
          >
            Register
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
  return <PrimaryLayout titleBar="Client Registration">{page}</PrimaryLayout>;
};
