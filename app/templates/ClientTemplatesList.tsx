"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Delete, Loader2, Pencil } from "lucide-react";
import {
  Table,
  TableCaption,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface Template {
  _id: string;
  title: string;
  content: string;
  updatedAt: string;
  fields?: Record<string, string>;
}

export default function ClientTemplatesList() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/templates")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch templates");
        return res.json();
      })
      .then((data) => setTemplates(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const deleteTemplate = async (id: string) => {
    const confirm = window.confirm("Sure you wanna delete this template?");
    if (!confirm) return;

    const res = await fetch(`/api/templates/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setTemplates((prev) => prev.filter((t: Template) => t._id !== id));
    } else {
      alert("Failed to delete template");
    }
  };

  if (loading) return <Loader2 className="animate-spin m-auto" />;
  if (error) return <p className="text-red-500">{error}</p>;

  if (templates.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        No templates found.{" "}
        <Link href="/templates/new" className="text-blue-500 underline">
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
          <TableHead className="w-[100px]">Title</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {templates.map((template: Template) => (
          <TableRow
            key={template._id}
            className="cursor-pointer"
            onClick={() =>
              (window.location.href = `/templates/${template._id}`)
            }
          >
            <TableCell>{template.title}</TableCell>
            <TableCell>{format(new Date(template.updatedAt), "PPP")}</TableCell>
            <TableCell>
              <Button
                variant="destructive"
                size="icon"
                className="size-8"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTemplate(template._id);
                }}
              >
                <Delete />
              </Button>
              <Button
                size="icon"
                className="size-8 ml-2"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("use this row data to make a new contract");
                }}
              >
                <Pencil />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
