import React, { useState } from "react";
import { cn } from "@/utils/cn";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";

const SearchBar = ({ 
  onSearch, 
  placeholder = "Search...", 
  className,
  showButton = false,
  ...props 
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch?.(searchTerm);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (!showButton) {
      onSearch?.(value);
    }
  };

  return (
    <form onSubmit={handleSearch} className={cn("flex gap-2", className)}>
      <div className="flex-1">
        <Input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder={placeholder}
          icon="Search"
          iconPosition="left"
          {...props}
        />
      </div>
      {showButton && (
        <Button type="submit" icon="Search">
          Search
        </Button>
      )}
    </form>
  );
};

export default SearchBar;