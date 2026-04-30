"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loading from "./competition-types-skeleton";
import useCompetitionTypes from "@/hooks/use-competition-types";

interface SelectTypeProps {
  onClose?: () => void;
}

export default function SelectType({ onClose }: SelectTypeProps) {
  const {
    selected,
    data,
    isLoading,
    handleSelectType,
    onSelectedClick,
    matchedType,
  } = useCompetitionTypes();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Select
      value={selected}
      onValueChange={(value) => {
        handleSelectType(value);
      }}
    >
      <SelectTrigger
        className={`${matchedType && "lg:text-primary"} bg-transparent pl-0 lg:px-3 text-xl  w-fit  lg:w-auto lg:text-base border-none outline-none focus:outline-none focus:ring-0 focus:ring-offset-0`}
      >
        <SelectValue placeholder={selected ? selected : "Competitions"} />
      </SelectTrigger>
      <SelectContent>
        {data?.map((type, i) => (
          <SelectItem
            value={type?.slug}
            key={i}
            onPointerDown={() => {
              onSelectedClick(type?.slug);
              if (onClose) {
                onClose();
              }
            }}
          >
            {type?.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
