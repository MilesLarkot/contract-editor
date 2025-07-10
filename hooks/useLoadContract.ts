import { useEffect } from "react";

export function useLoadContract(
  id: string | null,
  fetchContractData: () => Promise<void>,
  setIsLoading: (loading: boolean) => void
) {
  useEffect(() => {
    if (id) {
      setIsLoading(true);
      fetchContractData();
    } else {
      setIsLoading(false);
    }
  }, [id, fetchContractData, setIsLoading]);
}
