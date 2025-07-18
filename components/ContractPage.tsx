"use client";
import Inspector from "@/components/Inspector";
import { useState, useCallback, useRef } from "react";
import WYSIWYGEditor, { WYSIWYGEditorHandle } from "@/components/WYSIWYGEditor";
import { useParams } from "next/navigation";
import InspectorButton from "./InspectorButton";
import ContractHeader from "./ContractHeader";
import { useDebouncedSave } from "@/hooks/useDebounceSave";
import { useAutoSaveContract } from "@/hooks/useAutoSaveContract";
import { useLoadContract } from "@/hooks/useLoadContract";
import { useContractData } from "@/hooks/useContractData";
import { updateFieldsState } from "@/hooks/updateFieldState";
import { syncEditorField } from "@/hooks/syncEditorField";
import { updateContentJson } from "@/hooks/updateContentJson";
import { useSaveContract } from "@/hooks/useSaveContract";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import PreviewPDF from "./PreviewPDF";

interface ContractData {
  defaultFields?: Record<string, { value: string; mapping?: string }>;
  id?: string;
  title?: string;
  description?: string;
  content?: string;
  fields?: Record<string, string>;
  tags?: string[];
}

interface ContractPageProps {
  contractData?: ContractData;
  isTemplate?: boolean;
}

export default function ContractPage({
  contractData,
  isTemplate = false,
}: ContractPageProps) {
  const params = useParams();
  const id = params?.id === "new" ? null : (params?.id as string | null);
  const [fields, setFields] = useState<
    { id: number; fieldName: string; fieldValue: string; mapping?: string }[]
  >(() => {
    console.log("Initial contractData:", JSON.stringify(contractData, null, 2)); // Debug initial data
    if (isTemplate && contractData?.defaultFields) {
      return Object.entries(contractData.defaultFields).map(
        ([fieldName, field], index) => {
          const fieldValue = typeof field.value === "string" ? field.value : "";
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
      );
    } else if (contractData?.fields) {
      return Object.entries(contractData.fields).map(
        ([fieldName, fieldValue], index) => {
          const value = typeof fieldValue === "string" ? fieldValue : "";
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
            mapping: contractData.defaultFields?.[fieldName]?.mapping || "",
          };
        }
      );
    }
    return [];
  });
  const [title, setTitle] = useState(contractData?.title || "");
  const [description, setDescription] = useState(
    contractData?.description || ""
  );
  const [tags, setTags] = useState<string[]>(contractData?.tags || []);
  const [content, setContent] = useState(contractData?.content || "");
  const [contractId, setContractId] = useState<string | null>(id);
  const [localSaveError, setSaveError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!!id);
  const editorRef = useRef<WYSIWYGEditorHandle>(null);
  const [isActive, setIsActive] = useState(false);

  const { fetchContractData } = useContractData({
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
  });

  useLoadContract(id, fetchContractData, setIsLoading);

  const addField = (field: {
    id: number;
    fieldName: string;
    fieldValue: string;
    mapping?: string;
  }) => {
    setFields((prev) => {
      if (
        field.fieldName &&
        prev.some((f) => f.fieldName === field.fieldName)
      ) {
        return prev;
      }
      return [...prev, field];
    });
  };

  const updateField = (updatedField: {
    fieldName: string;
    fieldValue: string;
    mapping?: string;
  }) => {
    console.log("Updating field:", updatedField);
    if (typeof updatedField.fieldValue !== "string") {
      console.error("fieldValue is not a string:", updatedField.fieldValue);
      return;
    }
    setFields((prev) => updateFieldsState(prev, updatedField));
    syncEditorField(editorRef, updatedField);
    setContent((prev) => updateContentJson(prev, updatedField));
  };

  const deleteField = (fieldId: number) => {
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
  };

  const {
    saveContract,
    isSaving,
    lastSaved,
    saveError,
    // setContractId: setSaveContractId,
  } = useSaveContract({
    title,
    description,
    content,
    fields,
    contractId,
    isTemplate,
    tags,
  });

  const debouncedSaveRef = useDebouncedSave(saveContract, 2000);

  const triggerDebouncedSave = useCallback(() => {
    console.log(
      "Triggering save with fields:",
      JSON.stringify(fields, null, 2)
    );
    debouncedSaveRef.current?.();
  }, [fields]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    debouncedSaveRef.current?.cancel();
    console.log("Manual save with fields:", JSON.stringify(fields, null, 2));
    await saveContract();
  };

  useAutoSaveContract({
    isLoading,
    triggerDebouncedSave,
    debouncedSaveRef,
    deps: [title, description, content, fields, contractId, tags],
  });

  console.log(localSaveError);

  const [previewPDF, setPreviewPDF] = useState(false);

  return (
    <div className="sm:pr-[300px] h-screen min-h-fit">
      <InspectorButton
        toggle={() => setIsActive((prev) => !prev)}
        isActive={isActive}
      />
      <div className="flex flex-1 flex-col gap-4 px-2 sm:px-10 bg-gray-100 pt-6 min-h-fit">
        <ContractHeader
          title={title}
          description={description}
          content={content}
          isTemplate={isTemplate}
          isSaving={isSaving}
          isLoading={isLoading}
          lastSaved={lastSaved}
          saveError={saveError}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onTagsChange={setTags}
          tags={tags}
          onSubmit={handleSubmit}
        />
        <div className="space-x-2 ml-auto">
          <Label htmlFor="preview-mode">Preview Mode</Label>
          <Switch
            id="preview-mode"
            checked={previewPDF}
            onCheckedChange={setPreviewPDF}
          />
        </div>
        {previewPDF ? (
          <PreviewPDF title={title} content={content} />
        ) : (
          <div className="bg-white drop-shadow-[5px_5px_0_rgba(0,0,0,0.10)] min-h-fit">
            <WYSIWYGEditor
              ref={editorRef}
              value={content}
              onChange={setContent}
              placeholder={`Enter ${
                isTemplate ? "template" : "contract"
              } content`}
              onFieldDrop={(field) => addField({ id: fields.length, ...field })}
              onFieldUpdate={updateField}
            />
          </div>
        )}
      </div>
      <Inspector
        addField={addField}
        updateField={updateField}
        deleteField={deleteField}
        initialFields={fields}
        content={content}
        isActive={isActive}
        isTemplate={isTemplate}
      />
    </div>
  );
}
