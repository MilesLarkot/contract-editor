import { LibraryBig, PcCase } from "lucide-react";
import { Button } from "./ui/button";
import FieldPicker from "./FieldPicker";

interface Field {
  id: number;
  fieldName: string;
  fieldValue: string;
}

interface InspectorProps {
  addField: (field: Field) => void;
  updateField: (field: { fieldName: string; fieldValue: string }) => void;
  initialFields: Field[];
  isActive: boolean;
  isTemplate: boolean;
}

function Inspector({
  addField,
  updateField,
  initialFields,
  isActive,
  isTemplate,
}: InspectorProps) {
  return (
    <div
      className={`fixed top-0 right-0 h-full w-[300px] border-l z-20 bg-white translate-x-full sm:translate-x-0 ${
        isActive ? "translate-x-0" : "translate-x-full"
      } flex transition-transform`}
    >
      <div className="w-fit p-2 h-full border-r flex flex-col gap-2">
        <Button size="icon" variant="outline">
          <LibraryBig />
        </Button>
        <Button size="icon" variant="outline">
          <PcCase />
        </Button>
      </div>
      <div className="h-full w-full p-2">
        <FieldPicker
          setFinalFields={addField}
          updateField={updateField}
          initialFields={initialFields}
          isTemplate={isTemplate}
        />
      </div>
    </div>
  );
}

export default Inspector;
