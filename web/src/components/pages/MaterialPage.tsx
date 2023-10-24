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
    
import { notifications } from '@mantine/notifications';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { Api } from '@/api/Api';
import {
  Material,
  MaterialContentType,
  MaterialStatus,
  RenderedMaterial,
  materialContenTypeOptions,
  materialStatusOptions,
} from '@/types/types';
import { TopBar } from '@/components/TopBar';
import { EnumInput } from '@/components/inputs/EnumInput';
import { SimpleInput } from '@/components/inputs/TextInput';
import { CodeInput } from '@/components/inputs/CodeInput';
import { useAICStore } from '@/store/AICStore';
import { EyeIcon } from '@heroicons/react/24/outline';
import { cn } from '@/utils/styles';
import MarkdownPreview from '../MarkdownPreview';

const removeCopySuffix = (materialId: string) => {
  return materialId.replace(/_copy$/, ''); // Removes "_copy" from the end of the string
};

export function MaterialPage() {
  const { material_id } = useParams<{ material_id: string | undefined }>();
  const materialIdCopy = material_id;
  const [material, setMaterial] = useState<Material | undefined>(undefined);
  const [materialInitial, setMaterialInitial] = useState<Material | undefined>(
    undefined,
  );
  const isDuplicate = material_id?.includes('_copy');
  const materialId =
    isDuplicate && material_id ? removeCopySuffix(material_id) : material_id;
  const [preview, setPreview] = useState<RenderedMaterial | undefined>(
    undefined,
  );

  const isMaterialChanged = () => {
    if (material && materialInitial) {
      const changedFields = Object.entries(material).filter(([key, value]) => {
        return value !== materialInitial[key as keyof Material];
      });

      return Boolean(!changedFields.length);
    }
  };

  const deleteMaterial = useAICStore((state) => state.deleteMaterial);

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
  }, [material]);

  useEffect(() => {
    // Auto generate id based on name
    if (material?.name) {
      setMaterial((material: Material | undefined) => {
        if (!material) return material;

        //to lower
        let name = material?.name.toLowerCase() || '';

        //replace white space with underscore
        name = name.replace(/\s/g, '_');

        //remove special characters
        name = name.replace(/[^a-zA-Z0-9_]/g, '');

        //remove duplicate underscores
        name = name.replace(/_+/g, '_');

        //remove leading and trailing underscores
        name = name.replace(/^_+|_+$/g, '');

        return { ...material, id: name };
      });
    }
  }, [material?.name]);

  useEffect(() => {
    if (!materialId) {
      return;
    }

    Api.getMaterial(materialId).then((material) => {
      if (isDuplicate) {
        const parsedMaterialId = (material.id + '_copy').replace(/_/g, ' ');
        material.name = parsedMaterialId;
        material.defined_in = 'project';
        material.id = material_id || '';
      }
      setMaterialInitial(material);
      setMaterial(material);
    });
  }, [materialId, isDuplicate, material_id]);

  const handleSaveClick = (material: Material) => async () => {
    if (materialIdCopy && materialIdCopy !== material.id) {
      deleteMaterial(materialIdCopy);
    }
    await Api.saveMaterial(material);
    notifications.show({
      title: 'Saved',
      message: 'Material saved',
      color: 'green',
    });
  };
  const readOnly = material?.defined_in === 'aiconsole';
  const previewValue = preview
    ? preview?.content.split('\\n').join('\n')
    : 'Generating preview...';

  const disableSubmit = isMaterialChanged() && !isDuplicate;

  return (
    <div className="App flex flex-col h-screen fixed top-0 left-0 bottom-0 right-0 bg-gray-800/95 text-stone-400 ">
      <TopBar />

      <div className="flex flex-col h-full overflow-y-auto p-6 gap-4">
        <div className="flex gap-5">
          <p>
            <span className="font-bold">Material id: </span> {material?.id}
          </p>
          {readOnly && (
            <div className="flex gap-2 items-center text-sm ml-auto">
              <EyeIcon className="w-4 h-4" />
              This is a system material. It can’t be edited.
            </div>
          )}
        </div>
        {material && (
          <>
            <SimpleInput
              label="Material name"
              placeholder=""
              value={material.name}
              disabled={readOnly}
              onChange={(value) => setMaterial({ ...material, name: value })}
              withTooltip
              tootltipText="Material name is used to identify material in the system. It should be unique."
            />
            <SimpleInput
              label="Usage"
              value={material.usage}
              disabled={readOnly}
              onChange={(value) => setMaterial({ ...material, usage: value })}
              withTooltip
              tootltipText="Usage is used to help identify when material should be used. "
            />
            <EnumInput<MaterialStatus>
              label="Status"
              values={materialStatusOptions}
              value={material.status}
              onChange={(value) => setMaterial({ ...material, status: value })}
              withTooltip
              tootltipText="Status is used to tell GPT Model if it should be used to generate response."
            />
            <EnumInput<MaterialContentType>
              label="Content type"
              values={materialContenTypeOptions}
              value={material.content_type}
              disabled={readOnly}
              onChange={(value) =>
                setMaterial({ ...material, content_type: value })
              }
              withTooltip
              tootltipText="Content type is used to tell GPT Model how to interpret material content."
            />
            <div className="flex flex-row w-full gap-4 h-full">
              {material.content_type === 'static_text' && (
                <CodeInput
                  label="Text"
                  value={material.content_static_text}
                  onChange={(value) =>
                    setMaterial({ ...material, content_static_text: value })
                  }
                  className="flex-grow"
                  disabled={readOnly}
                  codeLanguage="markdown"
                />
              )}

              {material.content_type === 'dynamic_text' && (
                <CodeInput
                  label="Python function returning dynamic text"
                  value={material.content_dynamic_text}
                  onChange={(value) =>
                    setMaterial({ ...material, content_dynamic_text: value })
                  }
                  className="flex-grow"
                  disabled={readOnly}
                  codeLanguage="python"
                />
              )}
              {material.content_type === 'api' && (
                <CodeInput
                  label="API Module"
                  value={material.content_api}
                  onChange={(value) =>
                    setMaterial({ ...material, content_api: value })
                  }
                  disabled={readOnly}
                  className="flex-grow"
                />
              )}

              {preview?.error ? (
                <CodeInput
                  label="Preview"
                  value={preview.error}
                  disabled={readOnly}
                  readOnly={true}
                  className="flex-grow"
                />
              ) : (
                <div className="w-1/2">
                  <p className="font-bold mb-4">Preview</p>
                  <div className="bg-black/20 p-3 w-full h-full max-h-[540px] overflow-y-auto">
                    <MarkdownPreview text={previewValue} />
                  </div>
                </div>
              )}
            </div>
            <button
              disabled={disableSubmit}
              className={cn(
                'bg-primary hover:bg-gray-700/95 text-black hover:bg-primary-light px-4 py-1 rounded-full flow-right',
                {
                  'opacity-[0.3] cursor-default hover:bg-initial':
                    disableSubmit,
                },
              )}
              onClick={handleSaveClick(material)}
            >
              Save
            </button>
          </>
        )}
      </div>
    </div>
  );
}
