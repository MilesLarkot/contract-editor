"use client";

import { useMemo } from "react";

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

interface PreviewPDFProps {
  title?: string;
  content?: string;
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
  const alignStyle = node.align ? `text-align: ${node.align};` : "";
  const elementStyle =
    node.type === "heading"
      ? `font-size: 24px; font-weight: bold; margin-bottom: 16px;`
      : node.type === "paragraph"
      ? `margin-bottom: 25px;`
      : "";
  const combinedStyle =
    alignStyle || elementStyle ? ` style="${alignStyle}${elementStyle}"` : "";

  switch (node.type) {
    case "paragraph":
      return `<p${combinedStyle}>${children}</p>`;
    case "heading":
      return `<h1${combinedStyle}>${children}</h1>`;
    case "block-quote":
      return `<blockquote${combinedStyle}>${children}</blockquote>`;
    case "code-block":
      return `<pre><code${combinedStyle}>${children}</code></pre>`;
    case "bulleted-list":
      return `<ul${combinedStyle}>${children}</ul>`;
    case "numbered-list":
      return `<ol${combinedStyle}>${children}</ol>`;
    case "list-item":
      return `<li${combinedStyle}>${children}</li>`;
    case "link":
      return `<a href="${node.url || "#"}"${combinedStyle}>${children}</a>`;
    case "field":
      const fieldValue = node.fieldValue || node.fieldName || "";
      return `<strong>${fieldValue}</strong>`;
    default:
      return `<div${combinedStyle}>${children}</div>`;
  }
};

export default function PreviewPDF({ content = "" }: PreviewPDFProps) {
  const htmlContent = useMemo(() => {
    let parsedContent: SlateNode[];
    try {
      parsedContent = JSON.parse(content || "[]");
    } catch (e) {
      parsedContent = [
        { type: "paragraph", children: [{ text: content || "" }] },
      ];
      console.error("Error parsing content:", e);
    }
    return slateToHtml(parsedContent);
  }, [content]);

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        background: "#f3f4f6",
        display: "grid",
        placeItems: "center",
        minHeight: "fit-content",
      }}
    >
      <div
        className="paper"
        style={{
          background: "white",
          height: "100%",
          padding: "20px",
          filter: "drop-shadow(5px 5px 0 rgba(0, 0, 0, 0.1))",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "80px",
            borderBottom: "2px rgba(0, 0, 0, 0.1) solid",
            marginBottom: "24px",
          }}
        ></div>
        <div
          className="content"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}
