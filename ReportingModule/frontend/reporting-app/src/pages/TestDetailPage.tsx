//Test Report page - View reports, add comments, where the export button is located

import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";
import apiClient from "../services/api";
import { formatTimestamp } from "../utils/dateTimeUtils";
import { getStatusStyle } from "../utils/styleUtils";
import ExportReportModal from "../components/ExportReportModal";

interface TestStep {
  step_number: number;
  step_description: string;
  step_status: string;
  error_message?: string | null;
  timestamp: string;
}

interface TestReport {
  id: number;
  test_name: string;
  status: string;
  execution_time: number;
  timestamp: string;
  steps: TestStep[];
}

interface Comment {
  id: number;
  test_report_id: number;
  user_id: number;
  comment_text: string;
  created_at: string;
  username: string;
}

const TestDetailPage: React.FC = () => {
  const { testId } = useParams();
  const [testDetail, setTestDetail] = useState<TestReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");

  // Fetch the single test detail
  useEffect(() => {
    if (!testId) {
      setError("No test ID found in URL");
      setLoading(false);
      return;
    }

    const fetchTestDetail = async () => {
      try {
        const response = await apiClient.get(`/test-results/${testId}`);
        setTestDetail(response.data);
      } catch (err) {
        setError("Failed to load test detail.");
      } finally {
        setLoading(false);
      }
    };

    fetchTestDetail();
  }, [testId]);

  const loadComments = async () => {
    try {
      const response = await apiClient.get(`/test-results/${testId}/comments`);
      setComments(response.data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  useEffect(() => {
    if (testId) {
      loadComments();
    }
  }, [testId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await apiClient.post(`/test-results/${testId}/comments`, { comment_text: newComment });
      setNewComment("");
      loadComments();
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const getFirstStepTimestamp = (steps: TestStep[]): string | null => {
    if (!steps || steps.length === 0) return null;
    const sortedSteps = [...steps].sort((a, b) => a.step_number - b.step_number);
    return sortedSteps[0].timestamp;
  };

  if (loading) {
    return <div style={styles.loading}>Loading test details...</div>;
  }

  if (error) {
    return <div style={styles.error}>{error}</div>;
  }

  if (!testDetail) {
    return <div style={styles.error}>No test detail found.</div>;
  }

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h2 style={styles.title}>Test: {testDetail.test_name}</h2>
        <button style={styles.exportButton} onClick={() => setShowExportModal(true)}>
            Export Report
          </button>
        <div style={styles.summaryBox}>
          <p><strong>Status:</strong> {testDetail.status}</p>
          <p><strong>Execution Time:</strong> {testDetail.execution_time}s</p>
          <p>
          <strong>Started At:</strong>{" "}
          {getFirstStepTimestamp(testDetail.steps)
            ? formatTimestamp(getFirstStepTimestamp(testDetail.steps)!)
            : formatTimestamp(testDetail.timestamp)}
        </p>
        </div>

        <h3 style={styles.sectionTitle}>Test Steps</h3>
        {testDetail.steps.length === 0 ? (
          <p>No steps found for this test.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Step #</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Message</th>
                <th style={styles.th}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {testDetail.steps.map((step) => (
                <tr key={step.step_number}>
                  <td style={styles.td}>{step.step_number}</td>
                  <td style={styles.td}>{step.step_description}</td>
                  <td style={{ ...styles.td, ...getStatusStyle(step.step_status) }}>
                    {step.step_status}
                  </td>
                  <td style={styles.td}>{step.error_message || ""}</td>
                  <td style={styles.td}>{formatTimestamp(step.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <h3 style={styles.sectionTitle}>Comments</h3>
                <div style={styles.commentContainer}>
                  <textarea
                    placeholder="Leave a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    style={styles.commentInput}
                  />
                  <button onClick={handleAddComment} style={styles.commentButton}>
                    Post Comment
                  </button>
                </div>
                {comments.length > 0 ? (
                  <div style={styles.commentsList}>
                    {comments.map((comment) => (
                      <div key={comment.id} style={styles.commentItem}>
                        <div style={styles.commentHeader}>
                          <strong>{comment.username}</strong>{" "}
                          <span style={styles.commentTimestamp}>
                            {formatTimestamp(comment.created_at)}
                          </span>
                        </div>
                        <p style={styles.commentText}>{comment.comment_text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No comments yet.</p>
                )}
              </div>
              {showExportModal && (
              <ExportReportModal testId={testDetail.id} onClose={() => setShowExportModal(false)} />
              )}
        </div>
          );
        };

const styles = {
  container: {
    marginTop: "80px",
    padding: "1rem",
    textAlign: "left" as React.CSSProperties["textAlign"],
  },
  title: {
    textAlign: "center" as React.CSSProperties["textAlign"],
    marginBottom: "1rem",
  },
  exportButton: {
    padding: "0.2rem 1rem",
    backgroundColor: "#1f2937",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginBottom: "10px",
    marginTop: "15px",
    marginLeft: "70rem",
  },
  summaryBox: {
    border: "1px solid #ddd",
    padding: "1rem",
    marginBottom: "1rem",
    borderRadius: "6px",
    textAlign: "center" as React.CSSProperties["textAlign"],
  },
  sectionTitle: {
    textAlign: "center" as React.CSSProperties["textAlign"],
    margin: "1rem 0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as React.CSSProperties["borderCollapse"],
  },
  th: {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "center" as React.CSSProperties["textAlign"],
    backgroundColor: "#f2f2f2",
    whiteSpace: "nowrap" as React.CSSProperties["whiteSpace"],
  },
  td: {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "center" as React.CSSProperties["textAlign"],
  },
  loading: {
    marginTop: "80px",
    textAlign: "center" as React.CSSProperties["textAlign"],
  },
  error: {
    marginTop: "80px",
    color: "red",
  },
  commentContainer: {
    margin: "1rem 0",
    display: "flex",
    flexDirection: "column" as React.CSSProperties["flexDirection"],
    alignItems: "flex-start" as React.CSSProperties["alignItems"],
  },
  commentInput: {
    width: "100%",
    height: "80px",
    padding: "0.5rem",
    fontSize: "1rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
    marginBottom: "0.5rem",
  },
  commentButton: {
    alignSelf: "flex-end",
    padding: "0.5rem 1rem",
    fontSize: "1rem",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#1f2937",
    color: "#fff",
    cursor: "pointer",
  },
  commentsList: {
    marginTop: "1rem",
    borderTop: "1px solid #ccc",
    paddingTop: "1rem",
  },
  commentItem: {
    marginBottom: "1rem",
    borderBottom: "1px solid #eee",
    paddingBottom: "0.5rem",
  },
  commentHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.5rem",
  },
  commentTimestamp: {
    fontSize: "0.8rem",
    color: "#666",
  },
  commentText: {
    margin: 0,
  },
};

export default TestDetailPage;
