/* eslint-disable */
import { Editor, Element as SlateElement, Transforms } from "slate";
import { ReactEditor } from "slate-react";
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
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronUp,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Italic,
  List,
  ListOrdered,
  MoreHorizontal,
  Palette,
  Pilcrow,
  Quote,
  Subscript,
  Superscript,
  Type,
  Underline,
} from "lucide-react";
import { useState } from "react";

type HeadingElement = {
  type: "heading";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  align?: "left" | "center" | "right" | "justify";
  children: any[];
};

interface WYSIWYGToolbarProps {
  editor: ReactEditor;
}

const LIST_TYPES = ["numbered-list", "bulleted-list"];
const TEXT_ALIGN_TYPES = ["left", "center", "right", "justify"];

const isMarkActive = (editor: ReactEditor, format: string) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format as keyof typeof marks] === true : false;
};

const getMarkValue = (editor: ReactEditor, format: string) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format as keyof typeof marks] : undefined;
};

const toggleMark = (editor: ReactEditor, format: string, value?: string) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, value || true);
  }
};

const setMark = (editor: ReactEditor, format: string, value: string) => {
  Editor.addMark(editor, format, value);
};

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
    const block = {
      type: format as "bulleted-list" | "numbered-list",
      children: [],
    };
    Transforms.wrapNodes(editor, block);
  }
};

const getCurrentAlignment = (editor: ReactEditor) => {
  const { selection } = editor;
  if (!selection) return "left";

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && "align" in n,
    })
  );

  return match ? (match[0] as any).align || "left" : "left";
};

