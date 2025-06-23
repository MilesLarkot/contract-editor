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

interface ContractData {
  id?: string;
  title?: string;
  content?: string;
  fields?: Record<string, string>;
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
    { id: number; fieldName: string; fieldValue: string }[]
  >(
    contractData?.fields
      ? Object.entries(contractData.fields).map(
          ([fieldName, fieldValue], index) => ({
            id: index,
            fieldName,
            fieldValue,
          })
        )
      : []
  );
  const [title, setTitle] = useState(contractData?.title || "");
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
    setContent,
    setFields,
    setContractId,
    setIsLoading,
    setSaveError,
  });

  useLoadContract(id, fetchContractData, setIsLoading);

  const addField = (field: {
    id: number;
    fieldName: string;
    fieldValue: string;
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
  }) => {
    setFields((prev) => updateFieldsState(prev, updatedField));
    syncEditorField(editorRef, updatedField);
    setContent((prev) => updateContentJson(prev, updatedField));
  };

  const { saveContract, isSaving, lastSaved, saveError } = useSaveContract({
    title,
    content,
    fields,
    contractId,
    isTemplate,
  });

  const debouncedSaveRef = useDebouncedSave(saveContract, 2000);

  const triggerDebouncedSave = useCallback(() => {
    debouncedSaveRef.current?.();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    debouncedSaveRef.current?.cancel();
    await saveContract();
  };

  useAutoSaveContract({
    isLoading,
    triggerDebouncedSave,
    debouncedSaveRef,
    deps: [title, content, fields, contractId],
  });

  console.log(localSaveError);

  return (
    <div className="sm:pr-[300px] h-screen">
      <InspectorButton
        toggle={() => setIsActive((prev) => !prev)}
        isActive={isActive}
      />
      <div className="flex flex-1 flex-col gap-4 px-2 sm:px-10 bg-gray-100 pt-6">
        <ContractHeader
          title={title}
          content={content}
          isTemplate={isTemplate}
          isSaving={isSaving}
          isLoading={isLoading}
          lastSaved={lastSaved}
          saveError={saveError}
          onTitleChange={setTitle}
          onSubmit={handleSubmit}
        />
        <div className="bg-white drop-shadow-[5px_5px_0_rgba(0,0,0,0.10)]">
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
      </div>
      <Inspector
        addField={addField}
        updateField={updateField}
        initialFields={fields}
        isActive={isActive}
        isTemplate={isTemplate}
      />
    </div>
  );
}
