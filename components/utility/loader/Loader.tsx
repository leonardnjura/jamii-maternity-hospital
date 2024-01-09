const cookieCutter = require('cookie-cutter');
const parse = require('html-react-parser');

import React from 'react';

export interface ILoader {
  loading: boolean;
  silentLoading?: boolean;
  items?: string;
  standbyNotes: string;
  loadingBig?: boolean;
  absoluteItems?: string;
}

const Loader: React.FC<ILoader> = ({
  loading,
  silentLoading = false, //hide loading text regardless of loading boolean
  items = '',
  standbyNotes,
  loadingBig,
  absoluteItems, //don't prepend "Loading" if set
}) => {
  return silentLoading ? (
    <></>
  ) : loading ? (
    <span
      className={
        loadingBig
          ? `my-loading`
          : `nil ${loading ? `text-yellow-600 dark:text-yellow-700` : ``}`
      }
    >
      {parse(
        loading
          ? absoluteItems
            ? `${absoluteItems}`
            : `Loading${items == '' ? `` : ` ${items}`}..`
          : standbyNotes
      )}
    </span>
  ) : (
    <></>
  );
};

export default Loader;
