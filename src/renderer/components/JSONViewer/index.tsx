import { Flex, theme } from '@chakra-ui/react';
import { FC } from 'react';
import { JSONTree } from 'react-json-tree';

const viewerTheme = {
  scheme: 'monokai',
  author: 'wimer hazenberg (http://www.monokai.nl)',
  base00: 'transparent',
  base01: '#383830',
  base02: '#49483e',
  base03: theme.colors.gray[500],
  base04: '#a59f85',
  base05: '#f8f8f2',
  base06: '#f5f4f1',
  base07: '#f9f8f5',
  base08: '#f92672',
  base09: theme.colors.orange[600],
  base0A: '#f4bf75',
  base0B: theme.colors.green[600],
  base0C: '#a1efe4',
  base0D: theme.colors.blue[600],
  base0E: theme.colors.purple[500],
  base0F: '#cc6633',
};

export const JSONViewer: FC<{ data: any }> = ({ data }) => {
  return (
    <Flex w='100%' fontSize={12}>
      <JSONTree data={data} theme={viewerTheme} invertTheme={false} />
    </Flex>
  );
};
