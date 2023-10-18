import { Link } from 'react-router-dom';
import { TrashIcon } from '@heroicons/react/24/outline';

interface MaterialItemProps {
  id: string;
  usage: string;
  onDeleteClick: () => void;
}

export function MaterialItem({ id, usage, onDeleteClick }: MaterialItemProps) {
  return (
    <div className="group">
      <div className="flex flex-row gap-2">
        <Link to={`/materials/${id}`} key={id}>
          <div className="flex gap-2 items-center">
            <img
              src={`/favicon.svg`}
              className="h-4 w-4 cursor-pointer filter"
            />
            <span className="font-bold">{id}</span> -{' '}
            <span className="text-sm">{usage}</span>
          </div>
        </Link>
        <button className="hidden group-hover:block" onClick={onDeleteClick}>
          <TrashIcon className="h-5 w-5" />{' '}
        </button>
      </div>
    </div>
  );
}
