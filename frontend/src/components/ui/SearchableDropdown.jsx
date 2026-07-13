import { useState, useRef, useEffect } from "react";

export default function SearchableDropdown({ label, value, options, onChange }) {
  const [search, setSearch] = useState(value || "");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const filteredOptions = options.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase())
  );

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full relative" ref={wrapperRef}>
      <label className="block mb-1 font-medium">{label}</label>

      <input
        type="text"
        value={search}
        placeholder="Type to search district..."
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="w-full border border-slate-300 rounded-lg px-4 py-2"
      />

      {open && filteredOptions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-slate-200 shadow rounded-lg max-h-48 overflow-auto">
          {filteredOptions.map((item, index) => (
            <li
              key={index}
              onClick={() => {
                setSearch(item);
                setOpen(false);
                onChange(item);
              }}
              className="px-4 py-2 cursor-pointer hover:bg-blue-100"
            >
              {item}
            </li>
          ))}
        </ul>
      )}

      {open && filteredOptions.length === 0 && (
        <div className="absolute z-10 w-full bg-white border border-slate-200 shadow rounded-lg px-4 py-2 text-slate-500">
          No matches found
        </div>
      )}
    </div>
  );
}
