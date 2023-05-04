import './index.css';
import { createRoot } from 'react-dom/client';
import {
  ChakraProvider,
  GlobalStyle,
  DarkMode,
  ColorModeScript,
} from '@chakra-ui/react';
import App from './App';
import { VisualScriptingProvider } from './contexts/visual-scripting.context';
import { ContextMenuProvider } from './contexts/context-menu.context';
import theme from './utils/theme';
import { ProjectProvider } from './contexts/project.context';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
  <ChakraProvider theme={theme}>
    <ColorModeScript initialColorMode="dark" />
    <DarkMode>
      <GlobalStyle />
      <VisualScriptingProvider>
        <ProjectProvider>
          <ContextMenuProvider>
            <App />
          </ContextMenuProvider>
        </ProjectProvider>
      </VisualScriptingProvider>
    </DarkMode>
  </ChakraProvider>
);
