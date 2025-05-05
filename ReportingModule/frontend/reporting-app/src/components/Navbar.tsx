// Create navbar and different views depending on user

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate  } from "react-router-dom";
import logo from "../assets/logo.png";
import apiClient from "../services/api";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  sub: string;
  role: string;
  exp: number;
}

interface FavouriteProject {
  id: number;
  project_name: string;
}

interface NavbarProps {
  favouriteProjects?: FavouriteProject[];
}

const Navbar: React.FC<NavbarProps> = ({ favouriteProjects: initialFavouritesProp }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const projectId =
    pathSegments[1] === "project" && pathSegments[2] ? pathSegments[2] : null;

  const [favouriteProjects, setFavouriteProjects] = useState<FavouriteProject[]>(initialFavouritesProp ?? []);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [favDropdownOpen, setFavDropdownOpen] = useState(false);
  const [manageDropdownOpen, setManageDropdownOpen] = useState(false);

  useEffect(() => {
    if (!initialFavouritesProp || initialFavouritesProp.length === 0) {
      const fetchFavourites = async () => {
        try {
          const response = await apiClient.get("/favourite-projects/");
          setFavouriteProjects(response.data);
        } catch (error) {
          console.error("Error fetching favourite projects:", error);
        }
      };
      fetchFavourites();
    } else {
      setFavouriteProjects(initialFavouritesProp);
    }
  }, [initialFavouritesProp]);

  let isAdmin = false;
  const token = localStorage.getItem("access_token");
  if (token) {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      isAdmin = decoded.role.toLowerCase() === "admin";
    } catch (error) {
      console.error("Error decoding token in Navbar:", error);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/", { replace: true });
  };

  return (
    <header style={styles.header}>
      <div style={styles.logoContainer}>
        {/* Clicking the logo navigates to the dashboard */}
        <Link to="/dashboard">
          <img src={logo} alt="Company Logo" style={styles.logo} />
        </Link>
      </div>
      <nav style={styles.navLinks}>
        {/* Extra links shown only when inside a project */}
        {projectId && (
          <>
            <Link to={`/project/${projectId}`} style={styles.link}>
              Overview |
            </Link>
            <Link to={`/project/${projectId}/all-tests`} style={styles.link}>
              All Tests |
            </Link>
            <div
              style={styles.dropdown}
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <span style={styles.link}>Additional Metrics |</span>
              {dropdownOpen && (
                <div style={styles.dropdownContent}>
                  <Link
                    to={`/project/${projectId}/error-type/${projectId}`}
                    style={styles.dropdownLink}
                  >
                    Error Types
                  </Link>
                  <Link
                    to={`/project/${projectId}/metrics/test-coverage`}
                    style={styles.dropdownLink}
                  >
                    Test Coverage
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </nav>
      <nav style={styles.navUtils}>
        {/* Admin-only "Manage" dropdown */}
        {isAdmin && (
          <div
            style={{ ...styles.dropdown, marginRight: "2rem" }}
            onMouseEnter={() => setManageDropdownOpen(true)}
            onMouseLeave={() => setManageDropdownOpen(false)}
          >
            <span style={styles.link}>Manage </span>
            {manageDropdownOpen && (
              <div style={styles.dropdownContent}>
                <Link to="/admin-projects" style={styles.dropdownLink}>
                  Manage Projects
                </Link>
                <Link to="/admin-users" style={styles.dropdownLink}>
                  Manage Users
                </Link>
                <Link to="/admin-testsuites" style={styles.dropdownLink}>
                  Manage Test Suites
                </Link>
                <Link to="/admin-logs" style={styles.dropdownLink}>
                  Edit History
                </Link>
              </div>
            )}
          </div>
        )}

        <div
          style={{ ...styles.dropdown, marginRight: "2rem" }}
          onMouseEnter={() => setFavDropdownOpen(true)}
          onMouseLeave={() => setFavDropdownOpen(false)}
        >
          <span style={styles.link}>Favourites</span>
          {favDropdownOpen && (
            <div style={styles.dropdownContent}>
              {favouriteProjects.length > 0 ? (
                favouriteProjects.map((proj: FavouriteProject) => (
                  <Link
                    key={proj.id}
                    to={`/project/${proj.id}`}
                    style={styles.dropdownLink}
                  >
                    {proj.project_name}
                  </Link>
                ))
              ) : (
                <div style={styles.dropdownLink}>No favourites added</div>
              )}
            </div>
          )}
        </div>
        <Link to="/profile" style={styles.link}>
          Profile |
        </Link>
        <button
          onClick={handleLogout} style={styles.logoutButton}>
          Logout |
        </button>
      </nav>
    </header>
  );
};

interface Styles {
  header: React.CSSProperties;
  logoContainer: React.CSSProperties;
  logo: React.CSSProperties;
  navLinks: React.CSSProperties;
  navUtils: React.CSSProperties;
  link: React.CSSProperties;
  logoutButton: React.CSSProperties;
  dropdown: React.CSSProperties;
  dropdownContent: React.CSSProperties;
  dropdownLink: React.CSSProperties;
}

const styles: Styles = {
  header: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1f2937",
    padding: "0.5rem 1rem",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 1000,
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
  },
  logo: {
    height: "60px",
    width: "auto",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    paddingLeft: "26rem",
    paddingRight: "5rem",
  },
  navUtils: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    paddingLeft: "10rem",
    paddingRight: "5rem",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    fontWeight: "bold",
    cursor: "pointer",
  },
  logoutButton: {
    color: "#fff",
    background: "none",
    border: "none",
    padding: 0,
    fontWeight: "bold",
    textDecoration: "none",
    cursor: "pointer",
  },
  dropdown: {
    position: "relative",
    display: "inline-block",
  },
  dropdownContent: {
    position: "absolute",
    top: "100%",
    left: 0,
    backgroundColor: "#f9f9f9",
    minWidth: "160px",
    boxShadow: "0px 8px 16px 0px rgba(0,0,0,0.2)",
    zIndex: 999,
  },
  dropdownLink: {
    color: "#000",
    padding: "12px 16px",
    textDecoration: "none",
    display: "block",
    cursor: "pointer",
  },
};

export default Navbar;
