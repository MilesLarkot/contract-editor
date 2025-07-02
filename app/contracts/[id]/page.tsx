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
import Contract from "@/models/contract";

export const dynamic = "force-dynamic";

interface ContractData {
  id: string;
  title: string;
  content: string;
  fields: Record<string, string>;
}

async function fetchContract(id: string): Promise<ContractData | null> {
  try {
    const contract = await Contract.findById(id)
      .select("title content fields")
      .lean();
    console.log("Fetched contract:", contract);
    return contract as ContractData | null;
  } catch (err) {
    console.error("Error fetching contract:", err);
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
    // notFound();
    console.error("Contract not found for ID:", params.id);
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
              <BreadcrumbLink href="/contracts">Contracts</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{contractData.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <ContractPage contractData={contractData} />
    </div>
  );
}
