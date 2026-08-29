export const DEFAULT_EMPLOYEES = [
  {
    id: 1,
    name: "John Smith",
    email: "john@company.com",
    designation: "Developer",
    department: "Engineering",
    skills: "React, JavaScript, Node.js, Python",
    assignedCourses: 3,
    completedCourses: 1,
    assignedCourseIds: [1, 2],
    status: "active",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah@company.com",
    designation: "Manager",
    department: "Marketing",
    skills: "Marketing, Analytics, Leadership",
    assignedCourses: 2,
    completedCourses: 2,
    assignedCourseIds: [3, 4],
    status: "active",
  },
];

export const EMPLOYER_COURSES = [
  { id: 1, title: "Advanced React Patterns", category: "programming", duration: "8h", difficulty: "advanced", rating: 4.8 },
  { id: 2, title: "Machine Learning Basics", category: "data-science", duration: "12h", difficulty: "intermediate", rating: 4.7 },
  { id: 3, title: "Project Management", category: "business", duration: "6h", difficulty: "beginner", rating: 4.6 },
  { id: 4, title: "Digital Marketing Strategy", category: "marketing", duration: "10h", difficulty: "intermediate", rating: 4.9 },
  { id: 5, title: "Python for Automation", category: "programming", duration: "15h", difficulty: "intermediate", rating: 4.5 },
];

export function loadEmployees() {
  try {
    const saved = JSON.parse(localStorage.getItem("employees") || "null");
    return Array.isArray(saved) && saved.length ? saved : DEFAULT_EMPLOYEES;
  } catch {
    return DEFAULT_EMPLOYEES;
  }
}

export function saveEmployees(employees) {
  localStorage.setItem("employees", JSON.stringify(employees));
}

export function employeeProgress(employee) {
  if (!employee?.assignedCourses) return 0;
  return Math.round((employee.completedCourses / employee.assignedCourses) * 100);
}

export function splitSkills(skills) {
  if (Array.isArray(skills)) return skills;
  return String(skills || "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}
