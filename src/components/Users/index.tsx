import { ReactComponent as PersonIcon } from '../../icons/person_fill.svg';
import { ReactComponent as PauseIcon } from '../../icons/pause_fill.svg';
import { ReactComponent as PlayIcon } from '../../icons/play_fill.svg';
import { User } from '../../interfaces';

export interface UsersProps {
  users: User[];
  socketId: string;
  lastEvent?: {user: User, event: string};
  onEditUser: () => void;
};

export const Users = ({users, lastEvent, socketId, onEditUser}: UsersProps) => {
  const handleEditUser = (id: string) => {
    if (id === socketId) onEditUser();
  };

  return(
    <div className="flex justify-end text-xs px-2 py-4 from-transparent to-purple-900/50 bg-gradient-to-t select-none">
      <div className="flex flex-col gap-1">
        {users.map(user => (
          <div
            className="flex gap-2"
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
            {user.id === lastEvent?.user.id && lastEvent.event === 'pause' &&
              <div className="w-4 h-4">
                <PauseIcon />
              </div>
            }
            {user.id === lastEvent?.user.id && lastEvent.event === 'play' &&
              <div className="w-4 h-4">
                <PlayIcon />
              </div>
            }
          </div>
        ))}
      </div>
    </div>
  );
};
