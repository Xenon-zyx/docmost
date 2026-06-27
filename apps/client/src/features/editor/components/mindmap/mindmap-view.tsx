import { NodeViewProps } from "@tiptap/core";
import { Graph, Shape } from "@antv/x6";
import { useState, useEffect, useRef, useCallback } from "react";
import { ActionIcon, Tooltip, TextInput, Group } from "@mantine/core";
import {
  IconPlus,
  IconTrash,
  IconSitemap,
  IconZoomIn,
  IconZoomOut,
  IconZoomReset,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

interface MindMapNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface MindMapEdge {
  source: string;
  target: string;
}

interface MindMapData {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
}

const generateId = () =>
  `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export function MindMapView(props: NodeViewProps) {
  const { node, updateAttributes, editor } = props;
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [isEditable, setIsEditable] = useState(editor.isEditable);
  const isUpdatingRef = useRef(false);

  const parseMindMapData = useCallback((dataStr: string): MindMapData => {
    try {
      const data = JSON.parse(dataStr || "{}");
      if (!data.nodes || !Array.isArray(data.nodes)) {
        return {
          nodes: [{ id: "root", label: "Central Topic", x: 300, y: 180 }],
          edges: [],
        };
      }
      return data;
    } catch (error) {
      return {
        nodes: [{ id: "root", label: "Central Topic", x: 300, y: 180 }],
        edges: [],
      };
    }
  }, []);

  const saveGraphData = useCallback(() => {
    if (!graphRef.current || isUpdatingRef.current) return;

    const graph = graphRef.current;
    const nodes = graph.getNodes().map((n: any) => ({
      id: n.id,
      label: n.getData()?.label || "",
      x: n.getPosition().x,
      y: n.getPosition().y,
    }));

    const edges = graph.getEdges().map((e: any) => ({
      source: e.getSourceCellId(),
      target: e.getTargetCellId(),
    }));

    const updatedData: MindMapData = { nodes, edges };
    isUpdatingRef.current = true;
    updateAttributes({
      data: JSON.stringify(updatedData),
    });
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 0);
  }, [updateAttributes]);

  useEffect(() => {
    setIsEditable(editor.isEditable);
  }, [editor.isEditable]);

  useEffect(() => {
    if (!containerRef.current) return;

    const mindMapData = parseMindMapData(node.attrs.data);

    const graph = new Graph({
      container: containerRef.current,
      background: {
        color: "#fafafa",
      },
      grid: {
        size: 10,
        visible: true,
        type: "dot",
        args: {
          color: "#e0e0e0",
          thickness: 1,
        },
      },
      panning: {
        enabled: true,
        modifiers: ["shift"],
      },
      mousewheel: {
        enabled: true,
        zoomAtMousePosition: true,
        modifiers: "ctrl",
        minScale: 0.5,
        maxScale: 2,
      },
      connecting: {
        router: "manhattan",
        connector: {
          name: "rounded",
          args: {
            radius: 8,
          },
        },
        anchor: "center",
        connectionPoint: "anchor",
        allowBlank: false,
        allowLoop: false,
        highlight: true,
        snap: {
          radius: 20,
        },
        createEdge() {
          return new Shape.Edge({
            attrs: {
              line: {
                stroke: "#5F95FF",
                strokeWidth: 2,
                targetMarker: {
                  name: "classic",
                  size: 6,
                },
              },
            },
            zIndex: 0,
          });
        },
        validateConnection({ targetMagnet }) {
          return !!targetMagnet;
        },
      },
      highlighting: {
        magnetAdsorbed: {
          name: "stroke",
          args: {
            recurse: true,
            attrs: {
              fill: "#5F95FF",
              stroke: "#5F95FF",
            },
          },
        },
      },
      interacting: {
        nodeMovable: isEditable,
        edgeMovable: false,
        edgeLabelMovable: false,
        magnetConnectable: isEditable,
      },
    });

    graphRef.current = graph;

    mindMapData.nodes.forEach((nodeData) => {
      graph.addNode({
        id: nodeData.id,
        x: nodeData.x,
        y: nodeData.y,
        width: 140,
        height: 44,
        label: nodeData.label,
        data: { label: nodeData.label },
        attrs: {
          body: {
            fill: nodeData.id === "root" ? "#5F95FF" : "#ffffff",
            stroke: nodeData.id === "root" ? "#5F95FF" : "#d0d0d0",
            strokeWidth: 1.5,
            rx: 8,
            ry: 8,
          },
          label: {
            text: nodeData.label,
            fill: nodeData.id === "root" ? "#ffffff" : "#333333",
            fontSize: 13,
            fontWeight: nodeData.id === "root" ? 600 : 400,
            refX: "50%",
            refY: "50%",
            textAnchor: "middle",
            textVerticalAnchor: "middle",
          },
        },
        ports: {
          groups: {
            top: {
              position: "top",
              attrs: {
                circle: {
                  r: 4,
                  magnet: true,
                  stroke: "#5F95FF",
                  strokeWidth: 1,
                  fill: "#fff",
                  style: {
                    visibility: "hidden",
                  },
                },
              },
            },
            right: {
              position: "right",
              attrs: {
                circle: {
                  r: 4,
                  magnet: true,
                  stroke: "#5F95FF",
                  strokeWidth: 1,
                  fill: "#fff",
                  style: {
                    visibility: "hidden",
                  },
                },
              },
            },
            bottom: {
              position: "bottom",
              attrs: {
                circle: {
                  r: 4,
                  magnet: true,
                  stroke: "#5F95FF",
                  strokeWidth: 1,
                  fill: "#fff",
                  style: {
                    visibility: "hidden",
                  },
                },
              },
            },
            left: {
              position: "left",
              attrs: {
                circle: {
                  r: 4,
                  magnet: true,
                  stroke: "#5F95FF",
                  strokeWidth: 1,
                  fill: "#fff",
                  style: {
                    visibility: "hidden",
                  },
                },
              },
            },
          },
          items: [
            { group: "top" },
            { group: "right" },
            { group: "bottom" },
            { group: "left" },
          ],
        },
      });
    });

    mindMapData.edges.forEach((edge) => {
      if (edge.source && edge.target) {
        graph.addEdge({
          source: edge.source,
          target: edge.target,
          attrs: {
            line: {
              stroke: "#5F95FF",
              strokeWidth: 2,
              targetMarker: {
                name: "classic",
                size: 6,
              },
            },
          },
          router: {
            name: "manhattan",
          },
          connector: {
            name: "rounded",
            args: { radius: 8 },
          },
        });
      }
    });

    graph.on("node:click", ({ node: cellNode }) => {
      setSelectedNodeId(cellNode.id);
    });

    graph.on("node:dblclick", ({ node: cellNode }) => {
      if (!isEditable) return;
      const label = cellNode.getData()?.label || "";
      setEditingNodeId(cellNode.id);
      setEditText(label);
    });

    graph.on("blank:click", () => {
      setSelectedNodeId(null);
      setEditingNodeId(null);
    });

    graph.on("node:moved", () => {
      saveGraphData();
    });

    graph.on("edge:connected", () => {
      saveGraphData();
    });

    graph.on("edge:removed", () => {
      saveGraphData();
    });

    graph.on("node:removed", () => {
      setSelectedNodeId(null);
      saveGraphData();
    });

    graph.on("node:mouseenter", ({ node: cellNode }) => {
      const ports = cellNode.getPorts();
      ports.forEach((port: any) => {
        cellNode.setPortProp(
          port.id,
          "attrs/circle/style/visibility",
          "visible",
        );
      });
    });

    graph.on("node:mouseleave", ({ node: cellNode }) => {
      const ports = cellNode.getPorts();
      ports.forEach((port: any) => {
        cellNode.setPortProp(
          port.id,
          "attrs/circle/style/visibility",
          "hidden",
        );
      });
    });

    return () => {
      graph.dispose();
      graphRef.current = null;
    };
  }, [node.attrs.data, isEditable, parseMindMapData, saveGraphData]);

  const addChildNode = useCallback(() => {
    if (!graphRef.current || !selectedNodeId || !isEditable) return;

    const graph = graphRef.current;
    const parentNode = graph.getCellById(selectedNodeId);
    if (!parentNode || parentNode.isEdge()) return;

    const parentPos = (parentNode as any).getPosition();
    const parentSize = (parentNode as any).getSize();
    const newId = generateId();
    const newLabel = "New Topic";

    const childNodes = graph.getNeighbors(parentNode as any, {
      outgoing: true,
    });
    const childCount = childNodes.length;
    const offsetY = (childCount - 1) * 60;

    graph.addNode({
      id: newId,
      x: parentPos.x + parentSize.width + 80,
      y: parentPos.y + offsetY,
      width: 140,
      height: 44,
      label: newLabel,
      data: { label: newLabel },
      attrs: {
        body: {
          fill: "#ffffff",
          stroke: "#d0d0d0",
          strokeWidth: 1.5,
          rx: 8,
          ry: 8,
        },
        label: {
          text: newLabel,
          fill: "#333333",
          fontSize: 13,
          fontWeight: 400,
          refX: "50%",
          refY: "50%",
          textAnchor: "middle",
          textVerticalAnchor: "middle",
        },
      },
      ports: {
        groups: {
          top: {
            position: "top",
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: "#5F95FF",
                strokeWidth: 1,
                fill: "#fff",
                style: { visibility: "hidden" },
              },
            },
          },
          right: {
            position: "right",
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: "#5F95FF",
                strokeWidth: 1,
                fill: "#fff",
                style: { visibility: "hidden" },
              },
            },
          },
          bottom: {
            position: "bottom",
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: "#5F95FF",
                strokeWidth: 1,
                fill: "#fff",
                style: { visibility: "hidden" },
              },
            },
          },
          left: {
            position: "left",
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: "#5F95FF",
                strokeWidth: 1,
                fill: "#fff",
                style: { visibility: "hidden" },
              },
            },
          },
        },
        items: [
          { group: "top" },
          { group: "right" },
          { group: "bottom" },
          { group: "left" },
        ],
      },
    });

    graph.addEdge({
      source: selectedNodeId,
      target: newId,
      attrs: {
        line: {
          stroke: "#5F95FF",
          strokeWidth: 2,
          targetMarker: {
            name: "classic",
            size: 6,
          },
        },
      },
      router: { name: "manhattan" },
      connector: { name: "rounded", args: { radius: 8 } },
    });

    setSelectedNodeId(newId);
    saveGraphData();
  }, [selectedNodeId, isEditable, saveGraphData]);

  const addSiblingNode = useCallback(() => {
    if (!graphRef.current || !selectedNodeId || !isEditable) return;

    const graph = graphRef.current;
    const currentNode = graph.getCellById(selectedNodeId);
    if (!currentNode || currentNode.isEdge()) return;

    const incomingEdges = graph.getIncomingEdges(currentNode as any);
    if (!incomingEdges || incomingEdges.length === 0) {
      return;
    }

    const parentNode = incomingEdges[0].getSourceCell();
    if (!parentNode) return;

    const currentPos = (currentNode as any).getPosition();
    const newId = generateId();
    const newLabel = "New Topic";

    graph.addNode({
      id: newId,
      x: currentPos.x,
      y: currentPos.y + 60,
      width: 140,
      height: 44,
      label: newLabel,
      data: { label: newLabel },
      attrs: {
        body: {
          fill: "#ffffff",
          stroke: "#d0d0d0",
          strokeWidth: 1.5,
          rx: 8,
          ry: 8,
        },
        label: {
          text: newLabel,
          fill: "#333333",
          fontSize: 13,
          fontWeight: 400,
          refX: "50%",
          refY: "50%",
          textAnchor: "middle",
          textVerticalAnchor: "middle",
        },
      },
      ports: {
        groups: {
          top: {
            position: "top",
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: "#5F95FF",
                strokeWidth: 1,
                fill: "#fff",
                style: { visibility: "hidden" },
              },
            },
          },
          right: {
            position: "right",
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: "#5F95FF",
                strokeWidth: 1,
                fill: "#fff",
                style: { visibility: "hidden" },
              },
            },
          },
          bottom: {
            position: "bottom",
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: "#5F95FF",
                strokeWidth: 1,
                fill: "#fff",
                style: { visibility: "hidden" },
              },
            },
          },
          left: {
            position: "left",
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: "#5F95FF",
                strokeWidth: 1,
                fill: "#fff",
                style: { visibility: "hidden" },
              },
            },
          },
        },
        items: [
          { group: "top" },
          { group: "right" },
          { group: "bottom" },
          { group: "left" },
        ],
      },
    });

    graph.addEdge({
      source: parentNode.id,
      target: newId,
      attrs: {
        line: {
          stroke: "#5F95FF",
          strokeWidth: 2,
          targetMarker: {
            name: "classic",
            size: 6,
          },
        },
      },
      router: { name: "manhattan" },
      connector: { name: "rounded", args: { radius: 8 } },
    });

    setSelectedNodeId(newId);
    saveGraphData();
  }, [selectedNodeId, isEditable, saveGraphData]);

  const deleteSelectedNode = useCallback(() => {
    if (!graphRef.current || !selectedNodeId || !isEditable) return;
    if (selectedNodeId === "root") return;

    const graph = graphRef.current;
    const nodeToDelete = graph.getCellById(selectedNodeId);
    if (nodeToDelete) {
      graph.removeCells([nodeToDelete]);
      setSelectedNodeId(null);
      saveGraphData();
    }
  }, [selectedNodeId, isEditable, saveGraphData]);

  const handleEditSubmit = useCallback(() => {
    if (!graphRef.current || !editingNodeId) return;

    const graph = graphRef.current;
    const node = graph.getCellById(editingNodeId);
    if (node && node.isNode()) {
      (node as any).attr("label/text", editText);
      node.setData({ label: editText });
      saveGraphData();
    }
    setEditingNodeId(null);
    setEditText("");
  }, [editingNodeId, editText, saveGraphData]);

  const handleZoomIn = useCallback(() => {
    if (!graphRef.current) return;
    graphRef.current.zoom(0.1);
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!graphRef.current) return;
    graphRef.current.zoom(-0.1);
  }, []);

  const handleZoomReset = useCallback(() => {
    if (!graphRef.current) return;
    graphRef.current.zoomTo(1);
  }, []);

  return (
    <div
      className="mindmap-wrapper"
      style={{
        position: "relative",
        width: "100%",
        height: "450px",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "#fafafa",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {isEditable && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            zIndex: 10,
            backgroundColor: "white",
            borderRadius: "6px",
            padding: "4px 8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            gap: "4px",
            alignItems: "center",
          }}
        >
          <Tooltip label={t("Add child node")} position="bottom">
            <ActionIcon
              size="sm"
              variant="subtle"
              onClick={addChildNode}
              disabled={!selectedNodeId}
              aria-label={t("Add child node")}
            >
              <IconPlus size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={t("Add sibling node")} position="bottom">
            <ActionIcon
              size="sm"
              variant="subtle"
              onClick={addSiblingNode}
              disabled={!selectedNodeId || selectedNodeId === "root"}
              aria-label={t("Add sibling node")}
            >
              <IconSitemap size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={t("Delete node")} position="bottom">
            <ActionIcon
              size="sm"
              variant="subtle"
              color="red"
              onClick={deleteSelectedNode}
              disabled={!selectedNodeId || selectedNodeId === "root"}
              aria-label={t("Delete node")}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
          <div
            style={{
              width: "1px",
              height: "20px",
              backgroundColor: "#e5e7eb",
              margin: "0 4px",
            }}
          />
          <Tooltip label={t("Zoom in")} position="bottom">
            <ActionIcon
              size="sm"
              variant="subtle"
              onClick={handleZoomIn}
              aria-label={t("Zoom in")}
            >
              <IconZoomIn size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={t("Zoom out")} position="bottom">
            <ActionIcon
              size="sm"
              variant="subtle"
              onClick={handleZoomOut}
              aria-label={t("Zoom out")}
            >
              <IconZoomOut size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={t("Reset zoom")} position="bottom">
            <ActionIcon
              size="sm"
              variant="subtle"
              onClick={handleZoomReset}
              aria-label={t("Reset zoom")}
            >
              <IconZoomReset size={16} />
            </ActionIcon>
          </Tooltip>
        </div>
      )}

      {editingNodeId && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 20,
            backgroundColor: "white",
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            width: "300px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <TextInput
            value={editText}
            onChange={(e) => setEditText(e.currentTarget.value)}
            placeholder={t("Enter node text")}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleEditSubmit();
              }
              if (e.key === "Escape") {
                setEditingNodeId(null);
                setEditText("");
              }
            }}
            autoFocus
            data-autofocus
          />
          <Group justify="flex-end" mt="sm">
            <button
              onClick={() => {
                setEditingNodeId(null);
                setEditText("");
              }}
              style={{
                padding: "4px 12px",
                border: "1px solid #d0d0d0",
                borderRadius: "4px",
                backgroundColor: "#f5f5f5",
                cursor: "pointer",
              }}
            >
              {t("Cancel")}
            </button>
            <button
              onClick={handleEditSubmit}
              style={{
                padding: "4px 12px",
                border: "none",
                borderRadius: "4px",
                backgroundColor: "#5F95FF",
                color: "white",
                cursor: "pointer",
              }}
            >
              {t("Save")}
            </button>
          </Group>
        </div>
      )}

      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
        }}
      />

      {!isEditable && (
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            right: "10px",
            backgroundColor: "rgba(255,255,255,0.9)",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            color: "#6b7280",
          }}
        >
          {t("Read-only")}
        </div>
      )}
    </div>
  );
}

export default MindMapView;
