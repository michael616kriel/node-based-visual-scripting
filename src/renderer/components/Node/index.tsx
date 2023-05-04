import { theme } from '@chakra-ui/react';
import { FC } from 'react';
import { Circle, Group, Rect, Text } from 'react-konva';

export type NodeType =
  | 'function'
  | 'variable'
  | 'pure-function'
  | 'entry'
  | 'return';

export type FunctionType = {
  name: string;
  type: NodeType;
  execute: Function;
  init?: Function;
  inputs: { name: string }[];
  outputs: { name: string }[];
};

export type Position = {
  x: number;
  y: number;
};

export type NodeParameterObject = Position & {
  name: string;
  type: 'exec-event' | 'variable';
};

export type NodeConnection = {
  id: string;
  type: 'input' | 'output';
  parameterName: string;
};

export type NodeObject = Position & {
  name: string;
  id: string;
  category: 'event' | 'function'; // dictates which function set it should use from the dataset
  type: NodeType;
  inputs: NodeParameterObject[];
  outputs: NodeParameterObject[];
  connections: {
    // [key: string]: NodeConnection[][]; // should only be 'inputs' | 'outputs'
    inputs: NodeConnection[][];
    outputs: NodeConnection[][];
  };
};

const parameterTop = 10;
const parameterSize = 11;
const parameterSpacing = 5;
const rect = { w: 200 };

export const calculateParameterPosition = (
  parentPosition: Position,
  type: 'input' | 'output',
  index: number
) => {
  const positionY =
    (parameterSize + parameterSpacing) * index +
    parameterSize / 2 +
    parameterTop;
  if (type === 'input') {
    return {
      x: parentPosition.x,
      y: positionY + parentPosition.y,
    };
  } else {
    return {
      x: rect.w + parentPosition.x,
      y: positionY + parentPosition.y,
    };
  }
};

export const Node: FC<{
  isSelected: boolean;
  onClick: (id: string) => void;
  params: NodeObject;
  onInputClick: (parent: NodeObject, input: NodeParameterObject) => void;
  onOuputClick: (parent: NodeObject, output: NodeParameterObject) => void;
  onMove: (obj: NodeObject) => void;
}> = ({ params, onInputClick, onOuputClick, onMove, isSelected, onClick }) => {
  const paramCount =
    params.inputs.length > params.outputs.length
      ? params.inputs.length
      : params.outputs.length;
  const height =
    (parameterSize + parameterSpacing) * paramCount +
    parameterSize / 2 +
    parameterTop;
  return (
    <Group
      x={params.x}
      y={params.y}
      draggable
      onDragMove={(event) => {
        const { x, y } = event.target.attrs;
        onMove({
          ...params,
          x,
          y,
          inputs: params.inputs.map((input, index) => {
            return {
              ...input,
              ...calculateParameterPosition({ x, y }, 'input', index),
            };
          }),
          outputs: params.outputs.map((output, index) => {
            return {
              ...output,
              ...calculateParameterPosition({ x, y }, 'output', index),
            };
          }),
          connections: params.connections,
        });
      }}
    >
      <Rect
        x={0}
        y={0}
        width={rect.w}
        height={height}
        cornerRadius={3}
        stroke={isSelected ? theme.colors.green[500] : theme.colors.gray[800]}
        strokeWidth={1}
        fillLinearGradientStartPoint={{ x: 0, y: -30 }}
        fillLinearGradientEndPoint={{ x: 0, y: 30 }}
        fillLinearGradientColorStops={[
          0,
          params.type === 'variable'
            ? theme.colors.green[900]
            : theme.colors.blue[900],
          1,
          theme.colors.gray[800],
        ]}
        onClick={() => {
          onClick(params.id);
        }}
      />
      <Text
        y={10}
        x={0}
        width={rect.w}
        text={params.name}
        fill={theme.colors.gray[500]}
        fontSize={11}
        fontFamily="Arial"
        align="center"
        fontStyle="bold"
        onClick={() => {
          onClick(params.id);
        }}
      />
      <Group x={0} y={0}>
        {params.inputs.map((input, index) => {
          return (
            <>
              {input.type !== 'exec-event' && (
                <>
                  <Circle
                    y={
                      (parameterSize + parameterSpacing) * index +
                      parameterSize / 2 +
                      parameterTop
                    }
                    width={parameterSize}
                    height={parameterSize}
                    fill={theme.colors.purple[500]}
                    x={0}
                    name={input.name}
                    onClick={() => onInputClick(params, input)}
                  />
                  <Text
                    y={
                      (parameterSize + parameterSpacing) * index + parameterTop
                    }
                    x={parameterSize}
                    text={input.name}
                    fill={theme.colors.gray[500]}
                    fontSize={10}
                    fontFamily="Arial"
                    fontStyle="normal"
                  />
                </>
              )}
              {input.type === 'exec-event' && (
                <Rect
                  y={
                    (parameterSize + parameterSpacing) * index +
                    parameterSize / 2 +
                    parameterTop -
                    parameterSize / 2
                  }
                  width={parameterSize}
                  cornerRadius={3}
                  height={parameterSize}
                  x={-parameterSize / 2}
                  fill={theme.colors.teal[500]}
                  onClick={() => onInputClick(params, input)}
                />
              )}
            </>
          );
        })}
      </Group>
      <Group x={rect.w} y={0}>
        {params.outputs.map((output, index) => {
          return (
            <>
              {output.type !== 'exec-event' && (
                <>
                  <Text
                    y={
                      (parameterSize + parameterSpacing) * index + parameterTop
                    }
                    x={-80 - parameterSize}
                    text={output.name}
                    fill={theme.colors.gray[500]}
                    fontSize={10}
                    width={80}
                    align="right"
                    fontFamily="Arial"
                    fontStyle="normal"
                  />
                  <Circle
                    y={
                      (parameterSize + parameterSpacing) * index +
                      parameterSize / 2 +
                      parameterTop
                    }
                    width={parameterSize}
                    height={parameterSize}
                    fill={theme.colors.purple[500]}
                    x={0}
                    name={output.name}
                    onClick={() => onOuputClick(params, output)}
                  />
                </>
              )}
              {output.type === 'exec-event' && (
                <Rect
                  y={
                    (parameterSize + parameterSpacing) * index +
                    parameterSize / 2 +
                    parameterTop -
                    parameterSize / 2
                  }
                  width={parameterSize}
                  cornerRadius={3}
                  height={parameterSize}
                  x={-parameterSize / 2}
                  fill={theme.colors.teal[500]}
                  onClick={() => onOuputClick(params, output)}
                />
              )}
            </>
          );
        })}
      </Group>
    </Group>
  );
};
