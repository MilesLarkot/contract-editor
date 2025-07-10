"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Delete, Loader2, NotebookPen } from "lucide-react";
import {
  Table,
  TableCaption,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { getTemplates, deleteTemplate, createContract } from "@/lib/api";
import { useConvertTemplateToContract } from "@/hooks/useConvertTemplateToContract";

interface Template {
  id: string;
  title: string;
  content: string;
  updatedAt?: string | null;
  defaultFields?: Record<string, string>;
}

export default function ClientTemplatesList() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const { convertTemplateToContract } = useConvertTemplateToContract();

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const data = await getTemplates();
        console.log("Fetched templates:", data);
        const validTemplates = data.filter(
          (template: Template) => template.id && typeof template.id === "string"
        );
        if (validTemplates.length < data.length) {
          console.warn(
            "Some templates were filtered out due to missing or invalid id:",
            data
          );
        }
        setTemplates(validTemplates);
      } catch (error: any) {
        console.error(
          "Failed to fetch templates:",
          error.response?.data || error.message
        );
        setError("Failed to load templates");
      } finally {
        setLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  const deleteTemplateHandler = async (id: string) => {
    const confirm = window.confirm("Sure you wanna delete this template?");
    if (!confirm) return;

    try {
      await deleteTemplate(id);
      setTemplates((prev) => prev.filter((t: Template) => t.id !== id));
    } catch (error: any) {
      console.error(
        "Error deleting template:",
        error.response?.data || error.message
      );
      alert(
        error.response?.status === 403
          ? "Permission denied: Unable to delete template"
          : "Failed to delete template"
      );
    }
  };

  const createContractFromTemplate = async (template: Template) => {
    const contractData = convertTemplateToContract({
      id: template.id,
      title: template.title,
      content: template.content,
      defaultFields: new Map(Object.entries(template.defaultFields || {})),
      metadata: { category: undefined },
    });

    try {
      const payload = {
        title: contractData.title,
        content: contractData.content,
        fields: Object.fromEntries(contractData.fields),
        templateId: contractData.templateId,
        metadata: contractData.metadata,
      };
      console.log("Creating contract with payload:", payload);
      const { id } = await createContract(payload);
      router.push(`/contracts/${id}`);
    } catch (error: any) {
      console.error(
        "Error creating contract:",
        error.response?.data || error.message
      );
      alert(
        error.response?.status === 403
          ? "Permission denied: Unable to create contract"
          : "Failed to create contract from template"
      );
    }
  };

  if (loading) return <Loader2 className="animate-spin m-auto" />;
  if (error) return <p className="text-destruction">{error}</p>;

  if (templates.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        No templates found.{" "}
        <Link href="/templates/new" className="text-info underline">
          Create one
        </Link>
        .
      </p>
    );
  }

  return (
    <Table>
      <TableCaption>A list of your templates.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-fit">Title</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {templates.map((template: Template) => (
          <TableRow
            key={template.id}
            className="cursor-pointer"
            onClick={() => {
              if (template.id && typeof template.id === "string") {
                router.push(`/templates/${template.id}`);
              } else {
                console.error("Invalid template ID:", template);
                alert("Cannot navigate to template: Invalid ID");
              }
            }}
          >
            <TableCell>{template.title}</TableCell>
            <TableCell>
              {template.updatedAt
                ? format(new Date(template.updatedAt), "PPP")
                : "N/A"}
            </TableCell>
            <TableCell>
              <Button
                variant="destructive"
                size="icon"
                className="size-8"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTemplateHandler(template.id);
                }}
              >
                <Delete />
              </Button>
              <Button
                size="icon"
                className="size-8 ml-2"
                onClick={(e) => {
                  e.stopPropagation();
                  createContractFromTemplate(template);
                }}
              >
                <NotebookPen />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
