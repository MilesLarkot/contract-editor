import { useCallback, useRef, useState } from "react";

interface ContractField {
  id: number;
  fieldName: string;
  fieldValue: string;
  mapping?: string;
}

interface ContractData {
  title: string;
  description: string;
  content: string;
  fields: ContractField[];
  contractId: string | null;
  isTemplate: boolean;
  tags?: string[];
}

interface SaveContractResult {
  saveContract: () => Promise<void>;
  isSaving: boolean;
  lastSaved: string | null;
  saveError: string | null;
  setContractId: (id: string | null) => void;
}

export function useSaveContract({
  title,
  description,
  content,
  fields,
  contractId: initialContractId,
  isTemplate,
  tags,
}: ContractData): SaveContractResult {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [contractId, setContractId] = useState<string | null>(
    initialContractId
  );
  const isSavingRef = useRef(false);

  const saveContract = useCallback(async () => {
    if (isSavingRef.current) {
      return;
    }
    isSavingRef.current = true;

    if (
      !title &&
      !content &&
      fields.length === 0 &&
      !description &&
      (!isTemplate || !tags?.length)
    ) {
      isSavingRef.current = false;
      setSaveError("No data to save");
      return;
    }

    try {
      // Log fields to debug [object Object]
      console.log("Fields before save:", JSON.stringify(fields, null, 2));

      const contractDataToSave = {
        title: title || "Untitled Template",
        description: description || "",
        content: content ?? "",
        ...(isTemplate
          ? {
              defaultFields: fields.reduce((acc, field) => {
                if (field.fieldName.trim()) {
                  acc[field.fieldName] = {
                    value: String(field.fieldValue), // Ensure string
                    mapping: field.mapping || "",
                  };
                }
                return acc;
              }, {} as Record<string, { value: string; mapping: string }>),
              tags: tags || [],
            }
          : {
              fields: fields.reduce((acc, field) => {
                if (field.fieldName.trim()) {
                  acc[field.fieldName] = String(field.fieldValue); // Ensure string
                }
                return acc;
              }, {} as Record<string, string>),
            }),
      };

      // Log payload to debug [object Object]
      console.log(
        "Payload to API:",
        JSON.stringify(contractDataToSave, null, 2)
      );

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
        const errorData = await response.json();
        const errorMessage =
          errorData.error || `Save failed: ${response.status}`;
        console.error("Save failed:", response.status, errorMessage);
        setSaveError(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error(
        `Error saving ${isTemplate ? "template" : "contract"}:`,
        errorMessage
      );
      setSaveError(
        `Error saving ${isTemplate ? "template" : "contract"}: ${errorMessage}`
      );
    } finally {
      setIsSaving(false);
      isSavingRef.current = false;
    }
  }, [title, description, content, fields, contractId, isTemplate, tags]);

  return {
    saveContract,
    isSaving,
    lastSaved,
    saveError,
    setContractId,
  };
}
