import { Button } from "@/components/ui/button";
import ClientTemplatesList from "./ClientTemplatesList";
import { CirclePlus } from "lucide-react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@radix-ui/react-separator";
export default function Page() {
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
              <BreadcrumbPage>Templates</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
          <Link href="/templates/new" className="ml-auto">
            <Button variant="default">
              <CirclePlus /> New Template
            </Button>
          </Link>
        </Breadcrumb>
      </header>
      <div className="p-4 bg-gray-100">
        <ClientTemplatesList />
      </div>
    </div>
  );
}
