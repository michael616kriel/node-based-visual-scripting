import {
  Flex,
  Icon,
  Text,
  Input,
  Button,
  ButtonGroup,
  IconButton,
} from '@chakra-ui/react';
import { FC, useCallback, useState } from 'react';
import {
  FiCheck,
  FiFile,
  FiFolder,
  FiPlus,
  FiSearch,
  FiTrash,
  FiX,
} from 'react-icons/fi';
import { Directory, useProject } from 'renderer/contexts/project.context';
import { SearchInput } from '../SearchInput';
import { SidebarSection } from '../Layout/SidebarSection';

export const DirectoryTree: FC = () => {
  const {
    directory,
    readBlueprint,
    createBlueprint,
    selectedBlueprint,
    setSelectedBlueprint,
  } = useProject();
  const [actionState, setActionState] = useState({
    creating: false,
    searching: false,
    value: '',
  });

  const [selectedDirectory, setSelectedDirectory] = useState<string | null>(
    null
  );

  const clearActionState = useCallback(() => {
    setActionState({
      value: '',
      creating: false,
      searching: false,
    });
  }, []);

  const createFile = useCallback(() => {
    if (selectedDirectory) {
      createBlueprint(selectedDirectory, actionState.value);
      clearActionState();
    }
  }, [selectedDirectory, createBlueprint, clearActionState, actionState]);

  const getItemColor = (item: Directory) => {
    if (selectedDirectory === item.path) {
      return 'green.500';
    }
    if (selectedBlueprint === item.path) {
      return 'green.500';
    }
    return 'gray.500';
  };

  const renderDirectory = useCallback(
    (dir: Directory) => {
      return dir.children.map((item, index) => (
        <Flex direction="column">
          <Flex direction="row" py={1} align="center">
            <Icon
              as={item.isDirectory ? FiFolder : FiFile}
              mr={1}
              color={getItemColor(item)}
              fontSize="xs"
            />
            <Text
              fontSize="xs"
              color={getItemColor(item)}
              _hover={{
                color:
                  selectedDirectory === item.path ? 'green.500' : 'blue.500',
              }}
              fontWeight={item.isDirectory ? 'semibold' : 'normal'}
              onClick={() => {
                if (!item.isDirectory) {
                  readBlueprint(item.path);
                } else {
                  setSelectedDirectory(item.path);
                }
              }}
            >
              {item.name}
            </Text>
          </Flex>
          {selectedDirectory === item.path && actionState.creating && (
            <Flex direction="row" py={1} align="center">
              <Icon as={FiFile} mr={1} color="gray.500" fontSize="xs" />
              <Input
                size="xs"
                onChange={(event) => {
                  setActionState({
                    ...actionState,
                    value: event.target.value,
                  });
                }}
                color="gray.500"
                mr={2}
              />
              <ButtonGroup isAttached>
                <IconButton
                  size="xs"
                  icon={<FiCheck />}
                  aria-label="Confirm"
                  variant="ghost"
                  onClick={createFile}
                />
                <IconButton
                  size="xs"
                  icon={<FiX />}
                  aria-label="Confirm"
                  variant="ghost"
                  onClick={clearActionState}
                />
              </ButtonGroup>
            </Flex>
          )}
          <Flex direction="column" pl={2}>
            {renderDirectory(item)}
          </Flex>
        </Flex>
      ));
    },
    [
      readBlueprint,
      selectedDirectory,
      clearActionState,
      actionState,
      createFile,
    ]
  );

  return (
    <SidebarSection
      label="Blueprints"
      actions={[
        {
          id: 'create',
          icon: <FiPlus />,
        },
        {
          id: 'remove',
          icon: <FiTrash />,
        },
        {
          id: 'search',
          icon: <FiSearch />,
        },
      ]}
      onAction={(action) => {
        switch (action) {
          case 'create':
            setActionState({
              ...actionState,
              creating: true,
              searching: false,
            });
            break;
          case 'search':
            setActionState({
              ...actionState,
              creating: false,
              searching: true,
            });
            break;
          case 'remove':
            break;
          default:
            break;
        }
      }}
    >
      {actionState.searching && (
        <Flex py={2}>
          <SearchInput />
        </Flex>
      )}
      {renderDirectory(directory)}
    </SidebarSection>
  );
};
