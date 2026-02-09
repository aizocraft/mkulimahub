// src/pages/dashboards/admin/Analytics.jsx
import React from "react";
import DbStats from "../../../components/DbStats";

const Analytics = () => {
  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
    
      <DbStats />
    </div>
  );
};

export default Analytics;
