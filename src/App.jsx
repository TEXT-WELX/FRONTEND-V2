import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AIAssistant from "./components/AIAssistant";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OnboardingForm from "./pages/OnboardingForm";
import StudentDashboard from "./pages/StudentDashboard";
import CorporateDashboard from "./pages/CorporateDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import CourseMarketplace from "./pages/CourseMarketplace";
import CourseDetailEnhanced from "./pages/CourseDetailEnhanced";
import AIWorkshopRegistration from "./pages/FormPage"; // Temporary route for AI Workshop Registration form
import Payment from "./pages/Payment";
import Playground from "./pages/Playground";
import SimulationLab from "./pages/SimulationLab";
import Contact from "./pages/Contact";
import Events from "./pages/Events";
import Quiz from "./pages/Quiz";
import EmployeeDetails from "./pages/EmployeeDetails";
import CourseAssignment from "./pages/CourseAssignment";
import ModuleQuiz from "./pages/ModuleQuiz";
import Certificate from "./pages/Certificate";
import LearningRoadmap from "./pages/LearningRoadmap";
import EmployeeManagement from "./pages/EmployeeManagement";
import CompanyRoles from "./pages/CompanyRoles";
import CourseFeedback from "./pages/CourseFeedback";
import { CurrencyProvider } from "./contexts/CurrencyContext";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppRoutes({ user, setUser }) {
  const getDashboard = () => {
    if (!user) return <Navigate to="/login" />;

    switch (user.role) {
      case "student":
        return <StudentDashboard user={user} />;
      case "employee":
        return <CorporateDashboard user={user} />;
      case "employer":
        return <EmployeeManagement user={user} />;
      default:
        return <Navigate to="/login" />;
    }
  };

  const employerOnly = (page) => {
    if (!user) return <Navigate to="/login" />;
    return user.role === "employer" ? page : <Navigate to="/dashboard" />;
  };

  const companyManagerOnly = (page) => {
    if (!user) return <Navigate to="/login" />;
    return user.role === "employer" || user.companyAccess?.accessRole === "team_leader" ? page : <Navigate to="/dashboard" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} setUser={setUser} />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup setUser={setUser} />} />
          <Route
            path="/onboarding"
            element={<OnboardingForm user={user} setUser={setUser} />}
          />
          <Route path="/dashboard" element={getDashboard()} />
          <Route path="/employer-analytics" element={employerOnly(<EmployerDashboard user={user} />)} />
          <Route path="/company-roles" element={employerOnly(<CompanyRoles user={user} />)} />
          <Route path="/courses" element={<CourseMarketplace />} />
          <Route
            path="/course/:courseId"
            element={<CourseDetailEnhanced user={user} />}
          />
          <Route path="/payment" element={<Payment user={user} />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/simulation" element={<SimulationLab user={user} />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/events" element={<Events />} />
          <Route path="/quiz/:courseId" element={<Quiz user={user} />} />
          <Route
            path="/form"
            element={<AIWorkshopRegistration />} // Temporary route for AI Workshop Registration form
          />
          <Route
            path="/course-feedback/:courseId"
            element={<CourseFeedback user={user} />}
          />
          <Route
            path="/certificate/:courseId"
            element={<Certificate user={user} />}
          />
          <Route
            path="/learning-roadmap"
            element={<LearningRoadmap user={user} />}
          />
          <Route
            path="/employee-management"
            element={companyManagerOnly(<EmployeeManagement user={user} />)}
          />
          <Route path="/employee/:employeeId" element={companyManagerOnly(<EmployeeDetails />)} />
          <Route
            path="/assign-courses/:employeeId"
            element={companyManagerOnly(<CourseAssignment />)}
          />
        </Routes>
      </main>
      <Footer />
      <AIAssistant />
    </div>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("currentUser");
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      console.error("Failed to parse currentUser from localStorage", err);
      return null;
    }
  });

  // Save user to localStorage whenever user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [user]);

  useEffect(() => {
    const handleWelxPointsUpdate = (event) => {
      setUser((prevUser) => ({ ...prevUser }));
    };

    window.addEventListener("welxPointsUpdated", handleWelxPointsUpdate);
    return () =>
      window.removeEventListener("welxPointsUpdated", handleWelxPointsUpdate);
  }, []);

  return (
    <CurrencyProvider>
      <Router>
        <ScrollToTop />
        <AppRoutes user={user} setUser={setUser} />
      </Router>
    </CurrencyProvider>
  );
}

export default App;
