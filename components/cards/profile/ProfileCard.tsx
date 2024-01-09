import {
  faExternalLink,
  faTrash,
  faUserPlus,
  faWarning,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Modal } from '@nextui-org/react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import {
  MIDWIFE_ROLE_ID,
  PROJECT_NAME,
  USER_MAX_FILE_UPLOAD_LIMIT,
  lnoApiKeySysOps,
} from '../../../config';
import { dbois } from '../../../config/db';
import DataStore from '../../../context/app/DataStore';
import { IHospitalClient, IUserData } from '../../../data/types';
import {
  deleteUser,
  updateUser,
  updateUserProfilePictureBase64,
} from '../../../lib/get-users';

import Link from 'next/link';
import { FallingLines } from 'react-loader-spinner';
import { loadClients } from '../../../lib/get-clients';
import {
  abbreviateNumber,
  containsStringInStringArr,
  determineDefaultAvatar,
  equalStrings_i,
  exceptConjuctionsFromTitleCasePlease,
  generateRandomAvatarUrl,
  timeAgo,
  titleCasePlease,
} from '../../../utils/preops';
import DeleteButton from '../../buttons/delete-button/DeleteButton';
import Loader from '../../utility/loader/Loader';
import UserType from '../../utility/user-type/UserType';
import ClientCard from '../client/ClientCard';

const CHECK_FILE_SIZE_LIMIT = true;

export interface IProfileCard {
  mainSite: boolean;
  profile: IUserData;
  idx: number;
  vanishDeletedCards: boolean;
  numberedCards?: boolean;
  highlightCard?: boolean;
  popableCard?: boolean;
  highlightFirstNames?: boolean;
  reddedFirstName?: boolean;
  largeNotes?: boolean;
  //CRUDler
  userCanPutProfile?: boolean;
  userCanDeleteProfile?: boolean;
}

