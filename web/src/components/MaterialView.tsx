import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { TopBar } from './TopBar';
import { useParams } from 'react-router-dom';
import { ChangeEvent, useEffect, useState } from 'react';
import { Api } from '../api/Api';
import { Material } from '../store/types';
import { useWebSocketStore } from '../store/useWebSocketStore';

export function MaterialView() {
  const { material_id } = useParams<{ material_id: string | undefined }>();

  const [material, setMaterial] = useState<Material | undefined>(undefined);

  useEffect(() => {
    if (!material_id) {
      return;
    }

    Api.getMaterial(material_id).then((material) => {
      setMaterial(material);
    });
  }, [material_id]);


  //HACK: This is a copy from App, and also with an ugly twist of fake chatId
  {
    const { initWebSocket, disconnect } = useWebSocketStore();

    useEffect(() => {
      initWebSocket("non-existant-chat-id");

      // add return cleanup function to disconnect on unmount
      return () => disconnect();
    }, [initWebSocket, disconnect]);
  }

  const handleEditableChange =
    (fieldName: string) => (event: ChangeEvent<HTMLTextAreaElement>) => {
      setMaterial((material) => {
        if (!material) {
          return material;
        }

        return {
          ...material,
          [fieldName]: event.target.value,
        };
      });
    };

  useEffect(() => {
    if (!material) {
      return;
    }

    const timeout = setTimeout(() => {
      Api.saveMaterial(material);
    }, 2000);

    return () => {
      clearTimeout(timeout);
    };
  }, [material]);

  return (
    <MantineProvider>
      <Notifications position="top-right" />
      <div className="App flex flex-col h-screen fixed top-0 left-0 bottom-0 right-0 bg-gray-800/95 text-stone-400">
        <TopBar />
        <div className="flex flex-col h-full overflow-y-auto p-6 gap-4">
          {material && (
            <>
              <div className="font-bold"> Material: {material.id}</div>
              <label htmlFor="usage" className="font-bold">
                Usage:
              </label>
              <textarea
                className=" bg-black"
                id="usage"
                value={material.usage}
                onChange={handleEditableChange('usage')}
              />
              <label htmlFor="content" className="font-bold">
                Content:
              </label>
              <textarea
                className="flex-grow  bg-black"
                id="content"
                value={material.content}
                onChange={handleEditableChange('content')}
              />
            </>
          )}
        </div>
      </div>
    </MantineProvider>
  );
}
