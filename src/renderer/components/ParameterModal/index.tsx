import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { FC, useState } from 'react';

export const ParameterModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (paramter: { name: string; defaultValue: string }) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [value, setValue] = useState({
    name: '',
    defaultValue: '',
  });
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Parameter</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={3}>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              value={value.name}
              onChange={(event) => {
                setValue({
                  ...value,
                  name: event.target.value,
                });
              }}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Default value</FormLabel>
            <Input
              type="text"
              value={value.defaultValue}
              onChange={(event) => {
                setValue({
                  ...value,
                  defaultValue: event.target.value,
                });
              }}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" mr={3} onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={() => {
              onSubmit(value);
              onClose();
              setValue({
                name: '',
                defaultValue: '',
              });
            }}
          >
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
