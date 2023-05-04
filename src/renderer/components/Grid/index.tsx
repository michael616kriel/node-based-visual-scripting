import { theme } from '@chakra-ui/react';
import { FC } from 'react';
import { Layer, Line } from 'react-konva';
export const gridSize = 12;
export const Grid: FC<{ width: number; height: number }> = ({
  width,
  height,
}) => {
  const renderGrid = () => {
    const count = width / gridSize;
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push(
        <Line
          points={[gridSize * i, 0, gridSize * i, height]}
          stroke={theme.colors.blackAlpha[300]}
          strokeWidth={1}
        />
      );
      items.push(
        <Line
          points={[0, gridSize * i, width, gridSize * i]}
          stroke={theme.colors.blackAlpha[300]}
          strokeWidth={1}
        />
      );
    }
    return items;
  };
  return <Layer>{renderGrid()}</Layer>;
};
