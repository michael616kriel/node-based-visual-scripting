import { Flex, Icon, VStack } from '@chakra-ui/react';
import { FC } from 'react';
import { FiGrid, FiHome, FiLayers } from 'react-icons/fi';

export const SidebarMenu: FC = () => {
  const menu = [
    {
      name: 'Home',
      icon: FiHome,
    },
    {
      name: 'Layers',
      icon: FiLayers,
    },
    {
      name: 'Grid',
      icon: FiGrid,
    },
  ];

  return (
    <VStack w="100%" pt={3}>
      {menu.map((item) => (
        <Flex
          justify="center"
          align="center"
          py={3}
          color="gray.500"
          _hover={{
            color: 'blue.500',
          }}
        >
          <Icon as={item.icon} />
        </Flex>
      ))}
    </VStack>
  );
};
