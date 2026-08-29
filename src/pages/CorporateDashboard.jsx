import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import api from "../utils/api";
import EmployeeDashboard from "./EmployeeDashboard";
import LeaderDashboard from "./LeaderDashboard";

export default function CorporateDashboard({ user }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/company/me")
      .then(({ data }) => setProfile(data))
      .catch((requestError) => setError(requestError?.response?.data?.message || "Unable to load your company access."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="employer-page"><div className="employer-shell employer-not-found"><Building2 /><h1>Loading your corporate workspace...</h1></div></div>;
  if (error) return <div className="employer-page"><div className="employer-shell employer-not-found"><Building2 /><h1>Corporate dashboard unavailable</h1><p>{error}</p></div></div>;
  if (profile?.access?.accessRole === "team_leader") return <LeaderDashboard user={user} />;
  return <EmployeeDashboard user={user} companyProfile={profile} />;
}
