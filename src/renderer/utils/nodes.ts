import { omit } from 'lodash';
import { NodeConnection, NodeObject } from '../components/Node';
import { eventSet, functionSet } from '../components/VisualScripting/data';

export class NodeExecutor {
  nodes: NodeObject[];
  parameters: { key: string; value: string }[];
  constructor(
    nodes: NodeObject[],
    parameters: { key: string; value: string }[]
  ) {
    this.nodes = nodes;
    this.parameters = parameters;
  }

  // Sort a chain into a array of NodeObject's
  getNodeChain(entry: NodeObject, eventOnly: boolean = true) {
    let chain: NodeObject[] = [entry];
    for (let [from, to] of entry.connections.outputs) {
      if (
        (eventOnly &&
          from.parameterName === 'exec-event' &&
          to.parameterName === 'exec-event') ||
        (!eventOnly &&
          from.parameterName !== 'exec-event' &&
          to.parameterName !== 'exec-event')
      ) {
        const nextNode = this.findNodeById(to.id);
        if (nextNode) {
          const result = this.getNodeChain(nextNode, eventOnly);
          result.length && chain.push(...result);
        }
      }
    }
    return chain;
  }

  getEntryNodes() {
    return this.nodes.filter((node) => {
      return node.type === 'entry';
    });
  }

  findNodeById(id: string) {
    return this.nodes.find((node) => node.id === id);
  }

  filterEventConnections(
    [from, to]: NodeConnection[],
    onlyEvents: boolean = true
  ) {
    if (onlyEvents) {
      return (
        from.parameterName === 'exec-event' && to.parameterName === 'exec-event'
      );
    }
    return (
      from.parameterName !== 'exec-event' && to.parameterName !== 'exec-event'
    );
  }

  processChain(chains: NodeObject[], state: any) {
    for (let node of chains) {
      const func = (node.category === 'function' ? functionSet : eventSet).find(
        (func) => func.name === node.name
      );

      // If connected to a node that has been proccessed and has a result in the state
      const params = node.connections.inputs
        .filter((input) => this.filterEventConnections(input, false))
        .map(([from, to]) => {
          return state[from.id] && state[from.id][from.parameterName];
        });

      // Execute the node function and pass calculated values
      state[node.id] = func?.execute(...params);
    }
  }

  execute() {
    // Gets all entry nodes
    const entryEvents = this.getEntryNodes();
    const state: any = {};
    const variableNodes = this.nodes.filter((node) => node.type === 'variable');

    // Map any variable nodes into the state
    for (let variableNode of variableNodes) {
      // Set this variable nodes value
      state[variableNode.id] = {
        value: this.parameters.find((param) => param.key === variableNode.name)
          ?.value,
      };

      // process the variable node chain and store the results to state
      const variableChain = this.getNodeChain(variableNode, false).filter(
        (node) => node.type === 'pure-function'
      );
      this.processChain(variableChain, state);
    }

    if (entryEvents.length) {
      // process each chain
      entryEvents.forEach((node) => {
        const [entry, ...rest] = this.getNodeChain(node);
        const func = (
          entry.category === 'function' ? functionSet : eventSet
        ).find((func) => func.name === entry.name);
        if (func?.init) {
          // find input params
          const params = entry.connections.inputs
            .filter((input) => this.filterEventConnections(input, false))
            .map(([from, to]) => {
              return state[from.id] && state[from.id][from.parameterName];
            });

          // run function initializer
          func.init((args: any) => {
            state[entry.id] = func.execute(args);
            // this is what executes the rest of the chain connected to this entry node
            this.processChain(rest, state);
          }, ...params);
        }
      });
    }

    // console.log(state);
  }

  exportGraph() {
    return {
      nodes: this.nodes.map((node) => {
        let newNode: any = omit(node, ['x', 'y']);
        newNode.inputs = newNode.inputs.map((input: any) =>
          omit(input, ['x', 'y'])
        );
        newNode.outputs = newNode.inputs.map((output: any) =>
          omit(output, ['x', 'y'])
        );
        return newNode;
      }),
      parameters: this.parameters,
    };
  }
}
