import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react';
import { Position } from '../components/Node';

export type ContextMenuState = {
  contextMenu: { isOpen: boolean; position: Position };
  setContextMenu: Dispatch<
    SetStateAction<{
      isOpen: boolean;
      position: Position;
    }>
  >;
};

export const ContextMenuConext = createContext<ContextMenuState>({
  contextMenu: {
    isOpen: false,
    position: { x: 0, y: 0 },
  },
  setContextMenu: () => {},
});

const { Provider } = ContextMenuConext;
export const ContextMenuProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 } as Position,
  });

  return (
    <Provider
      value={{
        contextMenu,
        setContextMenu,
      }}
    >
      {children}
    </Provider>
  );
};

export const useContextMenu = () => {
  return useContext(ContextMenuConext);
};
