// src/pages/dashboards/farmer/ExpertsPage.jsx

import React, { useEffect, useState } from "react";
import { userAPI, apiUtils } from "../../../api"; // Adjust path if needed

const ExpertsPage = () => {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

useEffect(() => {
  const fetchExperts = async () => {
    try {
      const response = await userAPI.getExperts();
      const result = apiUtils.handleSuccess(response);

      console.log("Experts API response:", result.data);

      if (result.success && Array.isArray(result.data.experts)) {
        setExperts(result.data.experts); // ✅ this is the array
      } else {
        setError("Unexpected response format.");
      }
    } catch (err) {
      const errorResult = apiUtils.handleError(err);
      setError(errorResult.message);
    } finally {
      setLoading(false);
    }
  };

  fetchExperts();
}, []);



  if (loading) return <p className="p-4">Loading experts...</p>;
  if (error) return <p className="text-red-500 p-4">Error: {error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Available Experts</h1>
      {experts.length === 0 ? (
        <p>No experts found.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {experts.map((expert) => (
            <li
              key={expert._id}
              className="border rounded-md p-4 shadow hover:shadow-lg transition"
            >
              <h2 className="text-lg font-semibold">{expert.name}</h2>
              <p>Email: {expert.email}</p>
              <p>Specialization: {expert.specialization || "N/A"}</p>
              {/* Add more fields if available */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExpertsPage;
