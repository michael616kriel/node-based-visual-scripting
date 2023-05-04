import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { NodeObject } from 'renderer/components/Node';
import { useVisualScripting } from './visual-scripting.context';

export type Directory = {
  name: string;
  path: string;
  isDirectory: boolean;
  children: Directory[];
};

export type Contents = {
  path: string;
  contents: any;
};

export type ProjectState = {
  directory: Directory;
  setDirectory: Dispatch<SetStateAction<Directory>>;
  selectedBlueprint: string | null;
  setSelectedBlueprint: Dispatch<SetStateAction<string | null>>;
  readBlueprint: (filePath: string) => void;
  removeBlueprint: (filePath: string) => void;
  saveBlueprint: () => void;
  createBlueprint: (path: string, name: string) => void;
};

export const ProjectConext = createContext<ProjectState>({
  directory: {} as Directory,
  setDirectory: () => {},
  selectedBlueprint: '',
  setSelectedBlueprint: () => {},
  readBlueprint: () => {},
  removeBlueprint: () => {},
  saveBlueprint: () => {},
  createBlueprint: () => {},
});

const { ipcRenderer } = window.electron;

const { Provider } = ProjectConext;
export const ProjectProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedBlueprint, setSelectedBlueprint] = useState<string | null>(
    null
  );
  const [directory, setDirectory] = useState<Directory>({
    name: '',
    path: '',
    isDirectory: true,
    children: [],
  });
  const { setNodes, nodes } = useVisualScripting();

  useEffect(() => {
    ipcRenderer.on('get-project-directory', (result: string) => {
      setDirectory(JSON.parse(result));
    });
    ipcRenderer.on('get-file-contents', (result: Contents) => {
      setNodes(JSON.parse(result.contents) as NodeObject[]);
    });
    ipcRenderer.sendMessage('get-project-directory', ['ping']);
  }, []);

  const createBlueprint = (path: string, name: string) => {
    ipcRenderer.sendMessage('create-blueprint', { path, name });
  };

  const readBlueprint = useCallback((filePath: string) => {
    setSelectedBlueprint(filePath);
    ipcRenderer.sendMessage('get-file-contents', filePath);
  }, []);

  const removeBlueprint = (filePath: string) => {
    ipcRenderer.sendMessage('get-file-contents', filePath);
  };

  const saveBlueprint = useCallback(() => {
    if (selectedBlueprint) {
      ipcRenderer.sendMessage('update-blueprint', {
        path: selectedBlueprint,
        content: JSON.stringify(nodes, null, 2),
      });
    }
  }, [nodes, selectedBlueprint]);

  return (
    <Provider
      value={{
        directory,
        setDirectory,
        readBlueprint,
        removeBlueprint,
        saveBlueprint,
        createBlueprint,
        selectedBlueprint,
        setSelectedBlueprint,
      }}
    >
      {children}
    </Provider>
  );
};

export const useProject = () => {
  return useContext(ProjectConext);
};
