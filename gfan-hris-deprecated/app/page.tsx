'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import DashboardLayout from '@/components/DashboardLayout';
import { BiSolidUserAccount } from 'react-icons/bi';
import { AiFillCarryOut } from 'react-icons/ai';
import { MdEventNote, MdCheckCircle } from 'react-icons/md';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="dashboard-welcome">
        <h1 className="dashboard-title">Welcome to GFAN HRIS</h1>
        <p className="dashboard-subtitle">Human Resource Information System</p>

        <div className="dashboard-cards">
          <div className="dashboard-card">
            <BiSolidUserAccount className="card-icon" />
            <h3>Employees</h3>
            <p>Manage employee information and records</p>
          </div>

          <div className="dashboard-card">
            <AiFillCarryOut className="card-icon" />
            <h3>Attendance</h3>
            <p>Track employee attendance and working hours</p>
          </div>

          <div className="dashboard-card">
            <MdEventNote className="card-icon" />
            <h3>Leave Requests</h3>
            <p>Submit and manage leave applications</p>
          </div>

          <div className="dashboard-card">
            <MdCheckCircle className="card-icon" />
            <h3>Approvals</h3>
            <p>Review and approve pending requests</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
