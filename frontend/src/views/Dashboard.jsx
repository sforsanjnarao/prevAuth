import { useEffect, useState } from "react";
import axiosInstance from "../api/axios";

const Dashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const res = await axiosInstance.get("/dashboard"); // or /vault
      setData(res.data);
    };
    loadData();
  }, []);

  return (
    <div>
      <h1>Welcome to Dashboard</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default Dashboard;