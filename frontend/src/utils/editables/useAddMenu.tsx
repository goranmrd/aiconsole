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

import { useContextMenu } from '@/utils/common/useContextMenu';
import { MATERIAL_CONTENT_TYPE_ICONS, getEditableObjectIcon } from '@/utils/editables/getEditableObjectIcon';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

export function useAddMenu() {
  const { showContextMenu, hideContextMenu, isContextMenuVisible } = useContextMenu();
  const navigate = useNavigate();
  const ChatIcon = getEditableObjectIcon('chat');
  const MaterialNoteIcon = MATERIAL_CONTENT_TYPE_ICONS['static_text'];
  const MaterialDynamicNoteIcon = MATERIAL_CONTENT_TYPE_ICONS['dynamic_text'];
  const MaterialPythonAPIIcon = MATERIAL_CONTENT_TYPE_ICONS['api'];
  const AgentIcon = getEditableObjectIcon('agent');

  const handleClick = (path: string) => () => {
    navigate(path);
  };

  function showContextMenuReplacement() {
    return showContextMenu([
      {
        key: 'chat',
        icon: <ChatIcon className="w-6 h-6 text-chat" />,
        title: 'New Chat ...',
        onClick: handleClick(`/chats/${uuidv4()}`),
      },
      {
        key: 'note',
        icon: <MaterialNoteIcon className="w-6 h-6 text-material" />,
        title: 'New Note ...',
        onClick: handleClick(`/materials/new?type=static_text`),
      },
      {
        key: 'dynamic_note',
        icon: <MaterialDynamicNoteIcon className="w-6 h-6 text-material" />,
        title: 'New Dynamic Note ...',
        onClick: handleClick(`/materials/new?type=dynamic_text`),
      },
      {
        key: 'python_api',
        icon: <MaterialPythonAPIIcon className="w-6 h-6 text-material" />,
        title: 'New Python API ...',
        onClick: handleClick(`/materials/new?type=api`),
      },
      {
        key: 'agent',
        icon: <AgentIcon className="w-6 h-6 text-agent" />,
        title: 'New Agent ...',
        onClick: handleClick(`/agents/new`),
      },
      /*static_text: 'Markdown formated text will be injected into AI context.',
      dynamic_text: 'A python function will generate markdown text to be injected into AI context.',
      api: 'Documentation will be extracted from code and injected into AI context as markdown text, code will be available to execute by AI without import statements.',
    */
    ]);
  }

  return { showContextMenu: showContextMenuReplacement, hideContextMenu, isContextMenuVisible };
}
