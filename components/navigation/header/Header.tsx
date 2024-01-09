import Link from 'next/link';
import React, { useContext } from 'react';
import { logo } from '../../../config';
import DataStore from '../../../context/app/DataStore';
import NavRhs from '../../utility/nav-rhs/NavRhs';

export interface IHeader extends React.ComponentPropsWithoutRef<'header'> {}

const NAV_BOOTOM_ADJUSTMENT = 8;

const Header: React.FC<IHeader> = ({ className, ...headerProps }) => {
  const { theme, setTheme } = useContext(DataStore);

  return (
    <header
      {...headerProps}
      className={`w-full flex flex-row justify-between items-center ${className}`}
    >
      <div className="space-x-5 ml-4 mb-4 flex flex-row items-center">
        <a href="/">
          <img
            src={logo}
            alt="Logo"
            className={`w-16 h-auto mt-2 cursor-pointer`}
          />
        </a>

        <div className={`mb-${NAV_BOOTOM_ADJUSTMENT} space-x-5`}>
          <Link className="my-link-nav-bold hidden sm:inline" href="/">
            Home
          </Link>
          <Link className="my-link-nav-bold hidden sm:inline" href="/about">
            About
          </Link>
        </div>
      </div>

      <div className={`mb-${NAV_BOOTOM_ADJUSTMENT} space-x-5  mr-5`}>
        <NavRhs />
      </div>
    </header>
  );
};

export default Header;
