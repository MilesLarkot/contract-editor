"use client";

import {
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import {
  createEditor,
  Descendant,
  Element as SlateElement,
  Transforms,
  Editor,
  Range,
} from "slate";
import { withHistory } from "slate-history";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface FieldElement {
  type: "field";
  fieldName: string;
  fieldValue?: string;
  elementId: string;
  children: CustomText[];
}

type HeadingElement = {
  type: "heading";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  align?: "left" | "center" | "right" | "justify";
  children: CustomText[];
};

type ParagraphElement = {
  type: "paragraph";
  align?: "left" | "center" | "right" | "justify";
  children: CustomText[];
};

type BlockQuoteElement = {
  type: "block-quote";
  children: CustomText[];
};

type CodeBlockElement = {
  type: "code-block";
  children: CustomText[];
};

type BulletedListElement = {
  type: "bulleted-list";
  children: ListItemElement[];
};

type NumberedListElement = {
  type: "numbered-list";
  children: ListItemElement[];
};

type ListItemElement = {
  type: "list-item";
  children: CustomText[];
};

type LinkElement = {
  type: "link";
  url: string;
  children: CustomText[];
};

type CustomElement =
  | FieldElement
  | ParagraphElement
  | HeadingElement
  | BlockQuoteElement
  | CodeBlockElement
  | BulletedListElement
  | NumberedListElement
  | ListItemElement
  | LinkElement;

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  superscript?: boolean;
  subscript?: boolean;
  color?: string;
  backgroundColor?: string;
  fontSize?: string;
};

declare module "slate" {
  interface CustomTypes {
    Editor: ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

interface WYSIWYGEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFieldDrop?: (field: { fieldName: string; fieldValue: string }) => void;
  onFieldUpdate?: (field: { fieldName: string; fieldValue: string }) => void;
}

export interface WYSIWYGEditorHandle {
  updateFieldValue: (fieldName: string, fieldValue: string) => void;
}

const generateElementId = () =>
  `field_${Math.random().toString(36).substr(2, 9)}`;

const withFields = (editor: ReactEditor) => {
  const { isInline, isVoid } = editor;
  editor.isInline = (el) =>
    el.type === "field" || el.type === "link" || isInline(el);
  editor.isVoid = (el) => el.type === "field" || isVoid(el);
  return editor;
};

const initialValue: Descendant[] = [
  { type: "paragraph", children: [{ text: "" }] },
];

const isMarkActive = (editor: ReactEditor, format: string) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format as keyof typeof marks] === true : false;
};

const getMarkValue = (editor: ReactEditor, format: string) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format as keyof typeof marks] : undefined;
};

const toggleMark = (editor: ReactEditor, format: string, value?: any) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, value || true);
  }
};

const setMark = (editor: ReactEditor, format: string, value: any) => {
  Editor.addMark(editor, format, value);
};

const LIST_TYPES = ["numbered-list", "bulleted-list"];
const TEXT_ALIGN_TYPES = ["left", "center", "right", "justify"];

const isBlockActive = (
  editor: ReactEditor,
  format: string,
  blockType = "type"
) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        (blockType === "type"
          ? n.type === format
          : n[blockType as keyof typeof n] === format),
    })
  );

  return !!match;
};

const toggleBlock = (editor: ReactEditor, format: string) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type),
    split: true,
  });

  let newProperties: Partial<SlateElement>;
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    } as Partial<SlateElement>;
  } else {
    newProperties = {
      type: isActive ? "paragraph" : isList ? "list-item" : format,
    } as Partial<SlateElement>;
  }

  Transforms.setNodes<SlateElement>(editor, newProperties);

  if (!isActive && isList) {
    let block: CustomElement;
    if (format === "bulleted-list" || format === "numbered-list") {
      block = {
        type: format as "bulleted-list" | "numbered-list",
        children: [],
      };
    } else if (format === "link") {
      block = { type: "link", url: "", children: [] };
    } else {
      block = { type: format as any, children: [] };
    }
    Transforms.wrapNodes(editor, block);
  }
};

const insertLink = (editor: ReactEditor, url: string) => {
  if (editor.selection) {
    wrapLink(editor, url);
  }
};

const isLinkActive = (editor: ReactEditor) => {
  const linkEntries = Array.from(
    Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "link",
    })
  );
  const [link] = linkEntries;
  return !!link;
};

const unwrapLink = (editor: ReactEditor) => {
  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "link",
  });
};

