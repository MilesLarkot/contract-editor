"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Inspector from "@/components/Inspector";
import { useState, useEffect, useCallback, useRef } from "react";
import WYSIWYGEditor, { WYSIWYGEditorHandle } from "@/components/WYSIWYGEditor";
import { useParams } from "next/navigation";
import { debounce } from "lodash";
import ExportButton from "./ExportButton";
import InspectorButton from "./InspectorButton";

interface ContractData {
  id?: string;
  title?: string;
  content?: string;
  fields?: Record<string, string>;
}

interface ContractPageProps {
  contractData?: ContractData;
  isTemplate?: boolean;
}

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

export default function ContractPage({
  contractData,
  isTemplate = false,
}: ContractPageProps) {
  const params = useParams();
  const id = params?.id === "new" ? null : (params?.id as string | null);
  const [fields, setFields] = useState<
    { id: number; fieldName: string; fieldValue: string }[]
  >(
    contractData?.fields
      ? Object.entries(contractData.fields).map(
          ([fieldName, fieldValue], index) => ({
            id: index,
            fieldName,
            fieldValue,
          })
        )
      : []
  );
  const [title, setTitle] = useState(contractData?.title || "");
  const [content, setContent] = useState(contractData?.content || "");
  const [contractId, setContractId] = useState<string | null>(id);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!!id);
  const isSavingRef = useRef(false);
  const editorRef = useRef<WYSIWYGEditorHandle>(null);
  const debouncedSaveRef = useRef<ReturnType<typeof debounce>>();
  const [isActive, setIsActive] = useState(false);

  const fetchContractData = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/${isTemplate ? "templates" : "contracts"}/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          cache: "no-store",
        }
      );

      if (response.ok) {
        const data: ContractData = await response.json();
        setTitle(data.title || "");
        setContent(data.content || "");
        setFields(
          data.fields
            ? Object.entries(data.fields).map(
                ([fieldName, fieldValue], index) => ({
                  id: index,
                  fieldName,
                  fieldValue,
                })
              )
            : []
        );
        setContractId(data.id || id);
      } else {
        const errorText = await response.text();
        console.error(
          `Failed to fetch ${isTemplate ? "template" : "contract"}:`,
          response.status,
          errorText
        );
        setSaveError(
          `Failed to fetch ${isTemplate ? "template" : "contract"}: ${
            response.status
          } ${errorText}`
        );
      }
    } catch (err) {
      console.error(
        `Error fetching ${isTemplate ? "template" : "contract"}:`,
        err
      );
      setSaveError(
        `Error fetching ${isTemplate ? "template" : "contract"}: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  }, [id, isTemplate]);

  useEffect(() => {
    if (id) {
      fetchContractData();
    } else {
      setIsLoading(false);
    }
  }, [id, contractData, fetchContractData]);

  const addField = (field: {
    id: number;
    fieldName: string;
    fieldValue: string;
  }) => {
    setFields((prev) => {
      if (
        field.fieldName &&
        prev.some((f) => f.fieldName === field.fieldName)
      ) {
        return prev;
      }
      return [...prev, field];
    });
  };

  const updateField = (updatedField: {
    fieldName: string;
    fieldValue: string;
  }) => {
    setFields((prev) => {
      const targetField = prev.find(
        (f) => f.fieldName === updatedField.fieldName
      );
      if (!targetField) {
        return prev;
      }
      const duplicateExists = prev.some(
        (f) => f.fieldName === updatedField.fieldName && f.id !== targetField.id
      );
      if (duplicateExists && updatedField.fieldName !== "") {
        return prev;
      }
      const newFields = prev.map((f) =>
        f.id === targetField.id
          ? {
              ...f,
              fieldName: updatedField.fieldName,
              fieldValue: updatedField.fieldValue,
            }
          : f
      );
      return newFields;
    });

    if (editorRef.current && updatedField.fieldName) {
      editorRef.current.updateFieldValue(
        updatedField.fieldName,
        updatedField.fieldValue
      );
      setContent((prevContent) => {
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
      });
    }
  };

  const saveContract = useCallback(async () => {
    if (isSavingRef.current) {
      return;
    }
    isSavingRef.current = true;

    if (!title && !content && fields.length === 0) {
      isSavingRef.current = false;
      return;
    }

    try {
      const contractDataToSave = {
        title,
        content,
        fields: fields.reduce((acc, field) => {
          if (field.fieldName) {
            acc[field.fieldName] = field.fieldValue;
          }
          return acc;
        }, {} as Record<string, string>),
      };

      setIsSaving(true);
      setSaveError(null);

      const method = contractId ? "PATCH" : "POST";
      const url = contractId
        ? `/api/${isTemplate ? "templates" : "contracts"}/${contractId}`
        : `/api/${isTemplate ? "templates" : "contracts"}`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contractDataToSave),
      });

      if (response.ok) {
        const result = await response.json();
        if (!contractId && (result._id || result.id)) {
          const newId = result._id || result.id;
          setContractId(newId);
          window.history.replaceState(
            null,
            "",
            `/${isTemplate ? "templates" : "contracts"}/${newId}`
          );
        }
        setLastSaved(new Date().toLocaleTimeString());
      } else {
        const errorText = await response.text();
        console.error("Save failed:", response.status, errorText);
        setSaveError(`Save failed: ${response.status} ${errorText}`);
      }
    } catch (err) {
      console.error(
        `Error saving ${isTemplate ? "template" : "contract"}:`,
        err
      );
      setSaveError(
        `Error saving ${isTemplate ? "template" : "contract"}: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsSaving(false);
      isSavingRef.current = false;
    }
  }, [title, content, fields, contractId, isTemplate]);

  useEffect(() => {
    debouncedSaveRef.current = debounce(() => {
      saveContract();
    }, 2000);

    return () => {
      debouncedSaveRef.current?.cancel();
    };
  }, [saveContract]);

  const triggerDebouncedSave = useCallback(() => {
    debouncedSaveRef.current?.();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    debouncedSaveRef.current?.cancel();
    await saveContract();
  };

  useEffect(() => {
    if (isLoading) {
      return;
    }
    triggerDebouncedSave();
    return () => {
      debouncedSaveRef.current?.cancel();
    };
  }, [title, content, fields, contractId, isLoading, triggerDebouncedSave]);

  return (
    <div className="sm:pr-[300px] h-screen">
      <InspectorButton
        toggle={() => setIsActive((prev) => !prev)}
        isActive={isActive}
      />
      <div className="flex flex-1 flex-col gap-4 px-2 sm:px-10 bg-gray-100  pt-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="bg-white p-4 drop-shadow-[5px_5px_0_rgba(0,0,0,0.10)] rounded space-y-4">
            <div className="flex justify-between items-center">
              <Button type="submit" disabled={isSaving || isLoading}>
                {isSaving
                  ? "Saving..."
                  : isLoading
                  ? "Loading..."
                  : `Save ${isTemplate ? "Template" : "Contract"}`}
              </Button>
              <div className="mr-auto ml-2">
                <ExportButton title={title} content={content} />
              </div>
              <div className="flex flex-col items-end">
                {lastSaved && (
                  <span className="text-sm text-gray-500">
                    Last saved: {lastSaved}
                  </span>
                )}
                {saveError && (
                  <span className="text-sm text-red-500">{saveError}</span>
                )}
              </div>
            </div>
            <Input
              id="title"
              name="title"
              required
              placeholder={`Enter ${
                isTemplate ? "template" : "contract"
              } title`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="bg-white drop-shadow-[5px_5px_0_rgba(0,0,0,0.10)]">
            <WYSIWYGEditor
              ref={editorRef}
              value={content}
              onChange={setContent}
              placeholder={`Enter ${
                isTemplate ? "template" : "contract"
              } content`}
              onFieldDrop={(field) => addField({ id: fields.length, ...field })}
              onFieldUpdate={updateField}
            />
          </div>
        </form>
      </div>
      <Inspector
        addField={addField}
        updateField={updateField}
        initialFields={fields}
        isActive={isActive}
        isTemplate={isTemplate}
      />
    </div>
  );
}
