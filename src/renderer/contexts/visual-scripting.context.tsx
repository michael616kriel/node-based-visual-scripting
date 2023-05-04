import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react';
import { initialNodeDataset } from '../components/VisualScripting/data';
import { NodeObject } from '../components/Node';

export type KeyValuePair = {
  key: string;
  value: string;
};

export type VisualScriptingState = {
  nodes: NodeObject[];
  setNodes: Dispatch<SetStateAction<NodeObject[]>>;
  parameters: KeyValuePair[];
  setParameters: Dispatch<SetStateAction<KeyValuePair[]>>;
};

export const VisualScriptingConext = createContext<VisualScriptingState>({
  parameters: [],
  nodes: [],
  setNodes: () => {},
  setParameters: () => {},
});

const { Provider } = VisualScriptingConext;
export const VisualScriptingProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [nodes, setNodes] = useState<NodeObject[]>(initialNodeDataset);
  const [parameters, setParameters] = useState<KeyValuePair[]>([]);

  return (
    <Provider
      value={{
        nodes,
        setNodes,
        parameters,
        setParameters,
      }}
    >
      {children}
    </Provider>
  );
};

export const useVisualScripting = () => {
  return useContext(VisualScriptingConext);
};
