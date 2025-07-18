import { useCallback } from "react";

interface Field {
  id: number;
  fieldName: string;
  fieldValue: string;
  mapping?: string;
}

interface ContractData {
  id?: string;
  title?: string;
  description?: string;
  content?: string;
  defaultFields?: Record<string, { value: string; mapping?: string }>;
  fields?: Record<string, string>;
  tags?: string[];
}

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
        const data: ContractData = await response.json();
        console.log("Fetched contractData:", JSON.stringify(data, null, 2)); // Debug fetched data

        const validatedFields: Field[] =
          isTemplate && data.defaultFields
            ? Object.entries(data.defaultFields).map(
                ([fieldName, field], index) => {
                  const fieldValue =
                    typeof field.value === "string" ? field.value : "";
                  if (typeof field.value !== "string") {
                    console.error(
                      `Invalid fieldValue for ${fieldName}:`,
                      field.value,
                      "Using empty string"
                    );
                  }
                  return {
                    id: index,
                    fieldName,
                    fieldValue,
                    mapping: field.mapping || "",
                  };
                }
              )
            : data.fields
            ? Object.entries(data.fields).map(
                ([fieldName, fieldValue], index) => {
                  const value =
                    typeof fieldValue === "string" ? fieldValue : "";
                  if (typeof fieldValue !== "string") {
                    console.error(
                      `Invalid fieldValue for ${fieldName}:`,
                      fieldValue,
                      "Using empty string"
                    );
                  }
                  return {
                    id: index,
                    fieldName,
                    fieldValue: value,
                    mapping: data.defaultFields?.[fieldName]?.mapping || "",
                  };
                }
              )
            : [];

        console.log(
          "Validated fields:",
          JSON.stringify(validatedFields, null, 2)
        ); // Debug transformed fields

        setTitle(data.title || "");
        setDescription(data.description || "");
        setContent(data.content || "");
        setFields(validatedFields);
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