const ProfileCard: React.FC<IProfileCard> = ({
  mainSite,
  profile,
  idx,
  vanishDeletedCards,
  numberedCards = false,
  highlightCard = true,
  popableCard = false,
  highlightFirstNames = false,
  reddedFirstName = false,
  largeNotes = false,
  userCanPutProfile,
  userCanDeleteProfile,
}) => {
  const router = useRouter();
  const { theme, setTheme, authenticatedUser, gotoSignIn } =
    useContext(DataStore);

  const { _id, firstName, lastName, avatar } = profile;
  const defaultProfile: IUserData = {} as IUserData;

  const [errorExists, setErrorExists] = useState(false);
  const [cardVanished, setCardVanished] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);

  const [editableFirstName, setEditableFirstName] = useState(profile.firstName);
  const [editableLastName, setEditableLastName] = useState(profile.lastName);
  const [editableAvatar, setEditableAvatar] = useState(
    determineDefaultAvatar(profile)
  );

  const [snappableUser, setSnappableUser] = useState(profile);

  /**SITE MAINTENANCE  🦍🦍🦍🦍🦍🦍🦍🦍🦍🦍------------------------------------------- */
  // editing..
  const [isEditMode, setIsEditMode] = useState(false);

  const [editedFirstName, setEditedFirstName] = useState(profile.firstName);
  const [editedLastName, setEditedLastName] = useState(profile.lastName);
  const [editedAvatar, setEditedAvatar] = useState(
    determineDefaultAvatar(profile)
  );

  const [updatingProfileInDatabase, setUpdatingProfileInDatabase] =
    useState(false);
  const [
    updatingProfilePictureInDatabase,
    setUpdatingProfilePictureInDatabase,
  ] = useState(false);

  // deleting..
  const [visibleModalDelete, setVisibleModalDelete] = useState(false);
  const [profileToBeRemovedFromDatabase, setProfileToBeRemovedFromDatabase] =
    useState(defaultProfile);

  const deletingProfileFromDatabase =
    profileToBeRemovedFromDatabase._id != null &&
    profileToBeRemovedFromDatabase._id == _id;

  const openModalDelete = () => setVisibleModalDelete(true);
  const closeModalDelete = () => {
    setVisibleModalDelete(false);
    setProfileToBeRemovedFromDatabase(defaultProfile); //special
  };

  const confirmRemoveFromDatabase = async (item: IUserData) => {
    setProfileToBeRemovedFromDatabase(item);
    openModalDelete();
  };

  const removeFromDatabase = async () => {
    //firebase chucky/////////

    //if deleting does not really need logging an lno user api key coupled with userid, we could simply use the sys api key, feeling lazy to determine which particular api key can delete, we already determined user can delete, :)
    let apiKey = lnoApiKeySysOps;

    //determine doc id of profile item to be removed
    let docIdToBeChucked = profile._id;
    // console.log(`!!docIdToBeChucked from db::${profile._id}`);

    const resBody = await deleteUser(docIdToBeChucked!, apiKey!, false);
    let rawData = null;
    const contentType = resBody.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      rawData = await resBody.json();
    } else {
      rawData = await resBody.text();
    }
    console.log(
      `!!fb chucky res::${JSON.stringify(rawData)} httpStatus::${
        resBody.status
      }`
    );

    if (resBody.status == 401) {
      router.replace(`/user/${profile._id}`);
    }

    if (resBody.status == 204) {
      setProfileToBeRemovedFromDatabase(defaultProfile);
      setCardVanished(true);
    }
  };

  const editInDatabase = async () => {
    setUpdatingProfileInDatabase(true);

    let apiKey = lnoApiKeySysOps;
    let docIdToBeEdited = profile._id;

    let reqBody: IUserData = {
      email: profile.email,
      firstName: editedFirstName!.trim(),
      lastName: editedLastName!.trim(),
      avatar: editedAvatar!.trim(),
      updatedBy: `${authenticatedUser.email}`,
    };

    const resBody = await updateUser(docIdToBeEdited!, reqBody, apiKey!, false);

    if (imgsSrc.length > 0) {
      saveAvatarBase64(imgsSrc[0]);
    }

    if (resBody.status == 401) {
      router.replace(`/user/${profile._id}`);
    }

    if (resBody.status == 200) {
      setEditableFirstName(editedFirstName);
      setEditableLastName(editedLastName);
      setEditableAvatar(editedAvatar);

      if (loggedInUserOwnsCard) {
        gotoSignIn();
      }

      setIsEditMode(false);
    }

    setUpdatingProfileInDatabase(false);
  };

  const determineIfFormReadyToBeSubmitted = () => {
    let formReadyToBeSubmitted =
      editedFirstName!.trim().length > 0 && editedLastName!.length > 0;

    return formReadyToBeSubmitted;
  };

  /**SITE MAINTENANCE  🦍🦍🦍🦍🦍🦍🦍🦍🦍🦍------------------------------------------- */

  useEffect(() => {
    setEditableFirstName(profile.firstName);
    setEditableLastName(profile.lastName);
    setEditableAvatar(determineDefaultAvatar(profile));

    //streams..
    listenToFb_profile(profile);
  }, [profile]);

  const gotoPage = (pg: string) => {
    router.push(`${pg}`);
  };

  const listenToFb_profile = (user: IUserData) => {
    if (user._id) {
      const fbCollection = `profiles`;
      const fbDocId = `${user._id}`;

      onSnapshot(
        doc(dbois, fbCollection, fbDocId),
        async (doc: { data: () => any }) => {
          // console.log(`!!onsnapshot ${fbCollection}::`, doc.data());
          let snapshotObj: IUserData = doc.data();
          if (snapshotObj) {
            snapshotObj._id = user._id;
            // console.log(`!!snapshotObj profile card uid::${snapshotObj._id}`);
            setEditableFirstName(snapshotObj.firstName);
            setEditableLastName(snapshotObj.lastName);
            setEditableAvatar(determineDefaultAvatar(snapshotObj));

            setSnappableUser(snapshotObj);
          }
        }
      );
    }
  };

  const deafultImgsSrc: any[] = [];
  const deafultClients: IHospitalClient[] = [];

  const [imgsSrc, setImgsSrc] = useState(deafultImgsSrc);
  const [fileSize, setFileSize] = useState('');
  const [fileTooBig, setFileTooBig] = useState(false);
  const [lastFile, setLastFile] = useState('');

  const [clients, setClients] = useState(deafultClients);

  const handleImageSelect = async (e: any) => {
    const file = e.target.files[0];

    if (file) {
      // console.log(`!!file::`,file);
      // console.log(`!!file name::`, file.name);

      const path = (window.URL || window.webkitURL).createObjectURL(file);
      console.log(`!!file path::`, path);

      // console.log(`!!file type::`, file.type);
      console.log(`!!file size::`, file.size);
      setFileSize(abbreviateNumber(`${file.size}`)! + `B`);

      if (
        CHECK_FILE_SIZE_LIMIT &&
        Number(file.size) / 1000 > USER_MAX_FILE_UPLOAD_LIMIT
      ) {
        console.log(`!!file size too big`);
        setFileTooBig(true);
        setImgsSrc(deafultImgsSrc);
      } else {
        console.log(`!!file size is okay`);
        setFileTooBig(false);

        //reader..
        const reader1 = new FileReader();
        const reader2 = new FileReader();

        reader1.readAsDataURL(file);
        reader2.readAsArrayBuffer(file);

        reader1.onload = async () => {
          // console.log(`\n\n!!file data::`, reader.result);

          setImgsSrc((imgs) => [...imgs, reader1.result]);

          var base64DataRaw = reader1.result;

          if (base64DataRaw && typeof base64DataRaw === 'string') {
            setLastFile(base64DataRaw);
          }
        };
        reader1.onerror = () => {
          console.log(`!!Oops on reader1 file::${reader1.error}`);
        };
      }
    }
  };

  const saveAvatarBase64 = async (base64FileData: string) => {
    setUpdatingProfilePictureInDatabase(true);
    ////

    let opResult = await updateUserProfilePictureBase64(
      profile._id!,
      base64FileData,
      lnoApiKeySysOps!
    );

    if (opResult) {
      let downloadUrl = opResult;

      console.log(`!!fb op result url::${downloadUrl}`);
      setEditableAvatar(downloadUrl);
      setEditedAvatar(downloadUrl);
      setImgsSrc(deafultImgsSrc);

      if (loggedInUserOwnsCard) {
        gotoSignIn();
      }
    }

    setUpdatingProfilePictureInDatabase(false);
    ////
  };

  const onClickBrowse = async () => {
    if (userCanChat) {
      document.getElementById('selectedFile')!.click();
    }
  };

  const loadUserAssignments = async () => {
    ////
    setLoadingClients(true);

    const dbClients: IHospitalClient[] = await loadClients(lnoApiKeySysOps!);
    let userClients: IHospitalClient[] = [];

    let userClientRefs = [''];

    if (profile.clientAssignments) {
      for (let i = 0; i < profile.clientAssignments.length; i++) {
        let idee = profile.clientAssignments[i]._id;
        let foreignKey = profile.clientAssignments[i].assignmentRef;
        userClientRefs.push(foreignKey!);
      }
    }

    // console.log(`!!userClientRefs`, userClientRefs);

    if (dbClients) {
      //filter out user clients..

      for (let i = 0; i < dbClients.length; i++) {
        let client = dbClients[i];
        if (containsStringInStringArr(client._id!, userClientRefs)) {
          userClients.push(client);
        }
      }
      setClients(userClients);
    }

    // console.log(`!!dbClients`, dbClients);
    // console.log(`!!userClients`, userClients);

    ////
    setLoadingClients(false);
  };

  const loggedInUserOwnsCard: boolean = equalStrings_i(
    authenticatedUser.email,
    profile.email
  );

  const userCanChat = loggedInUserOwnsCard;

  return cardVanished ? (
    <></>
  ) : (
    <div className="py-4" id={`${idx + 1}`}>
      {/*%%% SITE MAINTENANCE ------------------------------------------- */}
      <Modal
        //closeButton
        blur
        aria-labelledby="modal-firstName"
        open={visibleModalDelete}
        onClose={closeModalDelete}
        className="m-2"
      >
        <Modal.Header>
          <div className="duo text-red-600 text-lg font-bold pt-4 ">
            <FontAwesomeIcon
              icon={faTrash}
              style={{ fontSize: 30 }}
              className=""
            />{' '}
            <br />
          </div>
        </Modal.Header>
        <Modal.Body>
          <DeleteButton
            isFlat={true}
            onClickDelete={async () => {
              closeModalDelete();
              removeFromDatabase();
            }}
            onClickCancel={closeModalDelete}
            deleteText={`Delete`}
            deleteVerbose={`${profileToBeRemovedFromDatabase.firstName!}`}
          />
        </Modal.Body>
      </Modal>
      {/*%%% SITE MAINTENANCE ------------------------------------------- */}
      <div className="flex flex-col justify-center items-center">
        <div className="relative">
          <img
            className="h-20 w-20 -mt-2 object-cover rounded-full"
            referrerPolicy="no-referrer"
            src={`${editedAvatar}`}
            alt=""
          />

          <span
            className={`absolute bottom-0 right-2  w-3.5 h-3.5 ${
              loggedInUserOwnsCard ? 'bg-green-400' : 'bg-zinc-400'
            }  border-2 border-white dark:border-gray-800 rounded-full`}
          ></span>
        </div>
      </div>
      {isEditMode ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            editInDatabase();
          }}
          className="mt-4"
        >
          <div className="mb-3">
            <label htmlFor="">
              {`Firstname `}
              <span
                className={`text-red-600 ${
                  editedFirstName!.trim().length > 0 ? `hidden` : ``
                }`}
              >
                *
              </span>
            </label>
            <br />
            <input
              type="text"
              autoFocus={true}
              className="resposta rounded-md border-2 w-full h-10 px-3 mt-2  text-zinc-600 my-input"
              placeholder={`FirstName`}
              value={editedFirstName}
              onChange={async (e) => {
                let editedRaw = e.target.value;
                setEditedFirstName(editedRaw);
              }}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="">
              {`Lastname `}
              <span
                className={`text-red-600 ${
                  editedLastName!.trim().length > 0 ? `hidden` : ``
                }`}
              >
                *
              </span>
            </label>
            <br />
            <input
              type="text"
              className="resposta rounded-md border-2 w-full h-10 px-3 mt-2  text-zinc-600 my-input"
              placeholder={`LastName`}
              value={editedLastName}
              onChange={async (e) => {
                let editedRaw = e.target.value;
                setEditedLastName(editedRaw);
              }}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="">
              {`Avatar`}
              <span
                className={`text-red-600 ${
                  editedAvatar!.trim().length > 0 ? `hidden` : `hidden`
                }`}
              >
                *
              </span>
            </label>
            <br />
            <input
              type="text"
              className="resposta rounded-md border-2 w-full h-10 px-3 mt-2  text-zinc-600 my-input"
              placeholder={`Avatar`}
              value={editedAvatar}
              onChange={async (e) => {
                let editedRaw = e.target.value;
                setEditedAvatar(editedRaw);
              }}
            />
          </div>

          <div className="flex flex-col justify-center items-center shadow-md p-3 rounded-md">
            <div className="">
              <span
                className={`${
                  !fileTooBig ? `hidden` : ``
                } inline-block bg-red-200 border border-zinc-300 dark:border-zinc-700 rounded-md py-2 px-3 mb-2`}
              >
                <span className="text-red-600 ">Too big {fileSize}</span>
                <span className="text-slate-400 nunito text-lg">{` (`}</span>
                Ensure <span className="top-secret-stamper">{`<`}</span>
                {abbreviateNumber(`${USER_MAX_FILE_UPLOAD_LIMIT * 1000}`) + `B`}
                <span className="text-slate-400 nunito text-lg">{`)`}</span>
                <br />
                <span>
                  <a
                    className="my-link-silent"
                    href={`https://www.iloveimg.com/compress-image`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Try this tool to downsize your image
                  </a>{' '}
                  or just paste in a url!
                </span>
                <br />
              </span>

              <div className="flex flex-col justify-center items-center">
                {imgsSrc.map((link, idx) => (
                  <a key={idx} className="cursor-pointer">
                    {idx == imgsSrc.length - 1 && (
                      <img
                        className="h-16 w-16 object-cover rounded-full"
                        src={link}
                        alt="s"
                      />
                    )}
                  </a>
                ))}

                <div className="py-2 text-center">
                  <>
                    <button
                      className="my-btn py-2 rounded-full w-36 sm:w-36 text-slate-500 bg-zinc-100 hover:bg-zinc-200 border-none focus:ring-slate-400"
                      onClick={(e) => {
                        e.preventDefault();
                        onClickBrowse();
                      }}
                    >
                      Browse...
                    </button>
                  </>
                  {updatingProfilePictureInDatabase ? (
                    <div>
                      <Loader
                        loading={updatingProfilePictureInDatabase}
                        standbyNotes={''}
                        absoluteItems="Saving avatar.."
                      />
                    </div>
                  ) : (
                    <div>
                      {userCanPutProfile && (
                        <span>
                          <a
                            className="my-link-silent"
                            onClick={() => {
                              //append reset time to mash it up a little..
                              let d = new Date();
                              const resetTime = d.toISOString(); //utc,

                              const dicebearAvatar = generateRandomAvatarUrl(
                                profile.email + resetTime
                              );

                              // saveAvatarUrl(dicebearAvatar);

                              setEditedAvatar(dicebearAvatar);
                            }}
                          >
                            Reset avatar
                          </a>
                          ?
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <label className="block">
                <span className="sr-only">Choose profile photo</span>
                <input
                  type="file"
                  id="selectedFile"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </label>
            </div>
          </div>

          {/* //// */}

          {/* //// */}

          <div id="chatBottom" className="text-center">
            <button
              type="submit"
              className="my-btn rounded-full w-48 sm:w-52"
              disabled={!determineIfFormReadyToBeSubmitted()}
            >
              {updatingProfileInDatabase ? `SAVING..` : `SAVE`}
            </button>
          </div>
        </form>
      ) : (
        <>
          {!highlightCard ? (
            <>
              <div>
                <strong className="resposta mr-2">
                  <a
                    className={`mr-2 text-blue-600 ${
                      numberedCards ? `` : `hidden`
                    }`}
                    onClick={() => {
                      if (mainSite) {
                        //navigate to top?
                        router.replace(`/users#top`);
                      }
                    }}
                  >
                    {idx + 1}.
                  </a>
                  <span
                    className={`reading-titles ${
                      highlightFirstNames ? `text-blue-600` : ``
                    } `}
                  >
                    {titleCasePlease(editableFirstName!)}
                  </span>
                </strong>
                <span
                  className={`reading-notes ${largeNotes ? `` : `text-xs`}`}
                >
                  {exceptConjuctionsFromTitleCasePlease(editableLastName!)}
                  &nbsp;
                </span>
              </div>
            </>
          ) : (
            <div className="py-4">
              <div className="">
                <div className="px-6 pt-4">
                  <h5 className="font-bold text-xl mb-2">
                    <a
                      className={`ol-number ${numberedCards ? `` : `hidden`}`}
                      onClick={() => {
                        if (mainSite) {
                          //navigate to top?

                          router.replace(`/users#top`);
                        }
                      }}
                    >
                      {idx + 1}
                    </a>
                    <span
                      className={`reading-notes nunito ${
                        highlightFirstNames ? `text-blue-600` : ``
                      } `}
                    >
                      {titleCasePlease(editableFirstName!)}
                    </span>

                    <span className={`nunito font-extralight`}>
                      &nbsp;
                      {exceptConjuctionsFromTitleCasePlease(editableLastName!)}
                    </span>
                  </h5>
                  {loggedInUserOwnsCard && (
                    <div>
                      Email: <span className="resposta">{profile.email}</span>
                    </div>
                  )}

                  <div className="text-xs">
                    Signed up:{' '}
                    <span className="resposta">
                      {timeAgo(profile.dateCreated!)}
                    </span>
                    <br />
                    <span
                      className={`mt-2 inline-block border border-zinc-300 dark:border-zinc-700 rounded-md p-2`}
                    >
                      <UserType
                        user={snappableUser}
                        hideRole={false}
                        popableCard={popableCard}
                      />
                    </span>
                  </div>

                  {!popableCard && profile.roleId == MIDWIFE_ROLE_ID && (
                    <div className="text-xs mt-8">
                      <span className="text-yellow-600 text-xl">Clients</span>
                      <br />
                      Total assigned:{' '}
                      <span className="resposta">
                        {profile.clientAssignments?.length}
                      </span>
                      <br />
                      <br />
                      {loadingClients && (
                        <FallingLines
                          color="#2F64EB"
                          width="50"
                          visible={true}
                        />
                      )}
                      <span>
                        {clients.length == 0 && (
                          <button
                            className="my-btn py-2 rounded-full w-full sm:w-full text-slate-500 bg-zinc-100 hover:bg-zinc-200 border-none focus:ring-slate-400 hover:text-green-600"
                            onClick={(e) => {
                              e.preventDefault();
                              loadUserAssignments();
                            }}
                          >
                            Load clients
                          </button>
                        )}
                      </span>
                      {clients?.map((client, idx) => (
                        <div key={idx}>
                          <ClientCard
                            client={client}
                            clientListId={
                              profile.clientAssignments?.filter(
                                (ass, idx) => ass.assignmentRef == client._id
                              )[0]._id ?? ''
                            }
                            idx={idx}
                            vanishDeletedCards={false}
                          />
                        </div>
                      ))}
                      <div className="text-center mt-4">
                        <Link
                          title="Client registration and midwife auto assignemnt"
                          href={`/register-client`}
                        >
                          <FontAwesomeIcon
                            icon={faUserPlus}
                            style={{ fontSize: 20 }}
                            className="my-link-chevron"
                          />
                        </Link>
                      </div>
                    </div>
                  )}

                  <div className="">{profile.notes}</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <hr className="my-rule mt-4 mb-4 " />
      <div className="text-right">
        {profile._id && (
          <>
            {/* {!loggedInUserOwnsCard && (
              <span className="uppercase">❗Not your Card </span>
            )} */}
            {userCanPutProfile && (
              <span>
                <a
                  className="my-link-underline hover:text-green-600"
                  onClick={() => setIsEditMode(!isEditMode)}
                >
                  {isEditMode ? `cancel ` : ``}
                  {!loggedInUserOwnsCard ? `moderate` : `edit`}
                </a>
              </span>
            )}
            {userCanDeleteProfile && (
              <span>
                {' • '}
                <a
                  className="my-link-underline hover:text-red-600"
                  onClick={() => confirmRemoveFromDatabase(profile)}
                >
                  {deletingProfileFromDatabase ? `deleting..` : `delete`}
                </a>
                {/* {' • '} */}
              </span>
            )}

            {popableCard && (
              <span className="">
                &nbsp;
                <a
                  className="my-link uppercase"
                  href={`/users/${profile._id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FontAwesomeIcon
                    icon={faExternalLink}
                    style={{ fontSize: 10 }}
                    className="pop-out"
                  />{' '}
                </a>
              </span>
            )}
          </>
        )}
      </div>

      {loggedInUserOwnsCard && (
        <div className="text-center mt-24">
          {/* {' ••• '} */}

          <div>
            <FontAwesomeIcon
              icon={faWarning}
              style={{ fontSize: 25 }}
              className="text-red-600"
            />{' '}
          </div>

          <button
            className="my-btn py-2 rounded-full w-72 sm:w-80 text-slate-500 bg-zinc-100 hover:bg-zinc-200 border-none focus:ring-slate-400  hover:text-red-600"
            onClick={(e) => {
              e.preventDefault();
              gotoPage(
                `/user/account-deletion?email=${authenticatedUser.email}&passHash=${authenticatedUser.password}&appName=${PROJECT_NAME}`
              );
            }}
          >
            <span className="hover:text-red-600"></span>
            Delete my account...
          </button>

          {/* <p>{authenticatedUser.password}</p> */}
          {/* {' ••• '} */}
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
