import { useEffect, useState } from "react";
import { Card } from "flowbite-react";
import { useSelector } from "react-redux";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ActiveUsers() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const { theme } = useSelector((state) => state.theme) || {};

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resUsers = await fetch("/api/user/active-users");
        const resGrowth = await fetch("/api/user/user-growth");
        const usersData = await resUsers.json();
        const growthData = await resGrowth.json();

        if (resUsers.ok) {
          setActiveUsers(
            Array.isArray(usersData) ? usersData : usersData.onlineUsers || []
          );
        }
        if (resGrowth.ok) {
          setUserGrowthData(growthData);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const gradientClasses = [
    "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700",
    "bg-gradient-to-r from-green-400 via-green-500 to-green-600",
    "bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600",
    "bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600",
  ];

  const chartBg = theme === "dark" ? "bg-gray-800" : "bg-white";

  return (
    <div
      className={`px-4 py-8 min-h-screen w-full ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Line Chart Section */}
      <h1 className="text-3xl font-bold mb-6 text-center">
        User Growth Analytics
      </h1>
      <div className={`p-6 rounded-xl shadow-lg mb-12 ${chartBg}`}>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={userGrowthData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme === "dark" ? "#555" : "#ccc"}
            />
            <XAxis
              dataKey="month"
              stroke={theme === "dark" ? "#8884d8" : "#555"}
            />
            <YAxis stroke={theme === "dark" ? "#8884d8" : "#555"} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#82ca9d"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* User Cards Section */}
      <h1 className="text-3xl font-bold mb-6 text-center">Users</h1>
      {activeUsers.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-6 p-4">
          {activeUsers.map((user, index) => (
            <Card
              key={user._id}
              className={`w-[160px] sm:w-[180px] md:w-[200px] rounded-xl shadow hover:shadow-2xl transition-all transform hover:scale-105 duration-300 p-4 flex flex-col items-center justify-center text-center ${chartBg}`}
            >
              <div
                className={`w-16 h-16 ${
                  gradientClasses[index % gradientClasses.length]
                } rounded-full flex items-center justify-center text-white text-2xl font-bold mb-2`}
              >
                {user.username ? user.username.charAt(0).toUpperCase() : "U"}
              </div>
              <h2 className="text-sm font-semibold truncate">
                {user.username}
              </h2>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-lg">No active users found.</p>
      )}
    </div>
  );
}
