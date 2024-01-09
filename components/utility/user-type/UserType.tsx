import { Snackbar } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import {
  ADMIN_ROLE_ID,
  MIDWIFE_ROLE_ID,
  lnoApiKeySysOps,
} from '../../../config';
import DataStore from '../../../context/app/DataStore';
import { IUserData } from '../../../data/types';
import { updateUser } from '../../../lib/get-users';
import { determineUserTypeName } from '../../../services/subscription.service';

import {
  faArrowRight,
  faClipboardCheck,
  faClose,
  faExternalLink,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { FallingLines } from 'react-loader-spinner';

export interface IUserType {
  user: IUserData;
  hideFreemiumLabel?: boolean;
  hideRole?: boolean;
  hideAvatar?: boolean;
  pullAvatarToRhs?: boolean;
  namesDisplayable?: boolean;
  hideLastName?: boolean;
  popableCard?: boolean;
}

export interface SnackbarMessage {
  message: string;
  key: number;
}

const UserType: React.FC<IUserType> = ({
  user,
  hideFreemiumLabel = false,
  hideRole = true,
  hideAvatar = true,
  pullAvatarToRhs = false,
  namesDisplayable = false,
  hideLastName = false,
  popableCard = false,
}) => {
  const router = useRouter();

  const { theme, setTheme } = useContext(DataStore);

  const [busy, setBusy] = useState(false);

  //snackbar
  const [snackMessage, setSnackMessage] = React.useState('');
  const [open, setOpen] = React.useState(false);

  //**run effect!~~~~~~~~~~~~~*/

  useEffect(() => {}, []);

  //**run effect!~~~~~~~~~~~~~*/

  const updateUserRole = async (roleId: string) => {
    const updateBody = {
      roleId: roleId,
    };

    ////
    setBusy(true);

    await updateUser(user._id!, updateBody, lnoApiKeySysOps!);

    //snack bar
    setSnackMessage(`Set as ${determineUserTypeName(roleId)} ✓`);
    handleSnackClick();

    ////
    setBusy(false);
  };

  const resetUser = async () => {
    const updateBody = {
      roleId: '-',
      // lastName: 'Sick0 & F1y 2Mooch', //add other resetable fields
    };

    ////
    setBusy(true);

    await updateUser(user._id!, updateBody, lnoApiKeySysOps!);

    //snack bar
    setSnackMessage(`Reset complete ✓`);
    handleSnackClick();

    ////
    setBusy(false);
  };

  const handleSnackClick = () => {
    setOpen(true);
  };

  const handleSnackClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const action = (
    <React.Fragment>
      <a className="mr-2" onClick={() => router.push(`/user/${user._id}`)}>
        <span className="resposta mx-2 cursor-pointer">
          <FontAwesomeIcon
            icon={faArrowRight}
            style={{ fontSize: 25 }}
            className={`text-slate-500 hover:text-yellow-600`}
          />
        </span>
      </a>

      <a className="hidden" onClick={handleSnackClose}>
        <FontAwesomeIcon
          icon={faClose}
          style={{ fontSize: 20 }}
          className={`my-link-error px-2`}
        />
      </a>
    </React.Fragment>
  );

  return user._id ? (
    <>
      {hideRole ? (
        <></>
      ) : (
        <>
          <div className="my-2 text-xs">
            <span
              className={`resposta ${
                user.roleId == ADMIN_ROLE_ID ? 'text-red-600' : 'text-zinc-400'
              } `}
              title="User designation"
            >
              {/* <span>
                Role id: {user.roleId!}
                <br />
              </span> */}

              <FontAwesomeIcon
                icon={faClipboardCheck}
                style={{ fontSize: 20 }}
                className=""
              />
              <br />

              {determineUserTypeName(user.roleId!).toLowerCase()}
            </span>

            {user.roleId == MIDWIFE_ROLE_ID && popableCard && (
              <>
                {' • '}
                <Link
                  className="my-link-delicate font-thin"
                  href={`/user/${user._id}`}
                  title="Assigned clients"
                >
                  assg. clients{' '}
                </Link>
              </>
            )}
          </div>

          {busy && <FallingLines color="#2F64EB" width="50" visible={true} />}

          {user.roleId != ADMIN_ROLE_ID && (
            <span className="text-xs">
              <br />
              <a
                className="my-link-dotted hover:text-red-600"
                onClick={() => updateUserRole(ADMIN_ROLE_ID)}
              >
                Set as admin
              </a>
            </span>
          )}

          {user.roleId != MIDWIFE_ROLE_ID && (
            <span className="text-xs">
              <br />
              <a
                className="my-link-dotted"
                onClick={() => updateUserRole(MIDWIFE_ROLE_ID)}
              >
                Set as midwife
              </a>
            </span>
          )}

          <span>
            <hr className="my-rule mt-4 mb-2" />

            <button
              className="my-btn py-2 rounded-full w-36 sm:w-36 text-slate-500 bg-zinc-100 hover:bg-zinc-200 border-none focus:ring-slate-400 hover:text-green-600"
              onClick={(e) => {
                e.preventDefault();
                resetUser();
              }}
            >
              Reset
            </button>
          </span>
        </>
      )}

      <div>
        <Snackbar
          open={open}
          autoHideDuration={6000}
          onClose={handleSnackClose}
          message={snackMessage}
          action={action}
        />
      </div>
    </>
  ) : (
    <></>
  );
};

export default UserType;
