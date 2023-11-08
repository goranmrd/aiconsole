import { ReactNode, ReactElement } from 'react';
import { Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Button } from '../system/Button';
import { X } from 'lucide-react';

interface SettingsModalProps {
  children: ReactNode;
  openModalButton: ReactElement;
  title: string;
  onSubmit: () => void;
  onClose?: () => void;
}
export const SettingsModal = ({
  children,
  openModalButton,
  title,
  onSubmit,
  onClose,
}: SettingsModalProps) => {
  const [opened, { open, close }] = useDisclosure(false, {
    onClose,
  });

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        centered
        className="mantine-Modal-root"
        withCloseButton={false}
        padding={25}
        fullScreen
        styles={{
          header: {
            backgroundColor: '#111111',
            textAlign: 'center',
          },
          content: {
            backgroundColor: '#111111',
            color: '#fff',
          },
        }}
      >
        <div className="flex justify-between items-center px-[5px] pb-[26px] pt-[1px] ">
          <img
            src={`favicon.svg`}
            className="h-[48px] w-[48px] cursor-pointer filter"
          />
          <Button variant="secondary" onClick={close} small>
            <X />
            Close
          </Button>
        </div>
        <div className="h-[calc(100vh-100px)] max-w-[720px] mx-auto">
          <h3 className="uppercase p-[30px] text-gray-400 text-[14px] leading-[21px] text-center mb-[40px]">
            {title}
          </h3>
          {children}
          <div className="flex items-center justify-end gap-[10px] py-[60px] mt-[40px]">
            <Button variant="secondary" bold onClick={close}>
              Cancel
            </Button>
            <Button onClick={onSubmit}>Save</Button>
          </div>
        </div>
      </Modal>

      <span className="w-full" onClick={open}>
        {openModalButton}
      </span>
    </>
  );
};
