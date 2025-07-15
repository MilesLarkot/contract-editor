"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Loader2, Trash } from "lucide-react";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface Contract {
  _id: string;
  title: string;
  content: string;
  updatedAt: string;
  fields?: Record<string, string>;
}

// Custom debounce hook
function useDebounce<T extends (...args: string[]) => void>(
  callback: T,
  delay: number
) {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

export default function ClientContractsList() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const router = useRouter();

  const fetchContracts = async (query: string = "") => {
    setLoading(true);
    try {
      const url = new URL("/api/contracts", window.location.origin);
      if (query) url.searchParams.set("q", query);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch contracts");
      const data = await res.json();
      setContracts(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch contracts"
      );
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchContracts = useDebounce(fetchContracts, 300);

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilter(value);
    debouncedFetchContracts(value.trim());
  };

  const deleteContract = async (id: string) => {
    const confirm = window.confirm("Sure you wanna delete this contract?");
    if (!confirm) return;

    const res = await fetch(`/api/contracts/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setContracts((prev) => prev.filter((c: Contract) => c._id !== id));
    } else {
      alert("Failed to delete contract");
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by title..."
        value={filter}
        onChange={handleFilterChange}
        className="rounded-none bg-white w-full"
      />
      {loading ? (
        <Loader2 className="animate-spin m-auto" />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : contracts.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No contracts found.{" "}
          <Link href="/contracts/new" className="text-blue-500 underline">
            Create one
          </Link>
          .
        </p>
      ) : (
        <Table>
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
                key={contract._id}
                className="cursor-pointer bg-white"
                onClick={() => router.push(`/contracts/${contract._id}`)}
              >
                <TableCell>{contract.title}</TableCell>
                <TableCell>
                  {contract.updatedAt
                    ? format(new Date(contract.updatedAt), "PPP")
                    : "Unknown"}
                </TableCell>
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
                    <Trash />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
