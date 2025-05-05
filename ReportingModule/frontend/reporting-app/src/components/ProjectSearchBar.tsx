//Functionality for the project search bar seen on dashboard page

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/api";

interface Project {
  id: number;
  project_name: string;
}

const ProjectSearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [results, setResults] = useState<Project[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setResults([]);
      return;
    }
    const debounceTimer = setTimeout(() => {
      apiClient
        .get("/projects/my", { params: { project_name: searchQuery } })
        .then((resp) => {
          setResults(resp.data);
          setShowDropdown(true);
        })
        .catch((err) => {
          console.error("Project search error:", err);
        });
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSelect = (project: Project) => {
    navigate(`/project/${project.id}`);
    setShowDropdown(false);
    setSearchQuery("");
  };

  return (
    <div style={searchStyles.container}>
      <input
        type="text"
        placeholder="Search projects..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={searchStyles.input}
      />
      {showDropdown && results.length > 0 && (
        <div style={searchStyles.dropdown}>
          {results.map((project) => (
            <div
              key={project.id}
              style={searchStyles.dropdownItem}
              onClick={() => handleSelect(project)}
            >
              {project.project_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const searchStyles = {
  container: {
    position: "relative" as "relative",
    margin: "1rem",
    width: "300px",
  },
  input: {
    width: "100%",
    padding: "0.5rem",
    fontSize: "1rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  dropdown: {
    position: "absolute" as "absolute",
    top: "110%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    borderRadius: "4px",
    zIndex: 1000,
  },
  dropdownItem: {
    padding: "0.5rem",
    cursor: "pointer",
  },
};

export default ProjectSearchBar;
