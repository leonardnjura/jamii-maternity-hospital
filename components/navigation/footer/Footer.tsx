import { useRouter } from 'next/router';
import React, { useContext, useEffect } from 'react';

import DataStore from '../../../context/app/DataStore';
import AuthButton from '../../buttons/auth-button/AuthButton';
import CookieConsentButton from '../../eu/cookie-consent-button/CookieConsentButton';
import { PROJECT_NAME } from '../../../config';

export interface IFooter extends React.ComponentPropsWithoutRef<'footer'> {
  hideFooter?: boolean;
}

const Footer: React.FC<IFooter> = ({
  className,
  hideFooter = false,
  ...footerProps
}) => {
  const router = useRouter();

  const { theme, setTheme } = useContext(DataStore);

  useEffect(() => {}, []);

  return hideFooter ? (
    <div className="h-32">&nbsp;</div>
  ) : (
    <footer {...footerProps} className={`w-full p-4 footer-style ${className}`}>
      <div className="flex flex-row justify-between">
        <div>
          {/* <span className="footer-title">{PROJECT_NAME}</span>{' '} */}
          <span className="footer-title">𝕁𝕒𝕞𝕚𝕚 𝕄𝕒𝕥𝕖𝕣𝕟𝕚𝕥𝕪 ℍ𝕠𝕤𝕡𝕚𝕥𝕒𝕝</span>{' '}
          <AuthButton isFlat={true} />
          <p>&nbsp;</p>
        </div>
      </div>

      <CookieConsentButton />
    </footer>
  );
};

export default Footer;
