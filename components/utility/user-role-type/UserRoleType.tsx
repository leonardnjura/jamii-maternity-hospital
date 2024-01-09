import { useRouter } from 'next/router';
import React, { useContext, useEffect } from 'react';
import DataStore from '../../../context/app/DataStore';
import { IUserData } from '../../../data/types';

export interface IUserRoleType {
  user: IUserData;
}

const UserRoleType: React.FC<IUserRoleType> = ({ user }) => {
  const router = useRouter();

  const { theme, setTheme } = useContext(DataStore);

  useEffect(() => {}, []);

  return user._id ? (
    <>
      {user.roleId == '0' ? (
        <span className="">admin</span>
      ) : (
        <span className="">user</span>
      )}
    </>
  ) : (
    <></>
  );
};

export default UserRoleType;
