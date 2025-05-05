// Form for creating a new project

import React, { useState } from 'react';
import apiClient from '../services/api';

interface CreateProjectProps {
  onProjectCreated?: () => void;
}

const CreateProject: React.FC<CreateProjectProps> = ({ onProjectCreated }) => {
  const [projectName, setProjectName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await apiClient.post('/projects/', { project_name: projectName });
      if (response && response.data) {
        setSuccessMessage(`Project "${response.data.project_name}" created successfully.`);
        setProjectName('');
        setError('');
        if (onProjectCreated) onProjectCreated();
      }
    } catch (err) {
      console.error("Error creating project:", err);
      setError('Error creating project. Please try again.');
      setSuccessMessage('');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Create New Project</h2>
      {error && <p style={styles.error}>{error}</p>}
      {successMessage && <p style={styles.success}>{successMessage}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Enter project name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>
          Create Project
        </button>
      </form>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    margin: '1rem auto',
    padding: '1rem',
    maxWidth: '500px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  input: {
    padding: '0.5rem',
    fontSize: '1rem',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  button: {
    padding: '0.5rem',
    fontSize: '1rem',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#1f2937',
    color: '#fff',
    cursor: 'pointer'
  },
  error: {
    color: 'red'
  },
  success: {
    color: 'green'
  }
};

export default CreateProject;
