//Project Cards seen on the dashboard page (gets project pass/fail rate and allows for favouriting)

import React from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface ProjectCardProps {
  projectName: string;
  projectId: number;
  totalTests: number;
  passRate: number; // 0-100
  isFavourite: boolean;
  onToggleFavourite: (id: number) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  projectName,
  projectId,
  totalTests,
  passRate,
  isFavourite,
  onToggleFavourite,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/project/${projectId}`);
  };

  return (
    <div style={styles.cardContainer} onClick={handleClick}>
      <div style={styles.header}>
        <h3 style={styles.projectName}>{projectName}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavourite(projectId);
          }}
          style={styles.favButton}
          title="Toggle Favourite"
        >
          {isFavourite ? "★" : "☆"}
        </button>
      </div>
      <p>Total Tests: {totalTests}</p>
      <div style={styles.chartContainer}>
        <CircularProgressbar
          value={passRate}
          text={`${passRate.toFixed(1)}%`}
          styles={buildStyles({
            textSize: "20px",
            pathColor: "rgba(5, 215, 50)",
            textColor: "#3e98c7",
            trailColor: "#d6d6d6",
          })}
        />
        <div style={styles.chartText}>Pass Rate</div>
      </div>
    </div>
  );
};

const styles = {
  cardContainer: {
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "1rem",
    width: "300px",
    textAlign: "center" as React.CSSProperties["textAlign"],
    margin: "1rem 2rem 1rem -1rem",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    cursor: "pointer" as React.CSSProperties["cursor"],
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  projectName: {
    margin: "auto",
    fontSize: "1.2rem",
    paddingLeft: "4rem",
  },
  favButton: {
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "1.5rem",
    color: "#f1c40f",
  },
  chartContainer: {
    width: "100px",
    height: "100px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column" as React.CSSProperties["flexDirection"],
    alignItems: "center" as React.CSSProperties["alignItems"],
  },
  chartText: {
    marginTop: "0.5rem",
    fontSize: "14px",
  },
};

export default ProjectCard;
