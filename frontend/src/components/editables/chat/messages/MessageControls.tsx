// The AIConsole Project
//
// Copyright 2023 10Clouds
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Trash, Pencil, Check, X } from 'lucide-react';
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
    <div className="flex flex-none gap-4 px-4 self-start">
      {isEditing ? (
        <>
          <button>
            <Check onClick={onSaveClick} className="h-5 w-5 text-green" />{' '}
          </button>
          <button>
            <X onClick={onCancelClick} className="h-5 w-5 text-red" />{' '}
          </button>
        </>
      ) : (
        <>
          {onSaveClick && onEditClick && onCancelClick ? (
            <button>
              <Pencil onClick={onEditClick} className="h-5 w-5" />{' '}
            </button>
          ) : (
            <div className="h-5 w-5"></div>
          )}
          {onRemoveClick && (
            <button onClick={onRemoveClick}>
              <Trash className="h-5 w-5" />{' '}
            </button>
          )}
        </>
      )}
    </div>
  );
}
