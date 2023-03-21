import { useParams } from 'react-router-dom';
import { Video } from '../components/Video';

export interface VideoPageProps {
}

export const VideoPage = () => {
  const { id } = useParams();

  return (
    <div className="p-4">
      <Video id={id || ''} />
    </div>
  );
};
