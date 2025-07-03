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
import connectDB from "@/lib/db";
import Template from "@/models/template";

export const dynamic = "force-dynamic";

interface TemplateData {
  id: string;
  title: string;
  content: string;
  fields: Record<string, string>;
}

async function fetchTemplate(id: string): Promise<TemplateData | null> {
  await connectDB();
  try {
    const template = await Template.findById(id)
      .select("title content fields")
      .lean();
    if (!template) return null;

    return {
      id: template._id.toString(),
      title: template.title,
      content: template.content,
      fields: template.defaultFields,
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
    return notFound(); // ← RETURN THIS
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
