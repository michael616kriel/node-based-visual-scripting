import { ButtonGroup, Flex, IconButton, Text } from '@chakra-ui/react';
import { FC, ReactElement, ReactNode } from 'react';

export const SidebarSection: FC<{
  children: ReactNode | ReactNode[];
  label: string;
  actions?: { icon: ReactElement; id: string }[];
  onAction?: (id: string) => void;
}> = ({ children, label, actions, onAction }) => {
  return (
    <>
      <Flex w="100%" p={2} px={3} bg="gray.900" direction="row" align="center">
        <Text fontSize="sm" fontWeight="semibold" color="gray.300" w="full">
          {label}
        </Text>
        {actions?.length && (
          <ButtonGroup size="xs" colorScheme="gray" isAttached variant="ghost">
            {actions.map(({ icon, id }) => (
              <IconButton
                icon={icon}
                aria-label={id}
                onClick={() => onAction && onAction(id)}
              />
            ))}
          </ButtonGroup>
        )}
      </Flex>
      <Flex direction="column" px={2}>
        {children}
      </Flex>
    </>
  );
};
