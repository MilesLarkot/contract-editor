"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export default function ClientContractList() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/contracts")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch contracts");

        return res.json();
      })
      .then((data) => setContracts(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const deleteContract = async (id: string) => {
    const confirm = window.confirm("Sure you wanna delete this contract?");
    if (!confirm) return;

    const res = await fetch(`/api/contracts/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setContracts((prev) => prev.filter((c: any) => c._id !== id));
    } else {
      alert("Failed to delete contract");
    }
  };

  if (loading) return <Loader2 className="animate-spin m-auto" />;
  if (error) return <p className="text-red-500">{error}</p>;

  if (contracts.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        No contracts found.{" "}
        <Link href="/contracts/new" className="text-blue-500 underline">
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
          <TableHead className="w-[100px]">Title</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contracts.map((contract: any) => (
          <TableRow
            key={contract._id}
            className="cursor-pointer"
            onClick={() =>
              (window.location.href = `/contracts/${contract._id}`)
            }
          >
            <TableCell>{contract.title}</TableCell>
            <TableCell>{format(new Date(contract.updatedAt), "PPP")}</TableCell>

            <TableCell>
              <Button
                variant="destructive"
                size="icon"
                className="size-8"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteContract(contract._id);
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
