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

import { EditableObject, EditableObjectType, EditableObjectTypePlural } from '@/types/types';

export function getEditableObjectType(editableObject?: EditableObject | EditableObjectTypePlural): EditableObjectType | undefined {

  if (typeof editableObject === 'string') {
    switch (editableObject) {
      case 'agents':
        return 'agent';
      case 'materials':
        return 'material';
      case 'chats':
        return 'chat';
      default:
        return undefined;
    }
  }

  if (editableObject) {
    // A bit hacky but effective way to distinguish between agent, materials and chats without introducing a new field

    if ('system' in editableObject) {
      return 'agent';
    }

    if ('content_type' in editableObject) {
      return 'material';
    }

    if ('last_modified' in editableObject) {
      return 'chat';
    }
  }

  return undefined;
}
