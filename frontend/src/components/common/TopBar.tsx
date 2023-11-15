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

import { cn } from '@/utils/common/cn';
import { useUserContextMenu } from '../../utils/common/useUserContextMenu';
import { getBaseURL } from '../../store/useAPIStore';

interface TopBarProps {
  variant?: 'recentProjects' | 'chat';
}

export function TopBar({ children }: React.PropsWithChildren<TopBarProps>) {
  const { showContextMenu: showUserMenu } = useUserContextMenu();

  return (
    <div className="flex w-full px-[30px] py-[7px] border-b bg-transparent shadow-md border-gray-600 relative z-40 h-[101px]">
      <div className="flex gap-2 w-full items-center">
        {children}
        <img
          src={`${getBaseURL()}/profile/user.jpg` || ''}
          className="h-11 w-11 ml-auto rounded-full border cursor-pointer shadow-md border-primary"
          onClick={showUserMenu()}
          onContextMenu={showUserMenu()}
        />
      </div>
    </div>
  );
}
