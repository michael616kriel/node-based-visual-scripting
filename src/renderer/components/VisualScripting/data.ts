import {
  calculateParameterPosition,
  FunctionType,
  NodeObject,
  Position,
} from '../Node';
import { v4 as uuidv4 } from 'uuid';

export const createNode = (
  name: string,
  type: 'variable' | 'function' | 'pure-function' | 'entry' | 'return',
  position: Position,
  inputs: { name: string }[],
  outputs: { name: string }[]
) => {
  return {
    name,
    type,
    id: uuidv4(),
    ...position,
    category: type === 'entry' ? 'event' : 'function',
    inputs: [
      ...(['function', 'return'].includes(type)
        ? [
            {
              name: 'exec-event',
              type: 'exec-event',
              ...calculateParameterPosition(position, 'input', 0),
            },
          ]
        : []),
      ...inputs.map((input, index) => ({
        name: input.name,
        type: 'variable',
        ...calculateParameterPosition(
          position,
          'input',
          index + (['entry', 'function', 'return'].includes(type) ? 1 : 0)
        ),
      })),
    ],
    outputs:
      type === 'return'
        ? []
        : [
            ...(['return', 'function', 'entry'].includes(type)
              ? [
                  {
                    name: 'exec-event',
                    type: 'exec-event',
                    ...calculateParameterPosition(position, 'output', 0),
                  },
                ]
              : []),
            ...outputs.map((output, index) => ({
              name: output.name,
              type: 'variable',
              ...calculateParameterPosition(
                position,
                'output',
                index + (['return', 'function', 'entry'].includes(type) ? 1 : 0)
              ),
            })),
          ],
    connections: {
      inputs: [],
      outputs: [],
    },
  } as NodeObject;
};

export const initialNodeDataset: NodeObject[] = [] as NodeObject[];

export const eventSet: FunctionType[] = [
  {
    name: 'On load',
    type: 'entry',
    init: (execute: any) => {
      window.addEventListener('load', execute);
    },
    execute: (event: any) => {
      return {
        result: event,
      };
    },
    inputs: [],
    outputs: [{ name: 'result' }],
  },
  {
    name: 'OnClick',
    type: 'entry',
    init: (execute: any, target: any) => {
      const elem = document.querySelector(target)
      elem.addEventListener('click', execute);
    },
    execute: (event: any) => {
      return {
        result: event,
      };
    },
    inputs: [{ name: 'target' }],
    outputs: [{ name: 'result' }],
  },
  {
    name: 'GET',
    type: 'entry',
    init: (execute: any, endpoint: any) => {
      const express = {
        get: (tar:any, exec:any) => {
          exec(tar)
        }
      }
      express.get(endpoint, execute);
    },
    execute: (event: any) => {
      return {
        result: event,
      };
    },
    inputs: [{ name: 'endpoint' }],
    outputs: [{ name: 'result' }],
  },
];

export const functionSet: FunctionType[] = [
  {
    name: 'Destruct Event',
    type: 'function',
    execute: (event: any) => {
      return {
        target: event.target,
        ...event.target
      };
    },
    inputs: [{ name: 'event' }],
    outputs: [
      { name: 'target' },
      { name: 'clientX' },
      { name: 'clientY' },
      { name: 'movementX' },
      { name: 'movementY' },
      { name: 'offsetX' },
      { name: 'offsetY' },
      { name: 'pageX' },
      { name: 'pageY' },
    ],
  },
  {
    name: 'Console log',
    type: 'function',
    execute: (data: any) => {
      console.log(data);
    },
    inputs: [{ name: 'data' }],
    outputs: [],
  },
];
