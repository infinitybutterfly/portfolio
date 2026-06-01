import React, { useState, useEffect } from 'react';
import './projectadmin.css';

const ProjectAdmin = () => {

  // --- Authentication State ---
  const [token, setToken] = useState(localStorage.getItem('adminToken') || null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // --- NEW: Global Error Toast State ---
  const [toastError, setToastError] = useState(null);

  // --- Core Dashboard State ---
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false); 

  // --- Modal & Form State ---
  const initialFormState = {
    name: '', url: '', startDate: '', endDate: '',
    description: '', language: '', status: 'Planning', type: 'Web'
  };
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);

  // --- Delete Alert State ---
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (toastError) {
      const timer = setTimeout(() => {
        setToastError(null); 
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastError]);

  // Fetch Projects Data
//   useEffect(() => {
//     if (!token) return; 

//     const fetchProjects = async () => {
//       setIsLoading(true);
//       try {
//         // const response = await fetch('https://localhost:7253/api/projects', {
//         const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/projects`, {
//           headers: { 'Authorization': `Bearer ${token}` } 
//         });
        
//         if (response.status === 401) {
//           handleLogout();
//           throw new Error('Session expired. Please log in again.');
//         }
//         if (!response.ok) throw new Error('Failed to fetch projects');
        
//         const data = await response.json();
//         setProjects(data);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchProjects();
//   }, [token]);

  // Fetch Projects Data
  useEffect(() => {
    if (!token) return; 

    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        // 1. ADD ?limit=0 so the Admin panel gets ALL projects
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/projects?limit=0`, {
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        
        if (response.status === 401) {
          handleLogout();
          throw new Error('Session expired. Please log in again.');
        }
        if (!response.ok) throw new Error('Failed to fetch projects');
        
        // 2. RENAME to 'result' to avoid confusion
        const result = await response.json();
        
        // 3. TARGET the actual array inside the new pagination object
        setProjects(result.data || result.Data || []);

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setToastError(null); 
    setIsAuthenticating(true);

    try {
    //   const response = await fetch('https://localhost:7253/api/auth/login', {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) throw new Error('Invalid username or password');
      
      const data = await response.json();
      setToken(data.token);
      localStorage.setItem('adminToken', data.token);
    } catch (err) {
      setToastError(err.message); 
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('adminToken');
    setProjects([]); 
  };

  const handleOpenCreate = () => {
    setFormData(initialFormState);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project) => {
    setFormData(project);
    setEditingId(project.id);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormState);
    setEditingId(null);
    setAttemptedSubmit(false); // Reset validation state when closing
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAttemptedSubmit(true);

    if (!formData.name || !formData.startDate || !formData.language || !formData.description || !formData.url) {
      setToastError("Please fill in all required fields.");
      return; 
    }

    if (!isValidUrl(formData.url)) {
      setToastError("Please enter a valid URL (it must include http:// or https://)");
      return; 
    }

    setIsProcessing(true);

    // 2. DATA CLEANUP
    const payload = { ...formData };
    if (payload.endDate === '') payload.endDate = null;

    try {
      if (modalMode === 'create') {
        // const response = await fetch('https://localhost:7253/api/projects', {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/projects`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          const errorText = await response.text(); 
          console.error("C# Validation Error (POST):", errorText);
          throw new Error(`Server rejected data. Check console.`);
        }
        
        const newProject = await response.json();
        setProjects([...projects, newProject]);
        
      } else {
        // const response = await fetch(`https://localhost:7253/api/projects/${editingId}`, {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/projects/${editingId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          const errorText = await response.text(); 
          console.error("C# Validation Error (PUT):", errorText);
          throw new Error(`Server rejected data. Check console.`);
        }
        
        const updatedProject = await response.json();
        setProjects(projects.map(p => p.id === editingId ? updatedProject : p)); 
      }
      handleCloseModal();
    } catch (err) {
      setToastError(err.message); 
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDelete = (id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const executeDelete = async () => {
    setIsProcessing(true);
    try {
    //   const response = await fetch(`https://localhost:7253/api/projects/${deleteId}`, {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/projects/${deleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete project');
      
      setProjects(projects.filter(p => p.id !== deleteId));
      setIsDeleteOpen(false);
      setDeleteId(null);
    } catch (err) {
      setToastError(err.message); 
      setIsDeleteOpen(false); 
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinishProject = async (id) => {
    setIsProcessing(true);
    try {
      const projectToUpdate = projects.find(p => p.id === id);
      const updatedData = { ...projectToUpdate, status: 'Completed', endDate: new Date().toISOString().split('T')[0] };

    //   const response = await fetch(`https://localhost:7253/api/projects/${id}`, {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/projects/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(updatedData)
      });
      
      if (!response.ok) throw new Error('Failed to update project status');
      
      const updatedProject = await response.json();
      setProjects(projects.map(p => p.id === id ? updatedProject : p));
    } catch (err) {
      setToastError(err.message); 
    } finally {
      setIsProcessing(false);
    }
  };

  const isValidUrl = (urlString) => {
    if (!urlString) return false;
    try {
      new URL(urlString);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="admin-container">
      
      {/* --- FLOATING ERROR TOAST --- */}
      {toastError && (
        <div className="toast-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{toastError}</span>
        </div>
      )}

      {/* VIEW 1: LOGIN DIALOG */}
      {!token ? (
        <div className="login-overlay">
          <div className="login-dialog">
            <div className="login-header">
              <h2>Admin Access</h2>
              <p>Please enter your credentials to continue.</p>
            </div>
            
            {/* RESTORED LOGIN FORM */}
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label>Username</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  required 
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                />
              </div>
              
              <button type="submit" className="submit-btn full-width" disabled={isAuthenticating}>
                {isAuthenticating ? 'Verifying...' : 'Login to Dashboard'}
              </button>
            </form>
          </div>
        </div>
      ) : isLoading ? (
        
        /* VIEW 2: LOADING STATE */
        <div className="center-content">
          <div className="loader"></div>
          <p className="status-text">Loading administration data...</p>
        </div>

      ) : error ? (
        
        /* VIEW 3: FATAL FETCH ERROR STATE */
        <div className="center-content">
          <p className="error-text">Failed to load admin panel: {error}</p>
          <button className="cancel-btn" onClick={() => window.location.reload()}>Retry</button>
        </div>

      ) : (

        /* VIEW 4: MAIN DASHBOARD */
        <>
          <div className="admin-header">
            <div>
              <h2>Project Administration</h2>
              <button className="cancel-btn" onClick={handleLogout} style={{marginTop: '10px'}}>
                Logout
              </button>
            </div>
            <button className="create-btn" onClick={handleOpenCreate}>
              + CREATE NEW PROJECT
            </button>
          </div>

          <div className="admin-list">
            {projects.length === 0 ? (
              <p className="empty-message">No projects found. Create one above.</p>
            ) : (
              projects.map(project => (
                <div className="admin-card" key={project.id}>
                  <div className="card-info">
                    <h3>{project.name}</h3>
                    <span className="card-badge">{project.type}</span>
                    <span className={`card-status status-${(project.status || 'planning').replace(/\s+/g, '-').toLowerCase()}`}>
                      {project.status}
                    </span>
                    <p className="card-desc">{project.description}</p>
                    <div className="card-meta">
                        <span><strong>Language:</strong> {project.language}</span>
                        <span><strong>Timeline:</strong> {project.startDate} to {project.endDate || 'Present'}</span>
                        
                        {project.url && <span><strong>URL:</strong> <a href={project.url} target="_blank" rel="noopener noreferrer" style={{color: '#6366f1', textDecoration: 'none'}}>{project.url}</a></span>}
                    </div>
                  </div>
                  <div className="card-actions">
                    {project.status !== 'Completed' && (
                      <button 
                        className="finish-btn" 
                        onClick={() => handleFinishProject(project.id)}
                        disabled={isProcessing}
                      >
                        Finish
                      </button>
                    )}
                    <button className="edit-btn" onClick={() => handleOpenEdit(project)} disabled={isProcessing}>Edit</button>
                    <button className="delete-btn" onClick={() => handleConfirmDelete(project.id)} disabled={isProcessing}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* --- FORM MODAL OVERLAY --- */}
          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>{modalMode === 'create' ? 'Create New Project' : 'Edit Project'}</h3>
                
                {/* CORRECTED MODAL FORM WITH VALIDATION */}
                <form onSubmit={handleSubmit} className="admin-form" noValidate>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Project Name <span className="req-star">*</span></label>
                      <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        className={attemptedSubmit && !formData.name ? 'error-input' : ''}
                      />
                    </div>
                    <div className="form-group">
                      <label>Project URL <span className="req-star">*</span></label>
                      <input 
                        type="url" 
                        name="url" 
                        value={formData.url} 
                        onChange={handleInputChange} 
                        className={attemptedSubmit && !formData.url ? 'error-input' : ''}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Date <span className="req-star">*</span></label>
                      <input 
                        type="date" 
                        name="startDate" 
                        value={formData.startDate} 
                        onChange={handleInputChange} 
                        className={attemptedSubmit && !formData.startDate ? 'error-input' : ''}
                      />
                    </div>
                    <div className="form-group">
                      <label>End Date</label>
                      <input type="date" name="endDate" value={formData.endDate || ''} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Code Language <span className="req-star">*</span></label>
                      <input 
                        type="text" 
                        name="language" 
                        value={formData.language} 
                        onChange={handleInputChange} 
                        placeholder="e.g., React, Dart, C#" 
                        className={attemptedSubmit && !formData.language ? 'error-input' : ''}
                      />
                    </div>
                    <div className="form-group">
                      <label>Project Type <span className="req-star">*</span></label>
                      <select name="type" value={formData.type} onChange={handleInputChange}>
                        <option value="Web">Web Application</option>
                        <option value="Mobile">Mobile App</option>
                        <option value="AI / Backend">AI / Backend</option>
                        <option value="Desktop">Desktop</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Status <span className="req-star">*</span></label>
                    <select name="status" value={formData.status} onChange={handleInputChange}>
                      <option value="Planning">Planning</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Description <span className="req-star">*</span></label>
                    <textarea 
                      name="description" 
                      rows="3" 
                      value={formData.description} 
                      onChange={handleInputChange} 
                      className={attemptedSubmit && !formData.description ? 'error-input' : ''}
                    ></textarea>
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="cancel-btn" onClick={handleCloseModal} disabled={isProcessing}>Cancel</button>
                    <button type="submit" className="submit-btn" disabled={isProcessing}>
                      {isProcessing ? 'Saving...' : (modalMode === 'create' ? 'Add Project' : 'Save Edit')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* --- DELETE CONFIRMATION OVERLAY --- */}
          {isDeleteOpen && (
            <div className="modal-overlay">
              <div className="dialog-content">
                <h3>Confirm Deletion</h3>
                <p>Are you sure you want to delete this project? This action cannot be undone.</p>
                <div className="modal-actions">
                  <button className="cancel-btn" onClick={() => setIsDeleteOpen(false)} disabled={isProcessing}>Cancel</button>
                  <button className="confirm-delete-btn" onClick={executeDelete} disabled={isProcessing}>
                    {isProcessing ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProjectAdmin;