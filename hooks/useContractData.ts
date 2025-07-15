import { useCallback } from "react";

type Field = { id: number; fieldName: string; fieldValue: any };

export function useContractData({
  id,
  isTemplate,
  setTitle,
  setDescription,
  setContent,
  setFields,
  setContractId,
  setIsLoading,
  setSaveError,
  setTags,
}: {
  id: string | null;
  isTemplate: boolean;
  setTitle: (t: string) => void;
  setDescription: (d: string) => void;
  setContent: (c: string) => void;
  setFields: (f: Field[]) => void;
  setContractId: (id: string) => void;
  setIsLoading: (b: boolean) => void;
  setSaveError: (msg: string) => void;
  setTags?: (tags: string[]) => void;
}) {
  const fetchContractData = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
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
        const data = await response.json();
        setTitle(data.title || "");
        setDescription(data.description || "");
        setContent(data.content || "");
        setFields(
          isTemplate && data.defaultFields
            ? Object.entries(data.defaultFields).map(
                ([fieldName, fieldValue], index) => ({
                  id: index,
                  fieldName,
                  fieldValue: fieldValue || "",
                })
              )
            : data.fields
            ? Object.entries(data.fields).map(
                ([fieldName, fieldValue], index) => ({
                  id: index,
                  fieldName,
                  fieldValue: fieldValue || "",
                })
              )
            : []
        );
        if (isTemplate && setTags) {
          setTags(data.tags || []);
        }
        setContractId(data.id || id);
      } else {
        const errorText = await response.text();
        setSaveError(
          `Failed to fetch ${isTemplate ? "template" : "contract"}: ${
            response.status
          } ${errorText}`
        );
        console.error("Fetch failed:", response.status, errorText);
      }
    } catch (err) {
      setSaveError(
        `Error fetching ${isTemplate ? "template" : "contract"}: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [
    id,
    isTemplate,
    setTitle,
    setDescription,
    setContent,
    setFields,
    setContractId,
    setIsLoading,
    setSaveError,
    setTags,
  ]);

  return { fetchContractData };
}
