"use client";
import { Button } from "@/components/ui/button";
import {
  SquarePlus,
  LetterText,
  Ellipsis,
  Copy,
  Settings,
  Trash,
} from "lucide-react";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
} from "./ui/dropdown-menu";
import { useState, useEffect } from "react";

interface Field {
  id: number;
  fieldName: string;
  fieldValue: string;
}

interface FieldPickerProps {
  setFinalFields: (field: Field) => void;
  updateField: (field: { fieldName: string; fieldValue: string }) => void;
  initialFields: Field[];
  onFieldValueChange?: (fieldName: string, fieldValue: string) => void;
  isTemplate: boolean;
}

function FieldPicker({
  setFinalFields,
  updateField,
  initialFields,
  onFieldValueChange,
  isTemplate,
}: FieldPickerProps) {
  const [fields, setFields] = useState<Field[]>(initialFields);
  const [nameErrors, setNameErrors] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    setFields(initialFields);
  }, [initialFields]);

  useEffect(() => {
    const nameCounts = new Map<string, number>();
    const errors = new Map<number, string>();

    fields.forEach((field) => {
      if (field.fieldName) {
        const count = (nameCounts.get(field.fieldName) || 0) + 1;
        nameCounts.set(field.fieldName, count);
        if (count > 1) {
          errors.set(
            field.id,
            `Field name "${field.fieldName}" is already in use`
          );
        }
      }
    });

    setNameErrors(errors);
  }, [fields]);

  useEffect(() => {
    const handler = (
      e: CustomEvent<{ fieldName: string; fieldValue: string }>
    ) => {
      const { fieldName, fieldValue } = e.detail;

      setFields((prev) => {
        const updated = prev.map((f) =>
          f.fieldName === fieldName ? { ...f, fieldValue } : f
        );
        return updated;
      });

      if (onFieldValueChange) {
        onFieldValueChange(fieldName, fieldValue);
      }
    };

    window.addEventListener("field-value-updated", handler as EventListener);
    return () =>
      window.removeEventListener(
        "field-value-updated",
        handler as EventListener
      );
  }, [onFieldValueChange]);

  const addFields = () => {
    const newField = { id: Date.now(), fieldName: "", fieldValue: "" };
    setFields((prev) => [...prev, newField]);
    setFinalFields(newField);
  };

  const handleFieldUpdate = (updatedField: Field) => {
    setFields((prev) =>
      prev.map((f) => (f.id === updatedField.id ? updatedField : f))
    );

    if (updatedField.fieldName && !nameErrors.has(updatedField.id)) {
      updateField({
        fieldName: updatedField.fieldName,
        fieldValue: updatedField.fieldValue,
      });
    }
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    field: Field
  ) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        fieldName: field.fieldName,
        fieldValue: field.fieldValue,
      })
    );
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="space-y-4">
      <div className="px-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={addFields}
          disabled={fields.some((f) => f.fieldName === "")}
        >
          <SquarePlus /> Add Fields
        </Button>
      </div>

      <div className="flex">
        <p className="font-semibold text-sm">All fields</p>
      </div>

      {fields.map((field) => (
        <div
          className="flex border-b group cursor-move bg-white"
          key={field.id}
          draggable={field.fieldName !== "" && !nameErrors.has(field.id)}
          onDragStart={(e) =>
            field.fieldName &&
            !nameErrors.has(field.id) &&
            handleDragStart(e, field)
          }
        >
          <div className="mr-2 p-1">
            <div className="bg-blue-500 rounded-xl p-1">
              <LetterText size={16} className="text-white" />
            </div>
          </div>

          <div className="flex-1">
            <div className="relative">
              <Input
                placeholder="Field Name"
                className={`focus-visible:ring-0 focus-visible:ring-offset-0 outline-none border-none font-semibold h-fit hover:bg-blue-50 ${
                  nameErrors.has(field.id) ? "border-red-500" : ""
                }`}
                value={field.fieldName}
                onChange={(e) =>
                  handleFieldUpdate({ ...field, fieldName: e.target.value })
                }
              />
              {nameErrors.has(field.id) && (
                <span className="text-red-500 text-xs absolute top-0 right-0 mt-1 mr-2">
                  {nameErrors.get(field.id)}
                </span>
              )}
            </div>

            <Input
              placeholder="Add text"
              className="focus-visible:ring-0 focus-visible:ring-offset-0 outline-none border-none pl-5 h-fit hover:bg-blue-50"
              value={field.fieldValue}
              onChange={(e) =>
                handleFieldUpdate({ ...field, fieldValue: e.target.value })
              }
              disabled={nameErrors.has(field.id) || isTemplate}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Ellipsis className="text-white group-hover:text-blue-600 mr-2 cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-50" align="start">
              <DropdownMenuGroup className="space-y-1 p-1">
                <DropdownMenuItem className="flex items-center gap-2 p-1 outline-none cursor-pointer hover:bg-blue-50 rounded hover:text-blue-600">
                  <Settings size={16} />
                  Properties
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 p-1 outline-none cursor-pointer hover:bg-blue-50 rounded hover:text-blue-600"
                  onClick={() =>
                    setFields((prev) => [
                      ...prev,
                      {
                        ...field,
                        id: Date.now(),
                      },
                    ])
                  }
                >
                  <Copy size={16} />
                  Duplicate field
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 p-1 outline-none cursor-pointer hover:bg-blue-50 rounded hover:text-blue-600"
                  onClick={() =>
                    setFields((prev) => prev.filter((f) => f.id !== field.id))
                  }
                >
                  <Trash size={16} />
                  Delete field
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
}

export default FieldPicker;
