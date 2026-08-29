import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Search, Sparkles, X } from "lucide-react";

export const SKILL_GROUPS = [
  { label: "Technical", options: ["Programming", "Web Development", "Mobile Development", "Cloud Computing", "Cybersecurity", "Data Analysis", "Machine Learning", "UI/UX Design"] },
  { label: "Business & Commerce", options: ["Business Analysis", "Project Management", "Finance", "Accounting", "Commerce", "Sales", "Digital Marketing", "Entrepreneurship"] },
  { label: "People & Non-technical", options: ["Leadership", "Communication", "Negotiation", "Critical Thinking", "Customer Service", "Human Resources", "Operations", "Personal Productivity"] },
];

export default function SkillsMultiSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const root = useRef(null);

  useEffect(() => {
    const close = (event) => !root.current?.contains(event.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const toggle = (skill) => onChange(value.includes(skill) ? value.filter((item) => item !== skill) : [...value, skill]);
  const groups = SKILL_GROUPS.map((group) => ({
    ...group,
    options: group.options.filter((option) => option.toLowerCase().includes(query.toLowerCase())),
  })).filter((group) => group.options.length);

  return (
    <div className="skill-select" ref={root}>
      <button type="button" className={`skill-select-trigger ${open ? "is-open" : ""}`} onClick={() => setOpen(!open)} aria-expanded={open}>
        <span><Sparkles /> {value.length ? `${value.length} skill${value.length === 1 ? "" : "s"} selected` : "Choose the skills you want to grow"}</span>
        <ChevronDown />
      </button>
      {!!value.length && <div className="skill-select-chips">{value.map((skill) => <button type="button" key={skill} onClick={() => toggle(skill)}>{skill}<X /></button>)}</div>}
      {open && <div className="skill-select-menu">
        <label><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search technical, business or people skills" autoFocus /></label>
        <div className="skill-select-options">
          {groups.map((group) => <section key={group.label}><h4>{group.label}</h4>{group.options.map((skill) => <button type="button" key={skill} onClick={() => toggle(skill)} className={value.includes(skill) ? "is-selected" : ""}><span>{skill}</span><i>{value.includes(skill) && <Check />}</i></button>)}</section>)}
          {!groups.length && <p>No matching skills yet.</p>}
        </div>
        <footer><span>{value.length} selected</span><button type="button" onClick={() => setOpen(false)}>Done</button></footer>
      </div>}
    </div>
  );
}
