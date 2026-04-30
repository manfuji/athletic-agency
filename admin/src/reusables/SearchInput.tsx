import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchInputProps {
  placeholder: string;
  onSearch: (query: string) => void;
}

export default function SearchInput({
  placeholder,
  onSearch,
}: SearchInputProps) {
  return (
    <div className="py-2 pr-3 transition-all duration-300">
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          className="placeholder:text-[14px] font-inter focus:outline-none focus:ring-0 focus:border-gray-300"
          onChange={(e) => onSearch(e.target.value)}
        />
        <Search
          className="absolute md:right-4 right-1 top-1/2 -translate-y-1/2 text-[#667085]"
          size={18}
        />
      </div>
    </div>
  );
}
