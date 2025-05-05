//Manage users page - Admins can edit user role, (un)assign them to projects and delete them

import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import apiClient from "../services/api";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  sub: string;
  role: string;
  exp: number;
}

interface Project {
  id: number;
  project_name: string;
}

interface User {
  id: number;
  username: string;
  role: string;
  projects: Project[];
}

const ManageUsersPage: React.FC = () => {
  const token = localStorage.getItem("access_token");
  let isAdmin = false;
  if (token) {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      isAdmin = decoded.role.toLowerCase() === "admin";
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [assignProjectIds, setAssignProjectIds] = useState<Record<number, string>>({});
  const [unassignProjectIds, setUnassignProjectIds] = useState<Record<number, string>>({});

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/users/");
      setUsers(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Delete a user
    const handleDelete = async (userId: number) => {
        const confirmed = window.confirm("Are you sure you want to delete this user?");
        if (!confirmed) return;
        try {
        await apiClient.delete(`/users/${userId}`);
        fetchUsers();
        } catch (err) {
        console.error("Error deleting user:", err);
        alert("Error deleting user");
        }
    };

  // Update a user's role
  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await apiClient.patch(`/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (err) {
      console.error("Error updating role:", err);
      alert("Error updating user role");
    }
  };

  // Assign a user to a project
  const handleAssignProject = async (userId: number, projectId: number) => {
    try {
      await apiClient.post(`/projects/${projectId}/assign-user/`, null, {
        params: { user_id: userId },
      });
      fetchUsers();
    } catch (err) {
      console.error("Error assigning project:", err);
      alert("Error assigning project to user");
    }
  };

  // Unassign a user from a project
  const handleUnassignProject = async (userId: number, projectId: number) => {
    try {
      await apiClient.delete(`/users/${userId}/projects`, {
        params: { project_id: projectId },
      });
      fetchUsers();
    } catch (err) {
      console.error("Error unassigning project:", err);
      alert("Error unassigning project from user");
    }
  };

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h1 style={styles.title}>Manage Users</h1>
        {loading ? (
          <p>Loading users...</p>
        ) : error ? (
          <p style={styles.error}>{error}</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
                <th style={styles.thCell}>ID</th>
                <th style={styles.thCell}>Username</th>
                <th style={styles.thCell}>Role</th>
                <th style={styles.thCell}>Projects Assigned</th>
                <th style={styles.thCell}>Manage Projects</th>
                <th style={styles.thCell}>Delete User</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={styles.bodyRow}>
                  <td style={styles.tdCell}>{user.id}</td>
                  <td style={styles.tdCell}>{user.username}</td>
                  <td style={styles.tdCell}>
                    <div style={styles.roleCell}>
                      <select
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        value={user.role}
                        style={styles.select}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </td>
                  <td style={styles.tdCell}>
                    {user.projects && user.projects.length > 0 ? (
                      <ul style={styles.projectList}>
                        {user.projects.map((proj) => (
                          <li key={proj.id}>{proj.project_name}</li>
                        ))}
                      </ul>
                    ) : (
                      "None"
                    )}
                  </td>
                  <td style={styles.tdCell}>
                    <div style={styles.inputGroup}>
                      <label style={styles.labelSmall}>Assign Project ID:</label>
                      <input
                        type="text"
                        placeholder="e.g. 12"
                        value={assignProjectIds[user.id] || ""}
                        onChange={(e) =>
                          setAssignProjectIds({ ...assignProjectIds, [user.id]: e.target.value })
                        }
                        style={styles.input}
                      />
                      <button
                        onClick={() =>
                          handleAssignProject(user.id, Number(assignProjectIds[user.id]))
                        }
                        style={styles.button}
                      >
                        Assign
                      </button>
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.labelSmall}>Unassign Project ID:</label>
                      <input
                        type="text"
                        placeholder="e.g. 12"
                        value={unassignProjectIds[user.id] || ""}
                        onChange={(e) =>
                          setUnassignProjectIds({
                            ...unassignProjectIds,
                            [user.id]: e.target.value,
                          })
                        }
                        style={styles.input}
                      />
                      <button
                        onClick={() =>
                          handleUnassignProject(user.id, Number(unassignProjectIds[user.id]))
                        }
                        style={styles.button}
                      >
                        Unassign
                      </button>
                    </div>
                  </td>
                  <td style={styles.tdCell}>
                    <button onClick={() => handleDelete(user.id)} style={styles.deleteButton}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    margin: "2rem auto",
    padding: "1rem",
    maxWidth: "1000px",
  },
  title: {
    marginBottom: "1.5rem",
    textAlign: "center",
  },
  error: {
    color: "red",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  headerRow: {
    backgroundColor: "#f8f8f8",
  },
  bodyRow: {
    transition: "background-color 0.2s",
  },
  thCell: {
    padding: "0.75rem",
    textAlign: "left",
    borderBottom: "2px solid #ddd",
  },
  tdCell: {
    padding: "0.75rem",
    borderBottom: "1px solid #ddd",
    verticalAlign: "top",
  },
  roleCell: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  select: {
    padding: "0.3rem",
  },
  projectList: {
    paddingLeft: "1.5rem",
    margin: 0,
  },
  inputGroup: {
    marginBottom: "0.75rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  labelSmall: {
    fontSize: "0.85rem",
    fontWeight: 500,
  },
  input: {
    width: "80px",
    padding: "0.3rem",
  },
  button: {
    padding: "0.3rem 0.6rem",
    cursor: "pointer",
    border: "1px solid #ccc",
    borderRadius: "4px",
    backgroundColor: "#f0f0f0",
  },
  deleteButton: {
    padding: "0.4rem 0.8rem",
    cursor: "pointer",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "red",
    color: "#fff",
    fontWeight: "bold",
  },
};

export default ManageUsersPage;
