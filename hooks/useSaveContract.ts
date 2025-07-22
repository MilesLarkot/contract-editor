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
  saveContract: () => Promise<string | void>;
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
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8091/api/legal";

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
      const contractDataToSave = {
        title: title || "Untitled",
        description: description || "",
        content: content ?? "",
        ...(isTemplate
          ? {
              defaultFields: fields.reduce((acc, field) => {
                if (field.fieldName.trim()) {
                  acc[field.fieldName] = {
                    value: String(field.fieldValue),
                    mapping: field.mapping || "",
                  };
                }
                return acc;
              }, {} as Record<string, { value: string; mapping: string }>),
            }
          : {
              fields: fields.reduce((acc, field) => {
                if (field.fieldName.trim()) {
                  acc[field.fieldName] = String(field.fieldValue);
                }
                return acc;
              }, {} as Record<string, string>),
            }),
        metadata: {
          description: description || "",
          tags: isTemplate ? tags || [] : undefined,
        },
      };

      console.log(
        "Payload to API:",
        JSON.stringify(contractDataToSave, null, 2)
      );

      setIsSaving(true);
      setSaveError(null);

      const method = contractId ? "PUT" : "POST";
      const url = contractId
        ? `${API_BASE_URL}/${
            isTemplate ? "templates" : "contracts"
          }/${contractId}`
        : `${API_BASE_URL}/${isTemplate ? "templates" : "contracts"}`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contractDataToSave),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Raw error response:", errorText);
        throw new Error(
          `Failed to save ${isTemplate ? "template" : "contract"}: ${
            response.status
          } ${errorText}`
        );
      }

      const result = await response.json();
      console.log("API response:", JSON.stringify(result, null, 2));
      if (!contractId && result.id) {
        setContractId(result.id);
        window.history.replaceState(
          null,
          "",
          `/${isTemplate ? "templates" : "contracts"}/${result.id}`
        );
        return result.id;
      }
      setLastSaved(new Date().toLocaleTimeString());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error(
        `Error saving ${isTemplate ? "template" : "contract"}:`,
        errorMessage
      );
      setSaveError(
        `Error saving ${isTemplate ? "template" : "contract"}: ${errorMessage}`
      );
      throw err;
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
