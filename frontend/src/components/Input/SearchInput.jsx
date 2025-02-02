import { Search } from 'lucide-react'

import './search-input.scss';

const SearchInput = ({ value, onChange, placeholder }) => {
  return (
    <div className="search-input">
      <Search />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Search...'}
      />
    </div>
  );
};

export default SearchInput; 