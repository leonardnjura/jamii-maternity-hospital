import { IAuthButton } from './AuthButton';

const base: IAuthButton = {
  isFlat: false,
  signedInDisplayText: '',
  signedInToSeeText: '',
  mainSite: true,
};

export const mockAuthButtonProps = {
  base,
};
