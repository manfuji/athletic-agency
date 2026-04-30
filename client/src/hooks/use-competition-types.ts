import { getCompetitionTypes } from "@/actions/competition";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";

export default function useCompetitionTypes() {
  const [selected, setSelected] = useState("");

  const router = useRouter();
  const pathname = usePathname();

  const { data, isLoading } = useSWR("/api/competitions/types", async () => {
    return await getCompetitionTypes();
  });

  const matchedType = data?.find((type) =>
    pathname.split("/").includes(type.slug)
  );

  useEffect(() => {
    const isCompetitionPath = pathname.includes("/competitions");

    if (!isCompetitionPath) {
      setSelected("");
      return;
    }

    if (matchedType) {
      setSelected(matchedType.slug);
    }
  }, [pathname, data, matchedType]);

  const handleSelectType = (value: string) => {
    setSelected(value);
    router.push(`/competitions/${value}`);
  };

  const onSelectedClick = (value: string) => {
    router.push(`/competitions/${value}`);
  };

  return {
    selected,
    data,
    isLoading,
    handleSelectType,
    onSelectedClick,
    matchedType,
  };
}
