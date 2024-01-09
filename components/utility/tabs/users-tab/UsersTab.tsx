import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { lnoApiKeySysOps } from '../../../../config';
import DataStore from '../../../../context/app/DataStore';
import { IDataset, IUserData } from '../../../../data/types';
import { loadUsers } from '../../../../lib/get-users';
import {
  determineIfUserIsAdmin,
  determineIfUserOwnsCard,
} from '../../../../services/subscription.service';
import ProfileCard from '../../../cards/profile/ProfileCard';
import Loader from '../../loader/Loader';

export interface IUsersTab {
  userOfInterest?: IUserData;
}

const UsersTab: React.FC<IUsersTab> = ({ userOfInterest }) => {
  const router = useRouter();
  const { theme, setTheme, authenticatedUser } = useContext(DataStore);

  //**State*/

  const [loadingThings, setLoadingThings] = useState(false);
  const defaultUsers: IUserData[] = [];

  const [users, setUsers] = useState(defaultUsers);

  //**~~~~~~~forget getServerSideProps use hooks in extension for next export~~~~~~*/
  useEffect(() => {
    fetchSh_t(true);
  }, []);
  //**~~~~~~~forget getServerSideProps use hooks in extension for next export~~~~~~*/

  const fetchSh_t = async (tabDisplayAuthorized: boolean) => {
    //do it..
    if (tabDisplayAuthorized) {
      setLoadingThings(true);
      ///🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🎻

      fetchUsers();

      ///🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🎻
      setLoadingThings(false);
    }
  };

  const fetchUsers = async () => {
    const dbUsers = await loadUsers(lnoApiKeySysOps!);

    if (dbUsers) {
      setUsers(dbUsers);
    }
  };

  return (
    <div>
      {loadingThings ? (
        <Loader
          loading={loadingThings}
          absoluteItems={'Preparing data..'}
          standbyNotes={''}
        />
      ) : (
        <>
          <div className="my-tab">
            {users.map((user, idx) => (
              <div key={idx} className="my-card">
                <ProfileCard
                  mainSite={true}
                  profile={user}
                  idx={0}
                  vanishDeletedCards={true}
                  highlightCard={true}
                  popableCard={true}
                  largeNotes={true}
                  userCanPutProfile={
                    determineIfUserIsAdmin(authenticatedUser) ||
                    determineIfUserOwnsCard(authenticatedUser, user.email)
                  }
                  userCanDeleteProfile={
                    determineIfUserIsAdmin(authenticatedUser) &&
                    !determineIfUserOwnsCard(authenticatedUser, user.email) //cannot delete own unless action is allowed && goes to a/c deletion ui page
                  }
                />
              </div>
            ))}

            <div className="mb-4">&nbsp;</div>

            <div className="text-xs nunito font-extralight text-slate-400">
              <hr className="my-bar pb-2" />
              <span className="delicate">Total users {users.length}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UsersTab;
