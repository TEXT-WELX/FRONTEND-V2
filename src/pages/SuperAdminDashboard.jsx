import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import DashboardCards from '../components/admin/DashboardCards';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('superAdminToken');
    if (!token) {
      navigate('/super-admin/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/admin/dashboard`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );

        if (!response.ok) throw new Error('Failed to fetch stats');

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white">Super Admin Dashboard</h1>
            <p className="text-gray-400 mt-2">System Overview & Management</p>
          </div>

          {stats && <DashboardCards stats={stats} />}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Users by Role</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Students</span>
                  <span className="text-blue-400 font-bold">{stats?.studentCount || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Employees</span>
                  <span className="text-green-400 font-bold">{stats?.employeeCount || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Admins</span>
                  <span className="text-purple-400 font-bold">{stats?.adminCount || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Quick Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Users</span>
                  <span className="text-white font-bold">{stats?.totalUsers || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active (24h)</span>
                  <span className="text-green-400 font-bold">{stats?.activeUsers || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Courses</span>
                  <span className="text-white font-bold">{stats?.totalCourses || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}