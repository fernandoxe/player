import { ChangeEvent, FormEvent, useState } from 'react';
import { ReactComponent as ArrowRightIcon } from '../../icons/arrow_right_fill.svg';

export interface EditUserProps {
  onChange: (user: string) => void;
}

export const EditUser = ({onChange}: EditUserProps) => {
  const [user, setUser] = useState('');

  const handleUserChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newUser = event.target.value;
    setUser(newUser);
  };

  const handleUserAccept = (event: FormEvent) => {
    event.preventDefault();
    console.log('send', user);
    onChange(user);
  };

  return (
    <div className="flex items-center justify-center fixed top-0 right-0 bottom-0 left-0 bg-slate-900 bg-opacity-70 z-[1]">
      <form onSubmit={handleUserAccept}>
        <div className="flex items-center gap-2 rounded-lg max-w-xs bg-slate-500 p-4">
          <input
            className="px-2 py-1 outline-none text-gray-900"
            type="text"
            value={user}
            onChange={handleUserChange}
            placeholder={'name'}
          />
          <div className="w-6 h-6">
            <button
              className="outline-none"
              disabled={!user}
            >
              <ArrowRightIcon />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
