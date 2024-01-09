import { useRouter } from 'next/router';
import { useContext } from 'react';
import DataStore from '../../../context/app/DataStore';

export interface IDeleteButton
  extends React.ComponentPropsWithoutRef<'button'> {
  deleteText?: string;
  cancelText?: string;
  deleteVerbose?: string;
  isFlat: boolean;
  onClickDelete?: () => void;
  onClickCancel?: () => void;
}

const DeleteButton: React.FC<IDeleteButton> = ({
  className,
  deleteText,
  cancelText,
  deleteVerbose,
  isFlat,
  onClickDelete = () => undefined,
  onClickCancel = () => undefined,
  ...buttonProps
}) => {
  const router = useRouter();
  const { authenticated, authenticatedUser, theme, setTheme } =
    useContext(DataStore);

  if (isFlat) {
    return (
      <>
        {deleteVerbose && (
          <p className="text-xs resposta text-center">{deleteVerbose}</p>
        )}
        <p className="text-xs duo text-center">
          <a
            className="my-link-nav hover:text-red-600 cursor-pointer"
            onClick={onClickDelete}
          >
            {deleteText ?? `Delete`}
          </a>
          {onClickCancel && (
            <>
              {' • '}
              <a
                className="my-link-nav text-slate-400 cursor-pointer"
                onClick={onClickCancel}
              >
                {cancelText ?? `Cancel`}
              </a>
            </>
          )}
        </p>
      </>
    );
  } else {
    return (
      <button
        onClick={onClickDelete}
        className={`${className} ${
          authenticated ? 'my-btn-hot' : 'my-btn'
        }  w-28`}
        {...buttonProps}
      >
        {deleteText ?? `Delete`}
      </button>
    );
  }
};

export default DeleteButton;
