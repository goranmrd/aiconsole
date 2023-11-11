import SideBarItem from '../system/sidebar/SideBarItem';
import { SidebarTabHeader } from '../system/sidebar/SidebarTabHeader';
import { useAICStore } from '@/store/AICStore';
import { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';

// TODO: add active state when tabs ready
export const MaterialsSidebarTab = () => {
  const navigate = useNavigate();
  const materials = useAICStore((state) => state.materials);
  const deleteMaterial = useAICStore((state) => state.deleteMaterial);

  const redirectToMaterialPage = (id: string) => (event: MouseEvent) => {
    event.stopPropagation();
    navigate(`/materials/${id}`);
  };

  const handleDeleteClick = (id: string) => (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    deleteMaterial(id);
  };

  return (
    <div>
      <SidebarTabHeader title="Material" linkTo='/materials/new' />

      <div className="overflow-y-auto flex flex-col gap-[5px] max-h-[calc(100vh-270px)] pr-[15px]">
        <h3 className="uppercase px-[9px] py-[5px] text-gray-400 text-[12px] leading-[18px]">Custom</h3>
        {materials?.map(
          (material) =>
            material.defined_in === 'project' && (
              <SideBarItem
                id={material.id}
                type="materials"
                label={material.name}
                key={material.id}
                status={material.status}
                linkTo={`/materials/${material.id}`}
                onDelete={handleDeleteClick(material.id)}
                onDuplicate={redirectToMaterialPage(`new?copy=${material.id}`)}
              />
            ),
        )}
        <h3 className="uppercase px-[9px] py-[5px] text-gray-400 text-[12px] leading-[18px]">System</h3>
        {materials?.map(
          (material) =>
            material.defined_in === 'aiconsole' && (
              <SideBarItem
                id={material.id}
                key={material.id}
                type="materials"
                label={material.name}
                status={material.status}
                linkTo={`/materials/${material.id}`}
                onDuplicate={redirectToMaterialPage(`new?copy=${material.id}`)}
              />
            ),
        )}
      </div>
    </div>
  );
};