const COLORS = [
  "#000000",
  "#374151",
  "#6B7280",
  "#9CA3AF",
  "#D1D5DB",
  "#E5E7EB",
  "#F3F4F6",
  "#F9FAFB",
  "#FFFFFF",
  "#FEF2F2",
  "#DC2626",
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#EAB308",
  "#84CC16",
  "#22C55E",
  "#10B981",
  "#14B8A6",
  "#06B6D4",
  "#0EA5E9",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#A855F7",
  "#C026D3",
  "#E11D48",
  "#F43F5E",
  "#FB7185",
  "#FBBF24",
  "#FDE047",
  "#BEF264",
  "#86EFAC",
  "#6EE7B7",
  "#5EEAD4",
  "#67E8F9",
  "#7DD3FC",
  "#93C5FD",
  "#A5B4FC",
  "#C4B5FD",
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
  icon: Icon,
}: {
  value?: string;
  onChange: (color: string) => void;
  title: string;
  icon?: React.ComponentType<any>;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2 flex items-center gap-1.5 hover:bg-gray-100 transition-colors"
          title={title}
        >
          {Icon && <Icon className="h-3.5 w-3.5" />}
          <div
            className="w-3 h-3 rounded-sm border border-gray-300 shadow-sm"
            style={{ backgroundColor: value || "#000000" }}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 p-3">
        <div className="grid grid-cols-10 gap-1.5">
          {COLORS.map((color) => (
            <DropdownMenuItem
              key={color}
              className="p-0 h-auto rounded-sm"
              onSelect={() => onChange(color)}
            >
              <div
                className="w-5 h-5 rounded-sm border border-gray-200 hover:scale-105 transition-transform cursor-pointer shadow-sm"
                style={{ backgroundColor: color }}
                title={color}
              />
            </DropdownMenuItem>
          ))}
        </div>
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
    <SelectTrigger className="w-20 h-8 text-sm font-medium">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {FONT_SIZES.map((size) => (
        <SelectItem key={size} value={size} className="font-medium">
          {size}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

const ToolbarButton = ({
  variant,
  children,
  onMouseDown,
  title,
  className = "",
}: {
  variant: "default" | "outline";
  children: React.ReactNode;
  onMouseDown: (e: React.MouseEvent) => void;
  title: string;
  className?: string;
}) => (
  <Button
    variant={variant}
    size="sm"
    className={`h-8 px-2.5 transition-all duration-200 hover:scale-105 ${
      variant === "default"
        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        : "hover:bg-gray-100 text-gray-700"
    } ${className}`}
    onMouseDown={onMouseDown}
    title={title}
  >
    {children}
  </Button>
);

const WYSIWYGToolbar = ({ editor }: WYSIWYGToolbarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const currentBlockType = (() => {
    if (isBlockActive(editor, "heading")) {
      const level =
        (
          Editor.nodes(editor, {
            match: (n) =>
              !Editor.isEditor(n) &&
              SlateElement.isElement(n) &&
              n.type === "heading",
          }).next().value?.[0] as HeadingElement
        )?.level || 1;
      return `heading-${level}`;
    }
    if (isBlockActive(editor, "block-quote")) return "block-quote";
    if (isBlockActive(editor, "code-block")) return "code-block";
    return "paragraph";
  })();

  const toggleToolbar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="top-16 right-0 z-50 transition-all duration-300 ease-in-out sticky">
      {/* Floating Button */}
      <Button
        onClick={toggleToolbar}
        className={`rounded-full h-12 w-12 shadow-lg hover:shadow-xl transition-all duration-300 ${
          isExpanded
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
        }`}
        title={isExpanded ? "Collapse toolbar" : "Expand toolbar"}
      >
        {isExpanded ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <MoreHorizontal className="h-5 w-5" />
        )}
      </Button>

      {/* Expanded Toolbar */}
      {isExpanded && (
        <div className="mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-md animate-in slide-in-from-top-2 duration-200 max-h-96 overflow-y-auto">
          <div className="flex flex-col gap-3">
            {/* Block Type and Font Size Row */}
            <div className="flex items-center gap-2">
              <Select
                value={currentBlockType}
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
                <SelectTrigger className="w-fit h-8 text-sm font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="paragraph"
                    className="flex items-center gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Pilcrow className="h-4 w-4" />
                      <span>Paragraph</span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="heading-1"
                    className="flex items-center gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Heading1 className="h-4 w-4" />
                      <span>Heading 1</span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="heading-2"
                    className="flex items-center gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Heading2 className="h-4 w-4" />
                      <span>Heading 2</span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="heading-3"
                    className="flex items-center gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Heading3 className="h-4 w-4" />
                      <span>Heading 3</span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="heading-4"
                    className="flex items-center gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Heading4 className="h-4 w-4" />
                      <span>Heading 4</span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="heading-5"
                    className="flex items-center gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Heading5 className="h-4 w-4" />
                      <span>Heading 5</span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="heading-6"
                    className="flex items-center gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Heading6 className="h-4 w-4" />
                      <span>Heading 6</span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="block-quote"
                    className="flex items-center gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Quote className="h-4 w-4" />
                      <span>Quote</span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="code-block"
                    className="flex items-center gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      <span>Code Block</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <FontSizeSelect
                value={getMarkValue(editor, "fontSize") as string}
                onChange={(size) => setMark(editor, "fontSize", size)}
              />
            </div>

            <Separator />

            {/* Text Formatting Row */}
            <div className="flex items-center gap-1 flex-wrap">
              <ToolbarButton
                variant={isMarkActive(editor, "bold") ? "default" : "outline"}
                onMouseDown={(event) => {
                  event.preventDefault();
                  toggleMark(editor, "bold");
                }}
                title="Bold (Ctrl+B)"
              >
                <Bold className="h-4 w-4" />
              </ToolbarButton>

              <ToolbarButton
                variant={isMarkActive(editor, "italic") ? "default" : "outline"}
                onMouseDown={(event) => {
                  event.preventDefault();
                  toggleMark(editor, "italic");
                }}
                title="Italic (Ctrl+I)"
              >
                <Italic className="h-4 w-4" />
              </ToolbarButton>

              <ToolbarButton
                variant={
                  isMarkActive(editor, "underline") ? "default" : "outline"
                }
                onMouseDown={(event) => {
                  event.preventDefault();
                  toggleMark(editor, "underline");
                }}
                title="Underline (Ctrl+U)"
              >
                <Underline className="h-4 w-4" />
              </ToolbarButton>

              <ToolbarButton
                variant={
                  isMarkActive(editor, "superscript") ? "default" : "outline"
                }
                onMouseDown={(event) => {
                  event.preventDefault();
                  if (isMarkActive(editor, "subscript")) {
                    toggleMark(editor, "subscript");
                  }
                  toggleMark(editor, "superscript");
                }}
                title="Superscript"
              >
                <Superscript className="h-4 w-4" />
              </ToolbarButton>

              <ToolbarButton
                variant={
                  isMarkActive(editor, "subscript") ? "default" : "outline"
                }
                onMouseDown={(event) => {
                  event.preventDefault();
                  if (isMarkActive(editor, "superscript")) {
                    toggleMark(editor, "superscript");
                  }
                  toggleMark(editor, "subscript");
                }}
                title="Subscript"
              >
                <Subscript className="h-4 w-4" />
              </ToolbarButton>
            </div>

            <Separator />

            {/* Color Pickers Row */}
            <div className="flex items-center gap-2">
              <ColorPicker
                value={getMarkValue(editor, "color") as string}
                onChange={(color) => setMark(editor, "color", color)}
                title="Text Color"
                icon={Type}
              />

              <ColorPicker
                value={getMarkValue(editor, "backgroundColor") as string}
                onChange={(color) => setMark(editor, "backgroundColor", color)}
                title="Background Color"
                icon={Palette}
              />
            </div>

            <Separator />

            {/* Alignment and Lists Row */}
            <div className="flex items-center gap-2">
              <Select
                value={getCurrentAlignment(editor)}
                onValueChange={(value) => toggleBlock(editor, value)}
              >
                <SelectTrigger className="w-12 h-8 p-0 justify-center">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-auto min-w-0">
                  <SelectItem value="left" className="px-2">
                    <AlignLeft className="h-4 w-4" />
                  </SelectItem>
                  <SelectItem value="center" className="px-2">
                    <AlignCenter className="h-4 w-4" />
                  </SelectItem>
                  <SelectItem value="right" className="px-2">
                    <AlignRight className="h-4 w-4" />
                  </SelectItem>
                  <SelectItem value="justify" className="px-2">
                    <AlignJustify className="h-4 w-4" />
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <ToolbarButton
                  variant={
                    isBlockActive(editor, "bulleted-list")
                      ? "default"
                      : "outline"
                  }
                  onMouseDown={(event) => {
                    event.preventDefault();
                    toggleBlock(editor, "bulleted-list");
                  }}
                  title="Bullet List"
                >
                  <List className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarButton
                  variant={
                    isBlockActive(editor, "numbered-list")
                      ? "default"
                      : "outline"
                  }
                  onMouseDown={(event) => {
                    event.preventDefault();
                    toggleBlock(editor, "numbered-list");
                  }}
                  title="Numbered List"
                >
                  <ListOrdered className="h-4 w-4" />
                </ToolbarButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WYSIWYGToolbar;
export type { WYSIWYGToolbarProps };
