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
import { TopBar } from '@/components/top/TopBar';
import { EnumInput } from '@/components/materials/EnumInput';
import { ErrorObject, SimpleInput } from '@/components/materials/TextInput';
import { CodeInput } from '@/components/materials/CodeInput';
import { useAICStore } from '@/store/AICStore';
import { EyeIcon, NoSymbolIcon, CheckIcon } from '@heroicons/react/24/outline';
import { cn } from '@/utils/styles';
import { BoltIcon } from '@heroicons/react/24/solid';
import { Tooltip } from '../system/Tooltip';

export function MaterialPage() {
  let { material_id } = useParams<{ material_id: string | undefined }>();

  const isNew = material_id === 'new';

  if (isNew) {
    material_id = undefined;
  }

  const copyId = new URLSearchParams(window.location.search).get('copy');
  const [material, setMaterial] = useState<Material | undefined>(undefined);
  const [materialInitial, setMaterialInitial] = useState<Material | undefined>(
    undefined,
  );

  const [preview, setPreview] = useState<RenderedMaterial | undefined>(
    undefined,
  );
  const [errors, setErrors] = useState<ErrorObject>({});

  const isMaterialChanged = () => {
    if (material && materialInitial) {
      const changedFields = Object.entries(material).filter(([key, value]) => {
        return value !== materialInitial[key as keyof Material];
      });

      return Boolean(!changedFields.length);
    }
  };

  const isError = Object.values(errors).some((error) => error !== null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    material?.content_api,
    material?.content_dynamic_text,
    material?.content_static_text,
    material?.content_type,
    material?.name,
  ]);

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
    if (copyId) {
      Api.getMaterial(copyId).then((materialToCopy) => {
        materialToCopy.name += ' Copy';
        materialToCopy.defined_in = 'project';
        materialToCopy.id = material_id || '';
        setMaterialInitial(materialToCopy);
        setMaterial(materialToCopy);
      });
    } else if (material_id) {
      Api.getMaterial(material_id).then((material) => {
        setMaterialInitial(material);
        setMaterial(material);
      });
    } else {
      //HACK: This will get a default new material
      Api.getMaterial('new').then((material) => {
        setMaterialInitial(material);
        setMaterial(material);
      });
    }
  }, [copyId, isNew, material_id]);

  const handleSaveClick = (material: Material) => async () => {
    if (isNew) {
      await Api.saveNewMaterial(material);

      notifications.show({
        title: 'Saved',
        message: 'Material saved',
        color: 'green',
      });
    } else if (materialInitial && materialInitial.id !== material.id) {
      await Api.saveNewMaterial(material);
      await deleteMaterial(materialInitial.id);

      notifications.show({
        title: 'Renamed',
        message: 'Material renamed',
        color: 'green',
      });
    } else {
      await Api.updateMaterial(material);

      notifications.show({
        title: 'Saved',
        message: 'Material saved',
        color: 'green',
      });
    }

    setMaterialInitial(material);
  };
  const readOnly = material?.defined_in === 'aiconsole';

  const previewValue = preview
    ? preview?.content.split('\\n').join('\n')
    : 'Generating preview...';

  const disableSubmit = (isMaterialChanged() && !(isNew && copyId)) || isError;

  return (
    <div className="App flex flex-col h-screen fixed top-0 left-0 bottom-0 right-0 bg-gray-800/95 text-stone-400 ">
      <TopBar />

      <div className="flex flex-col h-full overflow-y-auto p-6 gap-4">
        <div className="flex gap-5">
          <Tooltip
            label={
              'Material id determines the file name and is auto generated from name. It must be unique.'
            }
            position="top-end"
            offset={{ mainAxis: 7 }}
          >
            <p>
              <span className="font-bold">Material id: </span> {material?.id}
            </p>
          </Tooltip>

          {readOnly && (
            <div className="flex gap-2 items-center text-md font-bold ml-auto ">
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
              required
              name="material_name"
              errors={errors}
              setErrors={setErrors}
              onChange={(value) => setMaterial({ ...material, name: value })}
              withTooltip
              tootltipText="Material name is used to identify material in the system. Make it self explanatory so AI will better understand what it is."
            />
            <SimpleInput
              label="Usage"
              name="usage"
              value={material.usage}
              disabled={readOnly}
              onChange={(value) => setMaterial({ ...material, usage: value })}
              withTooltip
              tootltipText="Usage is used to help identify when this material should be used. "
            />
            <EnumInput<MaterialStatus>
              label="Status"
              values={materialStatusOptions}
              value={material.status}
              render={(value) => {
                return {
                  forced: (
                    <>
                      <BoltIcon className="h-4 w-4" title="forced" /> Forced
                    </>
                  ),
                  enabled: (
                    <>
                      <CheckIcon className="h-4 w-4" /> Enabled
                    </>
                  ),
                  disabled: (
                    <>
                      <NoSymbolIcon className="h-4 w-4" /> Disabled
                    </>
                  ),
                }[value];
              }}
              onChange={(value) => setMaterial({ ...material, status: value })}
              tootltipText={(value) => {
                return {
                  forced: 'This material will always be used for each task.',
                  enabled: 'This material can be used by AI.',
                  disabled:
                    'This material will never be used, in general its better keep only quality materials available to AI.',
                }[value];
              }}
            />
            <EnumInput<MaterialContentType>
              label="Content type"
              values={materialContenTypeOptions}
              value={material.content_type}
              render={(value) => {
                return {
                  static_text: 'Text',
                  dynamic_text: 'Dynamic text',
                  api: 'API',
                }[value];
              }}
              disabled={readOnly}
              onChange={(value) =>
                setMaterial({ ...material, content_type: value })
              }
              tootltipText={(value) => {
                return {
                  static_text:
                    'Markdown formated text will be injected into AI context.',
                  dynamic_text:
                    'A python function will generate markdown text to be injected into AI context.',
                  api: 'Documentation will be extracted from code and injected into AI context as markdown text, code will be available to execute by AI without import statements.',
                }[value];
              }}
            />
            <div className="flex flex-row w-full gap-4 ">
              <div className="w-1/2 h-[calc(100vh-500px)] min-h-[300px]">
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
              </div>
              <div className="w-1/2 h-[calc(100vh-500px)] min-h-[300px]">
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
                'bg-primary hover:bg-gray-700/95 text-black hover:bg-primary-light px-4 py-1 rounded-full flow-right',
                {
                  'opacity-[0.3] cursor-not-allowed hover:bg-initial':
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
