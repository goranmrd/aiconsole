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
  onConfirm: MouseEventHandler<HTMLButtonElement>;
  onClose?: () => void;
  confirmButtonText?: string;
  cancelButtonText?: string;
  title: string;
  openModalButton?: React.ReactElement;
  opened?: boolean;
}

export function ConfirmationModal({
  onConfirm,
  onClose,
  confirmButtonText = 'Submit',
  cancelButtonText = 'Cancel',
  title,
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
    onConfirm(event);
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
        padding={25}
        styles={{
          header: {
            backgroundColor: '#1a1a1a',
            textAlign: 'center',
          },
          title: {
            lineHeight: '24px',
            textAlign: 'center',
            width: '100%',
          },
          content: {
            backgroundColor: '#1a1a1a',
            color: '#fff',
          },
        }}
      >
        <div className="flex justify-center items-center gap-4">
          <Button variant="secondary" bold small onClick={close}>
            {cancelButtonText}
          </Button>
          <Button variant="primary" small onClick={handleConfirm} dataAutofocus>
            {confirmButtonText}
          </Button>
        </div>
      </Modal>

      {openModalButton && <span onClick={open}>{openModalButton}</span>}
    </>
  );
}
