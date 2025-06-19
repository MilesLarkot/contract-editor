"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Inspector from "@/components/Inspector";
import { useState, useEffect, useCallback, useRef } from "react";
import WYSIWYGEditor, { WYSIWYGEditorHandle } from "@/components/WYSIWYGEditor";
import { useParams } from "next/navigation";
import { debounce } from "lodash";
import ExportButton from "./ExportButton";

interface ContractData {
  id?: string;
  title?: string;
  content?: string;
  fields?: Record<string, string>;
}

interface ContractPageProps {
  contractData?: ContractData;
}

export default function ContractPage({ contractData }: ContractPageProps) {
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
  const isSavingRef = useRef(false);
  const editorRef = useRef<WYSIWYGEditorHandle>(null);
  const debouncedSaveRef = useRef<ReturnType<typeof debounce>>();

  const fetchContractData = useCallback(async () => {
    if (!id) {
      console.log("No contract ID provided, skipping fetch");
      return;
    }

    try {
      console.log(`Fetching contract data for ID: ${id}`);
      const response = await fetch(`/api/contracts/${id}?t=${Date.now()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
      });

      if (response.ok) {
        const data: ContractData = await response.json();
        console.log("Fetched contract data:", data);
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
        console.error("Failed to fetch contract:", response.status, errorText);
        setSaveError(
          `Failed to fetch contract: ${response.status} ${errorText}`
        );
      }
    } catch (err) {
      console.error("Error fetching contract:", err);
      setSaveError(
        `Error fetching contract: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  }, [id]);

  useEffect(() => {
    console.log(
      "Component mounted, params.id:",
      id,
      "contractData:",
      contractData
    );
    if (id) {
      fetchContractData();
    } else {
      console.log("No ID, initializing new contract state");
    }
  }, [id, contractData, fetchContractData]);

  const addField = (field: {
    id: number;
    fieldName: string;
    fieldValue: string;
  }) => {
    setFields((prev) => {
      // Reject if fieldName is non-empty and already exists
      if (
        field.fieldName &&
        prev.some((f) => f.fieldName === field.fieldName)
      ) {
        console.log(
          `Field with name "${field.fieldName}" already exists, skipping add`
        );
        return prev;
      }
      console.log("Adding field:", field);
      return [...prev, field];
    });
  };

  const updateField = (updatedField: {
    fieldName: string;
    fieldValue: string;
  }) => {
    console.log("🔄 updateField called with:", updatedField);

    setFields((prev) => {
      // Find the field being updated
      const targetField = prev.find(
        (f) => f.fieldName === updatedField.fieldName
      );
      if (!targetField) {
        console.log(`❌ No field found with name "${updatedField.fieldName}"`);
        return prev;
      }
      // Check for duplicate fieldName from other fields
      const duplicateExists = prev.some(
        (f) => f.fieldName === updatedField.fieldName && f.id !== targetField.id
      );
      if (duplicateExists && updatedField.fieldName !== "") {
        console.log(
          `❌ Duplicate field name "${updatedField.fieldName}" detected, skipping update`
        );
        return prev;
      }
      console.log("✅ Updating field successfully");
      const newFields = prev.map((f) =>
        f.id === targetField.id
          ? {
              ...f,
              fieldName: updatedField.fieldName,
              fieldValue: updatedField.fieldValue,
            }
          : f
      );
      console.log("🔄 New fields state:", newFields);
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
            const updatedContent = parsed.map((node: any) => {
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
    console.log("🚀 saveContract called");
    console.log("📊 Current state:", {
      title,
      content: content.substring(0, 100) + "...", // Truncate for logging
      fieldsCount: fields.length,
      contractId,
      isSaving: isSavingRef.current,
    });

    if (isSavingRef.current) {
      console.log("⏳ Save already in progress, skipping");
      return;
    }
    isSavingRef.current = true;

    if (!title && !content && fields.length === 0) {
      console.log("📝 No data to save, skipping.");
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

      console.log("📤 Sending data:", contractDataToSave);

      setIsSaving(true);
      setSaveError(null);

      const method = contractId ? "PATCH" : "POST";
      const url = contractId
        ? `/api/contracts/${contractId}`
        : "/api/contracts";

      console.log(`🌐 Making ${method} request to ${url}`);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contractDataToSave),
      });

      console.log("📡 Response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Save successful, response:", result);
        if (!contractId && (result._id || result.id)) {
          const newId = result._id || result.id;
          console.log(`🔥 New contract created. Updating ID to: ${newId}`);
          setContractId(newId);
          window.history.replaceState(null, "", `/contracts/${newId}/edit`);
        }
        setLastSaved(new Date().toLocaleTimeString());
      } else {
        const errorText = await response.text();
        console.error("❌ Save failed:", response.status, errorText);
        setSaveError(`Save failed: ${response.status} ${errorText}`);
      }
    } catch (err) {
      console.error("💥 Error saving contract:", err);
      setSaveError(
        `Error saving contract: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsSaving(false);
      isSavingRef.current = false;
    }
  }, [title, content, fields, contractId]);

  useEffect(() => {
    console.log(
      "Content changed in ContractPage:",
      content.length,
      "characters"
    );
  }, [content]);

  useEffect(() => {
    debouncedSaveRef.current = debounce(() => {
      console.log("⏰ Debounced save triggered with contractId:", contractId);
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
    console.log("Manual save triggered");
    debouncedSaveRef.current?.cancel();
    await saveContract();
  };

  useEffect(() => {
    console.log("State changed, scheduling autosave:", {
      title,
      content: content.substring(0, 50) + "...",
      fieldsCount: fields.length,
      contractId,
    });
    triggerDebouncedSave();

    return () => {
      console.log("Cleaning up debounced save");
      debouncedSaveRef.current?.cancel();
    };
  }, [title, content, fields, triggerDebouncedSave]);

  return (
    <div className="pr-[300px] h-screen">
      <div className="flex flex-1 flex-col gap-4 px-10 bg-gray-100 h-full pt-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="bg-white p-4 drop-shadow-[5px_5px_0_rgba(0,0,0,0.10)] rounded space-y-4">
            <div className="flex justify-between items-center">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Contract"}
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
              placeholder="Enter contract title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="bg-white drop-shadow-[5px_5px_0_rgba(0,0,0,0.10)]">
            <WYSIWYGEditor
              ref={editorRef}
              value={content}
              onChange={setContent}
              placeholder="Enter contract content"
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
      />
    </div>
  );
}
