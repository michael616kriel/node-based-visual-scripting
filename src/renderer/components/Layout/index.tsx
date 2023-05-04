import { Flex, Input, Text, useDisclosure } from '@chakra-ui/react';
import { FC, ReactNode, RefObject } from 'react';
import { FiPlus, FiSearch, FiTrash } from 'react-icons/fi';
import { useVisualScripting } from '../../contexts/visual-scripting.context';
import { DirectoryTree } from '../DirectoryTree';
import { EditorTools } from '../EditorTools';
import { JSONViewer } from '../JSONViewer';
import { ParameterModal } from '../ParameterModal';
import { Sidebar } from './Sidebar';
import { SidebarSection } from './SidebarSection';
import { SidebarMenu } from '../SidebarMenu';

export const Layout: FC<{
  children: ReactNode[];
  contentRef: RefObject<HTMLDivElement>;
}> = ({ children, contentRef }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { parameters, setParameters, nodes } = useVisualScripting();

  return (
    <Flex
      w="100%"
      h="100%"
      direction="row"
      background="gray.700"
      overflow="hidden"
    >
      <Flex
        w="80px"
        h="100%"
        zIndex={999}
        borderRight="1px solid"
        borderColor="blackAlpha.400"
        bg="gray.900"
      >
        <SidebarMenu />
      </Flex>
      <Sidebar>
        <DirectoryTree />
      </Sidebar>
      <Flex
        w="calc(100% - 680px)"
        h="100%"
        ref={contentRef}
        position="relative"
        overflow="auto"
      >
        <Flex
          position="fixed"
          bottom={0}
          left="50%"
          transform="translateX(-50%)"
          zIndex={99}
          p={3}
        >
          <EditorTools />
        </Flex>
        {children}
      </Flex>
      <Sidebar>
        <SidebarSection
          label="Parameters"
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
          onAction={(id) => {
            if (id === 'create') {
              onOpen();
            }
          }}
        >
          {!parameters.length && (
            <Text
              color="gray.500"
              w="100%"
              textAlign="center"
              fontSize="xs"
              p={3}
            >
              No parameters...
            </Text>
          )}
          {parameters.map((parameter, index) => (
            <Flex
              w="100%"
              px={2}
              py={1}
              direction="row"
              align="center"
              key={index}
            >
              <Text mr={3} fontSize={12} color="gray.300" w="80%">
                {parameter.key}
              </Text>
              <Input size="sm" value={parameter.value} />
            </Flex>
          ))}
        </SidebarSection>
        <SidebarSection label="Debug">
          <JSONViewer
            data={{
              parameters,
              nodes,
            }}
          />
        </SidebarSection>
      </Sidebar>
      <ParameterModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={(param) => {
          setParameters([
            ...parameters,
            { key: param.name, value: param.defaultValue },
          ]);
        }}
      />
    </Flex>
  );
};
