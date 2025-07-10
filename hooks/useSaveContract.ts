import { useCallback, useRef, useState } from "react";
import {
  createContract,
  updateContract,
  createTemplate,
  updateTemplate,
} from "@/lib/api";

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

    try {
      const contractDataToSave = {
        title: title || "Untitled Template",
        content: content || "",
        [isTemplate ? "defaultFields" : "fields"]: fields.reduce(
          (acc, field) => {
            if (field.fieldName) {
              acc[field.fieldName] = field.fieldValue;
            }
            return acc;
          },
          {} as Record<string, string>
        ),
      };

      setIsSaving(true);
      setSaveError(null);

      let result;
      if (contractId) {
        console.log(
          `Updating ${
            isTemplate ? "template" : "contract"
          } with ID: ${contractId}`,
          contractDataToSave
        );
        result = isTemplate
          ? await updateTemplate(contractId, contractDataToSave)
          : await updateContract(contractId, contractDataToSave);
      } else {
        console.log(
          `Creating new ${isTemplate ? "template" : "contract"}`,
          contractDataToSave
        );
        result = isTemplate
          ? await createTemplate(contractDataToSave)
          : await createContract(contractDataToSave);
      }

      if (!contractId && result.id) {
        const newId = result.id;
        setContractId(newId);
        window.history.replaceState(
          null,
          "",
          `/${isTemplate ? "templates" : "contracts"}/${newId}`
        );
      }
      setLastSaved(new Date().toLocaleTimeString());
    } catch (error: any) {
      console.error(
        `Error saving ${isTemplate ? "template" : "contract"}:`,
        error.response?.data || error.message
      );
      setSaveError(
        error.response?.status === 403
          ? `Permission denied: Unable to save ${
              isTemplate ? "template" : "contract"
            }`
          : `Error saving ${isTemplate ? "template" : "contract"}: ${
              error.message || "Unknown error"
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
