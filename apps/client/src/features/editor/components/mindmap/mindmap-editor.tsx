import { Graph, Shape } from "@antv/x6";
import { useState, useEffect, useRef } from "react";

interface MindMapEditorProps {
  data: any;
  onDataChange: (data: any) => void;
  readOnly?: boolean;
}

export function MindMapEditor({ data, onDataChange, readOnly = false }: MindMapEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const [mindMapData, setMindMapData] = useState<any>(data || { nodes: [], edges: [] });

  useEffect(() => {
    if (!containerRef.current) return;

    // 初始化X6.js图形
    const graph = new Graph({
      container: containerRef.current,
      width: "100%",
      height: "100%",
      background: {
        color: "#f5f5f5",
      },
      grid: {
        size: 10,
        visible: true,
        type: "dot",
      },
      panning: {
        enabled: true,
        modifiers: ["ctrl", "shift"],
      },
      mousewheel: {
        enabled: true,
        zoomAtMousePosition: true,
      },
      connecting: {
        snap: true,
        allowBlank: false,
        allowLoop: false,
        highlight: true,
        createEdge() {
          return new Shape.Edge({
            attrs: {
              line: {
                stroke: "#999",
                strokeWidth: 1,
              },
            },
          });
        },
      },
    });

    graphRef.current = graph;

    // 添加节点
    mindMapData.nodes.forEach((nodeData: any) => {
      graph.addNode({
        id: nodeData.id,
        x: nodeData.x || 0,
        y: nodeData.y || 0,
        width: 120,
        height: 40,
        label: nodeData.label,
        attrs: {
          body: {
            fill: "#fff",
            stroke: "#999",
            strokeWidth: 1,
          },
          label: {
            text: nodeData.label,
            fill: "#333",
            fontSize: 12,
            refX: "50%",
            refY: "50%",
            textAnchor: "middle",
            textVerticalAnchor: "middle",
          },
        },
      });
    });

    // 添加连接线
    mindMapData.edges.forEach((edge: any) => {
      graph.addEdge({
        source: edge.source,
        target: edge.target,
      });
    });

    // 监听节点变化
    graph.on("node:change", () => {
      if (readOnly) return;

      const updatedNodes = graph.getNodes().map((n: any) => ({
        id: n.id,
        label: n.getLabel(),
        x: n.getPosition().x,
        y: n.getPosition().y,
      }));

      const updatedEdges = graph.getEdges().map((e: any) => ({
        source: e.getSourceNode()?.id || "",
        target: e.getTargetNode()?.id || "",
      }));

      const updatedData = {
        nodes: updatedNodes,
        edges: updatedEdges,
      };

      setMindMapData(updatedData);
      onDataChange(updatedData);
    });

    return () => {
      graph.dispose();
    };
  }, [mindMapData, readOnly, onDataChange]);

  const addNode = () => {
    if (!graphRef.current || readOnly) return;

    const nodeId = `node-${Date.now()}`;
    graphRef.current.addNode({
      id: nodeId,
      x: 100,
      y: 100,
      width: 120,
      height: 40,
      label: "New Node",
      attrs: {
        body: {
          fill: "#fff",
          stroke: "#999",
          strokeWidth: 1,
        },
        label: {
          text: "New Node",
          fill: "#333",
          fontSize: 12,
          refX: "50%",
          refY: "50%",
          textAnchor: "middle",
          textVerticalAnchor: "middle",
        },
      },
    });
  };

  const deleteNode = () => {
    if (!graphRef.current || readOnly) return;
    const selectedNode = graphRef.current.getSelectedNodes()[0];
    if (selectedNode) {
      graphRef.current.removeCell(selectedNode);
    }
  };

  return (
    <div className="mindmap-editor">
      <div ref={containerRef} className="mindmap-container" style={{ height: "400px" }} />
      {!readOnly && (
        <div className="mindmap-controls">
          <button onClick={addNode}>Add Node</button>
          <button onClick={deleteNode}>Delete Node</button>
        </div>
      )}
    </div>
  );
}