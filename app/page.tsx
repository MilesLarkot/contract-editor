import InternalServerError from "@/components/InternalServerError";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

import { Separator } from "@radix-ui/react-separator";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <header className="bg-background sticky top-0 flex h-16 items-center gap-2 border-b px-4 z-10">
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb className="flex w-full">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Contract Builder</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        {/* <h1>Env Check</h1>
        <p>VERCEL_URL: {process.env.VERCEL_URL}</p>
        <p>NODE_ENV: {process.env.NODE_ENV}</p> */}

        <div className="flex gap-2 mt-4">
          <Link href="/contracts/" className="text-blue-500 underline">
            <Button>Contracts</Button>
          </Link>
          <Link href="/templates/" className="text-blue-500 underline">
            <Button>Templates</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
