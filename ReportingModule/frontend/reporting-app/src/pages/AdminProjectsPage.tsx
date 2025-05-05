// Manage Projects page. Admins can create/delete projects and assign users to projects

import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { jwtDecode } from 'jwt-decode';
import apiClient from "../services/api";
import CreateProject from "../components/CreateProject";

interface TokenPayload {
  sub: string;
  role: string;
  exp: number;
}

interface Project {
  id: number;
  project_name: string;
}

interface AssignUserFormProps {
  projectId: number;
  onAssigned: () => void;
}

const AssignUserForm: React.FC<AssignUserFormProps> = ({ projectId, onAssigned }) => {
  const [userId, setUserId] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleAssign = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await apiClient.post(`/projects/${projectId}/assign-user/`, null, {
        params: { user_id: userId },
      });
      setMessage("User assigned successfully.");
      setUserId("");
      onAssigned();
    } catch (error) {
      console.error("Error assigning user:", error);
      setMessage("Error assigning user. Please try again.");
    }
  };

  return (
    <form onSubmit={handleAssign} style={styles.assignForm}>
      <input
        type="text"
        placeholder="Enter User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        style={styles.input}
        required
      />
      <button type="submit" style={styles.smallButton}>
        Assign
      </button>
      {message && <p style={styles.message}>{message}</p>}
    </form>
  );
};

const AdminProjectsPage: React.FC = () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  let decoded: TokenPayload;
  try {
    decoded = jwtDecode<TokenPayload>(token);
  } catch (error) {
    console.error("Error decoding token:", error);
    return <Navigate to="/login" replace />;
  }
  if (decoded.role.toLowerCase() !== "admin") {
    return (
      <div style={styles.notAuthorized}>
        You are not authorized to view this page.
      </div>
    );
  }

  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreateProject, setShowCreateProject] = useState<boolean>(false);
  const [assigningProjectId, setAssigningProjectId] = useState<number | null>(null);

  const fetchProjects = async () => {
    try {
      const response = await apiClient.get("/projects/");
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

    const handleDeleteProject = async (projectId: number) => {
        const confirmed = window.confirm("Are you sure you want to delete this project?");
        if (!confirmed) return;
        try {
        await apiClient.delete(`/projects/${projectId}`);
        fetchProjects();
        } catch (error) {
        console.error("Error deleting project:", error);
        }
    };

  const toggleAssignUser = (projectId: number) => {
    if (assigningProjectId === projectId) {
      setAssigningProjectId(null);
    } else {
      setAssigningProjectId(projectId);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h1 style={styles.title}>Manage Projects</h1>
        <button onClick={() => setShowCreateProject((prev) => !prev)} style={styles.toggleButton}>
          {showCreateProject ? "Hide Create Project" : "Create New Project"}
        </button>
        {showCreateProject && <CreateProject onProjectCreated={fetchProjects} />}

        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.thCell}>ID</th>
              <th style={styles.thCell}>Project Name</th>
              <th style={styles.thCell}>Assign User</th>
              <th style={styles.thCell}>Delete</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} style={styles.bodyRow}>
                <td style={styles.tdCell}>{project.id}</td>
                <td style={styles.tdCell}>{project.project_name}</td>
                <td style={styles.tdCell}>
                  {assigningProjectId === project.id ? (
                    <div>
                      <AssignUserForm
                        projectId={project.id}
                        onAssigned={() => setAssigningProjectId(null)}
                      />
                      <button onClick={() => toggleAssignUser(project.id)} style={styles.cancelButton}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => toggleAssignUser(project.id)} style={styles.actionButton}>
                      Assign User
                    </button>
                  )}
                </td>
                <td style={styles.tdCell}>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    style={styles.deleteButton}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    margin: "2rem auto",
    padding: "1rem",
    maxWidth: "800px",
  },
  title: {
    marginBottom: "1.5rem",
    textAlign: "center",
  },
  toggleButton: {
    padding: "0.5rem 1rem",
    marginBottom: "1rem",
    fontSize: "1rem",
    cursor: "pointer",
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
  actionButton: {
    padding: "0.3rem 0.7rem",
    marginRight: "0.5rem",
    cursor: "pointer",
    fontSize: "0.9rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    backgroundColor: "#f0f0f0",
  },
  cancelButton: {
    padding: "0.3rem 0.7rem",
    cursor: "pointer",
    fontSize: "0.9rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    backgroundColor: "#fff",
    color: "#333",
    marginLeft: "0.5rem",
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
  assignForm: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.5rem",
  },
  input: {
    padding: "0.3rem",
    fontSize: "0.9rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
    width: "120px",
  },
  smallButton: {
    padding: "0.3rem 0.5rem",
    fontSize: "0.9rem",
    cursor: "pointer",
    border: "1px solid #ccc",
    borderRadius: "4px",
    backgroundColor: "#f0f0f0",
  },
  message: {
    margin: 0,
    fontSize: "0.8rem",
    color: "green",
  },
  notAuthorized: {
    margin: "2rem auto",
    padding: "1rem",
    maxWidth: "500px",
    textAlign: "center",
    fontSize: "1.2rem",
    color: "red",
    fontWeight: "bold",
  },
};

export default AdminProjectsPage;
