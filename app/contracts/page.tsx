import { Button } from "@/components/ui/button";
import ClientContractList from "./ClientContractsList";
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
import { DropdownMenu, DropdownMenuGroup } from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
              <BreadcrumbPage>Contracts</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default">
                  <CirclePlus /> New Contract
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuGroup>
                  <Link href="/contracts/new">
                    <DropdownMenuItem className="cursor-pointer">
                      From Scratch
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/templates">
                    <DropdownMenuItem className="cursor-pointer">
                      From Template
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Breadcrumb>
      </header>
      <div className="p-4">
        <ClientContractList />
      </div>
    </div>
  );
}
