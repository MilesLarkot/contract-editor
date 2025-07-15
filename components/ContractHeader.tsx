import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ExportButton from "./ExportButton";
import { PlusCircle, X } from "lucide-react";
import React from "react";
import { Badge } from "./ui/badge";

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
  onTagsChange: (tags: string[]) => void;
  tags: string[];
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
  onTagsChange,
  tags,
  onSubmit,
}: ContractHeaderProps) {
  const [tagInput, setTagInput] = React.useState("");

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (!trimmedTag || tags.includes(trimmedTag)) return;
    onTagsChange([...tags, trimmedTag]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    onTagsChange(tags.filter((t) => t !== tag));
  };

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
          <>
            <Input
              id="description"
              name="description"
              placeholder="Enter template description"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
            />
            <div className="w-full flex items-center justify-start gap-2 flex-wrap">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag()}
                placeholder="New tag…"
                className="flex-1 rounded-lg border px-2 py-1 text-sm max-w-[100px]"
              />
              <Button size="sm" variant="outline" onClick={addTag}>
                <PlusCircle className="mr-1 h-4 w-4" />
                Add tag
              </Button>
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="gap-1 cursor-default py-2"
                >
                  {tag}
                  <X
                    className="h-3 w-3 hover:opacity-70 cursor-pointer hover:text-red-600"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </>
        )}
      </div>
    </form>
  );
}
