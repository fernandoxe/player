import { ReactComponent as PersonIcon } from '../../icons/person_fill.svg';
import { ReactComponent as PauseIcon } from '../../icons/pause_fill.svg';
import { ReactComponent as PlayIcon } from '../../icons/play_fill.svg';
import { ReactComponent as LineEndCircleIcon } from '../../icons/line_end_circle_fill.svg';
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
    <div className="flex flex-col gap-1 text-xs">
      {users.map(user => (
        <div
          className="flex gap-1"
          key={user.id}
        >
          <div className="w-4 h-4">
            {user.id === lastEvent?.user.id && lastEvent.event === 'pause' &&
              <PauseIcon />
            }
            {user.id === lastEvent?.user.id && lastEvent.event === 'play' &&
              <PlayIcon />
            }
            {user.id === lastEvent?.user.id && lastEvent.event === 'change-time' &&
              <LineEndCircleIcon />
            }
          </div>
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
  );
};
