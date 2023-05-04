import { theme, Flex } from '@chakra-ui/react';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { createRef, FC, useCallback, useEffect, useState } from 'react';
import { Circle, Layer, Shape, Stage } from 'react-konva';
import { ContextMenu } from '../ContextMenu';
import { useContextMenu } from '../../contexts/context-menu.context';
import { Grid } from '../Grid';
import { Layout } from '../Layout';
import {
  Node,
  NodeConnection,
  NodeObject,
  NodeParameterObject,
  Position,
} from '../Node';
import { useVisualScripting } from '../../contexts/visual-scripting.context';

const dimensions = {
  width: 2000,
  height: 1300,
};

const DEBUG_BEZIER = false;

export const VisualScripting: FC = () => {
  const contentRef = createRef<HTMLDivElement>();
  const canvasRef = createRef<Konva.Stage>();
  const { setContextMenu } = useContextMenu();
  const [selectedNode, setSelectedNode] = useState('');
  const { nodes, setNodes } = useVisualScripting();
  const [mousePosition, setMousePosition] = useState<Position>({
    x: 0,
    y: 0,
  });
  const [connector, setConnector] = useState<{
    from: (Position & { name: string; parent: string }) | null;
    to: Position | null;
  }>({
    from: null,
    to: null,
  });

  const getConnectorPoints = (from: any, to: any) => {
    return [from.x, from.y, to.x, to.y];
  };

  const onInputClick = useCallback(
    (parent: NodeObject, input: NodeParameterObject) => {
      if (connector.from) {
        const newNodes = [...nodes];
        const nodeIndex = newNodes.findIndex(
          (node) => node.id === connector.from?.parent
        );
        const nodeCurrentIndex = newNodes.findIndex(
          (node) => node.id === parent.id
        );
        const connectionSet: NodeConnection[] = [
          {
            id: connector.from.parent,
            type: 'output',
            parameterName: connector.from.name,
          },
          {
            id: parent.id,
            type: 'input',
            parameterName: input.name,
          },
        ];
        // Add the connection to both nodes
        newNodes[nodeIndex].connections.outputs.push(connectionSet);
        newNodes[nodeCurrentIndex].connections.inputs.push(connectionSet);
        setNodes(newNodes);
        setConnector({
          from: null,
          to: null,
        });
      }
    },
    [connector.from, nodes, setNodes]
  );

  const onOuputClick = useCallback(
    (parent: NodeObject, output: NodeParameterObject) => {
      if (!connector.from) {
        const node = nodes.find((item) => item.id === parent.id);
        const paramPosition = node?.outputs.find(
          (param) => param.name === output.name
        );
        if (paramPosition) {
          setConnector({
            from: {
              ...paramPosition,
              ...output,
              parent: parent.id,
            },
            to: null,
          });
        }
      }
    },
    [connector.from, nodes]
  );

  const onConnectionClick = useCallback(
    (nodeIndex: number, conectionIndex: number) => {
      // NOTE: Connections from outputs are used to map the connections visually but in the data
      // the connection is on both nodes and need to be remove from both
      const newNodes = [...nodes];

      // We already have access to the current out connection and node where it needs to be removed from
      const currentConnection =
        newNodes[nodeIndex].connections.outputs[conectionIndex];

      // Find the other node that this is connected to
      const otherConnection = currentConnection.find(
        (conn) => conn.id !== newNodes[nodeIndex].id // find the name of the other connection
      );
      const otherNodeIndex = newNodes.findIndex(
        (node) => node.id === otherConnection?.id // find the other node based on the connection name
      );
      const otherConnectionIndex = newNodes[
        otherNodeIndex
      ]?.connections.inputs.findIndex((conn) => {
        // TODO: this weird sorting might not be needed
        // the data strucuture should always have from and to in the correct order
        const [otherFrom, otherTo] = conn.sort((item) =>
          item.id === newNodes[nodeIndex].id ? 1 : 0
        );
        const [from, to] = currentConnection.sort((item) =>
          item.id === newNodes[nodeIndex].id ? 1 : 0
        );
        // TODO: FIX matching of connection arrays
        const nameMatch = otherFrom.id === from.id && otherTo.id === to.id;
        const paramMatch =
          otherFrom.parameterName === from.parameterName &&
          otherTo.parameterName === to.parameterName;
        const typeMatch =
          otherFrom.type === from.type && otherTo.type === to.type;
        return nameMatch && paramMatch && typeMatch;
      });

      // Remove the connection from the current nodes outputs
      newNodes[nodeIndex].connections.outputs.splice(conectionIndex, 1);

      // Remove the connection from the other nodes inputs
      newNodes[otherNodeIndex].connections.inputs.splice(
        otherConnectionIndex,
        1
      );
      setNodes(newNodes);
    },
    [nodes, setNodes]
  );

  const getPreviewConnectorPoints = useCallback(() => {
    return getConnectorPoints(connector.from, mousePosition);
  }, [connector, mousePosition]);

  const calculateBezierCurve = (from: Position, to: Position) => {
    let [x1, y1, x2, y2] = [
      from.x - (from.x - to.x) / 2,
      from.y,
      to.x + (from.x - to.x) / 2,
      to?.y,
    ];
    if (from.x > to.x) {
      x1 += from.x - to.x;
      x2 -= from.x - to.x;
      if (from.y > to.y || from.y < to.y) {
        y1 = to.y + (from.y - to.y) / 2;
        y2 = to.y + (from.y - to.y) / 2;
      }
    } else if (Math.abs(from.x - to.x) < 50) {
      // x1 = x1 - (from.x - to.x);
      // x2 = x2 + (from.x - to.x);
    }
    return [x1, y1, x2, y2];
  };

  const onNodeClick = useCallback(
    (nodeId: string) => {
      if (nodeId === selectedNode) {
        setSelectedNode('');
      } else {
        setSelectedNode(nodeId);
      }
    },
    [selectedNode]
  );

  const onWindowKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (selectedNode !== '' && event.code === 'Backspace') {
        let newNodes = [...nodes];
        const nodeIndex = newNodes.findIndex(
          (node) => node.id === selectedNode
        );
        // Remove all connections for this node if any
        const { id } = newNodes[nodeIndex];
        newNodes = newNodes
          .filter((node) => node.id !== selectedNode)
          .map((node) => {
            const inputs = node.connections.inputs.filter(([from, to]) => {
              return from.id !== id;
            });
            const outputs = node.connections.outputs.filter(([from, to]) => {
              return to.id !== id;
            });
            return {
              ...node,
              connections: {
                inputs,
                outputs,
              },
            };
          });
        // Add a filter that removes all connections from other node based on the current node id
        setNodes(newNodes.filter((node) => node.id !== selectedNode));
      }
    },
    [selectedNode, nodes, setNodes]
  );

  const onContextMenu = useCallback(
    (event: KonvaEventObject<PointerEvent>) => {
      event.evt.preventDefault();
      if (contentRef.current && canvasRef.current) {
        setContextMenu({
          isOpen: true,
          position: {
            x: event.evt.pageX - 15,
            y: event.evt.pageY - 15,
          },
        });
      }
    },
    [canvasRef, contentRef, setContextMenu]
  );

  useEffect(() => {
    const listener = onWindowKeyUp;
    if (selectedNode) {
      window.addEventListener('keyup', listener);
    }
    return () => {
      if (selectedNode) {
        window.removeEventListener('keyup', listener);
      }
    };
  }, [onWindowKeyUp, selectedNode]);

  return (
    <Layout contentRef={contentRef}>
      <ContextMenu
        getMousePosition={(position: Position) => {
          // Recalculate mouse position relative to scroll amount/position
          // This is to ensure that the nodes that are chosen from the context menu are placed in the correct position on the canvas
          let { x, y } = { x: 0, y: 0 };
          if (contentRef.current) {
            x = contentRef.current.scrollLeft - contentRef.current.offsetLeft;
            y = contentRef.current.scrollTop - contentRef.current.offsetTop;
          }
          return {
            x: position.x + x,
            y: position.y + y,
          };
        }}
      />
      <Flex position="fixed" bottom={0} right={300} p={3} zIndex={999}>
        <Flex bg="gray.700" borderRadius={6} shadow="lg" border="1px solid">
          <Stage
            width={dimensions.width / 10}
            height={dimensions.height / 10}
            scaleX={1 / 10}
            scaleY={1 / 10}
          >
            <Layer>
              {nodes.map((node, index) => {
                return (
                  <Node
                    onInputClick={() => {}}
                    onOuputClick={() => {}}
                    params={node}
                    onMove={() => {}}
                    isSelected={selectedNode === node.id}
                    onClick={() => {}}
                  />
                );
              })}
            </Layer>
            <Layer>
              {nodes.map((node, nodeIndex) => {
                return node.connections.outputs.map((conn, index) => {
                  if (!conn.length) {
                    return null;
                  }
                  const data = conn.map((item) => {
                    const currentNode = nodes.find((n) => n.id === item.id);
                    if (currentNode) {
                      const params =
                        item.type === 'input'
                          ? currentNode.inputs
                          : currentNode.outputs;
                      const paramObject = params.find(
                        (n) => n.name === item.parameterName
                      );
                      return paramObject;
                    }
                    return null;
                  });
                  const [from, to] = data;
                  const isEventConnection =
                    from?.type === 'exec-event' || to?.type === 'exec-event';
                  const bezier = calculateBezierCurve(
                    from as Position,
                    to as Position
                  );
                  return (
                    <>
                      <Shape
                        stroke={
                          isEventConnection
                            ? theme.colors.teal[500]
                            : theme.colors.purple[500]
                        }
                        strokeWidth={3}
                        sceneFunc={(ctx, shape) => {
                          if (from && to) {
                            ctx.beginPath();
                            ctx.moveTo(from?.x, from?.y);
                            ctx.bezierCurveTo(
                              // @ts-ignore
                              ...bezier,
                              to?.x,
                              to?.y
                            );
                            ctx.fillStrokeShape(shape);
                          }
                        }}
                      />
                    </>
                  );
                });
              })}
              {connector.from !== null && (
                <Shape
                  stroke={theme.colors.blue[500]}
                  strokeWidth={3}
                  sceneFunc={(ctx, shape) => {
                    const [x1, y1, x2, y2] = getPreviewConnectorPoints();
                    const [from, to] = [
                      {
                        x: x1,
                        y: y1,
                      },
                      {
                        x: x2,
                        y: y2,
                      },
                    ];
                    const bezier = calculateBezierCurve(
                      from as Position,
                      to as Position
                    );
                    ctx.beginPath();
                    ctx.moveTo(from?.x, from?.y);
                    ctx.bezierCurveTo(
                      // @ts-ignore
                      ...bezier,
                      to?.x,
                      to?.y
                    );
                    ctx.fillStrokeShape(shape);
                  }}
                />
              )}
            </Layer>
          </Stage>
        </Flex>
      </Flex>
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        ref={canvasRef}
        onMouseMove={(e) => {
          const target = (e.currentTarget as Konva.Stage).pointerPos;
          setMousePosition({
            x: target?.x || 0,
            y: target?.y || 0,
          });
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            if (connector.from) {
              setConnector({
                from: null,
                to: null,
              });
            }
            setContextMenu({
              isOpen: false,
              position: {
                x: 0,
                y: 0,
              },
            });
            setSelectedNode('');
          }
        }}
        onContextMenu={onContextMenu}
      >
        <Grid width={dimensions.width} height={dimensions.height} />
        {/* RENDER CONNECTIONS */}
        <Layer>
          {nodes.map((node, nodeIndex) => {
            return node.connections.outputs.map((conn, index) => {
              if (!conn.length) {
                return null;
              }
              const data = conn.map((item) => {
                const currentNode = nodes.find((n) => n.id === item.id);
                if (currentNode) {
                  const params =
                    item.type === 'input'
                      ? currentNode.inputs
                      : currentNode.outputs;
                  const paramObject = params.find(
                    (n) => n.name === item.parameterName
                  );
                  return paramObject;
                }
                return null;
              });
              const [from, to] = data;
              const isEventConnection =
                from?.type === 'exec-event' || to?.type === 'exec-event';
              const bezier = calculateBezierCurve(
                from as Position,
                to as Position
              );
              return (
                <>
                  <Shape
                    stroke={
                      isEventConnection
                        ? theme.colors.teal[500]
                        : theme.colors.purple[500]
                    }
                    strokeWidth={3}
                    onClick={() => onConnectionClick(nodeIndex, index)}
                    sceneFunc={(ctx, shape) => {
                      if (from && to) {
                        ctx.beginPath();
                        ctx.moveTo(from?.x, from?.y);
                        ctx.bezierCurveTo(
                          // @ts-ignore
                          ...bezier,
                          to?.x,
                          to?.y
                        );
                        ctx.fillStrokeShape(shape);
                      }
                    }}
                  />
                  {DEBUG_BEZIER && (
                    <>
                      <Circle
                        x={bezier[0]}
                        y={bezier[1]}
                        width={10}
                        height={10}
                        fill="red"
                      />
                      <Circle
                        x={bezier[2]}
                        y={bezier[3]}
                        width={10}
                        height={10}
                        fill="red"
                      />
                    </>
                  )}
                </>
              );
            });
          })}
          {connector.from !== null && (
            <Shape
              stroke={theme.colors.blue[500]}
              strokeWidth={3}
              sceneFunc={(ctx, shape) => {
                const [x1, y1, x2, y2] = getPreviewConnectorPoints();
                const [from, to] = [
                  {
                    x: x1,
                    y: y1,
                  },
                  {
                    x: x2,
                    y: y2,
                  },
                ];
                const bezier = calculateBezierCurve(
                  from as Position,
                  to as Position
                );
                ctx.beginPath();
                ctx.moveTo(from?.x, from?.y);
                ctx.bezierCurveTo(
                  // @ts-ignore
                  ...bezier,
                  to?.x,
                  to?.y
                );
                ctx.fillStrokeShape(shape);
              }}
            />
          )}
        </Layer>
        {/* RENDER NODES */}
        <Layer>
          {nodes.map((node, index) => {
            return (
              <Node
                onInputClick={onInputClick}
                onOuputClick={onOuputClick}
                params={node}
                onMove={(nodeObject) => {
                  const newNodes = [...nodes];
                  newNodes[index] = nodeObject;
                  setNodes(newNodes);
                }}
                isSelected={selectedNode === node.id}
                onClick={onNodeClick}
              />
            );
          })}
        </Layer>
      </Stage>
    </Layout>
  );
};
