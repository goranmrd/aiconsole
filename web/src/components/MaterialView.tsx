import { notifications } from '@mantine/notifications';
import { useParams } from 'react-router-dom';
import { ChangeEvent, useEffect, useState } from 'react';
import { Api } from '../api/Api';
import { Material } from '../store/types';
import { useWebSocketStore } from '../store/useWebSocketStore';
import { TopBar } from './TopBar';

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
      initWebSocket('non-existant-chat-id');

      // add return cleanup function to disconnect on unmount
      return () => disconnect();
    }, [initWebSocket, disconnect]);
  }

  return (
    <div className="App flex flex-col h-screen fixed top-0 left-0 bottom-0 right-0 bg-gray-800/95 text-stone-400">
      <TopBar />

      <div className="flex flex-col h-full overflow-y-auto p-6 gap-4">
        {material && (
          <>
            
            <label htmlFor="id" className="font-bold">
              Material:
            </label>
            <textarea
              className="bg-black/20"
              id="id"
              value={material.id}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                setMaterial({ ...material, id: e.target.value });
              }}
            />

            <label htmlFor="usage" className="font-bold">
              Usage:
            </label>
            <textarea
              className=" bg-black/20"
              id="usage"
              value={material.usage}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                setMaterial({ ...material, usage: e.target.value });
              }}
            />
            <label htmlFor="content" className="font-bold">
              Content:
            </label>
            <textarea
              className="flex-grow  bg-black/20"
              id="content"
              value={material.content}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                setMaterial({ ...material, content: e.target.value });
              }}
            />
            <button
              className="bg-primary hover:bg-gray-700/95 text-black hover:bg-primary-light px-4 py-1 rounded-full flow-right"
              onClick={async () => {
                await Api.saveMaterial(material);
                notifications.show({
                  title: 'Saved',
                  message: 'Material saved',
                  color: 'green',
                });
              }}
            >
              Save
            </button>
          </>
        )}
      </div>
    </div>
  );
}
