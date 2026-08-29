import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";

const Dropdown = ({ onSelect }) => {
  const location = useLocation();
  const isOnSpecialPage = location.pathname === "/playground";
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("FAQ");

  const options = [
    { label: "FAQ", value: "faq" },
    ...(isOnSpecialPage
      ? [{ label: "Coding Support", value: "techSupport" }]
      : []),
  ];

  return (
    <div className={`w-40 relative ${isOnSpecialPage ? "block" : "hidden"}`}>
      <div
        className="flex h-10 items-center caret-transparent justify-between px-3 py-2 rounded-xl border border-white/60 bg-gradient-to-r from-[#273AA9] to-[#541F8A] text-white cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <span className="truncate">{selected}</span>
        <ChevronDown
          className={`w-4 h-4 transition ${open ? "rotate-180" : ""}`}
        />
      </div>

      {open && (
        <div className="  caret-transparent absolute top-full left-0 w-full mt-1 rounded-xl overflow-hidden bg-gradient-to-r from-[#273AA9] to-[#541F8A] text-white shadow-lg z-50">
          {options.map((opt) => (
            <div
              key={opt.value}
              className="px-3 py-2 hover:bg-white/20 cursor-pointer"
              onClick={() => {
                setSelected(opt.label);
                onSelect(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
