interface TextNode {
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
}

interface NodeType {
  type?: string;
  fieldName?: string;
  fieldValue?: string;
  children?: TextNode[];
  elementId?: string;
  align?: "left" | "center" | "right" | "justify";
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  url?: string;
  [key: string]: unknown;
}

export function updateContentJson(
  prevContent: string,
  updatedField: { fieldName: string; fieldValue: string }
): string {
  try {
    const parsed = JSON.parse(prevContent || "[]");
    if (Array.isArray(parsed)) {
      const updatedContent = parsed.map((node: NodeType) => {
        if (
          node.type === "field" &&
          node.fieldName === updatedField.fieldName
        ) {
          return { ...node, fieldValue: updatedField.fieldValue };
        }
        return node;
      });
      return JSON.stringify(updatedContent);
    }
  } catch (err) {
    console.error("Error updating content:", err);
  }
  return prevContent;
}
