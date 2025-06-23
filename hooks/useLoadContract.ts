import { useEffect } from "react";

export function useLoadContract(
  id: string | null,
  fetchContractData: () => void,
  setIsLoading: (loading: boolean) => void
) {
  useEffect(() => {
    if (id) {
      fetchContractData();
    } else {
      setIsLoading(false);
    }
  }, [id, fetchContractData, setIsLoading]);
}
