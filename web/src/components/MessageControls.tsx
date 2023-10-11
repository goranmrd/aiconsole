import {
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface MessageControlsProps {
  isEditing?: boolean;
  onSaveClick?: () => void;
  onEditClick?: () => void;
  onRemoveClick?: () => void;
  onCancelClick?: () => void;
}

export function MessageControls({
  isEditing,
  onSaveClick,
  onCancelClick,
  onEditClick,
  onRemoveClick,
}: MessageControlsProps) {
  return (
    <div className="flex gap-4 px-4 self-start">
      {isEditing ? (
        <>
          <button>
            <CheckIcon onClick={onSaveClick} className="h-5 w-5 fill-green" />{' '}
          </button>
          <button>
            <XMarkIcon onClick={onCancelClick} className="h-5 w-5 text-red" />{' '}
          </button>
        </>
      ) : (
        <>
          {onSaveClick && onEditClick && onCancelClick ? (
            <button>
              <PencilIcon onClick={onEditClick} className="h-5 w-5" />{' '}
            </button>
          ): <div className="h-5 w-5"></div>}
        </>
      )}
      {onRemoveClick && (
        <button onClick={onRemoveClick}>
          <TrashIcon className="h-5 w-5" />{' '}
        </button>
      )}
    </div>
  );
}
