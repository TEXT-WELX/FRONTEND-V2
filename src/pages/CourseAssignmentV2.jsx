import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Award, BookOpen, Check, Clock3, Plus, Search, User } from "lucide-react";
import api from "../utils/api";

function courseId(course) {
  return String(course?._id || course?.id || course?.course || "");
}

export default function CourseAssignmentV2() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    let current = true;
    Promise.all([api.get(`/employees/${employeeId}`), api.get("/employees/assignable-courses")])
      .then(([employeeResponse, coursesResponse]) => {
        if (!current) return;
        setEmployee(employeeResponse.data);
        setCourses(coursesResponse.data || []);
      })
      .catch((error) => current && setNotice({ tone: "error", text: error?.response?.data?.message || "Unable to load courses." }))
      .finally(() => current && setLoading(false));
    return () => { current = false; };
  }, [employeeId]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const assignedIds = useMemo(() => new Set((employee?.courseAssignments || []).map(courseId)), [employee]);
  const categories = useMemo(() => [...new Set(courses.map((course) => course.category || "General"))].sort(), [courses]);
  const filteredCourses = useMemo(() => courses.filter((course) => (
    course.title.toLowerCase().includes(searchTerm.trim().toLowerCase())
    && (selectedCategory === "all" || (course.category || "General") === selectedCategory)
  )), [courses, searchTerm, selectedCategory]);

  const toggleCourse = (id) => {
    if (assignedIds.has(id)) return;
    setSelectedCourses((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const handleAssignCourses = async () => {
    if (!selectedCourses.length) return;
    setWorking(true);
    try {
      const { data } = await api.post(`/employees/${employeeId}/assign-courses`, { courseIds: selectedCourses });
      setEmployee(data.employee);
      setSelectedCourses([]);
      setNotice({ tone: data.assigned ? "success" : "warning", text: data.assigned ? `${data.assigned} course(s) assigned to ${data.employee.name}.` : "Those courses were already assigned." });
    } catch (error) {
      setNotice({ tone: "error", text: error?.response?.data?.message || "Unable to assign the selected courses." });
    } finally {
      setWorking(false);
    }
  };

  if (loading) return <div className="employer-page"><div className="employer-shell employer-not-found"><BookOpen /><h1>Loading courses...</h1></div></div>;

  if (!employee) {
    return <div className="employer-page"><div className="employer-shell employer-not-found"><User /><h1>Employee not found</h1><p>This employee is not part of your organization.</p><button type="button" className="employer-button employer-button-blue" onClick={() => navigate("/employee-management")}>Back to team</button></div></div>;
  }

  return (
    <div className="employer-page employer-assignment-page">
      <div className="employer-shell employer-assignment-shell">
        <header className="employer-profile-heading">
          <button type="button" onClick={() => navigate("/employee-management")}><ArrowLeft /> Back to team</button>
          <div><span>Curate a development path</span><h1>Assign Courses</h1></div>
        </header>

        <section className="employer-panel employer-assignment-person">
          <i>{employee.name.charAt(0).toUpperCase()}</i>
          <div><h2>{employee.name}</h2><p>{employee.designation || "Employee"} <span>·</span> {employee.department || "General"}</p></div>
          <aside><span>Currently Assigned</span><strong>{employee.assignedCourses || 0}</strong></aside>
        </section>

        <section className="employer-panel employer-assignment-workspace">
          <div className="employer-assignment-filters">
            <div className="employer-search-field"><Search /><input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search courses..." /></div>
            <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} aria-label="Course category"><option value="all">All Categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select>
          </div>

          <div className="employer-course-selection-grid">
            {filteredCourses.map((course) => {
              const id = courseId(course);
              const selected = selectedCourses.includes(id);
              const assigned = assignedIds.has(id);
              return <button type="button" key={id} className={`${selected ? "is-selected" : ""}${assigned ? " is-assigned" : ""}`} onClick={() => toggleCourse(id)} disabled={assigned}>
                <header><i><BookOpen /></i><span className="employer-course-check">{(selected || assigned) && <Check />}</span></header>
                <h3>{course.title}</h3>
                <p><span><Clock3 /> {course.duration || "Self-paced"}</span><em className={`difficulty-${course.level || "beginner"}`}>{course.level || "beginner"}</em></p>
                <small><Award /> {assigned ? "Already assigned" : `${course.rating || "New"} rating`}</small>
              </button>;
            })}
          </div>

          {!filteredCourses.length && <div className="employer-empty-state">No courses match these filters.</div>}
          {selectedCourses.length > 0 && <div className="employer-assignment-summary"><div><strong>Selected: {selectedCourses.length} course(s)</strong><span>Duplicate assignments are automatically ignored.</span></div><button type="button" className="employer-button employer-button-blue" onClick={handleAssignCourses} disabled={working}><Plus /> {working ? "Assigning..." : "Assign courses"}</button></div>}
        </section>
      </div>
      {notice && <div className={`employer-toast tone-${notice.tone}`} role="status">{notice.text}</div>}
    </div>
  );
}
