// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import apiClient from "../services/api";

// interface TestReport {
//   id: number;
//   test_name: string;
//   status: string;
//   execution_time: number;
//   timestamp: string;
// }

// interface TestListProps {
//   projectId: number | null;
//   suiteId: number | null;
// }

// const TestList: React.FC<TestListProps> = ({ projectId, suiteId }) => {
//   const [tests, setTests] = useState<TestReport[]>([]);
//   const navigate = useNavigate();

//   const fetchTests = async () => {
//     if (!projectId) return;
//     try {
//       const response = await apiClient.get("/test-results", {
//         params: { project_id: projectId, suite_id: suiteId },
//       });
//       setTests(response.data);
//     } catch (err) {
//       console.error("Error fetching tests:", err);
//     }
//   };

//   useEffect(() => {
//     fetchTests();
//   }, [projectId, suiteId]);

//   return (
//     <div>
//       <h3>Test List</h3>
//       {tests.length > 0 ? (
//         <ul>
//           {tests.map((test) => (
//             <li
//               key={test.id}
//               onClick={() => navigate(`/project/${projectId}/test/${test.id}`)}
//               style={{ cursor: "pointer", marginBottom: "0.5rem" }}
//             >
//               {test.test_name} - {test.status} - {test.execution_time}s
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p>No tests found.</p>
//       )}
//     </div>
//   );
// };

// export default TestList;
