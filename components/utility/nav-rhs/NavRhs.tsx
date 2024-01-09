import React, { useContext, useEffect } from 'react';
import DataStore from '../../../context/app/DataStore';
import SignedInUser from '../signed-in-user/SignedInUser';

import Search from '../search/Search';
import MoreSh_t from '../more-sh_t/MoreSh_t';

export interface INavRhs {}

const NavRhs: React.FC<INavRhs> = () => {
  const { theme, setTheme } = useContext(DataStore);

  useEffect(() => {}, []);

  return (
    <>
      <span className={`flex flex-row space-x-5 justify-center`}>
        <Search />
        <SignedInUser />
        <MoreSh_t />
      </span>
    </>
  );
};

export default NavRhs;
