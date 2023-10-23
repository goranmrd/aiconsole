import { Link } from 'react-router-dom';
import { TrashIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
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
      <div className="flex items-start flex-row gap-2">
        <Link to={`/materials/${id}`} key={id}>
          <div className="flex gap-2 items-baseline">
            <img
              src={`/favicon.svg`}
              className="h-4 w-4 cursor-pointer filter"
            />
            <span className="font-bold">{id}</span>
            {usage && '-'}
            {usage ? <span className="text-sm">{usage}</span> : null}
          </div>
        </Link>
        <div className="flex gap-2 min-w-[60px]">
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
          <Link to={`/materials/${id}_copy`}>
            <button className="hidden group-hover:block">
              <DocumentDuplicateIcon className="h-5 w-5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