const wrapLink = (editor: ReactEditor, url: string) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link: LinkElement = {
    type: "link",
    url,
    children: isCollapsed ? [{ text: url }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: "end" });
  }
};

const COLORS = [
  "#000000",
  "#434343",
  "#666666",
  "#999999",
  "#b7b7b7",
  "#cccccc",
  "#d9d9d9",
  "#efefef",
  "#f3f3f3",
  "#ffffff",
  "#980000",
  "#ff0000",
  "#ff9900",
  "#ffff00",
  "#00ff00",
  "#00ffff",
  "#4a86e8",
  "#0000ff",
  "#9900ff",
  "#ff00ff",
  "#e6b8af",
  "#f4cccc",
  "#fce5cd",
  "#fff2cc",
  "#d9ead3",
  "#d0e0e3",
  "#c9daf8",
  "#cfe2f3",
  "#d9d2e9",
  "#ead1dc",
  "#dd7e6b",
  "#ea9999",
  "#f9cb9c",
  "#ffe599",
  "#b6d7a8",
  "#a2c4c9",
  "#a4c2f4",
  "#9fc5e8",
  "#b4a7d6",
  "#d5a6bd",
];

const FONT_SIZES = [
  "8px",
  "10px",
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
  "28px",
  "32px",
  "36px",
  "48px",
];

