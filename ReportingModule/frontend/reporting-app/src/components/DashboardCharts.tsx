// //

// import React, { useState, useEffect } from "react";
// import apiClient from "../services/api";
// import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
// import "react-circular-progressbar/dist/styles.css";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   ResponsiveContainer,
// } from "recharts";

// interface AggregatedReport {
//   total_tests: number;
//   passed_tests: number;
//   failed_tests: number;
//   pass_rate: number;
//   avg_execution_time: number;
// }

// interface TestReport {
//   id: number;
//   test_name: string;
//   status: string;
//   execution_time: number;
//   timestamp: string;
// }

// interface DashboardChartsProps {
//   projectId: number | null;
//   suiteId: number | null;
// }

// const DashboardCharts: React.FC<DashboardChartsProps> = ({ projectId, suiteId }) => {
//   const [aggregated, setAggregated] = useState<AggregatedReport | null>(null);
//   const [recentTests, setRecentTests] = useState<TestReport[]>([]);

//   const fetchAggregatedData = async () => {
//     if (!projectId) return;
//     try {
//       const response = await apiClient.get("/aggregated-reports", {
//         params: { project_id: projectId, suite_id: suiteId },
//       });
//       setAggregated(response.data);
//     } catch (err) {
//       console.error("Error fetching aggregated data:", err);
//     }
//   };

//   const fetchRecentTests = async () => {
//     if (!projectId) return;
//     try {
//       const response = await apiClient.get("/test-results", {
//         params: { project_id: projectId, suite_id: suiteId, limit: 10 },
//       });
//       setRecentTests(response.data);
//     } catch (err) {
//       console.error("Error fetching recent tests:", err);
//     }
//   };

//   useEffect(() => {
//     fetchAggregatedData();
//     fetchRecentTests();
//   }, [projectId, suiteId]);

//   return (
//     <div style={{
//       display: "flex",
//       flexDirection: "column",
//       alignItems: "center",
//       justifyContent: "center",
//       gap: "1rem"
//     }}>
//       <h3>Aggregated Metrics</h3>
//       {aggregated ? (
//         <div style={{ display: "flex", gap: "2rem" }}>
//           <div style={{ width: 150, height: 150 }}>
//             <CircularProgressbar
//               value={aggregated.pass_rate}
//               text={`${aggregated.pass_rate.toFixed(2)}%`}
//               styles={buildStyles({
//                 pathColor:
//                   aggregated.pass_rate >= 75 ? "green" : "red",
//                 textColor: "#000",
//               })}
//             />
//             <p style={{ textAlign: "center" }}>Pass Rate</p>
//           </div>
//           <div style={{ flex: 1 }}>
//             <h4>Average Execution Time</h4>
//             <p>{aggregated.avg_execution_time.toFixed(2)} seconds</p>
//           </div>
//         </div>
//       ) : (
//         <p>Loading aggregated data...</p>
//       )}

//       <h3>Recent Test Executions</h3>
//       {recentTests.length > 0 ? (
//         <ResponsiveContainer width="100%" height={300}>
//           <BarChart data={recentTests}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="test_name" />
//             <YAxis />
//             <Tooltip />
//             <Bar dataKey="execution_time" fill="#8884d8" />
//           </BarChart>
//         </ResponsiveContainer>
//       ) : (
//         <p>Loading recent test executions...</p>
//       )}
//     </div>
//   );
// };

// export default DashboardCharts;
