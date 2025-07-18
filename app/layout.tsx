import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Book, BookDashed } from "lucide-react";
// import ReactScanProvider from "./_providers/ReactScanProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Contract Editor",
  description: "A contract editor application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <Sidebar collapsible="icon">
              <SidebarContent>
                <SidebarGroup className="bg-primary text-primary-foreground h-full">
                  <SidebarGroupLabel className="text-white">
                    Contract Editor
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <a href="/contracts/">
                            <Book />
                            <span>Contracts</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <a href="/templates/">
                            <BookDashed />
                            <span>Templates</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>

            <main className="flex-1">
              <header className="flex items-center border-b px-4 gap-2 ">
                <SidebarTrigger className="md:hidden inline-flex" />
              </header>
              {/* <ReactScanProvider /> */}
              {children}
            </main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
