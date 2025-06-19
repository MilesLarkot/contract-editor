import { ChevronLeft, ChevronRight } from "lucide-react";

function InspectorButton({
  toggle,
  isActive,
}: {
  toggle: () => void;
  isActive: boolean;
}) {
  return (
    <div
      className={`fixed right-0 bottom-6 bg-gray-300 py-1 z-30 rounded-l-md cursor-pointer sm:hidden `}
      onClick={toggle}
    >
      {isActive ? <ChevronRight size={30} /> : <ChevronLeft size={30} />}
    </div>
  );
}

export default InspectorButton;
