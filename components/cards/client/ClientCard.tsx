import {
  faCheck,
  faHourglass,
  faUserMinus,
  faWarning,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';
import DataStore from '../../../context/app/DataStore';
import { IHospitalClient, IUserData } from '../../../data/types';

import Link from 'next/link';
import { FallingLines } from 'react-loader-spinner';
import { PROJECT_NAME, lnoApiKeySysOps } from '../../../config';
import { loadOneUser } from '../../../lib/get-users';
import { transferOneItemFromUserClientList } from '../../../lib/get-users-clientlist-info';
import { determineDaysLeftBeforeClientDischarge } from '../../../services/subscription.service';
import {
  exceptConjuctionsFromTitleCasePlease,
  titleCasePlease,
} from '../../../utils/preops';

export interface IClientCard {
  client: IHospitalClient;
  clientListId: string;
  idx: number;
  vanishDeletedCards: boolean;
  numberedCards?: boolean;
  highlightFirstNames?: boolean;
}

const ClientCard: React.FC<IClientCard> = ({
  client,
  clientListId,
  idx,
  vanishDeletedCards,
  numberedCards = true,
  highlightFirstNames = false,
}) => {
  const router = useRouter();
  const { theme, setTheme, authenticatedUser } = useContext(DataStore);

  // editing..
  const [isEditMode, setIsEditMode] = useState(false);

  const [message, setMessage] = useState('');
  const [icon, setIcon] = useState(faUserMinus);
  const [iconColor, setIconColor] = useState(`text-zinc-600`);
  const [doingThings, setDoingThings] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedSuccessfully, setSubmittedSuccessfully] = useState(false);

  const [handlerMedicUrl, setHandlerMedicUrl] = useState('');
  const [handlerMedicNames, setHandlerMedicNames] = useState('');
  const [handlerMedicAssignmentCount, setHandlerMedicAssignmentCount] =
    useState(0);

  const [cardVanished, setCardVanished] = useState(false);
  const [transferringClients, setTransferringClients] = useState(false);

  const [receivingMidwifeId, setReceivingMidwifeId] = useState('');

  const transferUserAssignments = async () => {
    //firebase op/////////
    setTransferringClients(true);

    setSubmitted(true);
    setIcon(faHourglass);

    const resBody = await transferOneItemFromUserClientList(
      client.handlerMedicId!,
      clientListId,
      receivingMidwifeId,
      lnoApiKeySysOps!,
      false
    );

    const rawData = await resBody.json();
    console.log(
      `!!fb xy res::${JSON.stringify(rawData)} httpStatus::${resBody.status}`
    );

    let someHttpErrorExists = resBody.status != 200; //‼️OK

    if (someHttpErrorExists) {
      setIcon(faWarning);
      setIconColor(`text-red-600`);

      setMessage(`${rawData['message']}`);
    } else {
      setIcon(faCheck);
      setIconColor(`text-green-600`);
      setSubmittedSuccessfully(true);

      const messageId = rawData['data']._id;

      // setMessage(`${rawData['data']}`); //temp, edit api
      setMessage('');

      console.log(`docRef`, messageId);
    }

    setTransferringClients(false);
    //firebase op/////////

    //aob////--------------------------------------------------------------------
    const receivingMedicDetails: IUserData = await loadOneUser(
      receivingMidwifeId,
      lnoApiKeySysOps!
    );

    if (receivingMedicDetails) {
      setHandlerMedicUrl(`/user/${receivingMedicDetails._id}`);
      setHandlerMedicNames(
        `${receivingMedicDetails.firstName} ${receivingMedicDetails.lastName}`
      );
      setHandlerMedicAssignmentCount(
        receivingMedicDetails.clientAssignments
          ? receivingMedicDetails.clientAssignments?.length
          : 0
      );
    }

    // await wait(5000);
    // setCardVanished(true);
    //aob////--------------------------------------------------------------------
  };

  return cardVanished ? (
    <></>
  ) : (
    <div className="text-xs mt-8">
      {/* client id: {client._id}
     clientListId: {clientListId} */}
      <div key={idx} className="my-card">
        {!submittedSuccessfully && (
          <>
            <div>
              <strong className="resposta mr-2">
                <span className="mr-2 text-blue-600">{idx + 1}.</span>
                <span
                  className={`reading-titles ${
                    highlightFirstNames ? `text-blue-600` : ``
                  } `}
                >
                  {titleCasePlease(client.firstName!)}
                </span>
              </strong>
              <span className={`text-xs text-zinc-400`}>
                {exceptConjuctionsFromTitleCasePlease(client.lastName!)}
                &nbsp;
              </span>

              <div className="text-right mt-4">
                <a
                  title="Client tranfer"
                  className={`${isEditMode ? 'hidden' : ''}`}
                >
                  <FontAwesomeIcon
                    icon={faUserMinus}
                    style={{ fontSize: 10 }}
                    className="my-link"
                    onClick={() => setIsEditMode(!isEditMode)}
                  />
                </a>
              </div>
            </div>
            Email: <span className="font-semibold">{client.clientEmail}</span>
            <br />
            Days left before discharge:{' '}
            <span className="font-semibold">
              {determineDaysLeftBeforeClientDischarge(client)}
            </span>
            <br />
            <br />
          </>
        )}
        {/* input */}
        {isEditMode && (
          <div className="mb-3 flex flex-col justify-center items-center text-center  ">
            <div className="items-center">
              {!submittedSuccessfully ? (
                <></>
              ) : (
                <>
                  <div className="mt-4">&nbsp;</div>
                  <span className="text-yellow-600">Transfer Done</span>
                  {/* <hr className="my-rule mt-4 mb-4 " /> */}

                  {handlerMedicNames && (
                    <span className="font-semibold">
                      <br />
                      <br />
                      Midwife:{' '}
                      <Link
                        className="resposta my-link-dotted cursor-pointer"
                        href={handlerMedicUrl}
                        title={`Midwife ${handlerMedicNames} has been manually assigned to handle existing client ${
                          client.clientEmail
                        } at ${PROJECT_NAME}. Total assignment for ${
                          handlerMedicNames.split(' ')[0]
                        } ${handlerMedicAssignmentCount}`}
                      >
                        {handlerMedicNames.split(' ')[0]}
                      </Link>
                    </span>
                  )}
                </>
              )}
            </div>
            <div className="text-base mt-12 mb-4" hidden={false}>
              <FontAwesomeIcon
                icon={icon}
                style={{ fontSize: 40 }}
                className={iconColor}
              />
            </div>

            <hr className="my-rule mt-4 mb-2" />

            <span>{message}</span>

            {!submittedSuccessfully && (
              <div className="flex flex-col justify-center items-center">
                <input
                  autoFocus={true}
                  type="text"
                  className="duo rounded-md border-2 w-72 sm:w-80 h-10 px-3 mt-2  text-zinc-600"
                  placeholder="receiving midwife id"
                  value={receivingMidwifeId}
                  onChange={(e) => {
                    setReceivingMidwifeId(e.target.value);

                    //reset ui
                    setMessage('');
                    setIconColor(`text-zinc-500`);

                    // setSubmitted(false);
                    setIcon(faUserMinus);
                  }}
                />

                {transferringClients && (
                  <FallingLines color="#2F64EB" width="50" visible={true} />
                )}

                <span>
                  <br />
                  <button
                    className="my-btn py-2 rounded-full w-36 sm:w-36 text-slate-500 bg-zinc-100 hover:bg-zinc-200 border-none focus:ring-slate-400 hover:text-red-600"
                    onClick={(e) => {
                      e.preventDefault();
                      transferUserAssignments();
                    }}
                    disabled={
                      receivingMidwifeId.trim().length == 0 ||
                      transferringClients ||
                      receivingMidwifeId.trim() == client.handlerMedicId!.trim()
                    }
                    title={
                      receivingMidwifeId.trim() == client.handlerMedicId!.trim()
                        ? `You cannot transfer to the same midwife`
                        : ``
                    }
                  >
                    Transfer
                  </button>
                </span>

                <span>
                  <br />
                  <a
                    className="my-link-underline hover:text-green-600"
                    onClick={() => setIsEditMode(!isEditMode)}
                  >
                    cancel
                  </a>
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientCard;
