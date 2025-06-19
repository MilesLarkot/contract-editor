"use client";
import { useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import ReactQuill, { Quill } from "react-quill";

const ReactQuillComponent = dynamic(() => import("react-quill"), {
  ssr: false,
});

interface WYSIWYGEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFieldDrop?: (field: { fieldName: string; fieldValue: string }) => void;
}

export default function WYSIWYGEditor({
  value,
  onChange,
  placeholder = "Enter contract content",
  onFieldDrop,
}: WYSIWYGEditorProps) {
  const quillRef = useRef<ReactQuill>(null);
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        ["blockquote", "code-block"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        ["link"],
        ["clean"],
      ],
    }),
    []
  );

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

      const quill = quillRef.current?.getEditor();
      if (quill) {
        const range = quill.getSelection();
        const position = range ? range.index : quill.getLength();
        quill.insertText(position, `{{${fieldName}}}`);
      }

      if (onFieldDrop) {
        onFieldDrop({ fieldName, fieldValue });
      }
    } catch (err) {
      console.error("Failed to parse dropped field", err);
    }
  };

  return (
    <div onDragOver={handleDragOver} onDrop={handleDrop}>
      <ReactQuill
        theme="snow"
        ref={quillRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        className="h-[600px] mb-12"
      />
    </div>
  );
}
