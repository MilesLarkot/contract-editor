import { useCallback, useRef, useState } from "react";

interface ContractData {
  title: string;
  content: string;
  fields: { id: number; fieldName: string; fieldValue: string }[];
  contractId: string | null;
  isTemplate: boolean;
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
  content,
  fields,
  contractId: initialContractId,
  isTemplate,
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

    if (!title && !content && fields.length === 0) {
      isSavingRef.current = false;
      return;
    }

    if (title === "") {
      title = "Untitled Contract";
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

  return {
    saveContract,
    isSaving,
    lastSaved,
    saveError,
    setContractId,
  };
}
