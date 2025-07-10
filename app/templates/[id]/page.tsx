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
import { getTemplate } from "@/lib/api";
import { AxiosError } from "axios";

export const dynamic = "force-dynamic";

interface TemplateData {
  id: string;
  title: string;
  content: string;
  defaultFields: Record<string, string>;
}

async function fetchTemplate(id: string): Promise<TemplateData | null> {
  try {
    const template = await getTemplate(id);
    console.log("Fetched template:", template);
    return {
      id: template.id,
      title: template.title,
      content: template.content,
      defaultFields: template.defaultFields || {},
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "Error fetching template:",
        error.response?.data || error.message
      );
    } else if (error instanceof Error) {
      console.error("Error fetching template:", error.message);
    } else {
      console.error("Unknown error fetching template:", error);
    }
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
