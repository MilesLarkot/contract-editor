import { useCallback } from "react";
import { getContract, getTemplate } from "@/lib/api";

interface ContractDataParams {
  id: string | null;
  isTemplate: boolean;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setFields: (
    fields: { id: number; fieldName: string; fieldValue: string }[]
  ) => void;
  setContractId: (id: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setSaveError: (error: string | null) => void;
}

export function useContractData({
  id,
  isTemplate,
  setTitle,
  setContent,
  setFields,
  setContractId,
  setIsLoading,
  setSaveError,
}: ContractDataParams) {
  const fetchContractData = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    try {
      const data = isTemplate ? await getTemplate(id) : await getContract(id);
      console.log(`Fetched ${isTemplate ? "template" : "contract"}:`, data);
      setTitle(data.title || "");
      setContent(data.content || "");
      const fields = isTemplate ? data.defaultFields : data.fields;
      setFields(
        fields
          ? Object.entries(fields).map(([fieldName, fieldValue], index) => ({
              id: index,
              fieldName,
              fieldValue: String(fieldValue),
            }))
          : []
      );
      setContractId(data.id);
      setSaveError(null);
    } catch (error: any) {
      console.error(
        `Error fetching ${isTemplate ? "template" : "contract"}:`,
        error.response?.data || error.message
      );
      setSaveError(
        error.response?.status === 403
          ? `Permission denied: Unable to load ${
              isTemplate ? "template" : "contract"
            }`
          : `Failed to load ${isTemplate ? "template" : "contract"}`
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    id,
    isTemplate,
    setTitle,
    setContent,
    setFields,
    setContractId,
    setIsLoading,
    setSaveError,
  ]);

  return { fetchContractData };
}
