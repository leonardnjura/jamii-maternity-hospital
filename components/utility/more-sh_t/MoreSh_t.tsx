const cookieCutter = require('cookie-cutter');
const parse = require('html-react-parser');

import {
  faEllipsisVertical,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Modal } from '@nextui-org/react';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import DataStore from '../../../context/app/DataStore';

export interface IMoreSh_t {}

const MoreSh_t: React.FC<IMoreSh_t> = () => {
  const router = useRouter();

  const { theme, setTheme, authenticated, authenticatedUser } =
    useContext(DataStore);

  const [visible, setVisible] = useState(false);
  const [visible2, setVisible2] = useState(false);

  const handler = () => setVisible(true);
  const handler2 = () => setVisible2(true);
  const closeHandler = () => {
    setVisible(false);
  };
  const closeHandler2 = () => {
    setVisible2(false);
  };

  useEffect(() => {}, []);

  const gotoPage = (pg: string) => {
    closeHandler();
    closeHandler2();
    //put any pg preops in pg, trigger 'em with hook listener..
    router.push(`${pg}`);
  };

  return (
    <>
      <a className="hover:bg-bl ">
        <FontAwesomeIcon
          icon={faEllipsisVertical}
          style={{ fontSize: 20 }}
          className="my-link-nav"
          onClick={handler}
        />
      </a>

      <Modal
        //closeButton
        blur
        aria-labelledby="modal-title"
        open={visible}
        onClose={closeHandler}
        className="m-2"
      >
        <Modal.Header>
          <div className="duo text-black text-lg font-bold pt-4 ">
            <a className="hover:bg-bl ">
              <FontAwesomeIcon
                icon={faEllipsisVertical}
                style={{ fontSize: 30 }}
                className={`my-link-nav`}
                onClick={handler}
              />
            </a>
            <br />

            {/* mobile only */}
            <span className="text-xs block py-1 sm:hidden">
              <a className="my-link-nav" onClick={() => gotoPage(`/`)}>
                Home
              </a>
            </span>

            {/* all displays */}
            {/* <hr className="my-rule mt-4 mb-4 sm:hidden" /> */}
            <span className="text-xs block py-1">
              <a className="my-link-nav" onClick={() => gotoPage(`/users`)}>
                users
              </a>
            </span>

            <span className="text-xs block py-1">
              <a className="my-link-nav" onClick={() => gotoPage(`/users`)}>
                assign roles
              </a>
            </span>

            <span className="text-xs block py-1">
              <a className="my-link-nav" onClick={() => gotoPage(`/stats`)}>
                stats
              </a>
            </span>

            <br />

            <span className="" title={`Registration`}>
              {' '}
              <FontAwesomeIcon
                icon={faUserPlus}
                style={{ fontSize: 15 }}
                className={`my-link-nav`}
                // onClick={() => gotoPage(`/register-client`)}
                onClick={() => {
                  closeHandler();
                  handler2();
                }}
              />
            </span>

            <hr className="my-rule border-t-zinc-200 dark:border-t-zinc-200 mt-2 mb-1" />
            <div className="flex flex-col justify-center pt-4 text-xs">
              <a className="tooltip-link" onClick={() => gotoPage(`/about`)}>
                About
              </a>
            </div>
            <div className="flex flex-col justify-center pt-2 text-xs">
              <a className="tooltip-link" onClick={() => gotoPage(`/contact`)}>
                Contact Us
              </a>
            </div>
            <div className="flex flex-col justify-center items-center pt-2 text-xs tooltip-link">
              {authenticatedUser._id ? (
                <a
                  className="tooltip-link"
                  onClick={() => gotoPage(`/signout`)}
                >
                  Sign Out
                </a>
              ) : (
                <a className="tooltip-link" onClick={() => gotoPage(`/signin`)}>
                  Sign In
                </a>
              )}
            </div>
          </div>
        </Modal.Header>
        <Modal.Body>
          <p>{''}</p>
        </Modal.Body>
      </Modal>

      <Modal
        //closeButton
        blur
        aria-labelledby="modal-title"
        open={visible2}
        onClose={closeHandler2}
        className="m-2"
      >
        <Modal.Header>
          <div className="duo text-black text-lg font-bold pt-4 ">
            <a className="hover:bg-bl ">
              <FontAwesomeIcon
                icon={faEllipsisVertical}
                style={{ fontSize: 30 }}
                className={`my-link-nav`}
                onClick={handler2}
              />
            </a>
            <br />

            {/* mobile only */}
            <span className="text-xs block py-1 sm:hidden">
              <a className="my-link-nav" onClick={() => gotoPage(`/`)}>
                Home
              </a>
            </span>

            {/* all displays */}
            {/* <hr className="my-rule mt-4 mb-4 sm:hidden" /> */}
            <span className="text-xs block py-1">
              <a
                className="my-link-nav"
                onClick={() => gotoPage(`/signup`)}
                title={`Sign up a user and designate midwife nurse role`}
              >
                <FontAwesomeIcon
                  icon={faUserPlus}
                  style={{ fontSize: 15 }}
                  className={`my-link-nav`}
                />{' '}
                midwife registration
              </a>
            </span>

            {/* <span>{' • '}</span> */}

            <span className="text-xs block py-1">
              <a
                className="my-link-nav"
                onClick={() => gotoPage(`/register-client`)}
                title={`Register pregnant mums`}
              >
                <FontAwesomeIcon
                  icon={faUserPlus}
                  style={{ fontSize: 15 }}
                  className={`my-link-nav`}
                />{' '}
                client registration
              </a>
            </span>

            <br />
          </div>
        </Modal.Header>
        <Modal.Body>
          <p>{''}</p>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default MoreSh_t;
