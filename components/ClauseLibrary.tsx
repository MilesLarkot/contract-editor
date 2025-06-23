import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, SquarePlus, Trash } from "lucide-react";

interface Clause {
  _id: string;
  title: string;
  content: string;
}

function ClauseLibrary() {
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newClauseTitle, setNewClauseTitle] = useState("");
  const [newClauseContent, setNewClauseContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editingClauseId, setEditingClauseId] = useState<string | null>(null);
  const [editClauseTitle, setEditClauseTitle] = useState("");
  const [editClauseContent, setEditClauseContent] = useState("");

  useEffect(() => {
    async function fetchClauses() {
      try {
        const response = await fetch("/api/clauses");
        const data = await response.json();
        setClauses(data);
      } catch (error) {
        console.error("Failed to fetch clauses:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchClauses();
  }, []);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    clause: Clause
  ) => {
    e.dataTransfer.setData("text/plain", clause.content);
    e.dataTransfer.setData("application/clause-id", clause._id);
  };

  const handleAddClause = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClauseTitle.trim() || !newClauseContent.trim()) {
      setError("Title and content are required");
      return;
    }

    try {
      const response = await fetch("/api/clauses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newClauseTitle,
          content: newClauseContent,
          metadata: {},
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create clause");
      }

      const newClause = await response.json();
      setClauses([...clauses, newClause]);
      setNewClauseTitle("");
      setNewClauseContent("");
      setError(null);
    } catch (error) {
      console.error("Error creating clause:", error);
      setError("Failed to create clause");
    }
  };

  const handleEditClause = async (e: React.FormEvent, clauseId: string) => {
    e.preventDefault();
    if (!editClauseTitle.trim() || !editClauseContent.trim()) {
      setError("Title and content are required");
      return;
    }

    try {
      const response = await fetch(`/api/clauses/${clauseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editClauseTitle,
          content: editClauseContent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update clause");
      }

      const updatedClause = await response.json();
      setClauses(
        clauses.map((clause) =>
          clause._id === clauseId ? updatedClause : clause
        )
      );
      setEditingClauseId(null);
      setEditClauseTitle("");
      setEditClauseContent("");
      setError(null);
    } catch (error) {
      console.error("Error updating clause:", error);
      setError("Failed to update clause");
    }
  };

  const handleDeleteClause = async (clauseId: string) => {
    try {
      const response = await fetch(`/api/clauses/${clauseId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete clause");
      }

      setClauses(clauses.filter((clause) => clause._id !== clauseId));
    } catch (error) {
      console.error("Error deleting clause:", error);
      setError("Failed to delete clause");
    }
  };

  const startEditing = (clause: Clause) => {
    setEditingClauseId(clause._id);
    setEditClauseTitle(clause.title);
    setEditClauseContent(clause.content);
  };

  const cancelEditing = () => {
    setEditingClauseId(null);
    setEditClauseTitle("");
    setEditClauseContent("");
    setError(null);
  };

  if (isLoading) {
    return <div>Loading clauses...</div>;
  }

  return (
    <div className="space-y-4 p-2 h-full overflow-auto">
      <form onSubmit={handleAddClause} className="space-y-2">
        <div className="flex">
          <input
            type="text"
            value={newClauseTitle}
            onChange={(e) => setNewClauseTitle(e.target.value)}
            placeholder="Clause Title"
            className="w-full px-2 border rounded"
          />
          <Button type="submit" className="ml-2" size="icon">
            <SquarePlus />
          </Button>
        </div>
        <textarea
          value={newClauseContent}
          onChange={(e) => setNewClauseContent(e.target.value)}
          placeholder="Clause Content"
          className="w-full px-2 border rounded"
          rows={2}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
      <div className="flex">
        <p className="font-semibold text-sm">All clauses</p>
      </div>
      <div className="overflow-y-auto space-y-1">
        {clauses.length === 0 ? (
          <p className="text-gray-500">No clauses available</p>
        ) : (
          clauses.map((clause) => (
            <div key={clause._id} className="border px-2 py-1 rounded">
              {editingClauseId === clause._id ? (
                <form
                  onSubmit={(e) => handleEditClause(e, clause._id)}
                  className="space-y-2"
                >
                  <input
                    type="text"
                    value={editClauseTitle}
                    onChange={(e) => setEditClauseTitle(e.target.value)}
                    placeholder="Clause Title"
                    className="w-full px-2 border rounded"
                  />
                  <textarea
                    value={editClauseContent}
                    onChange={(e) => setEditClauseContent(e.target.value)}
                    placeholder="Clause Content"
                    className="w-full px-2 border rounded"
                    rows={2}
                  />
                  <div className="flex space-x-2">
                    <Button type="submit">Save</Button>
                    <Button variant="outline" onClick={cancelEditing}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div
                  className="flex justify-between items-center"
                  draggable
                  onDragStart={(e) => handleDragStart(e, clause)}
                >
                  <span className="select-none cursor-move">
                    {clause.title}
                  </span>
                  <div className="space-x-2 flex">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={() => startEditing(clause)}
                    >
                      <Pencil size="icon" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="size-8"
                      onClick={() => handleDeleteClause(clause._id)}
                    >
                      <Trash size="icon" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ClauseLibrary;
