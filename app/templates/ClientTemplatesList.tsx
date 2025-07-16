"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
// import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash, Loader2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";

interface Template {
  id: string;
  title: string;
  content: string;
  description: string;
  updatedAt: string;
  defaultFields?: Record<string, string>;
  tags?: string[];
}

// Custom debounce hook
function useDebounce<T extends (...args: string[]) => void>(
  callback: T,
  delay: number
) {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

export default function ClientTemplatesList() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  const fetchTemplates = async (query: string = "") => {
    setLoading(true);
    try {
      const url = new URL("/api/templates", window.location.origin);
      if (query) url.searchParams.set("q", query);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch templates");
      const data = await res.json();
      setTemplates(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch templates"
      );
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchTemplates = useDebounce(fetchTemplates, 300);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilter(value);
    debouncedFetchTemplates(value.trim());
  };

  const deleteTemplate = async (id: string) => {
    const confirm = window.confirm("Sure you wanna delete this template?");
    if (!confirm) return;

    const res = await fetch(`/api/templates/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setTemplates((prev) => prev.filter((t: Template) => t.id !== id));
    } else {
      alert("Failed to delete template");
    }
  };

  const truncateDescription = (description: string, maxLength: number = 50) => {
    if (description.length <= maxLength) return description;
    return description.slice(0, maxLength) + "...";
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by title, description, or tags..."
        value={filter}
        onChange={handleFilterChange}
        className="w-full rounded-none bg-white"
      />
      {loading ? (
        <Loader2 className="animate-spin m-auto" />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : templates.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No templates found.{" "}
          <Link href="/templates/new" className="text-blue-500 underline">
            Create one
          </Link>
          .
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-fit">Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Tags</TableHead>
              {/* <TableHead>Last Updated</TableHead> */}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template: Template) => (
              <TableRow
                key={template.id}
                className="cursor-pointer bg-white"
                onClick={() =>
                  (window.location.href = `/templates/${template.id}`)
                }
              >
                <TableCell>{template.title}</TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          {template.description
                            ? truncateDescription(template.description)
                            : "No description"}
                        </span>
                      </TooltipTrigger>
                      {template.description && (
                        <TooltipContent className="bg-white border max-w-xs text-black">
                          {template.description}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex flex-wrap items-center gap-1 ">
                          {template.tags && template.tags.length > 0 ? (
                            <>
                              {template.tags.slice(0, 2).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="mr-1 flex truncate"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {template.tags.length > 2 && (
                                <Badge variant="outline" className="mr-1">
                                  +{template.tags.length - 2} more
                                </Badge>
                              )}
                            </>
                          ) : (
                            "No tags"
                          )}
                        </div>
                      </TooltipTrigger>
                      {template.tags && template.tags.length > 0 && (
                        <TooltipContent className="bg-white max-w-xs border">
                          <div className="flex flex-wrap gap-1">
                            {template.tags.map((tag) => (
                              <Badge key={tag} variant="outline">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                {/* <TableCell>
                  {template.updatedAt
                    ? format(new Date(template.updatedAt), "PPP")
                    : "Unknown"}
                </TableCell> */}
                <TableCell>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="size-8   "
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTemplate(template.id);
                    }}
                  >
                    <Trash />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
