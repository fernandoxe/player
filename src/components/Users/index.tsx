import { ReactComponent as PersonIcon } from '../../icons/person_fill.svg';
import { User } from '../../interfaces';

export interface UsersProps {
  users: User[];
  socketId: string;
  onEditUser: () => void;
};

export const Users = ({users, socketId, onEditUser}: UsersProps) => {
  const handleEditUser = (id: string) => {
    if (id === socketId) onEditUser();
  };

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
            <div
              className={`${user.id === socketId ? 'font-bold cursor-pointer' : ''}`}
              onClick={() => handleEditUser(user.id)}
            >
              {user.user}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
