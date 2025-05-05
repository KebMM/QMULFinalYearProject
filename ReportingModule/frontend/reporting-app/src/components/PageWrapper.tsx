// Page layout helper

import React from "react";

interface PageWrapperProps {
  children: React.ReactNode;
  title?: string;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children, title }) => {
  return (
    <div style={styles.pageContainer}>
      <div style={styles.content}>
        {title && <h1 style={styles.pageTitle}>{title}</h1>}
        {children}
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
        background: "linear-gradient(135deg, #f8fafc, #ffffff)",
        flex: "column",
      alignItems: "flex-start" as React.CSSProperties["alignItems"],
  },
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "2rem",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  pageTitle: {
    marginTop: 0,
    marginBottom: "1.5rem",
    textAlign: "center" as const,
    color: "#1f2937",
  },
};

export default PageWrapper;
