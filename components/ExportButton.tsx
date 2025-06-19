"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ExportButtonProps {
  title?: string;
  content?: string;
}

const slateToHtml = (nodes: any[]): string => {
  return nodes.map((node) => nodeToHtml(node)).join("");
};

const nodeToHtml = (node: any): string => {
  if (typeof node === "string") {
    return node;
  }

  if (node.text !== undefined) {
    let text = node.text;
    if (!text) return "";

    if (node.bold) text = `<strong>${text}</strong>`;
    if (node.italic) text = `<em>${text}</em>`;
    if (node.underline) text = `<u>${text}</u>`;
    if (node.strikethrough) text = `<s>${text}</s>`;
    if (node.code)
      text = `<code style="background-color: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-family: monospace;">${text}</code>`;
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
      return `<h${node.level}${alignStyle}>${children}</h${node.level}>`;

    case "block-quote":
      return `<blockquote style="border-left: 4px solid #ccc; padding-left: 16px; margin: 16px 0; font-style: italic;"${alignStyle}>${children}</blockquote>`;

    case "code-block":
      return `<pre style="background-color: #f5f5f5; padding: 16px; border-radius: 4px; font-family: monospace; overflow-x: auto; white-space: pre-wrap;"${alignStyle}><code>${children}</code></pre>`;

    case "bulleted-list":
      return `<ul style="margin: 16px 0; padding-left: 20px;"${alignStyle}>${children}</ul>`;

    case "numbered-list":
      return `<ol style="margin: 16px 0; padding-left: 20px;"${alignStyle}>${children}</ol>`;

    case "list-item":
      return `<li${alignStyle}>${children}</li>`;

    case "link":
      return `<a href="${node.url}" style="color: #0066cc; text-decoration: underline;">${children}</a>`;

    case "field":
      const fieldValue = node.fieldValue || node.fieldName;
      return fieldValue;

    default:
      return `<div${alignStyle}>${children}</div>`;
  }
};

const generatePdfHtml = (title: string, content: string): string => {
  let parsedContent;
  try {
    parsedContent = JSON.parse(content || "[]");
  } catch (e) {
    parsedContent = [
      { type: "paragraph", children: [{ text: content || "" }] },
    ];
  }

  const htmlContent = slateToHtml(parsedContent);

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 40px 20px;
            }
            h1 { font-size: 2.5em; margin-bottom: 0.5em; font-weight: bold; }
            h2 { font-size: 2em; margin-bottom: 0.5em; font-weight: bold; }
            h3 { font-size: 1.5em; margin-bottom: 0.5em; font-weight: bold; }
            h4 { font-size: 1.25em; margin-bottom: 0.5em; font-weight: bold; }
            h5 { font-size: 1.1em; margin-bottom: 0.5em; font-weight: bold; }
            h6 { font-size: 1em; margin-bottom: 0.5em; font-weight: bold; }
            p { margin-bottom: 1em; }
            ul, ol { margin-bottom: 1em; }
            li { margin-bottom: 0.5em; }
            code { font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; }
            pre { margin-bottom: 1em; }
            blockquote { margin-bottom: 1em; }
            .title {
                font-size: 2.5em;
                font-weight: bold;
                margin-bottom: 1em;
                text-align: center;
                border-bottom: 2px solid #333;
                padding-bottom: 0.5em;
            }
            @media print {
                body { margin: 0; padding: 20px; }
                @page { 
                    margin: 0.5in;
                    size: auto;
                }
            }
        </style>
    </head>
    <body>
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
    <div className="flex gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={handleExport}
        disabled={isExporting}
      >
        {isExporting ? "Exporting..." : "Export PDF"}
      </Button>
    </div>
  );
}

export default ExportButton;
