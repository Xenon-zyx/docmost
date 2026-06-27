import { BubbleMenu as BaseBubbleMenu } from "@tiptap/react/menus";
import { findParentNode, posToDOMRect, useEditorState } from "@tiptap/react";
import { useCallback } from "react";
import { Node as PMNode } from "@tiptap/pm/model";
import { isEditorReady } from "@docmost/editor-ext";
import {
  EditorMenuProps,
  ShouldShowProps,
} from "@/features/editor/components/table/types/types.ts";
import { ActionIcon, Tooltip } from "@mantine/core";
import {
  IconLayoutAlignCenter,
  IconLayoutAlignLeft,
  IconLayoutAlignRight,
  IconTrash,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import classes from "../common/toolbar-menu.module.css";

export function MindMapMenu({ editor }: EditorMenuProps) {
  const { t } = useTranslation();

  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      if (!ctx.editor) {
        return null;
      }

      return {
        isMindMap: ctx.editor.isActive("mindmap"),
        isAlignLeft: ctx.editor.isActive("mindmap", { align: "left" }),
        isAlignCenter: ctx.editor.isActive("mindmap", { align: "center" }),
        isAlignRight: ctx.editor.isActive("mindmap", { align: "right" }),
      };
    },
  });

  const shouldShow = useCallback(
    ({ state }: ShouldShowProps) => {
      if (!state) {
        return false;
      }

      return editor.isActive("mindmap");
    },
    [editor],
  );

  const getReferencedVirtualElement = useCallback(() => {
    if (!isEditorReady(editor)) return;
    const { selection } = editor.state;
    const predicate = (node: PMNode) => node.type.name === "mindmap";
    const parent = findParentNode(predicate)(selection);

    if (parent) {
      const dom = editor.view.nodeDOM(parent?.pos) as HTMLElement;
      const domRect = dom.getBoundingClientRect();
      return {
        getBoundingClientRect: () => domRect,
        getClientRects: () => [domRect],
      };
    }

    const domRect = posToDOMRect(editor.view, selection.from, selection.to);
    return {
      getBoundingClientRect: () => domRect,
      getClientRects: () => [domRect],
    };
  }, [editor]);

  const alignLeft = useCallback(() => {
    editor
      .chain()
      .focus(undefined, { scrollIntoView: false })
      .updateAttributes("mindmap", { align: "left" })
      .run();
  }, [editor]);

  const alignCenter = useCallback(() => {
    editor
      .chain()
      .focus(undefined, { scrollIntoView: false })
      .updateAttributes("mindmap", { align: "center" })
      .run();
  }, [editor]);

  const alignRight = useCallback(() => {
    editor
      .chain()
      .focus(undefined, { scrollIntoView: false })
      .updateAttributes("mindmap", { align: "right" })
      .run();
  }, [editor]);

  const handleDelete = useCallback(() => {
    editor.commands.deleteSelection();
  }, [editor]);

  return (
    <BaseBubbleMenu
      editor={editor}
      pluginKey={`mindmap-menu`}
      updateDelay={0}
      getReferencedVirtualElement={getReferencedVirtualElement}
      options={{
        placement: "top",
        offset: 8,
        flip: false,
      }}
      shouldShow={shouldShow}
    >
      <div className={classes.toolbar}>
        <Tooltip position="top" label={t("Align left")} withinPortal={false}>
          <ActionIcon
            onClick={alignLeft}
            size="lg"
            aria-label={t("Align left")}
            variant="subtle"
            className={clsx({ [classes.active]: editorState?.isAlignLeft })}
          >
            <IconLayoutAlignLeft size={18} />
          </ActionIcon>
        </Tooltip>

        <Tooltip
          position="top"
          label={t("Align center")}
          withinPortal={false}
        >
          <ActionIcon
            onClick={alignCenter}
            size="lg"
            aria-label={t("Align center")}
            variant="subtle"
            className={clsx({ [classes.active]: editorState?.isAlignCenter })}
          >
            <IconLayoutAlignCenter size={18} />
          </ActionIcon>
        </Tooltip>

        <Tooltip position="top" label={t("Align right")} withinPortal={false}>
          <ActionIcon
            onClick={alignRight}
            size="lg"
            aria-label={t("Align right")}
            variant="subtle"
            className={clsx({ [classes.active]: editorState?.isAlignRight })}
          >
            <IconLayoutAlignRight size={18} />
          </ActionIcon>
        </Tooltip>

        <div className={classes.divider} />

        <Tooltip position="top" label={t("Delete")} withinPortal={false}>
          <ActionIcon
            onClick={handleDelete}
            size="lg"
            aria-label={t("Delete")}
            variant="subtle"
          >
            <IconTrash size={18} />
          </ActionIcon>
        </Tooltip>
      </div>
    </BaseBubbleMenu>
  );
}

export default MindMapMenu;
