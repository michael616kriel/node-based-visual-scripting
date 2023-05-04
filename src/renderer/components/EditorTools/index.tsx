import { ButtonGroup, IconButton } from '@chakra-ui/react';
import { FC, ReactNode } from 'react';
import { BsLayoutSidebar, BsLayoutSidebarReverse } from 'react-icons/bs';
import {
  FiPause,
  FiPlay,
  FiPlus,
  FiSave,
  FiSearch,
  FiServer,
  FiStopCircle,
} from 'react-icons/fi';
import { useProject } from 'renderer/contexts/project.context';

export const EditorTools: FC = () => {
  const { saveBlueprint } = useProject();
  const editorTools = [
    [
      {
        name: 'compile',
        icon: <BsLayoutSidebar />,
      },
      {
        name: 'compile',
        icon: <BsLayoutSidebarReverse />,
      },
    ],
    [
      {
        name: 'compile',
        icon: <FiPlay />,
      },
      {
        name: 'compile',
        icon: <FiPause />,
      },
      {
        name: 'compile',
        icon: <FiStopCircle />,
      },
    ],
    [
      {
        name: 'compile',
        icon: <FiPlus />,
      },
      {
        name: 'compile',
        icon: <FiServer />,
      },
      {
        name: 'compile',
        icon: <FiSearch />,
      },
    ],
    [
      {
        name: 'save',
        icon: <FiSave />,
      },
    ],
  ];

  return (
    <>
      {editorTools.map((toolset) => {
        return (
          <ButtonGroup isAttached mr={3}>
            {toolset.map((tool) => {
              return (
                <IconButton
                  colorScheme="gray"
                  color="gray.500"
                  variant="solid"
                  bg="gray.900"
                  size="sm"
                  icon={tool.icon}
                  aria-label={tool.name}
                  _hover={{
                    bg: 'gray.800',
                    color: 'blue.500',
                  }}
                  onClick={() => {
                    switch (tool.name) {
                      case 'save':
                        saveBlueprint();
                        break;
                      default:
                        break;
                    }
                  }}
                />
              );
            })}
          </ButtonGroup>
        );
      })}
    </>
  );
};
