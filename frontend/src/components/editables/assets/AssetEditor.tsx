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

import { CodeInput } from '@/components/editables/assets/CodeInput';
import { SimpleInput } from '@/components/editables/assets/TextInput';
import { useEditablesStore } from '@/store/editables/useEditablesStore';
import { Agent, AssetType, Material, MaterialContentType, RenderedMaterial } from '@/types/editables/assetTypes';
import { cn } from '@/utils/common/cn';
import showNotification from '@/utils/common/showNotification';
import { getEditableObjectType } from '@/utils/editables/getEditableObjectType';
import { MaterialContentNames, getMaterialContentName } from '@/utils/editables/getMaterialContentName';
import { EditablesAPI } from '../../../api/api/EditablesAPI';
import { useAssetStore } from '@/store/editables/asset/useAssetStore';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { useDiscardAssetChangesStore } from '@/store/editables/asset/useDiscardAssetChangesStore';

const MaterialContent = ({ material }: { material: Material }) => {
  const setSelectedAsset = useAssetStore((state) => state.setSelectedAsset);

  return (
    <>
      {material.content_type === 'static_text' && (
        <CodeInput
          label="Text"
          value={material.content_static_text}
          onChange={(value) =>
            setSelectedAsset({
              ...material,
              content_static_text: value,
            } as Material)
          }
          className="flex-grow"
          codeLanguage="markdown"
        />
      )}
      {material.content_type === 'dynamic_text' && (
        <CodeInput
          label="Python function returning dynamic text"
          value={material.content_dynamic_text}
          onChange={(value) =>
            setSelectedAsset({
              ...material,
              content_dynamic_text: value,
            } as Material)
          }
          className="flex-grow"
          codeLanguage="python"
        />
      )}
      {material.content_type === 'api' && (
        <CodeInput
          label="API Module"
          value={material.content_api}
          onChange={(value) => setSelectedAsset({ ...material, content_api: value } as Material)}
          className="flex-grow"
        />
      )}
    </>
  );
};

const AgentContent = ({ agent }: { agent: Agent }) => {
  const setSelectedAsset = useAssetStore((state) => state.setSelectedAsset);

  return (
    <CodeInput
      label="System information"
      value={agent.system}
      onChange={(value) => setSelectedAsset({ ...agent, system: value } as Agent)}
      className="flex-grow"
      codeLanguage="markdown"
    />
  );
};

export function AssetEditor() {
  const asset = useAssetStore((state) => state.selectedAsset);
  const lastSavedAsset = useAssetStore((state) => state.lastSavedSelectedAsset);
  const setSelectedAsset = useAssetStore((state) => state.setSelectedAsset);
  const { setIsChanged, setConfirmCallback, confirmCallback } = useDiscardAssetChangesStore();

  const searchParams = useSearchParams()[0];
  const [preview, setPreview] = useState<RenderedMaterial | undefined>(undefined);

  const [typeName, setTypeName] = useState<MaterialContentNames>('Material');
  const [showPreview, setShowPreview] = useState(false);

  const previewValue = preview ? preview?.content.split('\\n').join('\n') : 'Generating preview...';
  const assetType = getEditableObjectType(asset) as AssetType;

  const deleteEditableObject = useEditablesStore((state) => state.deleteEditableObject);
  const navigate = useNavigate();

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

  useEffect(() => {
    setIsChanged(isAssetChanged);
  }, [isAssetChanged, setIsChanged]);

  const isAssetStatusChanged = (() => {
    if (!asset || !lastSavedAsset) {
      return true;
    }
    return asset.status !== lastSavedAsset.status;
  })();

  const updateStatusIfNecessary = async () => {
    if (isAssetStatusChanged && asset) {
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

    if (lastSavedAsset?.id !== asset.id) {
      navigate(`/${assetType}s/${asset.id}`);
    }

    useAssetStore.setState({ lastSavedSelectedAsset: asset });
    setIsChanged(false);
    setConfirmCallback(null);
  };

  const handleCloseDiscardConfirmation = () => {
    setConfirmCallback(null);
  };

  const handleDiscardChanges = () => {
    if (confirmCallback) {
      confirmCallback();
    }
    setIsChanged(false);
    setConfirmCallback(null);
  };

  useEffect(() => {
    setPreview(undefined);
    if (!asset) {
      return;
    }
    let timeout: NodeJS.Timeout;
    if (assetType === 'material') {
      const material: Material = asset as Material;
      setShowPreview(true);
      setTypeName(getMaterialContentName(material?.content_type));

      if (lastSavedAsset === undefined) {
        material.content_type = (searchParams.get('type') as MaterialContentType | null) || material.content_type;
      }

      timeout = setTimeout(() => {
        EditablesAPI.previewMaterial(material).then((preview) => {
          setPreview(preview);
        });
      }, 3000);
    } else {
      setTypeName('Agent');
      setShowPreview(false);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [asset, assetType, lastSavedAsset, searchParams]);

  return (
    <div className="flex flex-col w-full h-full overflow-auto p-6 gap-4">
      {asset && (
        <>
          <SimpleInput
            label="Usage"
            name="usage"
            value={asset.usage}
            onChange={(value) => setSelectedAsset({ ...asset, usage: value })}
            withTooltip
            tootltipText={`Usage is used to help identify when this ${typeName} should be used. `}
          />
          <div className="flex-grow flex flex-row w-full gap-4 overflow-clip">
            <div className="flex-1">
              {assetType === 'agent' ? (
                <AgentContent agent={asset as Agent} />
              ) : (
                <MaterialContent material={asset as Material} />
              )}
            </div>
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
      <ConfirmationModal
        confirmButtonText="Yes"
        cancelButtonText="No"
        opened={Boolean(confirmCallback)}
        onClose={handleCloseDiscardConfirmation}
        onConfirm={handleDiscardChanges}
        title="Do you want to discard your changes and continue?"
      />
    </div>
  );
}
