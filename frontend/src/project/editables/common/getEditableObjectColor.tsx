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

import { EditableObject, EditableObjectType } from '@/project/editables/assets/assetTypes';
import { getEditableObjectType } from '@/project/editables/common/getEditableObjectType';

export function getEditableObjectColor(editableObject?: EditableObject | EditableObjectType) {
  let assetType;

  if (typeof editableObject === 'string') {
    assetType = editableObject;
  } else {
    assetType = getEditableObjectType(editableObject);
  }

  switch (assetType) {
    case 'material':
      return '#CFA740';
    case 'agent':
      return '#62ADF2';
    case 'chat':
      return '#A67CFF';
    default:
      return '#FFFFFF';
  }
}
