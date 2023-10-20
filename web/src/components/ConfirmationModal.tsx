import { useDisclosure } from '@mantine/hooks';
import { Modal } from '@mantine/core';
import { Button } from './Button';

interface ConfirmationModalProps {
  onConfirm: () => void;
  confirmButtonText?: string;
  cancelButtonText?: string;
  title: string;
  openModalButton: React.ReactElement;
}

export function ConfirmationModal({
  onConfirm,
  confirmButtonText = 'Submit',
  cancelButtonText = 'Cancel',
  title,
  openModalButton,
}: ConfirmationModalProps) {
  const [opened, { open, close }] = useDisclosure(false);

  const handleConfirm = () => {
    onConfirm();
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
          content: {
            backgroundColor: '#1a1a1a',
            color: '#fff',
          },
        }}
      >
        <div className="flex justify-center items-center gap-4">
          <Button variant="danger" label={cancelButtonText} onClick={close} />
          <Button onClick={handleConfirm} label={confirmButtonText} />
        </div>
      </Modal>

      <div onClick={open}>{openModalButton}</div>
    </>
  );
}
