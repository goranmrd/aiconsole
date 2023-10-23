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

const removeCopySuffix = (materialId: string) => {
  return materialId.replace(/_copy$/, ''); // Removes "_copy" from the end of the string
};

export function MaterialPage() {
  const { material_id } = useParams<{ material_id: string | undefined }>();
  const materialIdCopy = material_id;
  const [material, setMaterial] = useState<Material | undefined>(undefined);
  const isDuplicate = material_id?.includes('_copy');
  const materialId =
    isDuplicate && material_id ? removeCopySuffix(material_id) : material_id;
  const [preview, setPreview] = useState<RenderedMaterial | undefined>(
    undefined,
  );
  const deleteMaterial = useAICStore((state) => state.deleteMaterial);

  //After 3 seconds of inactivity after change query /preview to get rendered material
  useEffect(() => {
    console.log('material changed');
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
  const { content, error } = preview || {};
  const previewValue = preview
    ? error || content || ''
    : 'Generating preview...';
  return (
    <div className="App flex flex-col h-screen fixed top-0 left-0 bottom-0 right-0 bg-gray-800/95 text-stone-400 ">
      <TopBar />

      <div className="flex flex-col h-full overflow-y-auto p-6 gap-4">
        <p>
          <span className="font-bold">Material id:</span> {material?.id}
        </p>
        {material && (
          <>
            <SimpleInput
              label="Material name"
              placeholder=""
              value={material.name}
              disabled={readOnly}
              onChange={(value) => setMaterial({ ...material, name: value })}
            />

            <SimpleInput
              label="Usage"
              value={material.usage}
              disabled={readOnly}
              onChange={(value) => setMaterial({ ...material, usage: value })}
            />

            <EnumInput<MaterialStatus>
              label="Status"
              values={materialStatusOptions}
              value={material.status}
              onChange={(value) => setMaterial({ ...material, status: value })}
            />

            <EnumInput<MaterialContentType>
              label="Content type"
              values={materialContenTypeOptions}
              value={material.content_type}
              disabled={readOnly}
              onChange={(value) =>
                setMaterial({ ...material, content_type: value })
              }
            />

            <div className="flex flex-row w-full gap-4 overflow-y-auto ">
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
              <CodeInput
                label="Preview"
                value={previewValue}
                disabled={true}
                className="flex-grow"
              />
            </div>

            <button
              className="bg-primary hover:bg-gray-700/95 text-black hover:bg-primary-light px-4 py-1 rounded-full flow-right"
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
