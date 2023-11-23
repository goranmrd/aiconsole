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

import { useDisclosure } from '@mantine/hooks';
import { Modal } from '@mantine/core';
import { Button } from './Button';
import { MouseEventHandler, MouseEvent, useEffect } from 'react';

interface ConfirmationModalProps {
  onConfirm: MouseEventHandler<HTMLButtonElement> | null;
  onClose?: () => void;
  confirmButtonText?: string;
  cancelButtonText?: string;
  title: string;
  openModalButton?: React.ReactElement;
  opened?: boolean;
  children?: string;
}

export function ConfirmationModal({
  onConfirm,
  onClose,
  confirmButtonText = 'Submit',
  cancelButtonText = 'Cancel',
  title,
  children,
  openModalButton,
  opened: isOpened,
}: ConfirmationModalProps) {
  const [opened, { open, close }] = useDisclosure(isOpened, { onClose });

  useEffect(() => {
    if (isOpened) {
      open();
    } else {
      close();
    }
  }, [close, isOpened, open]);

  const handleConfirm = (event: MouseEvent<HTMLButtonElement>) => {
    if (onConfirm) {
      onConfirm(event);
    }
    close();
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title={title}
        centered
        className="mantine-Modal-root"
        withCloseButton={false}
        styles={{
          root: {
            backgroundColor: '#1a1a1a'
          },
          header: {
            textAlign: 'center',
            padding: '0 0 10px',
            backgroundColor: 'transparent',
          },
          title: {
            lineHeight: 'normal',
            fontSize: '22px',
            fontWeight: '900',
            textAlign: 'center',
            width: '100%',
          },
          content: {
            color: '#fff',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0px 20px 40px 0px rgba(0, 0, 0, 0.25)',
            background: 'radial-gradient(circle at 50% -40%, rgba(173,122,255,1) -150%, rgba(26,26,26,1) 60%)'
          },
          body: {
            color: '#a6a6a6',
            padding: 0,
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '150%'
          },
        }}
      >
        <div>
          <Modal.Body className="w-full mb-8 text-center">{children}</Modal.Body>
          <div className="flex justify-center items-center gap-4">
            <Button variant="secondary" bold small onClick={close}>
              {cancelButtonText}
            </Button>
            <Button variant="primary" small onClick={handleConfirm} dataAutofocus>
              {confirmButtonText}
            </Button>
          </div>
        </div>
      </Modal>

      {openModalButton && <span onClick={open}>{openModalButton}</span>}
    </>
  );
}
