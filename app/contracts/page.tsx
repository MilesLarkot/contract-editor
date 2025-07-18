"use client";
import { Button } from "@/components/ui/button";
import ClientContractList from "./ClientContractsList";
import { CirclePlus, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@radix-ui/react-separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useEffect, useState } from "react";
import TemplatePreview from "@/components/TemplatePreview";
import { Switch } from "@/components/ui/switch";
import { useConvertTemplateToContract } from "@/hooks/useConvertTemplateToContract";

interface Template {
  _id: string;
  title: string;
  content: string;
  description: string;
  updatedAt: string;
  defaultFields?: Record<string, { value: string; mapping?: string }>;
}

export default function Page() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { convertTemplateToContract } = useConvertTemplateToContract();

  useEffect(() => {
    if (!dialogOpen) return;
    fetch("/api/templates")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch templates");
        return res.json();
      })
      .then((data) => setTemplates(data))
      .catch((err) => {
        setError(err.message);
        console.error("Error fetching templates:", err);
      });
  }, [dialogOpen]);

  const [isGridView, setIsGridView] = useState(false);

  const createContractFromTemplate = async (template: Template) => {
    try {
      const defaultFieldsMap = new Map(
        Object.entries(template.defaultFields || {}).map(([key, field]) => [
          key,
          field.value || "",
        ])
      );
      console.log(
        "Template defaultFields:",
        JSON.stringify(Array.from(defaultFieldsMap.entries()), null, 2)
      ); // Debug

      const contractData = convertTemplateToContract({
        _id: template._id,
        title: template.title,
        content: template.content,
        defaultFields: defaultFieldsMap,
        metadata: { category: undefined, description: template.description },
      });

      console.log("Contract data:", JSON.stringify(contractData, null, 2)); // Debug

      if (!(contractData.fields instanceof Map)) {
        console.error("contractData.fields is not a Map:", contractData.fields);
        throw new Error("Invalid fields format: fields must be a Map");
      }

      const fieldsObject = Object.fromEntries(contractData.fields);
      console.log("Fields for API:", JSON.stringify(fieldsObject, null, 2)); // Debug

      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: contractData.title,
          content: contractData.content,
          fields: fieldsObject,
          templateId: contractData.templateId,
          metadata: contractData.metadata,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Failed to create contract: ${res.status} ${errorText}`
        );
      }

      const { id } = await res.json();
      setDialogOpen(false);
      router.push(`/contracts/${id}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to create contract from template";
      setError(errorMessage);
      console.error("Error creating contract:", err);
    }
  };

  return (
    <div>
      <header className="bg-background sticky top-0 flex h-16 items-center gap-2 border-b px-4 z-10">
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb className="flex w-full">
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/">Contract Builder</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Contracts</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
          <div className="ml-auto">
            <Button variant="default" onClick={() => setDialogOpen(true)}>
              <CirclePlus /> New
            </Button>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="sm:max-w-[425px] md:max-w-[750px] lg:max-w-[900px] w-fit select-none min-w-[300px]">
                <DialogHeader>
                  <DialogTitle className="text-primary">
                    Select a template
                  </DialogTitle>
                  <DialogDescription className="content-between flex">
                    Click on a template to create a new contract based on it.
                    <Switch
                      checked={isGridView}
                      onCheckedChange={setIsGridView}
                      className="ml-auto"
                    />
                  </DialogDescription>
                </DialogHeader>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="max-h-[70vh] overflow-y-auto flex flex-wrap gap-4 justify-center pt-3">
                  {isGridView ? (
                    <>
                      <Link href="/contracts/new">
                        <div className="w-[200px] min-h-[200px] cursor-pointer hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-2 hover:border-primary transition-all duration-300 group bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm overflow-hidden relative border-dashed border-4 border-black rounded-2xl flex items-center justify-center gap-2 flex-col">
                          <PlusCircle
                            size={64}
                            className="group-hover:text-primary transition-all"
                          />
                          <div className="group-hover:text-primary tranition-all text-center font-semibold">
                            Create a contract from scratch
                          </div>
                        </div>
                      </Link>
                      {templates.map((tpl) => (
                        <div
                          key={tpl._id}
                          onClick={() => createContractFromTemplate(tpl)}
                        >
                          <TemplatePreview
                            title={tpl.title}
                            content={tpl.description}
                          />
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="flex items-start overflow-hidden w-full gap-4 flex-col">
                      <Link href="/contracts/new" className="w-full pr-2">
                        <div className="w-full cursor-pointer hover:shadow-xl hover:shadow-blue-500/10 hover:translate-x-2 hover:border-primary transition-all duration-300 group pl-2 border-dashed border-2 border-black rounded-2xl p-2">
                          <p className="font-bold group-hover:text-primary transition-colors ">
                            Blank contract
                          </p>
                          <small className="group-hover:text-primary transition-colors">
                            Create a contract from scratch.
                          </small>
                        </div>
                      </Link>
                      {templates.map((tpl) => (
                        <div
                          key={tpl._id}
                          className="w-full cursor-pointer hover:shadow-xl hover:shadow-blue-500/10 hover:translate-x-2 transition-all duration-300 group hover:border-l-4 pl-2 border-primary rounded"
                          onClick={() => createContractFromTemplate(tpl)}
                        >
                          <p className="font-bold group-hover:text-primary transition-colors duration-300">
                            {tpl.title}
                          </p>
                          <small>{tpl.description || "No description"}</small>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Breadcrumb>
      </header>
      <div className=" bg-gray-100">
        <ClientContractList />
      </div>
    </div>
  );
}
