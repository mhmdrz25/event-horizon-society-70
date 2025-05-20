
import React, { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

const Search: React.FC<SearchProps> = ({ 
  placeholder = "Search...", 
  onSearch = () => {} 
}) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form 
      onSubmit={handleSearch} 
      className="relative w-full"
    >
      <SearchIcon 
        size={18} 
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
      />
      <Input
        type="search"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-10 pr-4"
      />
    </form>
  );
};

export default Search;
