//Functionality for the Test report search bar seen in project pages


import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../services/api";

interface TestReport {
  id: number;
  test_name: string;
}

const TestSearchBar: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [results, setResults] = useState<TestReport[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setResults([]);
      return;
    }
    const debounceTimer = setTimeout(() => {
      if (!projectId) return;
      apiClient
        .get("/test-results/", {
          params: { project_id: projectId, test_name: searchQuery.trim() },
        })
        .then((response) => {
          setResults(response.data);
          setShowDropdown(true);
        })
        .catch((err) => {
          console.error("Test search error:", err);
          setResults([]);
        });
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, projectId]);

  const handleSelect = (testReport: TestReport) => {
    navigate(`/project/${projectId}/test/${testReport.id}`);
    setSearchQuery("");
    setShowDropdown(false);
  };

  return (
    <div style={styles.container}>
      <input
        type="text"
        placeholder="Search tests by name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={styles.input}
        onFocus={() => {
          if (results.length > 0) setShowDropdown(true);
        }}
        onBlur={() => {
          setTimeout(() => setShowDropdown(false), 200);
        }}
      />
      {showDropdown && results.length > 0 && (
        <div style={styles.dropdown}>
          {results.map((test) => (
            <div
              key={test.id}
              style={styles.dropdownItem}
              onClick={() => handleSelect(test)}
            >
              {test.test_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: "relative",
    margin: "1rem 2rem",
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
    position: "absolute",
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

export default TestSearchBar;
