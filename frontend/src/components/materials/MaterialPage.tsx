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

import { Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { Api } from '@/api/Api';
import { CodeInput } from '@/components/materials/CodeInput';
import { ErrorObject, SimpleInput } from '@/components/materials/TextInput';
import { useAICStore } from '@/store/AICStore';
import {
  Material,
  MaterialContentType,
  RenderedMaterial
} from '@/types/types';
import showNotification from '@/utils/showNotification';
import { cn } from '@/utils/styles';
import { Tooltip } from '../system/Tooltip';
import { getAssetIcon } from '@/utils/getAssetIcon';
import { getAssetColor } from '@/utils/getAssetColor';
import { useAssetContextMenu } from '@/hooks/useAssetContextMenu';


export function getContentName(contentType?: MaterialContentType) {
  switch (contentType) {
    case 'static_text':
      return 'Note';
    case 'dynamic_text':
      return 'Dynamic Note';
    case 'api':
      return 'Python API';
    default:
        return 'Material';
  }
}

export function MaterialPage() {
  const navigate = useNavigate();

  const location = useLocation();

  let { materialId } = useParams<{ materialId: string | undefined }>();

  const isNew = materialId === 'new';

  

  if (isNew) {
    materialId = undefined;
  }

  const copyId = new URLSearchParams(location.search).get('copy');

  const [material, setMaterial] = useState<Material | undefined>(undefined);
  const [materialInitial, setMaterialInitial] = useState<Material | undefined>(undefined);
  const [preview, setPreview] = useState<RenderedMaterial | undefined>(undefined);
  const [errors, setErrors] = useState<ErrorObject>({});

  const isError = Object.values(errors).some((error) => error !== null);
  const deleteAsset = useAICStore((state) => state.deleteAsset);
  const readOnly = material?.defined_in === 'aiconsole';
  const previewValue = preview ? preview?.content.split('\\n').join('\n') : 'Generating preview...';

  if (isNew && material) {
    material.content_type = new URLSearchParams(location.search).get('type') as MaterialContentType | null || 'static_text';
  }

  const isMaterialStatusChanged = () => {
    if (!material || !materialInitial) {
      return true;
    }
    return material.status !== materialInitial.status;
  };

  const isMaterialChanged = () => {
    if (!material || !materialInitial) {
      return true;
    }

    const changedFields = Object.keys(material).filter((key) => {
      return key !== 'status' && material[key as keyof Material] !== materialInitial[key as keyof Material];
    });

    return changedFields.length > 0;
  };

  const enableSubmit = (isMaterialChanged() || isMaterialStatusChanged()) && !isError;
  const disableSubmit = !enableSubmit;

  //After 3 seconds of inactivity after change query /preview to get rendered material
  useEffect(() => {
    setPreview(undefined);
    if (!material) {
      return;
    }

    const timeout = setTimeout(() => {
      Api.previewMaterial(material).then((preview) => {
        setPreview(preview);
      });
    }, 3000);

    return () => {
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    material?.content_api,
    material?.content_dynamic_text,
    material?.content_static_text,
    material?.content_type,
    material?.name,
  ]);

  function nameToId(name: string) {
    //to lower
    name = name.toLowerCase() || '';

    //replace white space with underscore
    name = name.replace(/\s/g, '_');

    //remove special characters
    name = name.replace(/[^a-zA-Z0-9_]/g, '');

    //remove duplicate underscores
    name = name.replace(/_+/g, '_');

    //remove leading and trailing underscores
    name = name.replace(/^_+|_+$/g, '');

    return name;
  }

  useEffect(() => {
    // Auto generate id based on name
    if (material?.name) {
      setMaterial((material: Material | undefined) => {
        if (!material) return material;
        const id = nameToId(material.name);
        return { ...material, id };
      });
    }
  }, [material?.name]);

  useEffect(() => {
    if (copyId) {
      Api.getAsset<Material>('material', copyId).then((materialToCopy) => {
        materialToCopy.name += ' Copy';
        materialToCopy.defined_in = 'project';
        materialToCopy.id = nameToId(materialToCopy.name);
        setMaterialInitial(undefined);
        setMaterial(materialToCopy);
      });
    } else if (materialId) {
      Api.getAsset<Material>('material', materialId).then((material) => {
        setMaterialInitial(material);
        setMaterial(material);
      });
    } else {
      //HACK: This will get a default new material
      Api.getAsset<Material>('material', 'new').then((material) => {
        setMaterialInitial(undefined);
        setMaterial(material);
      });
    }
  }, [copyId, isNew, materialId]);

  const updateStatusIfNecessary = async (material: Material) => {
    if (isMaterialStatusChanged()) {
      await Api.setAssetStatus('material', material.id, material.status);

      showNotification({
        title: 'Status changed',
        message: `Material status changed to ${material.status}`,
        variant: 'success',
      });
    }
  };

  const handleSaveClick = (material: Material) => async () => {
    if (isNew) {
      await Api.saveNewAsset('material', material);
      await updateStatusIfNecessary(material);

      showNotification({
        title: 'Saved',
        message: 'Material saved',
        variant: 'success',
      });
    } else if (materialInitial && materialInitial.id !== material.id) {
      await Api.saveNewAsset('material', material);
      await deleteAsset('material', materialInitial.id);
      await updateStatusIfNecessary(material);

      showNotification({
        title: 'Renamed',
        message: 'Material renamed',
        variant: 'success',
      });
    } else {
      if (isMaterialChanged()) {
        await Api.updateAsset('material', material);

        showNotification({
          title: 'Saved',
          message: 'Material saved',
          variant: 'success',
        });
      }

      await updateStatusIfNecessary(material);
    }

    if (materialId !== material.id) {
      navigate(`/materials/${material.id}`);
    }

    setMaterialInitial(material);
  };

  const Icon = getAssetIcon(material || 'material');

  const {showContextMenu} = useAssetContextMenu({ assetType: 'material', asset: material, fromAssetDetail: true });

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto p-6 gap-4">
      <div className="flex gap-5" onContextMenu={showContextMenu()}>
        <Tooltip
          label={`${getContentName(material?.content_type)} id determines the file name and is auto generated from name. It must be unique.`}
          position="top-end"
          offset={{ mainAxis: 7 }}
        >
          <div className="flex flex-row items-center gap-2 font-bold">
            <Icon style={{color: getAssetColor(material || 'material')}} /> {material?.id}
          </div>
        </Tooltip>

        {readOnly && (
          <div className="flex gap-2 items-center text-md font-bold ml-auto ">
            <Eye className="w-4 h-4" />
            This is a system material. It can't be edited.
          </div>
        )}
      </div>
      {material && (
        <>
          <SimpleInput
            label={`${getContentName(material?.content_type)} name`}
            placeholder=""
            value={material.name}
            disabled={readOnly}
            required
            name="material_name"
            errors={errors}
            setErrors={setErrors}
            onChange={(value) => setMaterial({ ...material, name: value })}
            withTooltip
            tootltipText={`${getContentName(material?.content_type)} name is used to identify material in the system. Make it self explanatory so AI will better understand what it is.`}
          />
          <SimpleInput
            label="Usage"
            name="usage"
            value={material.usage}
            disabled={readOnly}
            onChange={(value) => setMaterial({ ...material, usage: value })}
            withTooltip
            tootltipText={`Usage is used to help identify when this ${getContentName(material?.content_type)} should be used. `}
          />
          <div className="flex flex-row w-full gap-4 ">
            <div className="w-1/2 h-[calc(100vh-425px)] min-h-[300px]">
              {material.content_type === 'static_text' && (
                <CodeInput
                  label="Text"
                  value={material.content_static_text}
                  onChange={(value) => setMaterial({ ...material, content_static_text: value })}
                  className="flex-grow"
                  disabled={readOnly}
                  codeLanguage="markdown"
                />
              )}

              {material.content_type === 'dynamic_text' && (
                <CodeInput
                  label="Python function returning dynamic text"
                  value={material.content_dynamic_text}
                  onChange={(value) => setMaterial({ ...material, content_dynamic_text: value })}
                  className="flex-grow"
                  disabled={readOnly}
                  codeLanguage="python"
                />
              )}
              {material.content_type === 'api' && (
                <CodeInput
                  label="API Module"
                  value={material.content_api}
                  onChange={(value) => setMaterial({ ...material, content_api: value })}
                  disabled={readOnly}
                  className="flex-grow"
                />
              )}
            </div>
            <div className="w-1/2 h-[calc(100vh-425px)] min-h-[300px]">
              <CodeInput
                label="Preview of markdown text to be injected into AI context"
                value={preview?.error ? preview.error : previewValue}
                disabled={readOnly}
                readOnly={true}
                className="flex-grow"
                codeLanguage="markdown"
              />
            </div>
          </div>
          <button
            disabled={disableSubmit}
            className={cn(
              'bg-primary hover:bg-gray-700/95 text-black hover:bg-primary-light px-4 py-1 rounded-full flow-right text-[16px] ',
              {
                'opacity-[0.3] cursor-not-allowed hover:bg-initial': disableSubmit,
              },
            )}
            onClick={handleSaveClick(material)}
          >
            Save
          </button>
        </>
      )}
    </div>
  );
}
