import { ReactComponent as PersonIcon } from '../../../icons/person_fill.svg';

export interface UsersProps {
  users: {id: string, user: string}[];
};

export const Users = ({users}: UsersProps) => {
  return(
    <div className="flex justify-end text-xs px-2 py-4 from-transparent to-purple-900/50 bg-gradient-to-t select-none">
      <div className="flex flex-col gap-1">
        {users.map(user => (
          <div
            className="flex gap-1"
            key={user.id}
          >
            <div className="w-4 h-4">
              <PersonIcon />
            </div>
            <div>
              {user.user}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
