import React from "react";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import DashSidebar from '../components/DashSidebar';
import DashProfile from '../components/DashProfile';
import DashPosts from '../components/DashPosts';
import DashUsers from '../components/DashUsers';
import DashComments from '../components/DashComments';
import DashboardComp from '../components/DashboardComp';
<<<<<<< HEAD
import FeedbackDashboard from './FeedbackDashboard';
=======
import AdminDeliveryManagement from './AdminDeliveryManagement';
>>>>>>> 4ccaa7146c979f03a8506a948456ea22fca4c1b4


export default function Dashboard() {
  const location = useLocation();
  const [tab, setTab] = useState("");
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="md:w-56">
        <DashSidebar />
      </div>
      {tab === "profile" && <DashProfile />}
      {tab === "posts" && <DashPosts />}
      {tab === "users" && <DashUsers />}
<<<<<<< HEAD
      {/* feedback */}
      {tab === "feedback" && <FeedbackDashboard />}
      {/* dashboard comp */}
      {/* comments  */}
=======
>>>>>>> 4ccaa7146c979f03a8506a948456ea22fca4c1b4
      {tab === "comments" && <DashComments />}
      {tab === "delivery-details" && <AdminDeliveryManagement />}
      {tab === "dash" && <DashboardComp />}
    </div>
  );
}
