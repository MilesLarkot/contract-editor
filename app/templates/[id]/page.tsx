import ContractPage from "@/components/ContractPage";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@radix-ui/react-separator";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface TemplateData {
  id: string;
  title: string;
  content: string;
  defaultFields: Record<string, { value: string; mapping?: string }>;
  description: string;
  tags: string[];
}

async function fetchTemplate(id: string): Promise<TemplateData | null> {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8091/api/legal";
  try {
    const res = await fetch(`${API_BASE_URL}/templates/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`Error fetching template: ${res.status} ${res.statusText}`);
      return null;
    }
    const template = await res.json();
    return {
      id: template.id,
      title: template.title,
      content: template.content,
      defaultFields: template.defaultFields || {},
      description: template.metadata?.description || "",
      tags: template.metadata?.tags || [],
    };
  } catch (err) {
    console.error("Error fetching template:", err);
    return null;
  }
}

export default async function TemplateEditPage({
  params,
}: {
  params: { id: string };
}) {
  const templateData = await fetchTemplate(params.id);
  if (!templateData) {
    return notFound();
  }

  return (
    <div>
      <header className="bg-background sticky top-0 flex h-16 items-center gap-2 border-b px-4 z-10">
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/">Contract Builder</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/templates">Templates</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{templateData.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <ContractPage contractData={templateData} isTemplate={true} />
    </div>
  );
}
