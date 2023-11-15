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

import { useProjectContextMenu } from '@/utils/projects/useProjectContextMenu';
import { useProjectStore } from '@/store/projects/useProjectStore';
import { PlusIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/common/Button';
import { useAddMenu } from '@/utils/editables/useAddMenu';
import { useDiscardAssetChangesStore } from '@/store/editables/asset/useDiscardAssetChangesStore';
import { ProjectsAPI } from '@/api/api/ProjectsAPI';

export function ProjectTopBarElements() {
  const projectName = useProjectStore((state) => state.projectName);

  const { showContextMenu: showProjectContextMenu } = useProjectContextMenu();
  const { showContextMenu: showPlusMenu } = useAddMenu();

  const { isChanged, setConfirmCallback } = useDiscardAssetChangesStore();

  const handleBackToProjects = () => {
    if (isChanged) {
      setConfirmCallback(() => ProjectsAPI.closeProject());
    } else {
      ProjectsAPI.closeProject();
    }
  };

  return (
    <>
      <div className="flex text-sm gap-2 items-center pr-5">
        <div className="flex items-center justify-center gap-[70px]">
          <button className="w-12 h-12" onClick={handleBackToProjects}>
            <img src="logo.png" className="h-[48px] mt-[2px] w-[48px] min-w-[48px]" alt="Logo" />
          </button>
          <Link
            to={`/chats/${uuidv4()}`}
            className="h-11 text-grey-300 font-bold  text-lg text-gray-300 hover:animate-pulse cursor-pointer flex gap-2 items-center"
            onContextMenu={showProjectContextMenu()}
          >
            {projectName}
          </Link>
        </div>

        <Button small classNames="ml-10" variant="secondary" onClick={showPlusMenu()} onContextMenu={showPlusMenu()}>
          <PlusIcon />
          New
        </Button>
      </div>
    </>
  );
}
