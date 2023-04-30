import { ChangeEvent, FormEvent, MouseEvent, useState } from 'react';
import { ReactComponent as ArrowRightIcon } from '../../icons/arrow_right_fill.svg';

export interface EditUserProps {
  user: string;
  onChange: (user: string) => void;
  onClose: () => void;
}

export const EditUser = ({onChange, onClose, user}: EditUserProps) => {
  const [userInput, setUserInput] = useState(user);

  const handleUserChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newUser = event.target.value;
    setUserInput(newUser);
  };

  const handleUserSubmit = (event: FormEvent) => {
    event.preventDefault();
    onChange(userInput);
  };

  const handleFocus = (event: ChangeEvent<HTMLInputElement>) => {
    event.target.select();
  };

  const handleOutsideClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onClose();
  };

  return (
    <div
      className="flex items-center justify-center fixed top-0 right-0 bottom-0 left-0 bg-gray-900/75 z-[1] cursor-default"
      onClick={handleOutsideClick}
      onMouseMove={(e) => e.stopPropagation()}
    >
      <form onSubmit={handleUserSubmit}>
        <div
          className="flex items-center gap-2 rounded-lg max-w-xs from-purple-900 to-purple-700 bg-gradient-to-t p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            className="px-2 py-1 outline-none text-neutral-900 bg-neutral-300"
            type="text"
            value={userInput}
            onChange={handleUserChange}
            onFocus={handleFocus}
            placeholder={'name'}
          />
          <div className="w-6 h-6">
            <button
              className="outline-none"
              disabled={!userInput}
            >
              <ArrowRightIcon />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
