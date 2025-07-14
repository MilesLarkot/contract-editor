import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ExportButton from "./ExportButton";

interface ContractHeaderProps {
  title: string;
  description: string;
  content: string;
  isTemplate?: boolean;
  isSaving: boolean;
  isLoading: boolean;
  lastSaved: string | null;
  saveError: string | null;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ContractHeader({
  title,
  description,
  content,
  isTemplate = false,
  isSaving,
  isLoading,
  lastSaved,
  saveError,
  onTitleChange,
  onDescriptionChange,
  onSubmit,
}: ContractHeaderProps) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="bg-white p-4 drop-shadow-[5px_5px_0_rgba(0,0,0,0.10)] rounded space-y-4">
        <div className="flex justify-between items-center">
          <Button type="submit" disabled={isSaving || isLoading}>
            {isSaving
              ? "Saving..."
              : isLoading
              ? "Loading..."
              : `Save ${isTemplate ? "Template" : "Contract"}`}
          </Button>
          <div className="mr-auto ml-2 flex space-x-2">
            <ExportButton title={title} content={content} />
          </div>
          <div className="flex flex-col items-end">
            {lastSaved && (
              <span className="text-sm text-gray-500">
                Last saved: {lastSaved}
              </span>
            )}
            {saveError && (
              <span className="text-sm text-red-500">{saveError}</span>
            )}
          </div>
        </div>
        <Input
          id="title"
          name="title"
          placeholder={`Enter ${isTemplate ? "template" : "contract"} title`}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
        {isTemplate && (
          <Input
            id="description"
            name="description"
            placeholder="Enter template description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        )}
      </div>
    </form>
  );
}
