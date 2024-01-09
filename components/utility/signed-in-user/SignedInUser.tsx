import { faSignIn, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Modal } from '@nextui-org/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import DataStore from '../../../context/app/DataStore';
import { titleCasePlease } from '../../../utils/preops';
import UserType from '../user-type/UserType';

export interface ISignedInUser {}

const SignedInUser: React.FC<ISignedInUser> = () => {
  const router = useRouter();

  const {
    theme,
    setTheme,
    authenticated,
    authenticatedUser,
    gotoSignIn,
    gotoSignOut,
  } = useContext(DataStore);

  const [visible, setVisible] = useState(false);

  const { data: session } = useSession(); //google session

  const handler = () => setVisible(true);
  const closeHandler = () => {
    setVisible(false);
  };

  //**~~~~~~~~~~~~~~~~~~~~~~~~effect~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  useEffect(() => {}, []);
  //**~~~~~~~~~~~~~~~~~~~~~~~~effect~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

  const gotoPage = (pg: string) => {
    //put any pg preops in pg, trigger 'em with hook listener..
    router.push(`${pg}`);
  };

  const avatarUrl = authenticatedUser.avatar;

  return (
    <>
      {authenticated ? (
        <>
          {' '}
          {avatarUrl ? (
            <a onClick={handler}>
              <img
                className="h-9 w-9 -mt-2 object-cover rounded-full cursor-pointer"
                referrerPolicy="no-referrer"
                src={`${avatarUrl}`}
                alt=""
              />
            </a>
          ) : (
            <a onClick={handler}>
              <FontAwesomeIcon
                icon={faUser}
                style={{ fontSize: 20 }}
                className="my-link-nav"
              />{' '}
            </a>
          )}
        </>
      ) : (
        <>
          <FontAwesomeIcon
            icon={faSignIn}
            style={{ fontSize: 20 }}
            className="my-link-nav"
            onClick={handler}
          />
        </>
      )}

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
            {authenticated && authenticatedUser._id ? (
              <a
                className="inline-block"
                onClick={() => {
                  closeHandler();
                  gotoPage(`/user/${authenticatedUser._id}`);
                }}
              >
                {avatarUrl ? (
                  <img
                    className="h-20 w-20 -mt-2 object-cover rounded-full"
                    referrerPolicy="no-referrer"
                    src={`${avatarUrl}`}
                    alt=""
                  />
                ) : (
                  <>
                    <FontAwesomeIcon
                      icon={faUser}
                      style={{ fontSize: 35 }}
                      className={`text-blue-600 hover:text-blue-700`}
                    />{' '}
                  </>
                )}
              </a>
            ) : (
              <>
                <FontAwesomeIcon
                  icon={faSignIn}
                  style={{ fontSize: 30 }}
                  className="my-link-nav"
                />
              </>
            )}
            <br />
            {authenticated ? (
              <>
                <span className="resposta text-xs">
                  {authenticatedUser.firstName
                    ? titleCasePlease(`${authenticatedUser.firstName}`)
                    : ``}
                </span>{' '}
                {}
                <span className="text-xs">{' • '}</span>
                <span className="text-xs">
                  <a
                    className="my-link-nav"
                    onClick={() => {
                      closeHandler();
                      gotoPage(`/user/${authenticatedUser._id}`);
                    }}
                  >
                    My Profile
                  </a>
                </span>{' '}
                <span className="text-xs">{' • '}</span>
                <span className="text-xs">
                  <a
                    onClick={() => gotoSignOut()}
                    className="my-link-nav-error"
                  >
                    Sign Out
                  </a>{' '}
                </span>
                <UserType user={authenticatedUser} hideRole={true} />
              </>
            ) : (
              <span className="text-xs">
                <a
                  onClick={() => {
                    closeHandler();
                    ////
                    gotoSignIn();
                  }}
                  className="my-link-nav"
                >
                  Sign In{' '}
                </a>
              </span>
            )}
          </div>
        </Modal.Header>
        <Modal.Body>
          <p>{''}</p>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SignedInUser;
