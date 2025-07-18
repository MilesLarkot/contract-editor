/* eslint-disable */
"use client";
import { Button } from "@/components/ui/button";
import {
  SquarePlus,
  LetterText,
  Ellipsis,
  Copy,
  Trash,
  Map as MapIcon,
} from "lucide-react";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
} from "./ui/dropdown-menu";
import { useState, useEffect, useCallback } from "react";

interface Field {
  id: number;
  fieldName: string;
  fieldValue: string;
  mapping?: string;
}

interface FieldPickerProps {
  setFinalFields: (field: Field) => void;
  updateField: (field: { fieldName: string; fieldValue: string }) => void;
  deleteField: (fieldId: number) => void;
  initialFields: Field[];
  content?: string;
  onFieldValueChange?: (fieldName: string, fieldValue: string) => void;
  isTemplate: boolean;
  onFieldsChange?: (fields: Field[]) => void;
}

function FieldPicker({
  setFinalFields,
  updateField,
  deleteField,
  initialFields,
  content,
  onFieldValueChange,
  isTemplate,
  onFieldsChange,
}: FieldPickerProps) {
  const [fields, setFields] = useState<Field[]>(initialFields);
  const [nameErrors, setNameErrors] = useState<Map<number, string>>(new Map());
  const [editingMappingFieldId, setEditingMappingFieldId] = useState<
    number | null
  >(null);
  const [tempParty, setTempParty] = useState<string>("");
  const [tempProperty, setTempProperty] = useState<string>("");

  const sortedFields = [...fields].sort((a, b) => {
    if (!a.fieldName.trim() && !b.fieldName.trim()) return 0;
    if (!a.fieldName.trim()) return -1;
    if (!b.fieldName.trim()) return 1;

    return a.fieldName.toLowerCase().localeCompare(b.fieldName.toLowerCase());
  });

  const extractFieldsFromContent = useCallback(
    (content: string | undefined): Field[] => {
      if (!content) return [];
      try {
        const parsedContent = JSON.parse(content);
        const extractedFields: Field[] = [];

        const traverseNodes = (nodes: any[]) => {
          nodes.forEach((node) => {
            if (node.type === "field" && node.fieldName) {
              extractedFields.push({
                id: Date.now() + Math.random(),
                fieldName: node.fieldName,
                fieldValue: node.fieldValue || "",
                mapping: node.mapping || "",
              });
            }
            if (node.children) {
              traverseNodes(node.children);
            }
          });
        };

        traverseNodes(parsedContent);
        return extractedFields;
      } catch (e) {
        console.error("Failed to parse content JSON:", e);
        return [];
      }
    },
    []
  );

  useEffect(() => {
    const contentFields = extractFieldsFromContent(content);
    const existingFieldNames = new Set(fields.map((f) => f.fieldName.trim()));

    const missingFields = contentFields.filter(
      (field) =>
        field.fieldName && !existingFieldNames.has(field.fieldName.trim())
    );

    if (missingFields.length > 0) {
      setFields((prev) => {
        const newFields = [...prev, ...missingFields];
        missingFields.forEach((field) => setFinalFields(field));
        return newFields;
      });
    }
  }, [content, extractFieldsFromContent, setFinalFields]);

  useEffect(() => {
    setFields(initialFields);
  }, [initialFields]);

  useEffect(() => {
    const nameCounts = new Map<string, number>();
    const errors = new Map<number, string>();

    fields.forEach((field) => {
      if (field.fieldName.trim()) {
        const trimmedName = field.fieldName.trim();
        const count = (nameCounts.get(trimmedName) || 0) + 1;
        nameCounts.set(trimmedName, count);
        if (count > 1) {
          errors.set(field.id, `Field name "${trimmedName}" is already in use`);
        }
      }
    });

    setNameErrors(errors);
  }, [fields]);

  useEffect(() => {
    if (onFieldsChange) {
      onFieldsChange(fields);
    }
  }, [fields, onFieldsChange]);

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

  const addFields = useCallback(() => {
    const newField = {
      id: Date.now(),
      fieldName: "",
      fieldValue: "",
      mapping: "",
    };
    setFields((prev) => [...prev, newField]);
    setFinalFields(newField);
  }, [setFinalFields]);

  const handleFieldUpdate = useCallback(
    (updatedField: Field) => {
      console.log("FieldPicker handleFieldUpdate:", updatedField); // Debug fieldValue
      if (typeof updatedField.fieldValue !== "string") {
        console.error(
          "FieldPicker: fieldValue is not a string:",
          updatedField.fieldValue
        );
        return;
      }
      setFields((prev) =>
        prev.map((f) => (f.id === updatedField.id ? updatedField : f))
      );

      if (updatedField.fieldName.trim() && !nameErrors.has(updatedField.id)) {
        updateField({
          fieldName: updatedField.fieldName.trim(),
          fieldValue: updatedField.fieldValue,
        });
      }
    },
    [updateField, nameErrors]
  );

  const handleMappingChange = useCallback(
    (fieldId: number, party: string, property: string) => {
      const mapping = party && property ? `${party}.${property}` : "";
      setFields((prev) =>
        prev.map((f) => (f.id === fieldId ? { ...f, mapping } : f))
      );
      setFinalFields({
        id: fieldId,
        fieldName: fields.find((f) => f.id === fieldId)?.fieldName || "",
        fieldValue: fields.find((f) => f.id === fieldId)?.fieldValue || "",
        mapping,
      });
      setEditingMappingFieldId(null);
      setTempParty("");
      setTempProperty("");
    },
    [setFinalFields, fields]
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, field: Field) => {
      e.dataTransfer.setData(
        "application/json",
        JSON.stringify({
          fieldName: field.fieldName.trim(),
          fieldValue: field.fieldValue,
          mapping: field.mapping,
        })
      );
      e.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const duplicateField = useCallback(
    (field: Field) => {
      let newName = field.fieldName + "_copy";
      const existingNames = new Set(
        fields.map((f) => f.fieldName.trim().toLowerCase())
      );
      let counter = 1;

      while (existingNames.has(newName.toLowerCase())) {
        newName = field.fieldName + "_copy" + counter;
        counter++;
      }

      const newField = {
        ...field,
        id: Date.now() + Math.random(),
        fieldName: newName,
      };

      setFields((prev) => [...prev, newField]);
      setFinalFields(newField);
    },
    [fields, setFinalFields]
  );

  const deleteFieldCallback = useCallback(
    (fieldId: number) => {
      setFields((prev) => prev.filter((f) => f.id !== fieldId));
      deleteField(fieldId);
      if (editingMappingFieldId === fieldId) {
        setEditingMappingFieldId(null);
        setTempParty("");
        setTempProperty("");
      }
    },
    [deleteField, editingMappingFieldId]
  );

  const startEditingMapping = useCallback(
    (fieldId: number, currentMapping: string, event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      setEditingMappingFieldId(fieldId);
      if (currentMapping) {
        const [party, property] = currentMapping.split(".");
        setTempParty(party || "");
        setTempProperty(property || "");
      } else {
        setTempParty("");
        setTempProperty("");
      }
    },
    []
  );

  const cancelEditingMapping = useCallback(() => {
    setEditingMappingFieldId(null);
    setTempParty("");
    setTempProperty("");
  }, []);

  const hasEmptyFieldNames = fields.some((f) => f.fieldName.trim() === "");

  return (
    <div className="flex flex-col h-full">
      <div className="px-2 flex-shrink-0">
        <Button
          variant="outline"
          className="w-full"
          onClick={addFields}
          disabled={hasEmptyFieldNames}
          title={
            hasEmptyFieldNames
              ? "Please fill in all field names before adding new fields"
              : "Add new field"
          }
        >
          <SquarePlus className="mr-2" /> Add Fields
        </Button>
      </div>

      <div className="flex px-2 py-2 flex-shrink-0">
        <p className="font-semibold text-sm">
          All fields ({sortedFields.length})
        </p>
      </div>

      <div
        className="flex-1 overflow-y-scroll min-h-0 scrollbar-always-visible"
        onWheel={(e) => e.stopPropagation()}
      >
        <style jsx>{`
          .scrollbar-always-visible::-webkit-scrollbar {
            width: 8px;
          }
          .scrollbar-always-visible::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .scrollbar-always-visible::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 4px;
          }
          .scrollbar-always-visible::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
          }
          .scrollbar-always-visible {
            scrollbar-width: thin;
            scrollbar-color: #c1c1c1 #f1f1f1;
          }
        `}</style>
        {sortedFields.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No fields yet. Click "Add Fields" to get started.</p>
          </div>
        ) : (
          sortedFields.map((field) => (
            <div
              className="flex border-b group cursor-move bg-white hover:bg-gray-50 transition-colors"
              key={field.id}
              draggable={
                field.fieldName.trim() !== "" && !nameErrors.has(field.id)
              }
              onDragStart={(e) =>
                field.fieldName.trim() &&
                !nameErrors.has(field.id) &&
                handleDragStart(e, field)
              }
            >
              <div className="mr-2 p-1">
                <div className="bg-primary rounded-xl p-1">
                  <LetterText size={16} className="text-white" />
                </div>
              </div>

              <div className="flex-1">
                <div className="relative">
                  <Input
                    placeholder="Field Name"
                    className={`focus-visible:ring-0 focus-visible:ring-offset-0 outline-none border-none font-semibold h-fit hover:bg-blue-50 transition-colors ${
                      nameErrors.has(field.id) ? "border-red-500" : ""
                    }`}
                    value={field.fieldName}
                    onChange={(e) =>
                      handleFieldUpdate({ ...field, fieldName: e.target.value })
                    }
                    maxLength={50}
                  />
                  {nameErrors.has(field.id) && (
                    <span className="text-red-500 text-xs absolute top-0 right-0 mt-1 mr-2">
                      {nameErrors.get(field.id)}
                    </span>
                  )}
                </div>

                <Input
                  placeholder="Add text"
                  className="focus-visible:ring-0 focus-visible:ring-offset-0 outline-none border-none pl-5 h-fit hover:bg-blue-50 transition-colors"
                  value={field.fieldValue}
                  onChange={(e) =>
                    handleFieldUpdate({ ...field, fieldValue: e.target.value })
                  }
                  disabled={nameErrors.has(field.id)}
                  title={
                    nameErrors.has(field.id)
                      ? "Resolve field name errors to edit value"
                      : ""
                  }
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Ellipsis className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-50" align="start">
                  <DropdownMenuGroup className="space-y-1 p-1">
                    {isTemplate && (
                      <>
                        <DropdownMenuItem
                          className="flex items-center gap-2 p-1 outline-none cursor-pointer hover:bg-blue-50 rounded hover:text-blue-600"
                          onClick={(e) =>
                            startEditingMapping(
                              field.id,
                              field.mapping || "",
                              e
                            )
                          }
                        >
                          <MapIcon size={16} />
                          Mapping {field.mapping ? `(${field.mapping})` : ""}
                        </DropdownMenuItem>
                        {editingMappingFieldId === field.id && (
                          <div className="p-2">
                            <Input
                              placeholder="Party (e.g., partyA)"
                              value={tempParty}
                              onChange={(e) => setTempParty(e.target.value)}
                              disabled={nameErrors.has(field.id)}
                              title={
                                nameErrors.has(field.id)
                                  ? "Resolve field name errors to edit mapping"
                                  : "Enter the party for this field"
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleMappingChange(
                                    field.id,
                                    tempParty,
                                    tempProperty
                                  );
                                } else if (e.key === "Escape") {
                                  cancelEditingMapping();
                                }
                              }}
                              className="mb-2"
                            />
                            <Input
                              placeholder="Property (e.g., name)"
                              value={tempProperty}
                              onChange={(e) => setTempProperty(e.target.value)}
                              disabled={nameErrors.has(field.id)}
                              title={
                                nameErrors.has(field.id)
                                  ? "Resolve field name errors to edit mapping"
                                  : "Enter the property for this field"
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleMappingChange(
                                    field.id,
                                    tempParty,
                                    tempProperty
                                  );
                                } else if (e.key === "Escape") {
                                  cancelEditingMapping();
                                }
                              }}
                            />
                            <div className="flex gap-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleMappingChange(
                                    field.id,
                                    tempParty,
                                    tempProperty
                                  )
                                }
                                disabled={nameErrors.has(field.id)}
                              >
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={cancelEditingMapping}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    <DropdownMenuItem
                      className="flex items-center gap-2 p-1 outline-none cursor-pointer hover:bg-blue-50 rounded hover:text-blue-600"
                      onClick={() => duplicateField(field)}
                    >
                      <Copy size={16} />
                      Duplicate field
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2 p-1 outline-none cursor-pointer hover:bg-red-50 rounded hover:text-red-600"
                      onClick={() => deleteFieldCallback(field.id)}
                    >
                      <Trash size={16} />
                      Delete field
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default FieldPicker;
