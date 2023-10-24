import { MouseEvent } from 'react';
import { MaterialInfo } from '@/types/types';
import { Link, useNavigate } from 'react-router-dom';

import {
  PencilSquareIcon,
  TrashIcon,
  LockClosedIcon,
  DocumentDuplicateIcon,
  EyeIcon,
} from '@heroicons/react/24/solid';
import { useAICStore } from '@/store/AICStore';
import { ConfirmationModal } from './ConfirmationModal';

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

  const handleDeleteClick = (id: string) => () => deleteMaterial(id);

  return (
    <div className="card ">
      <table className="w-full table-auto text-left ">
        <thead className="font-bold border-b border-white/20">
          <tr>
            <td className="p-4">Name</td>
            <td className="p-4">Usage</td>
            <td className="p-4 text-center">Actions</td>
          </tr>
        </thead>
        <tbody>
          {materials.map((material) => (
            <tr
              className="border-b border-white/10 hover:bg-white/5 cursor-pointer"
              onClick={redirectToMaterialPage(material.id)}
            >
              <td className="p-4">
                <div className="flex items-center">
                  <Link to={`/materials/${material.id}`} key={material.id}>
                    {material.id}
                  </Link>
                  {material.defined_in === 'aiconsole' && (
                    <LockClosedIcon className="w-4 h-5 inline ml-2" />
                  )}
                </div>
              </td>
              <td className="p-4">{material.usage}</td>
              <td className="p-4 text-center flex items-center justify-end gap-1">
                <div onClick={redirectToMaterialPage(material.id)}>
                  {material.defined_in === 'project' ? (
                    <PencilSquareIcon className="w-5 h-5 inline-block" />
                  ) : (
                    <EyeIcon className="w-5 h-5 inline-block" />
                  )}
                </div>
                <div onClick={redirectToMaterialPage(`${material.id}_copy`)}>
                  <DocumentDuplicateIcon className="h-5 w-5 inline-block" />
                </div>
                {material.defined_in === 'project' && (
                  <ConfirmationModal
                    confirmButtonText="Yes"
                    cancelButtonText="No"
                    onConfirm={handleDeleteClick(material.id)}
                    title={`Are you sure you want to remove ${material.id} material?`}
                    openModalButton={
                      <TrashIcon className="w-5 h-5 inline-block " />
                    }
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
