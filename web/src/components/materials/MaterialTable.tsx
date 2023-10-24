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

import { MouseEvent } from 'react';
import { MaterialInfo } from '@/types/types';
import { useNavigate } from 'react-router-dom';

import {
  BoltIcon,
  TrashIcon,
  LockClosedIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/solid';
import { useAICStore } from '@/store/AICStore';
import { ConfirmationModal } from '../system/ConfirmationModal';
import { NoSymbolIcon, CheckIcon } from '@heroicons/react/24/outline';
import { cn } from '@/utils/styles';

interface MaterialTableProps {
  materials: MaterialInfo[];
}

export function MaterialTable({ materials }: MaterialTableProps) {
  const navigate = useNavigate();
  const deleteMaterial = useAICStore((state) => state.deleteMaterial);

  const redirectToMaterialPage = (id: string) => (event: MouseEvent) => {
    event.stopPropagation();
    navigate(`/materials/${id}`);
  };

  const handleDeleteClick = (id: string, event: MouseEvent) => {
    console.log('delete');
    event.stopPropagation();
    event.preventDefault();
    deleteMaterial(id);
  }

  return (
    <table className="w-full table-auto text-left">
      <thead className="font-bold border-b border-white/20">
        <tr>
          <td className="p-4">Status</td>
          <td className="p-4">Name</td>
          <td className="p-4">Usage</td>
          <td className="p-4 text-center">Actions</td>
        </tr>
      </thead>
      <tbody>
        {materials.map((material) => (
          <tr
            key={material.id}
            className={cn(
              'border-b border-white/10 hover:bg-white/5',
              material.status === 'disabled' && 'opacity-40',
            )}
          >
            <td className="p-4 cursor-pointer" onClick={redirectToMaterialPage(material.id)}>
              <div className=" flex flex-row items-center justify-center w-full h-full">
                {material.status === 'forced' && (
                  <BoltIcon className="h-6 w-6 text-primary" title="forced" />
                )}
                {material.status === 'enabled' && (
                  <CheckIcon className="h-6 w-6" title="enabled" />
                )}
                {material.status === 'disabled' && (
                  <NoSymbolIcon className="h-6 w-6" title="disabled" />
                )}
              </div>
            </td>
            <td className="p-4 cursor-pointer" onClick={redirectToMaterialPage(material.id)}>
              <div className="flex items-center">
                  {material.name}
                {material.defined_in === 'aiconsole' && (
                  <LockClosedIcon className="w-4 h-5 inline ml-2" />
                )}
              </div>
            </td>
            <td className="p-4 cursor-pointer" onClick={redirectToMaterialPage(material.id)}>{material.usage}</td>
            <td className="p-4">
              <div className=" flex flex-row items-center justify-center w-full h-full gap-2">
                <DocumentDuplicateIcon
                  onClick={redirectToMaterialPage(`${material.id}_copy`)}
                  className="h-5 w-5 cursor-pointer"
                />

                {material.defined_in === 'project' && (
                  <ConfirmationModal
                    confirmButtonText="Yes"
                    cancelButtonText="No"
                    onConfirm={event => handleDeleteClick(material.id, event)}
                    title={`Are you sure you want to remove ${material.id} material?`}
                    openModalButton={
                      <TrashIcon className="w-5 h-5 cursor-pointer" />
                    }
                  />
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
