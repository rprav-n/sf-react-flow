import React, { useCallback, useState } from 'react';
import Dagre from '@dagrejs/dagre';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ControlButton,
  Position,
  Panel,
  useReactFlow,
  ReactFlowProvider
} from 'reactflow';

import 'reactflow/dist/style.css';


const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'the integral, is the area under the graph of h(r) vs r' }, sourcePosition: 'right', targetPosition: 'left' },
  { id: '2', position: { x: 200, y: 0 }, data: { label: 'the line intersects at time B' }, sourcePosition: 'right', targetPosition: 'left', },
  { id: '3', position: { x: 400, y: 0 }, data: { label: 'the slopes are the same at time A' }, sourcePosition: 'right', targetPosition: 'left', },
];
const initialEdges = [
  { id: 'e1-2', type: 'bezier', source: '1', target: '2', },
  { id: 'e2-3', type: 'bezier', source: '2', target: '3', }
];

const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes, edges, options) => {
  g.setGraph({ rankdir: options.direction });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) => g.setNode(node.id, node));

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const { x, y } = g.node(node.id);

      return { ...node, position: { x, y } };
    }),
    edges,
  };
};


export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [fullsize, setFullsize] = useState(false);
  const [width, setWidth] = useState('800px');
  const [height, setHeight] = useState('400px');
  const { fitView } = useReactFlow();
  const [showControls, setShowControls] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);
  const [text, setText] = useState("");

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onLayout = useCallback(
    (direction) => {
      console.debug("nodes.length", nodes.length)
      const layouted = getLayoutedElements(nodes, edges, { direction });

      setNodes([...layouted.nodes]);
      setEdges([...layouted.edges]);

      window.requestAnimationFrame(() => {
        fitView();
      });
    },
    [nodes, edges]
  );


  const handleSize = () => {
    let val = !fullsize;
    setFullsize(val);

    if (val) {
      setWidth('100%');
      setHeight('100%');
    } else {
      setWidth('800px');
      setHeight('400px');
    }
  }

  const handleAddNode = (event) => {
    event.preventDefault();
    if (nodes && nodes.length) {
      let lastNode = nodes[nodes.length - 1];
      let newID = parseInt(lastNode.id, 10) + 1;
      let newNode = { id: `${newID}`, position: { x: lastNode.position.x + 100, y: 0 }, data: { label: text }, sourcePosition: 'right', targetPosition: 'left', }
      setNodes([
        ...nodes,
        newNode,
      ]);
      setText('');
    } else {
      let newNode = { id: `1`, position: { x: 0, y: 0 }, data: { label: text }, sourcePosition: 'right', targetPosition: 'left', }
      setNodes([
        ...nodes,
        newNode,
      ]);
      setText('');
    }
  }

  return (
    <div style={{ width: '99vw', height: '99vh', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem'
      }} >
        <small>Select a node or edge and press 'delete' to remove</small>
        <div>
          <label htmlFor="controls">Show Controls</label>
          <input type="checkbox" checked={showControls} id="controls" name='controls' onClick={() => setShowControls(!showControls)} />
        </div>
        <div>
          <label htmlFor="minimap">Show Minimap</label>
          <input type="checkbox" checked={showMinimap} id="minimap" name='minimap' onClick={() => setShowMinimap(!showMinimap)} />
        </div>
        <div>
          <form onSubmit={handleAddNode}>
            <input type="text" value={text} onChange={(e) => setText(e.target.value)} required placeholder='Type in your custom text' />
            <button type='submit'>Add node</button>
          </form>
        </div>
      </div>
      <div style={{ width: width, height: height, position: 'relative', border: '1px solid #999' }}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            defaultMarkerColor='#bb0000'
            connectionLineType='step'
            fitView={true}
            edgeTypes={"bezier"}
            proOptions={{
              hideAttribution: true
            }}
            deleteKeyCode={'Delete'}
          // connectionMode='loose'
          >
            <Panel position="top-right">
              <button onClick={() => onLayout('TB')}>vertical layout</button>
              <button onClick={() => onLayout('LR')}>horizontal layout</button>
            </Panel>
            {showControls ?
              <Controls>
                <ControlButton onClick={handleSize}>
                  <i className="fa-solid fa-arrows-up-down" style={{ transform: "rotate(45deg)" }}></i>
                </ControlButton>
              </Controls>
              : null}
            {showMinimap ? <MiniMap /> : null}
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  );
}