const ColorPicker = ({
  value,
  onChange,
  title,
}: {
  value?: string;
  onChange: (color: string) => void;
  title: string;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          title={title}
        >
          <div
            className="w-4 h-4 rounded border border-gray-300"
            style={{ backgroundColor: value || "#000000" }}
          />
          <span className="text-xs">▼</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 p-2 grid grid-cols-10 gap-1">
        {COLORS.map((color) => (
          <DropdownMenuItem
            key={color}
            className="p-0"
            onSelect={() => onChange(color)}
          >
            <div
              className="w-5 h-5 rounded border border-gray-200 hover:scale-110 transition-transform cursor-pointer"
              style={{ backgroundColor: color }}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const FontSizeSelect = ({
  value,
  onChange,
}: {
  value?: string;
  onChange: (size: string) => void;
}) => (
  <Select value={value || "16px"} onValueChange={onChange}>
    <SelectTrigger className="w-24 h-8 text-sm">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {FONT_SIZES.map((size) => (
        <SelectItem key={size} value={size}>
          {size}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

const WYSIWYGEditor = forwardRef<WYSIWYGEditorHandle, WYSIWYGEditorProps>(
  (
    {
      value,
      onChange,
      placeholder = "Enter contract content",
      onFieldDrop,
      onFieldUpdate,
    },
    ref
  ) => {
    const editorRef = useRef<ReactEditor | null>(null);
    const [internalValue, setInternalValue] =
      useState<Descendant[]>(initialValue);

    useEffect(() => {
      try {
        const parsed = JSON.parse(value || JSON.stringify(initialValue));
        const fixed = parsed.map((node: any) => {
          if (node.type === "field") {
            return {
              ...node,
              elementId: node.elementId || generateElementId(),
              children: node.children || [{ text: "" }],
            };
          }
          return node;
        });
        setInternalValue(fixed);
      } catch (err) {
        setInternalValue([
          { type: "paragraph", children: [{ text: value || "" }] },
        ]);
      }
    }, [value]);

    if (!editorRef.current) {
      editorRef.current = withFields(withHistory(withReact(createEditor())));
    }
    const editor = editorRef.current;
    const [editingField, setEditingField] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      updateFieldValue(fieldName: string, fieldValue: string) {
        const nodeEntries = Array.from(
          Editor.nodes(editor, {
            at: [],
            match: (n) =>
              SlateElement.isElement(n) &&
              n.type === "field" &&
              n.fieldName === fieldName,
          })
        );
        for (const [, path] of nodeEntries) {
          Transforms.setNodes(editor, { fieldValue }, { at: path });
        }
        onChange(JSON.stringify(editor.children));
      },
    }));

    const slateValue = useMemo(() => {
      try {
        const parsed = JSON.parse(value || JSON.stringify(initialValue));
        return parsed.map((node: any) => {
          if (node.type === "field") {
            return {
              ...node,
              elementId: node.elementId || generateElementId(),
              children: node.children || [{ text: "" }],
            };
          }
          return node;
        });
      } catch (err) {
        return [{ type: "paragraph", children: [{ text: value || "" }] }];
      }
    }, [value]);

    const serialize = (nodes: Descendant[]) => JSON.stringify(nodes);

    const startEditing = (elementId: string) => {
      setEditingField(elementId);
    };

    const saveFieldValue = (
      elementId: string,
      fieldName: string,
      newValue: string
    ) => {
      const matchingFields = Array.from(
        Editor.nodes(editor, {
          at: [],
          match: (n) =>
            SlateElement.isElement(n) &&
            n.type === "field" &&
            n.fieldName === fieldName,
        })
      );

      for (const [, path] of matchingFields) {
        Transforms.setNodes(editor, { fieldValue: newValue }, { at: path });
      }

      if (onFieldUpdate) {
        onFieldUpdate({ fieldName, fieldValue: newValue });
      }

      onChange(serialize(editor.children));
      setEditingField(null);
    };

    const renderElement = useCallback(
      (props: any) => {
        const { attributes, children, element } = props;
        const isEditing = editingField === element.elementId;
        const currentValue = element.fieldValue || element.fieldName;

        const style: React.CSSProperties = {};
        if (element.align) {
          style.textAlign = element.align;
        }

        switch (element.type) {
          case "field":
            return (
              <span
                {...attributes}
                contentEditable={false}
                className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mx-1"
              >
                {isEditing ? (
                  <input
                    defaultValue={currentValue}
                    onBlur={(e) =>
                      saveFieldValue(
                        element.elementId,
                        element.fieldName,
                        e.target.value
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        saveFieldValue(
                          element.elementId,
                          element.fieldName,
                          (e.target as HTMLInputElement).value
                        );
                      }
                    }}
                    autoFocus
                    className="bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 pl-1 focus:ring-blue-500"
                  />
                ) : (
                  <span
                    className="cursor-pointer"
                    onClick={() => startEditing(element.elementId)}
                  >
                    {currentValue}
                    {children}
                  </span>
                )}
              </span>
            );
          case "block-quote":
            return (
              <blockquote
                {...attributes}
                className="border-l-4 border-gray-300 pl-4 italic my-4"
                style={style}
              >
                {children}
              </blockquote>
            );
          case "bulleted-list":
            return (
              <ul
                {...attributes}
                className="list-disc list-inside my-4"
                style={style}
              >
                {children}
              </ul>
            );
          case "numbered-list":
            return (
              <ol
                {...attributes}
                className="list-decimal list-inside my-4"
                style={style}
              >
                {children}
              </ol>
            );
          case "list-item":
            return (
              <li {...attributes} style={style}>
                {children}
              </li>
            );
          case "heading":
            const HeadingTag =
              `h${element.level}` as keyof JSX.IntrinsicElements;
            const headingClasses = {
              1: "text-4xl font-bold my-4",
              2: "text-3xl font-bold my-3",
              3: "text-2xl font-bold my-3",
              4: "text-xl font-bold my-2",
              5: "text-lg font-bold my-2",
              6: "text-base font-bold my-2",
            };
            return (
              <HeadingTag
                {...attributes}
                className={
                  headingClasses[element.level as keyof typeof headingClasses]
                }
                style={style}
              >
                {children}
              </HeadingTag>
            );
          case "code-block":
            return (
              <pre
                {...attributes}
                className="bg-gray-100 p-4 rounded font-mono text-sm my-4 overflow-x-auto"
                style={style}
              >
                <code>{children}</code>
              </pre>
            );
          case "link":
            return (
              <a
                {...attributes}
                href={element.url}
                className="text-blue-600 underline hover:text-blue-800"
              >
                {children}
              </a>
            );
          default:
            return (
              <p {...attributes} className="my-2" style={style}>
                {children}
              </p>
            );
        }
      },
      [editingField]
    );

    const renderLeaf = useCallback((props: any) => {
      const { attributes, children, leaf } = props;
      let element = children;

      if (leaf.bold) {
        element = <strong>{element}</strong>;
      }

      if (leaf.italic) {
        element = <em>{element}</em>;
      }

      if (leaf.underline) {
        element = <u>{element}</u>;
      }

      if (leaf.strikethrough) {
        element = <s>{element}</s>;
      }

      if (leaf.code) {
        element = (
          <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
            {element}
          </code>
        );
      }

      if (leaf.superscript) {
        element = <sup>{element}</sup>;
      }

      if (leaf.subscript) {
        element = <sub>{element}</sub>;
      }

      const style: React.CSSProperties = {};
      if (leaf.color) {
        style.color = leaf.color;
      }
      if (leaf.backgroundColor) {
        style.backgroundColor = leaf.backgroundColor;
      }
      if (leaf.fontSize) {
        style.fontSize = leaf.fontSize;
      }

      return (
        <span {...attributes} style={style}>
          {element}
        </span>
      );
    }, []);

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      const fieldData = e.dataTransfer.getData("application/json");
      if (!fieldData) return;

      try {
        const field = JSON.parse(fieldData);
        const { fieldName, fieldValue } = field;

        const fieldElement: FieldElement = {
          type: "field",
          fieldName,
          fieldValue: fieldValue || "",
          elementId: generateElementId(),
          children: [{ text: "" }],
        };

        ReactEditor.focus(editor);
        const point = ReactEditor.findEventRange(editor, e);
        Transforms.select(editor, point);
        Transforms.insertNodes(editor, fieldElement);

        if (onFieldDrop) {
          onFieldDrop({ fieldName, fieldValue: fieldValue || "" });
        }

        onChange(serialize(editor.children));
      } catch (err) {
        console.error("Failed to parse dropped field", err);
      }
    };

    const handleChange = (newValue: Descendant[]) => {
      onChange(serialize(newValue));
    };

    const addLinkWithPrompt = () => {
      const url = window.prompt("Enter the URL of the link:");
      if (url && !isLinkActive(editor)) {
        insertLink(editor, url);
      } else if (url && isLinkActive(editor)) {
        unwrapLink(editor);
        insertLink(editor, url);
      }
    };

    return (
      <div className="border rounded">
        <div className="border-b bg-gray-50 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={
                isBlockActive(editor, "heading")
                  ? `heading-${
                      (
                        Editor.nodes(editor, {
                          match: (n) =>
                            !Editor.isEditor(n) &&
                            SlateElement.isElement(n) &&
                            n.type === "heading",
                        }).next().value?.[0] as HeadingElement
                      )?.level || 1
                    }`
                  : isBlockActive(editor, "block-quote")
                  ? "block-quote"
                  : isBlockActive(editor, "code-block")
                  ? "code-block"
                  : "paragraph"
              }
              onValueChange={(value) => {
                if (value.startsWith("heading-")) {
                  const level = parseInt(value.split("-")[1]) as
                    | 1
                    | 2
                    | 3
                    | 4
                    | 5
                    | 6;
                  Transforms.setNodes(editor, { type: "heading", level });
                } else {
                  toggleBlock(editor, value);
                }
              }}
            >
              <SelectTrigger className="w-36 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paragraph">Paragraph</SelectItem>
                <SelectItem value="heading-1">Heading 1</SelectItem>
                <SelectItem value="heading-2">Heading 2</SelectItem>
                <SelectItem value="heading-3">Heading 3</SelectItem>
                <SelectItem value="heading-4">Heading 4</SelectItem>
                <SelectItem value="heading-5">Heading 5</SelectItem>
                <SelectItem value="heading-6">Heading 6</SelectItem>
                <SelectItem value="block-quote">Quote</SelectItem>
                <SelectItem value="code-block">Code Block</SelectItem>
              </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <FontSizeSelect
              value={getMarkValue(editor, "fontSize") as string}
              onChange={(size) => setMark(editor, "fontSize", size)}
            />

            <Separator orientation="vertical" className="h-6 mx-1" />

            <Button
              variant={isMarkActive(editor, "bold") ? "default" : "outline"}
              size="sm"
              onMouseDown={(event) => {
                event.preventDefault();
                toggleMark(editor, "bold");
              }}
              title="Bold"
            >
              <strong>B</strong>
            </Button>

            <Button
              variant={isMarkActive(editor, "italic") ? "default" : "outline"}
              size="sm"
              onMouseDown={(event) => {
                event.preventDefault();
                toggleMark(editor, "italic");
              }}
              title="Italic"
            >
              <em>I</em>
            </Button>

            <Button
              variant={
                isMarkActive(editor, "underline") ? "default" : "outline"
              }
              size="sm"
              onMouseDown={(event) => {
                event.preventDefault();
                toggleMark(editor, "underline");
              }}
              title="Underline"
            >
              <u>U</u>
            </Button>

            <Button
              variant={
                isMarkActive(editor, "strikethrough") ? "default" : "outline"
              }
              size="sm"
              onMouseDown={(event) => {
                event.preventDefault();
                toggleMark(editor, "strikethrough");
              }}
              title="Strikethrough"
            >
              <s>S</s>
            </Button>

            <Button
              variant={isMarkActive(editor, "code") ? "default" : "outline"}
              size="sm"
              onMouseDown={(event) => {
                event.preventDefault();
                toggleMark(editor, "code");
              }}
              title="Inline Code"
            >
              &lt;/&gt;
            </Button>

            <Button
              variant={
                isMarkActive(editor, "superscript") ? "default" : "outline"
              }
              size="sm"
              onMouseDown={(event) => {
                event.preventDefault();
                if (isMarkActive(editor, "subscript")) {
                  toggleMark(editor, "subscript");
                }
                toggleMark(editor, "superscript");
              }}
              title="Superscript"
            >
              X<sup>2</sup>
            </Button>

            <Button
              variant={
                isMarkActive(editor, "subscript") ? "default" : "outline"
              }
              size="sm"
              onMouseDown={(event) => {
                event.preventDefault();
                if (isMarkActive(editor, "superscript")) {
                  toggleMark(editor, "superscript");
                }
                toggleMark(editor, "subscript");
              }}
              title="Subscript"
            >
              X<sub>2</sub>
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <ColorPicker
              value={getMarkValue(editor, "color") as string}
              onChange={(color) => setMark(editor, "color", color)}
              title="Text Color"
            />

            <ColorPicker
              value={getMarkValue(editor, "backgroundColor") as string}
              onChange={(color) => setMark(editor, "backgroundColor", color)}
              title="Background Color"
            />

            <Separator orientation="vertical" className="h-6 mx-1" />

            <Button
              variant={
                isBlockActive(editor, "left", "align") ? "default" : "outline"
              }
              size="sm"
              onMouseDown={(event) => {
                event.preventDefault();
                toggleBlock(editor, "left");
              }}
              title="Align Left"
            >
              ⬅
            </Button>

            <Button
              variant={
                isBlockActive(editor, "center", "align") ? "default" : "outline"
              }
              size="sm"
              onMouseDown={(event) => {
                event.preventDefault();
                toggleBlock(editor, "center");
              }}
              title="Align Center"
            >
              ↔
            </Button>

            <Button
              variant={
                isBlockActive(editor, "right", "align") ? "default" : "outline"
              }
              size="sm"
              onMouseDown={(event) => {
                event.preventDefault();
                toggleBlock(editor, "right");
              }}
              title="Align Right"
            >
              ➡
            </Button>

            <Button
              variant={
                isBlockActive(editor, "justify", "align")
                  ? "default"
                  : "outline"
              }
              size="sm"
              onMouseDown={(event) => {
                event.preventDefault();
                toggleBlock(editor, "justify");
              }}
              title="Justify"
            >
              ≡
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <Button
              variant={
                isBlockActive(editor, "bulleted-list") ? "default" : "outline"
              }
              size="sm"
              onMouseDown={(event) => {
                event.preventDefault();
                toggleBlock(editor, "bulleted-list");
              }}
              title="Bulleted List"
            >
              • List
            </Button>

            <Button
              variant={
                isBlockActive(editor, "numbered-list") ? "default" : "outline"
              }
              size="sm"
              onMouseDown={(event) => {
                event.preventDefault();
                toggleBlock(editor, "numbered-list");
              }}
              title="Numbered List"
            >
              1. List
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <Button
              variant={isLinkActive(editor) ? "default" : "outline"}
              size="sm"
              onMouseDown={(event) => {
                event.preventDefault();
                if (isLinkActive(editor)) {
                  unwrapLink(editor);
                } else {
                  addLinkWithPrompt();
                }
              }}
              title={isLinkActive(editor) ? "Remove Link" : "Add Link"}
            >
              🔗
            </Button>

            <Button
              variant={
                isBlockActive(editor, "block-quote") ? "default" : "outline"
              }
              size="sm"
              onMouseDown={(event) => {
                event.preventDefault();
                toggleBlock(editor, "block-quote");
              }}
              title="Block Quote"
            >
              ❝
            </Button>
          </div>
        </div>

        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="h-[600px] mb-12 p-4"
        >
          <Slate
            editor={editor}
            initialValue={slateValue}
            onChange={(newVal) => {
              setInternalValue(newVal);
              onChange(JSON.stringify(newVal));
            }}
          >
            <Editable
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              placeholder={placeholder}
              className="h-full outline-none"
            />
          </Slate>
        </div>
      </div>
    );
  }
);

WYSIWYGEditor.displayName = "WYSIWYGEditor";

export default WYSIWYGEditor;
