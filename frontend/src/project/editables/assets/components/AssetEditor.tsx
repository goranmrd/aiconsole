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

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';


import { CodeInput } from '@/project/editables/assets/components/CodeInput';
import { SimpleInput } from '@/project/editables/assets/components/TextInput';
import { useAICStore } from '@/project/editables/chat/AICStore';
import { Agent, Asset, AssetType, Material, MaterialContentType, RenderedMaterial } from '@/project/editables/assets/assetTypes';
import { getEditableObjectType } from '@/project/editables/common/getEditableObjectType';
import showNotification from '@/common/showNotification';
import { cn } from '@/common/cn';
import { getMaterialContentName } from '../getMaterialContentName';
import { EditablesAPI } from '../../common/EditablesAPI';

export function AssetEditor({
  asset,
  lastSavedAsset,
  setAsset,
  setLastSavedAsset,
}: {
  asset: Asset;
  lastSavedAsset: Asset;
  setAsset: (asset: Asset | undefined) => void;
  setLastSavedAsset: (asset: Asset | undefined) => void;
}) {
  const searchParams = useSearchParams()[0];
  const [preview, setPreview] = useState<RenderedMaterial | undefined>(undefined);

  const previewValue = preview ? preview?.content.split('\\n').join('\n') : 'Generating preview...';
  const assetType = getEditableObjectType(asset) as AssetType;

  const deleteEditableObject = useAICStore((state) => state.deleteEditableObject);
  const navigate = useNavigate();

  let typeName = 'Material';
  let typeSpecificPart = null;
  let showPreview = true;

  const isAssetChanged = (() => {
    if (!asset || !lastSavedAsset) {
      return true;
    }

    const changedFields = Object.keys(asset).filter((key) => {
      return (
        key !== 'status' && asset[key as keyof typeof asset] !== lastSavedAsset[key as keyof typeof lastSavedAsset]
      );
    });

    return changedFields.length > 0;
  })();

  const isAssetStatusChanged = (() => {
    if (!asset || !lastSavedAsset) {
      return true;
    }
    return asset.status !== lastSavedAsset.status;
  })();

  const updateStatusIfNecessary = async () => {
    if (isAssetStatusChanged) {
      await EditablesAPI.setAssetStatus(assetType, asset.id, asset.status);

      showNotification({
        title: 'Status changed',
        message: `Status changed to ${asset.status}`,
        variant: 'success',
      });
    }
  };

  const enableSubmit = (isAssetChanged || isAssetStatusChanged) && asset?.id && asset?.name;
  const disableSubmit = !enableSubmit;

  const handleSaveClick = async () => {
    let isReallyNew = lastSavedAsset === undefined;

    if (asset === undefined) {
      return;
    }

    if (asset.defined_in === 'aiconsole') {
      asset.defined_in = 'project';
      isReallyNew = true;
    }

    if (isReallyNew) {
      await EditablesAPI.saveNewEditableObject(assetType, asset);
      await updateStatusIfNecessary();

      showNotification({
        title: 'Saved',
        message: 'saved',
        variant: 'success',
      });
    } else if (lastSavedAsset && lastSavedAsset.id !== asset.id) {
      await EditablesAPI.saveNewEditableObject(assetType, asset);
      await deleteEditableObject(assetType, lastSavedAsset.id);
      await updateStatusIfNecessary();

      showNotification({
        title: 'Renamed',
        message: 'renamed',
        variant: 'success',
      });
    } else {
      if (isAssetChanged) {
        await EditablesAPI.updateEditableObject(assetType, asset);

        showNotification({
          title: 'Saved',
          message: 'saved',
          variant: 'success',
        });
      }

      await updateStatusIfNecessary();
    }

    if (lastSavedAsset.id !== asset.id) {
      navigate(`/${assetType}s/${asset.id}`);
    }

    setLastSavedAsset(asset);
  };

  if (asset && assetType === 'material') {
    const material: Material = asset as Material;

    typeName = getMaterialContentName(material?.content_type);

    typeSpecificPart = (
      <>
        {material.content_type === 'static_text' && (
          <CodeInput
            label="Text"
            value={material.content_static_text}
            onChange={(value) => setAsset({ ...material, content_static_text: value } as Material)}
            className="flex-grow"
            codeLanguage="markdown"
          />
        )}
        {material.content_type === 'dynamic_text' && (
          <CodeInput
            label="Python function returning dynamic text"
            value={material.content_dynamic_text}
            onChange={(value) => setAsset({ ...material, content_dynamic_text: value } as Material)}
            className="flex-grow"
            codeLanguage="python"
          />
        )}
        {material.content_type === 'api' && (
          <CodeInput
            label="API Module"
            value={material.content_api}
            onChange={(value) => setAsset({ ...material, content_api: value } as Material)}
            className="flex-grow"
          />
        )}
      </>
    );

    if (lastSavedAsset === undefined) {
      material.content_type = (searchParams.get('type') as MaterialContentType | null) || material.content_type;
    }

    //After 3 seconds of inactivity after change query /preview to get rendered material
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      setPreview(undefined);
      if (!asset) {
        return;
      }

      const timeout = setTimeout(() => {
        EditablesAPI.previewMaterial(material).then((preview) => {
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
  } else if (asset && assetType === 'agent') {
    const agent: Agent = asset as Agent;
    typeName = 'Agent';
    showPreview = false;

    typeSpecificPart = (
      <CodeInput
        label="System information"
        value={agent.system}
        onChange={(value) => setAsset({ ...agent, system: value } as Agent)}
        className="flex-grow"
        codeLanguage="markdown"
      />
    );

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      setPreview(undefined);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [null, null, null, null, null]);
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      setPreview(undefined);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [null, null, null, null, null]);
  }

  return (
    <div className="flex flex-col w-full h-full overflow-auto p-6 gap-4">
      {asset && (
        <>
          <SimpleInput
            label="Usage"
            name="usage"
            value={asset.usage}
            onChange={(value) => setAsset({ ...asset, usage: value })}
            withTooltip
            tootltipText={`Usage is used to help identify when this ${typeName} should be used. `}
          />
          <div className="flex-grow flex flex-row w-full gap-4 overflow-clip">
            <div className="flex-1">{typeSpecificPart}</div>
            {showPreview && (
              <div className="flex-1">
                <CodeInput
                  label="Preview of text to be injected into AI context"
                  value={preview?.error ? preview.error : previewValue}
                  readOnly={true}
                  className="flex-grow"
                  codeLanguage="markdown"
                />
              </div>
            )}
          </div>
          <button
            disabled={disableSubmit}
            className={cn(
              ' flex-none bg-primary hover:bg-gray-700/95 text-black hover:bg-primary-light px-4 py-1 rounded-full flow-right text-[16px] ',
              {
                'opacity-[0.3] cursor-not-allowed hover:bg-initial': disableSubmit,
              },
            )}
            onClick={handleSaveClick}
          >
            Save
          </button>
        </>
      )}
    </div>
  );
}
