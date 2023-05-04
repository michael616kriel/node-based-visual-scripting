import { Flex, Input, Text } from '@chakra-ui/react';
import { FC, useEffect, useState } from 'react';
import { Position } from '../Node';
import { useVisualScripting } from '../../contexts/visual-scripting.context';
import { createNode, eventSet, functionSet } from '../VisualScripting/data';
import { useContextMenu } from '../../contexts/context-menu.context';

export const ContextMenu: FC<{
  getMousePosition: (position: Position) => Position;
}> = ({ getMousePosition }) => {
  const {
    contextMenu: { isOpen, position },
    setContextMenu,
  } = useContextMenu();
  const { parameters, nodes, setNodes } = useVisualScripting();
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setValue('');
    }
  }, [isOpen]);

  const filteredParams = parameters.filter((param) => {
    if (value.length) {
      return param.key.toLowerCase().includes(value.toLowerCase());
    } else {
      return true;
    }
  });

  const filteredFunctions = functionSet.filter((func) => {
    if (value.length) {
      return func.name.toLowerCase().includes(value.toLowerCase());
    } else {
      return true;
    }
  });

  const filteredEvent = eventSet.filter((event) => {
    if (value.length) {
      return event.name.toLowerCase().includes(value.toLowerCase());
    }
    return true;
  });

  return (
    <>
      {isOpen ? (
        <Flex
          position="fixed"
          left={position.x}
          top={position.y}
          bg="gray.800"
          zIndex={1000}
          shadow="md"
          w={300}
          direction="column"
          borderRadius={3}
          overflow="hidden"
        >
          <Flex p={3} bg="gray.900" shadow="lg">
            <Input
              size="sm"
              placeholder="Search for nodes..."
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
              }}
            />
          </Flex>
          <Flex direction="column" maxH={200} overflowY="auto">
            <Flex py={1} px={3} bg="gray.900">
              <Text fontSize="sm" fontWeight="semibold" color="gray.500">
                Parameters
              </Text>
            </Flex>
            <Flex px={3} py={2} direction="column">
              {filteredParams.map((param) => (
                <Text
                  fontSize="xs"
                  color="gray.500"
                  _hover={{
                    color: 'blue.500',
                  }}
                  onClick={() => {
                    const relativePosition = getMousePosition(position);
                    const newNodes = [...nodes];
                    newNodes.push(
                      createNode(
                        param.key,
                        'variable',
                        relativePosition,
                        [],
                        [{ name: 'value' }]
                      )
                    );
                    setNodes(newNodes);
                    setContextMenu({
                      isOpen: false,
                      position: { x: 0, y: 0 },
                    });
                  }}
                >
                  {param.key}
                </Text>
              ))}
              {!filteredParams.length && (
                <Text fontSize="xs" color="gray.600">
                  no results for parameters...
                </Text>
              )}
            </Flex>
            <Flex py={1} px={3} bg="gray.900">
              <Text fontSize="sm" fontWeight="semibold" color="gray.500">
                Events
              </Text>
            </Flex>
            <Flex px={3} py={2} direction="column">
              {filteredEvent.map((event) => (
                <Text
                  fontSize="xs"
                  color="gray.500"
                  _hover={{
                    color: 'blue.500',
                  }}
                  onClick={() => {
                    const relativePosition = getMousePosition(position);
                    const newNodes = [...nodes];
                    const node = createNode(
                      event.name,
                      event.type,
                      relativePosition,
                      event.inputs,
                      event.outputs
                    );
                    newNodes.push(node);
                    setNodes(newNodes);
                    setContextMenu({
                      isOpen: false,
                      position: { x: 0, y: 0 },
                    });
                  }}
                >
                  {event.name}
                </Text>
              ))}
              {!filteredFunctions.length && (
                <Text fontSize="xs" color="gray.600">
                  no results for events...
                </Text>
              )}
            </Flex>
            <Flex py={1} px={3} bg="gray.900">
              <Text fontSize="sm" fontWeight="semibold" color="gray.500">
                Functions
              </Text>
            </Flex>
            <Flex px={3} py={2} direction="column">
              {filteredFunctions.map((func) => (
                <Text
                  fontSize="xs"
                  color="gray.500"
                  _hover={{
                    color: 'blue.500',
                  }}
                  onClick={() => {
                    const relativePosition = getMousePosition(position);
                    const newNodes = [...nodes];
                    const node = createNode(
                      func.name,
                      func.type,
                      relativePosition,
                      func.inputs,
                      func.outputs
                    );
                    newNodes.push(node);
                    setNodes(newNodes);
                    setContextMenu({
                      isOpen: false,
                      position: { x: 0, y: 0 },
                    });
                  }}
                >
                  {func.name}
                </Text>
              ))}
              {!filteredFunctions.length && (
                <Text fontSize="xs" color="gray.600">
                  no results for functions...
                </Text>
              )}
            </Flex>
          </Flex>
        </Flex>
      ) : null}
    </>
  );
};
