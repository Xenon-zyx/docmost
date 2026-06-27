import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

export interface MindMapOptions {
  HTMLAttributes: Record<string, any>;
  view: any;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mindmap: {
      setMindMap: (attributes?: Record<string, any>) => ReturnType;
      setMindMapAlign: (align: "left" | "center" | "right") => ReturnType;
    };
  }
}

export const MindMap = Node.create<MindMapOptions>({
  name: "mindmap",
  inline: false,
  group: "block",
  isolating: true,
  atom: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      view: null,
    };
  },

  addAttributes() {
    return {
      data: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-mindmap"),
        renderHTML: (attributes) => ({
          "data-mindmap": attributes.data,
        }),
      },
      align: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-align") || "center",
        renderHTML: (attributes) => ({
          "data-align": attributes.align,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-mindmap]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    ];
  },

  addCommands() {
    return {
      setMindMap:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
      setMindMapAlign:
        (align) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { align });
        },
    };
  },

  addNodeView() {
    return (props) => {
      return ReactNodeViewRenderer(this.options.view)(props);
    };
  },
});
