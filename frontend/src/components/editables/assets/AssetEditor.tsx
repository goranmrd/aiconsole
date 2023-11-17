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

import { useCallback, useEffect, useState } from 'react';
import { unstable_useBlocker as useBlocker, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/common/Button';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { CodeInput } from '@/components/editables/assets/CodeInput';
import { SimpleInput } from '@/components/editables/assets/TextInput';
import { useAssetStore } from '@/store/editables/asset/useAssetStore';
import {
  Agent,
  Asset,
  AssetType,
  Material,
  MaterialContentType,
  RenderedMaterial,
} from '@/types/editables/assetTypes';
import { cn } from '@/utils/common/cn';
import showNotification from '@/utils/common/showNotification';
import { convertNameToId } from '@/utils/editables/convertNameToId';
import { MaterialContentNames, getMaterialContentName } from '@/utils/editables/getMaterialContentName';
import { useEditableObjectContextMenu } from '@/utils/editables/useContextMenuForEditable';
import { useDeleteEditableObjectWithUserInteraction } from '@/utils/editables/useDeleteEditableObjectWithUserInteraction';
import { EditablesAPI } from '../../../api/api/EditablesAPI';
import { useAssetChanged } from '../../../utils/editables/useAssetChanged';
import { EditorHeader } from '../EditorHeader';
import { localStorageTyped } from '@/utils/common/localStorage';
import { usePrevious } from '@mantine/hooks';

const { setItem } = localStorageTyped<boolean>('isAssetChanged');

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

export function AssetEditor({ assetType }: { assetType: AssetType }) {
  const params = useParams();
  const id = params.id || '';
  const editableObjectType = assetType;
  const searchParams = useSearchParams()[0];
  const copyId = searchParams.get('copy');
  const asset = useAssetStore((state) => state.selectedAsset);
  const lastSavedAsset = useAssetStore((state) => state.lastSavedSelectedAsset);
  const setLastSavedSelectedAsset = useAssetStore((state) => state.setLastSavedSelectedAsset);
  const setSelectedAsset = useAssetStore((state) => state.setSelectedAsset);
  const [preview, setPreview] = useState<RenderedMaterial | undefined>(undefined);
  const [typeName, setTypeName] = useState<MaterialContentNames>('Material');
  const [showPreview, setShowPreview] = useState(false);
  const previewValue = preview ? preview?.content.split('\\n').join('\n') : 'Generating preview...';
  const handleDeleteWithInteraction = useDeleteEditableObjectWithUserInteraction(assetType);
  const navigate = useNavigate();
  const isAssetChanged = useAssetChanged();
  const isPrevAssetChanged = usePrevious(isAssetChanged);
  const [newPath, setNewPath] = useState<string>('');

  const wasAssetChangedInitially = !isPrevAssetChanged && isAssetChanged;
  const wasAssetUpdate = isPrevAssetChanged && !isAssetChanged;

  const blocker = useBlocker(isAssetChanged);

  const { reset, proceed, state: blockerState } = blocker || {};

  useEffect(() => {
    if (wasAssetUpdate && newPath) {
      navigate(newPath);
      setNewPath('');
    }
  }, [newPath, isAssetChanged, wasAssetUpdate, navigate]);

  useEffect(() => {
    setItem(isAssetChanged);
  }, [isAssetChanged]);

  function handleRevert(id: string) {
    if (isAssetChanged) {
      handleDiscardChanges();
    } else {
      handleDeleteWithInteraction(id);
    }
  }

  const getInitialAsset = useCallback(() => {
    if (copyId) {
      setLastSavedSelectedAsset(undefined);

      EditablesAPI.fetchEditableObject<Asset>({ editableObjectType, id: copyId }).then((assetToCopy) => {
        assetToCopy.name += ' Copy';
        assetToCopy.defined_in = 'project';
        assetToCopy.id = convertNameToId(assetToCopy.name);
        setSelectedAsset(assetToCopy);
      });
    } else {
      //For id === 'new' This will get a default new asset
      const raw_type = searchParams.get('type');
      const type = raw_type ? raw_type : undefined;
      EditablesAPI.fetchEditableObject<Asset>({ editableObjectType, id, type }).then((editable) => {
        setLastSavedSelectedAsset(id !== 'new' ? editable : undefined); // for new assets, lastSavedAsset is undefined
        setSelectedAsset(editable);
      });
    }
  }, [copyId, editableObjectType, id, setLastSavedSelectedAsset, setSelectedAsset, searchParams]);

  // Acquire the initial object
  useEffect(() => {
    getInitialAsset();

    return () => {
      setSelectedAsset(undefined);
      setLastSavedSelectedAsset(undefined);
    };
  }, [getInitialAsset, setLastSavedSelectedAsset, setSelectedAsset]);

  const isAssetStatusChanged = (() => {
    if (!asset || !lastSavedAsset) {
      return false;
    }
    return asset.status !== lastSavedAsset.status;
  })();

  const updateStatusIfNecessary = useCallback(async () => {
    if (isAssetStatusChanged && asset) {
      await EditablesAPI.setAssetStatus(assetType, asset.id, asset.status);

      showNotification({
        title: 'Status changed',
        message: `Status changed to ${asset.status}`,
        variant: 'success',
      });
    }
  }, [asset, assetType, isAssetStatusChanged]);

  const enableSubmit = (isAssetChanged || isAssetStatusChanged) && asset?.id && asset?.name;
  const disableSubmit = !enableSubmit;

  const handleSaveClick = useCallback(async () => {
    if (asset === undefined) {
      return;
    }

    if (lastSavedAsset === undefined) {
      await EditablesAPI.saveNewEditableObject(assetType, asset.id, asset);
      await updateStatusIfNecessary();

      showNotification({
        title: 'Saved',
        message: 'saved',
        variant: 'success',
      });
    } else if (lastSavedAsset && lastSavedAsset.id !== asset.id) {
      await EditablesAPI.saveNewEditableObject(assetType, lastSavedAsset.id, asset);
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
      useAssetStore.setState({ lastSavedSelectedAsset: asset });
      setNewPath(`/${assetType}s/${asset.id}`);
    } else {
      // Reload the asset from server
      const newAsset = await EditablesAPI.fetchEditableObject<Material>({
        editableObjectType: assetType,
        id: asset.id,
      });
      setSelectedAsset(newAsset);
      useAssetStore.setState({ lastSavedSelectedAsset: newAsset });
    }
  }, [asset, assetType, isAssetChanged, lastSavedAsset, setSelectedAsset, updateStatusIfNecessary]);

  const handleDiscardChanges = () => {
    //set last selected asset to the same as selected asset

    if (!asset) {
      return;
    }

    if (lastSavedAsset === undefined) {
      getInitialAsset();
    } else {
      setSelectedAsset({ ...lastSavedAsset } as Asset);
    }
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

  // If edited a core asset, set override and defined in
  useEffect(() => {
    if (asset && asset.defined_in === 'aiconsole' && wasAssetChangedInitially) {
      console.log('CORE');
      setSelectedAsset({ ...asset, defined_in: 'project' } as Asset);
      setLastSavedSelectedAsset(undefined);
    }
  }, [asset, setSelectedAsset, wasAssetChangedInitially, setLastSavedSelectedAsset]);

  const [hasCore, setHasCore] = useState(false);

  // hasCore
  useEffect(() => {
    if (!assetType || !asset?.id) {
      setHasCore(false);
      return;
    }

    EditablesAPI.doesEdibleExist(assetType, asset?.id, 'aiconsole').then((exists) => {
      setHasCore(exists);
      setSelectedAsset({ ...asset, override: exists });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetType, asset?.id, setSelectedAsset]);

  const handleRename = async (newName: string) => {
    if (!asset) {
      return;
    }

    setSelectedAsset({ ...asset, name: newName, id: convertNameToId(newName) });
  };

  const { showContextMenu } = useEditableObjectContextMenu({ editable: asset, editableObjectType: assetType });

  return (
    <div className="flex flex-col w-full h-full max-h-full overflow-auto">
      <EditorHeader
        editable={asset}
        onRename={handleRename}
        isChanged={isAssetChanged}
        onContextMenu={showContextMenu}
      >
        (Defined in {asset?.defined_in})
      </EditorHeader>
      <div className="flex-grow overflow-auto">
        <div className="flex w-full h-full flex-col justify-between downlight">
          <div className="w-full h-full overflow-auto">
            <div className="flex-grow flex flex-col w-full h-full overflow-auto p-6 gap-4">
              {asset && (
                <>
                  {hasCore && asset.defined_in === 'aiconsole' && (
                    <div className="flex-none flex flex-row gap-2 bg-primary/10 px-6 py-2 items-center -m-6 mb-0 ">
                      <span className="flex-grow">This is a system {assetType} start editing to override it.</span>
                    </div>
                  )}
                  {hasCore && asset.defined_in === 'project' && (
                    <div className="flex-none flex flex-row gap-2 bg-secondary/10 px-6 py-2 items-center -m-6 mb-0 ">
                      <span className="flex-grow">
                        This {assetType} {lastSavedAsset !== undefined ? 'is overriding' : 'will override'} a default
                        system {assetType}.
                      </span>
                      <Button
                        variant="secondary"
                        small
                        classNames="self-end m-0 text-xs p-2 px-4"
                        onClick={() => handleRevert(asset.id)}
                      >
                        Revert
                      </Button>{' '}
                    </div>
                  )}
                  <SimpleInput
                    label="Usage"
                    name="usage"
                    value={asset.usage}
                    onChange={(value) => setSelectedAsset({ ...asset, usage: value })}
                    withTooltip
                    withResize
                    tootltipText={`Usage is used to help identify when this ${typeName} should be used. `}
                  />
                  <div className="flex-grow flex flex-row w-full gap-4 overflow-clip">
                    <div className="flex-1 w-1/2">
                      {assetType === 'agent' ? (
                        <AgentContent agent={asset as Agent} />
                      ) : (
                        <MaterialContent material={asset as Material} />
                      )}
                    </div>
                    {showPreview && (
                      <div className="flex-1 w-1/2">
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
                    {lastSavedAsset === undefined
                      ? hasCore
                        ? 'Override'
                        : 'Create'
                      : lastSavedAsset && lastSavedAsset.id !== asset.id
                      ? isAssetChanged
                        ? 'Rename and Save Changes'
                        : 'Saved'
                      : isAssetChanged
                      ? 'Save Changes'
                      : 'Saved'}
                  </button>
                </>
              )}
            </div>

            <ConfirmationModal
              confirmButtonText="Yes"
              cancelButtonText="No"
              opened={blockerState === 'blocked'}
              onClose={reset}
              onConfirm={proceed || null}
              title="Do you want to discard your changes and continue?"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
