import { Link } from 'react-router-dom';
import { TrashIcon } from '@heroicons/react/24/outline';
import { ConfirmationModal } from './ConfirmationModal';
import { MaterialDefinitionSource } from '@/types/types';

interface MaterialItemProps {
  id: string;
  usage: string;
  type: MaterialDefinitionSource;
  onDeleteClick: () => void;
}

export function MaterialItem({
  id,
  usage,
  onDeleteClick,
  type,
}: MaterialItemProps) {
  return (
    <div className="group">
      <div className="flex items-center flex-row gap-2">
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
        {type === 'project' ? (
          <ConfirmationModal
            confirmButtonText="yes"
            cancelButtonText="no"
            onConfirm={onDeleteClick}
            title={`Are you sure you want to remove ${id} material?`}
            openModalButton={
              <button className="hidden group-hover:block">
                <TrashIcon className="h-5 w-5" />
              </button>
            }
          />
        ) : null}
      </div>
    </div>
  );
}
