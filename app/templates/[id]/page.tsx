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

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

interface ContractData {
  id: string;
  title: string;
  content: string;
  fields: Record<string, string>;
}

async function fetchContract(id: string): Promise<ContractData | null> {
  try {
    const response = await fetch(`${baseUrl}/api/templates/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch template: ${response.statusText}`);
    }

    const contract = await response.json();
    return {
      id: contract._id || contract.id,
      title: contract.title,
      content: contract.content,
      fields: contract.fields,
    };
  } catch (err) {
    console.error("Error fetching template:", err);
    return null;
  }
}

export default async function ContractEditPage({
  params,
}: {
  params: { id: string };
}) {
  const contractData = await fetchContract(params.id);
  if (!contractData) {
    notFound();
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
              <BreadcrumbPage>{contractData.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <ContractPage contractData={contractData} isTemplate={true} />
    </div>
  );
}
