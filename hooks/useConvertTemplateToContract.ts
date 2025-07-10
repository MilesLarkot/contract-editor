import { useCallback } from "react";

interface TemplateData {
  id: string;
  title: string;
  content: string;
  defaultFields: Map<string, string>;
  metadata: {
    category?: string;
  };
}

interface ContractData {
  id?: string;
  title: string;
  content: string;
  fields: Map<string, string>;
  templateId?: string;
  metadata: {
    createdBy?: string;
  };
  versionHistory: { content: string; updatedAt: Date }[];
}

export const useConvertTemplateToContract = () => {
  const convertTemplateToContract = useCallback(
    (template: TemplateData): ContractData => {
      return {
        id: undefined,
        title: template.title,
        content: template.content,
        fields: template.defaultFields,
        templateId: template.id,
        metadata: {
          createdBy: undefined,
        },
        versionHistory: [],
      };
    },
    []
  );

  return { convertTemplateToContract };
};
