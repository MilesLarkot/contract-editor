"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ExportButtonProps {
  title?: string;
  content?: string;
}

interface SlateNode {
  type?: string;
  text?: string;
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
  align?: string;
  children?: SlateNode[];
  fieldName?: string;
  fieldValue?: string;
  url?: string;
}

const slateToHtml = (nodes: SlateNode[]): string => {
  return nodes.map((node) => nodeToHtml(node)).join("");
};

const nodeToHtml = (node: SlateNode | string): string => {
  if (typeof node === "string") {
    return node;
  }

  if (node.text !== undefined) {
    let text = node.text || "";
    if (!text) return "";

    if (node.bold) text = `<strong>${text}</strong>`;
    if (node.italic) text = `<em>${text}</em>`;
    if (node.underline) text = `<u>${text}</u>`;
    if (node.strikethrough) text = `<del>${text}</del>`;
    if (node.code) text = `<code>${text}</code>`;
    if (node.superscript) text = `<sup>${text}</sup>`;
    if (node.subscript) text = `<sub>${text}</sub>`;

    const styles: string[] = [];
    if (node.color) styles.push(`color: ${node.color}`);
    if (node.backgroundColor)
      styles.push(`background-color: ${node.backgroundColor}`);
    if (node.fontSize) styles.push(`font-size: ${node.fontSize}`);

    if (styles.length > 0) {
      text = `<span style="${styles.join("; ")}">${text}</span>`;
    }

    return text;
  }

  const children = node.children ? slateToHtml(node.children) : "";
  const alignStyle = node.align ? ` style="text-align: ${node.align}"` : "";

  switch (node.type) {
    case "paragraph":
      return `<p${alignStyle}>${children}</p>`;

    case "heading":
      return `<h1${alignStyle}>${children}</h1>`;

    case "block-quote":
      return `<blockquote${alignStyle}>${children}</blockquote>`;

    case "code-block":
      return `<pre><code${alignStyle}>${children}</code></pre>`;

    case "bulleted-list":
      return `<ul${alignStyle}>${children}</ul>`;

    case "numbered-list":
      return `<ol${alignStyle}>${children}</ol>`;

    case "list-item":
      return `<li${alignStyle}>${children}</li>`;

    case "link":
      return `<a href="${node.url || "#"}"${alignStyle}>${children}</a>`;

    case "field":
      const fieldValue = node.fieldValue || node.fieldName || "";
      return fieldValue;

    default:
      return `<div${alignStyle}>${children}</div>`;
  }
};

const generatePdfHtml = (title: string, content: string): string => {
  let parsedContent: SlateNode[];
  try {
    parsedContent = JSON.parse(content || "[]");
  } catch (e) {
    parsedContent = [
      { type: "paragraph", children: [{ text: content || "" }] },
    ];
    console.error(e);
  }

  const htmlContent = slateToHtml(parsedContent);

  return `
<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${htmlContent}
</body>
</html>
  `;
};

function ExportButton({ title = "Contract", content = "" }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const htmlContent = generatePdfHtml(title, content);

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        throw new Error(
          "Failed to open print window. Please allow popups for this site."
        );
      }

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();

          printWindow.onafterprint = () => {
            printWindow.close();
          };
        }, 250);
      };
    } catch (error) {
      console.error("Export failed:", error);
      alert(
        `Export failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={isExporting}>
      {isExporting ? "Exporting..." : "Export PDF"}
    </Button>
  );
}

export default ExportButton;
