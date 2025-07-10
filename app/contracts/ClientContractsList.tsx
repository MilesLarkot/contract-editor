"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Delete, Loader2 } from "lucide-react";
import {
  Table,
  TableCaption,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { getContracts, deleteContract } from "@/lib/api";
import { AxiosError } from "axios";

interface Contract {
  id: string;
  title: string;
  content: string;
  updatedAt?: string | null;
  fields?: Record<string, string>;
}

export default function ClientContractsList() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchContracts() {
      try {
        const data = await getContracts();
        console.log("Fetched contracts:", data);
        const validContracts = data.filter(
          (contract: Contract) => contract.id && typeof contract.id === "string"
        );
        if (validContracts.length < data.length) {
          console.warn(
            "Some contracts were filtered out due to missing or invalid id:",
            data
          );
        }
        setContracts(validContracts);
      } catch (error) {
        if (error instanceof AxiosError) {
          console.error(
            "Failed to fetch contracts:",
            error.response?.data || error.message
          );
        } else if (error instanceof Error) {
          console.error("Failed to fetch contracts:", error.message);
        } else {
          console.error("Unknown error:", error);
        }
        setError("Failed to load contracts");
      } finally {
        setLoading(false);
      }
    }
    fetchContracts();
  }, []);

  const deleteContractHandler = async (id: string) => {
    const confirm = window.confirm("Sure you wanna delete this contract?");
    if (!confirm) return;

    try {
      await deleteContract(id);
      setContracts((prev) => prev.filter((c: Contract) => c.id !== id));
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(
          "Error deleting contract:",
          error.response?.data || error.message
        );
        alert(
          error.response?.status === 403
            ? "Permission denied: Unable to delete contract"
            : "Failed to delete contract"
        );
      } else if (error instanceof Error) {
        console.error("Error deleting contract:", error.message);
        alert("Failed to delete contract");
      } else {
        console.error("Unknown error deleting contract:", error);
        alert("An unknown error occurred");
      }
    }
  };

  if (loading) return <Loader2 className="animate-spin m-auto" />;
  if (error) return <p className="text-destruction">{error}</p>;

  if (contracts.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        No contracts found.{" "}
        <Link href="/contracts/new" className="text-info underline">
          Create one
        </Link>
        .
      </p>
    );
  }

  return (
    <Table>
      <TableCaption>A list of your contracts.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-fit">Title</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contracts.map((contract: Contract) => (
          <TableRow
            key={contract.id}
            className="cursor-pointer"
            onClick={() => {
              if (contract.id && typeof contract.id === "string") {
                router.push(`/contracts/${contract.id}`);
              } else {
                console.error("Invalid contract ID:", contract);
                alert("Cannot navigate to contract: Invalid ID");
              }
            }}
          >
            <TableCell>{contract.title}</TableCell>
            <TableCell>
              {contract.updatedAt
                ? format(new Date(contract.updatedAt), "PPP")
                : "N/A"}
            </TableCell>
            <TableCell>
              <Button
                variant="destructive"
                size="icon"
                className="size-8"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteContractHandler(contract.id);
                }}
              >
                <Delete />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
