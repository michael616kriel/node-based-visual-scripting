import { Flex } from '@chakra-ui/react';
import { FC, ReactNode } from 'react';
import { useContextMenu } from 'renderer/contexts/context-menu.context';

export const Sidebar: FC<{ children: ReactNode | ReactNode[] }> = ({
  children,
}) => {
  const { setContextMenu } = useContextMenu();
  return (
    <Flex
      w="300px"
      h="100%"
      background="gray.800"
      shadow="xl"
      direction="column"
      maxH="100%"
      overflowY="auto"
      onContextMenu={() => {
        setContextMenu({
          isOpen: false,
          position: {
            x: 0,
            y: 0,
          },
        });
      }}
    >
      {children}
    </Flex>
  );
};
