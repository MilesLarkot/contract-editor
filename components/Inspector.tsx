import { LibraryBig, PcCase } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import FieldPicker from "./FieldPicker";
import ClauseLibrary from "./ClauseLibrary";

interface Field {
  id: number;
  fieldName: string;
  fieldValue: string;
}

interface InspectorProps {
  addField: (field: Field) => void;
  updateField: (field: { fieldName: string; fieldValue: string }) => void;
  initialFields: Field[];
  content?: string;
  isActive: boolean;
  isTemplate: boolean;
}

type TabType = "fields" | "library";

function Inspector({
  addField,
  updateField,
  initialFields,
  content,
  isActive,
  isTemplate,
}: InspectorProps) {
  const [activeTab, setActiveTab] = useState<TabType>("fields");
  return (
    <div
      className={`fixed top-0 right-0 h-full w-[300px] border-l z-20 bg-white translate-x-full sm:translate-x-0 ${
        isActive ? "translate-x-0" : "translate-x-full"
      } flex transition-transform`}
    >
      <div className="w-fit p-2 h-full border-r flex flex-col gap-2">
        <Button
          size="icon"
          variant={activeTab === "fields" ? "default" : "outline"}
          onClick={() => setActiveTab("fields")}
        >
          <PcCase />
        </Button>
        <Button
          size="icon"
          variant={activeTab === "library" ? "default" : "outline"}
          onClick={() => setActiveTab("library")}
        >
          <LibraryBig />
        </Button>
      </div>
      <div className="h-full w-full p-2">
        {activeTab === "fields" ? (
          <FieldPicker
            setFinalFields={addField}
            updateField={updateField}
            initialFields={initialFields}
            content={content}
            isTemplate={isTemplate}
          />
        ) : (
          <ClauseLibrary />
        )}
      </div>
    </div>
  );
}

export default Inspector;
