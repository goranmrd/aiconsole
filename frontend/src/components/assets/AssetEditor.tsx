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
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { Api } from '@/api/Api';
import { CodeInput } from '@/components/assets/CodeInput';
import { ErrorObject, SimpleInput } from '@/components/assets/TextInput';
import { useAICStore } from '@/store/AICStore';
import { Agent, Asset, AssetType, Material, MaterialContentType, RenderedMaterial } from '@/types/types';
import showNotification from '@/utils/showNotification';
import { cn } from '@/utils/styles';
import { convertNameToId } from '../../utils/convertNameToId';
import { getMaterialContentName } from './getMaterialContentName';

export function AssetEditor({ assetType }: { assetType: AssetType }) {
  const navigate = useNavigate();
  const [asset, setAsset] = useState<Asset | undefined>(undefined);
  const [assetInitial, setAssetInitial] = useState<Asset | undefined>(undefined);
  const [preview, setPreview] = useState<RenderedMaterial | undefined>(undefined);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [errors, _] = useState<ErrorObject>({});

  let { id } = useParams<{ id: string | undefined }>();

  const isNew = id === 'new';

  if (isNew) {
    id = undefined;
  }

  const searchParams = useSearchParams()[0];
  const copyId = searchParams.get('copy');

  const isError = Object.values(errors).some((error) => error !== null);
  const deleteAsset = useAICStore((state) => state.deleteEditableObject);
  const previewValue = preview ? preview?.content.split('\\n').join('\n') : 'Generating preview...';

  const isAssetStatusChanged = () => {
    if (!asset || !assetInitial) {
      return true;
    }
    return asset.status !== assetInitial.status;
  };

  const isAsseetChanged = () => {
    if (!asset || !assetInitial) {
      return true;
    }

    const changedFields = Object.keys(asset).filter((key) => {
      return key !== 'status' && asset[key as keyof typeof asset] !== assetInitial[key as keyof typeof asset];
    });

    return changedFields.length > 0;
  };

  const enableSubmit = (isAsseetChanged() || isAssetStatusChanged()) && !isError;
  const disableSubmit = !enableSubmit;

  let typeName = 'Material';
  let typeSpecificPart = null;
  let showPreview = true;

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

    if (isNew) {
      material.content_type = (searchParams.get('type') as MaterialContentType | null) || 'static_text';
    }

    //After 3 seconds of inactivity after change query /preview to get rendered material
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      setPreview(undefined);
      if (!asset) {
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

  useEffect(() => {
    // Auto generate id based on name
    if (asset?.name) {
      setAsset((asset: Asset | undefined) => {
        if (!asset) return asset;
        const id = convertNameToId(asset.name);
        return { ...asset, id };
      });
    }
  }, [asset?.name]);

  useEffect(() => {
    if (copyId) {
      Api.fetchEditableObject<Asset>(assetType, copyId).then((assetToCopy) => {
        assetToCopy.name += ' Copy';
        assetToCopy.defined_in = 'project';
        assetToCopy.id = convertNameToId(assetToCopy.name);
        setAssetInitial(undefined);
        setAsset(assetToCopy);
      });
    } else if (id) {
      Api.fetchEditableObject<Asset>(assetType, id).then((asset) => {
        setAssetInitial(asset);
        setAsset(asset);
      });
    } else {
      //HACK: This will get a default new asset
      Api.fetchEditableObject<Asset>(assetType, 'new').then((asset) => {
        setAssetInitial(undefined);
        setAsset(asset);
      });
    }
  }, [copyId, isNew, id, assetType]);

  const updateStatusIfNecessary = async (asset: Asset) => {
    if (isAssetStatusChanged()) {
      await Api.setAssetStatus(assetType, asset.id, asset.status);

      showNotification({
        title: 'Status changed',
        message: `Status changed to ${asset.status}`,
        variant: 'success',
      });
    }
  };

  const handleSaveClick = (asset: Asset) => async () => {
    if (isNew) {
      await Api.saveNewEditableObject(assetType, asset);
      await updateStatusIfNecessary(asset);

      showNotification({
        title: 'Saved',
        message: 'saved',
        variant: 'success',
      });
    } else if (assetInitial && assetInitial.id !== asset.id) {
      await Api.saveNewEditableObject(assetType, asset);
      await deleteAsset(assetType, assetInitial.id);
      await updateStatusIfNecessary(asset);

      showNotification({
        title: 'Renamed',
        message: 'renamed',
        variant: 'success',
      });
    } else {
      if (isAsseetChanged()) {
        await Api.updateEditableObject(assetType, asset);

        showNotification({
          title: 'Saved',
          message: 'saved',
          variant: 'success',
        });
      }

      await updateStatusIfNecessary(asset);
    }

    if (id !== asset.id) {
      navigate(`/${assetType}s/${asset.id}`);
    }

    setAssetInitial(asset);
  };

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
            {showPreview && <div className="flex-1">
              <CodeInput
                label="Preview of text to be injected into AI context"
                value={preview?.error ? preview.error : previewValue}
                readOnly={true}
                className="flex-grow"
                codeLanguage="markdown"
              />
            </div>}
          </div>
          <button
            disabled={disableSubmit}
            className={cn(
              ' flex-none bg-primary hover:bg-gray-700/95 text-black hover:bg-primary-light px-4 py-1 rounded-full flow-right text-[16px] ',
              {
                'opacity-[0.3] cursor-not-allowed hover:bg-initial': disableSubmit,
              },
            )}
            onClick={handleSaveClick(asset)}
          >
            Save
          </button>
        </>
      )}
    </div>
  );
}
