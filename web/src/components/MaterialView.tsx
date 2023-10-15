import { notifications } from '@mantine/notifications';
import { useParams } from 'react-router-dom';
import { ChangeEvent, useEffect, useState } from 'react';
import { Api } from '../api/Api';
import { Material, MaterialContentType, MaterialDefinedIn, MaterialStatus, materialContenTypeOptions, materialDefinedInOptions, materialStatusOptions } from '../store/types';
import { useWebSocketStore } from '../store/useWebSocketStore';
import { TopBar } from './TopBar';
import { cn } from '../utils/styles';
import { Chip, Group } from '@mantine/core';

function EnumInput<T extends string>(props: {
  label: string;
  value: T;
  values: T[];
  className?: string;
  onChange: (value: T) => void;
  placeholder?: string;
}) {
  return (
    <Chip.Group
      value={props.value}
      onChange={(value: T) => {
        props.onChange(value);
      }}
    >
      <div className="flex flex-row gap-4">
        <label htmlFor={props.label} className="font-bold">
          {props.label}:
        </label>
        <Group justify="center">
          {props.values.map((value) => (
            <Chip value={value}>{value}</Chip>
          ))}
        </Group>
      </div>
    </Chip.Group>
  );
}

function SimpleInput(props: {
  label: string;
  value: string;
  className?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <>
      <label htmlFor={props.label} className="font-bold">
        {props.label}:
      </label>
      <textarea
        placeholder={props.placeholder}
        id={props.label}
        value={props.value}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
          props.onChange(e.target.value);
        }}
        className={cn(
          props.className,
          'resize-none bg-black/20 appearance-none border border-transparent rounded w-full py-2 px-3 leading-tight placeholder-gray-400 focus:outline-none focus:border-primary/50 focus:shadow-outline',
        )}
      ></textarea>
    </>
  );
}

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
            <SimpleInput
              label="Material id"
              placeholder="some_material_id"
              value={material.id}
              onChange={(value) => setMaterial({ ...material, id: value })}
            />
            <SimpleInput
              label="Usage"
              value={material.usage}
              onChange={(value) => setMaterial({ ...material, usage: value })}
            />

            <EnumInput<MaterialStatus>
              label="Status"
              values={materialStatusOptions}
              value={material.status}
              onChange={(value) => setMaterial({ ...material, status: value })}
            />

            <EnumInput<MaterialDefinedIn>
              label="Defined in"
              values={materialDefinedInOptions}
              value={material.defined_in}
              onChange={(value) =>
                setMaterial({ ...material, defined_in: value })
              }
            />

            <EnumInput<MaterialContentType>
              label="Content type"
              values={materialContenTypeOptions}
              value={material.content_type}
              onChange={(value) =>
                setMaterial({ ...material, content_type: value })
              }
            />

            {material.content_type === 'static_text' && (
              <SimpleInput
                label="Text"
                value={material.content_static_text}
                onChange={(value) =>
                  setMaterial({ ...material, content_static_text: value })
                }
                className="flex-grow"
              />
            )}

            {material.content_type === 'dynamic_text' && (
              <SimpleInput
                label="Python function returning dynamic text"
                value={material.content_dynamic_text}
                onChange={(value) =>
                  setMaterial({ ...material, content_dynamic_text: value })
                }
                className="flex-grow"
              />
            )}

            {material.content_type === 'api' && (
              <SimpleInput
                label="API Module"
                value={material.content_api}
                onChange={(value) =>
                  setMaterial({ ...material, content_api: value })
                }
                className="flex-grow"
              />
            )}

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
