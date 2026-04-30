import { useState } from "react";

export const useFilterCategory = <
  T,
  K extends keyof T,
  P extends keyof T[K],
>(
  data: T[],
  key: K,
  nestedKey: P,
) => {
  const [category, setCategory] = useState<string>("");

  const filteredData = data?.filter((item: T) => {
    if (!category.trim() || category === "All") {
      return item;
    } else {
      return String(item[key][nestedKey]) === category;
    }
  });

  return {
    category,
    setCategory,
    filteredData,
  };
};

export const useFilterTeam = <T, K extends keyof T>(data: T[], key: K) => {
  const [team, setTeam] = useState<string>("");

  const filteredData = data?.filter((item: T) => {
    if (!team.trim()) {
      return item;
    } else {
      return String(item[key]).toLowerCase().includes(team.toLowerCase());
    }
  });

  return { team, setTeam, filteredData };
};
