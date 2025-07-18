import { useCallback } from "react";

interface TemplateData {
  _id: string;
  title: string;
  content: string;
  defaultFields: Map<string, string>;
  metadata: { category?: string; description: string };
}

interface ContractData {
  title: string;
  content: string;
  fields: Map<string, string>;
  templateId: string;
  metadata: { category?: string; description: string };
}

export function useConvertTemplateToContract() {
  const convertTemplateToContract = useCallback(
    (template: TemplateData): ContractData => {
      console.log(
        "Converting template defaultFields:",
        JSON.stringify(Array.from(template.defaultFields.entries()), null, 2)
      ); // Debug
      const fields = new Map<string, string>();
      Array.from(template.defaultFields.entries()).forEach(([key, value]) => {
        fields.set(key, typeof value === "string" ? value : "");
      });

      return {
        title: template.title,
        content: template.content,
        fields,
        templateId: template._id,
        metadata: template.metadata,
      };
    },
    []
  );

  return { convertTemplateToContract };
}
