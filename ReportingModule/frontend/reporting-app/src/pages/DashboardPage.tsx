// Main dashboard page for displaying the user's project cards etc

import React, { useEffect, useState } from "react";
import apiClient from "../services/api";
import ProjectCard from "../components/ProjectCard";
import Navbar from "../components/Navbar";
import ProjectSearchBar from "../components/ProjectSearchBar";

interface Project {
  id: number;
  project_name: string;
  totalTests?: number;
  passRate?: number;
  isFavourite?: boolean;
}

const DashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  const fetchProjects = async () => {
    try {
      const projectsResponse = await apiClient.get("/projects/my");
      const projectsData: Project[] = projectsResponse.data;

      const favResponse = await apiClient.get("/favourite-projects/");
      const favProjects: Project[] = favResponse.data;
      const favIds = favProjects.map((proj) => proj.id);

      const projectsWithMetrics = await Promise.all(
        projectsData.map(async (proj: Project) => {
          try {
            const metricsResponse = await apiClient.get("/aggregated-reports/", {
              params: { project_id: proj.id },
            });
            const metricsData = metricsResponse.data;
            return {
              ...proj,
              totalTests: metricsData.total_tests,
              passRate: metricsData.pass_rate,
              isFavourite: favIds.includes(proj.id),
            };
          } catch (error) {
            console.error(`Error fetching metrics for project ${proj.id}:`, error);
            return {
              ...proj,
              totalTests: 0,
              passRate: 0,
              isFavourite: favIds.includes(proj.id),
            };
          }
        })
      );

      // Sort so that favourite projects are at the top
      projectsWithMetrics.sort((a, b) => {
        if (a.isFavourite && !b.isFavourite) return -1;
        if (!a.isFavourite && b.isFavourite) return 1;
        return 0;
      });
      setProjects(projectsWithMetrics);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const toggleFavourite = async (id: number) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;

    try {
      if (project.isFavourite) {
        await apiClient.delete(`/favourite-projects/${id}`);
      } else {
        await apiClient.post("/favourite-projects/", { project_id: id });
     }
     fetchProjects();
   } catch (error) {
     console.error(`Error toggling favourite for project ${id}:`, error);
    }
  };

  const favouriteProjects = projects.filter((proj) => proj.isFavourite);

  return (
    <div>
      <Navbar favouriteProjects={favouriteProjects} />
      <div style={styles.searchContainer}>
      <ProjectSearchBar /> </div>
      <div style={styles.dashboardContainer}>
        <h2>My Projects</h2>
        <div style={styles.projectsGrid}>
          {projects.map((proj) => (
            <ProjectCard
              key={proj.id}
              projectName={proj.project_name}
              projectId={proj.id}
              totalTests={proj.totalTests ?? 0}
              passRate={proj.passRate ?? 0}
              isFavourite={proj.isFavourite ?? false}
              onToggleFavourite={toggleFavourite}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  searchContainer: {
      marginTop: "65px",
      marginLeft: "-20rem",
      display: "flex",
      flexDirection: "column" as React.CSSProperties["flexDirection"],
      alignItems: "flex-start" as React.CSSProperties["alignItems"],
    },
  dashboardContainer: {
    paddingTop: "80px",
    padding: "1rem",
    display: "flex",
    flexDirection: "column" as React.CSSProperties["flexDirection"],
    textAlign: "center" as React.CSSProperties["textAlign"],
  },
  projectsGrid: {
    width: "100%",
    display: "flex",
    flexDirection: "row" as React.CSSProperties["flexDirection"],
    flexWrap: "wrap" as React.CSSProperties["flexWrap"],
    justifyContent: "flex-start" as React.CSSProperties["justifyContent"],
    gap: "1rem",
    textAlign: "center" as React.CSSProperties["textAlign"],
    marginLeft: "8rem",
  },
};

export default DashboardPage;
