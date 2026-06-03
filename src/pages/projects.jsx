import React, { useState, useEffect, useRef } from 'react';
import './projects.css';

const Project = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- Server-Side States ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10); 
  const [activeFilter, setActiveFilter] = useState(null); 
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  
  // --- Multi-Select Filter States ---
  const [selectedLangs, setSelectedLangs] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  
  // --- Dropdown UI Toggles & Refs ---
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  
  const langDropdownRef = useRef(null);
  const typeDropdownRef = useRef(null);

  // --- NEW: Modal State ---
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const availableLangs = ['React', 'Dart', 'Python', 'C#', 'Kotlin', 'Java', 'JavaScript'];
  const availableTypes = ['Web', 'Mobile', 'AI / Backend', 'Desktop'];

  // Click-Outside Listener for Dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setIsTypeOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch from Server
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: currentPage,
          limit: limit,
          sort: `${sortConfig.key}-${sortConfig.direction}`
        });
        
        if (activeFilter) queryParams.append('filter', activeFilter);
        selectedLangs.forEach(lang => queryParams.append('languages', lang));
        selectedTypes.forEach(type => queryParams.append('types', type));

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/projects?${queryParams}`);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const result = await response.json();
        
        setProjects(result.data || result.Data || []);
        const pages = result.totalPages || result.TotalPages || 1;
        setTotalPages(pages === 0 ? 1 : pages);
      } catch (err) {
        setError(err.message);
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [currentPage, limit, activeFilter, sortConfig, selectedLangs, selectedTypes]);

  // --- Handlers ---
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return '#059669'; 
      case 'in progress': return '#8a7ce3'; 
      case 'planning': return '#d97706'; 
      case 'on hold': return '#db2777'; 
      default: return '#c4c4c4'; 
    }
  };

  const toggleStatusFilter = (status) => {
    setActiveFilter(activeFilter === status ? null : status);
    setCurrentPage(1); 
  };

  const handleSortChange = (e) => {
    const [key, direction] = e.target.value.split('-');
    setSortConfig({ key, direction });
    setCurrentPage(1); 
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setCurrentPage(1); 
  };

  const handleCheckboxChange = (item, list, setList) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
    setCurrentPage(1); 
  };

  // NEW: Open/Close Modal Handlers
  const handleOpenModal = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        
        <div className="top-controls">
          <div className="filters">
            <span className="filter-label">Filter Status</span>
            <button 
              className={`filter-btn ${activeFilter === 'in progress' ? 'active' : ''}`}
              onClick={() => toggleStatusFilter('in progress')}
            >
              In Progress
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'completed' ? 'active' : ''}`}
              onClick={() => toggleStatusFilter('completed')}
            >
              Completed
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'on hold' ? 'active' : ''}`}
              onClick={() => toggleStatusFilter('on hold')}
            >
              On Hold
            </button>

            {/* --- MULTI-SELECT DROPDOWNS --- */}
            <div className="dropdown-container" ref={langDropdownRef}>
              <button className="filter-btn dropdown-toggle" onClick={() => setIsLangOpen(!isLangOpen)}>
                Languages {selectedLangs.length > 0 && `(${selectedLangs.length})`} ▼
              </button>
              {isLangOpen && (
                <div className="dropdown-menu">
                  {availableLangs.map(lang => (
                    <label key={lang} className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={selectedLangs.includes(lang)}
                        onChange={() => handleCheckboxChange(lang, selectedLangs, setSelectedLangs)}
                      />
                      {lang}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="dropdown-container" ref={typeDropdownRef}>
              <button className="filter-btn dropdown-toggle" onClick={() => setIsTypeOpen(!isTypeOpen)}>
                Types {selectedTypes.length > 0 && `(${selectedTypes.length})`} ▼
              </button>
              {isTypeOpen && (
                <div className="dropdown-menu">
                  {availableTypes.map(type => (
                    <label key={type} className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={selectedTypes.includes(type)}
                        onChange={() => handleCheckboxChange(type, selectedTypes, setSelectedTypes)}
                      />
                      {type}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="sort-control">
            <span className="filter-label">Sort by</span>
            <select 
              className="sort-dropdown" 
              value={`${sortConfig.key}-${sortConfig.direction}`}
              onChange={handleSortChange}
            >
              <option value="id-desc">Latest Added</option>
              <option value="id-asc">Oldest Added</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="language-asc">Language (A-Z)</option>
              <option value="type-asc">Type (A-Z)</option>
            </select>
          </div>
        </div>

        <hr className="divider" />

        {/* --- Table / Error States --- */}
        {isLoading && projects.length === 0 ? (
           <div className="center-content">
             <div className="loader"></div>
             <p className="status-text">Fetching projects...</p>
           </div>
        ) : error ? (
           <div className="center-content">
             <p className="error-text">Failed to load projects: {error}</p>
             <button className="cancel-btn" onClick={() => window.location.reload()}>Retry</button>
           </div>
        ) : (
          <div className="project-table">
            <div className="table-header">
              <div className="col-header">PROJECT</div>
              <div className="col-header">LANGUAGE</div> 
              <div className="col-header">PROJECT TYPE</div>
              <div className="col-header">STATUS</div>
              <div className="col-header">TIMELINE</div>
            </div>

            <div className="table-body">
              {projects.length === 0 ? (
                <div className="empty-state">No projects found matching these filters.</div>
              ) : (
                projects.map((project) => (
                  <div className="table-row" key={project.id}>
                    <div className="col-project" data-label="Project">
                      {/* Name is now clickable to open the modal */}
                      <div className="project-title clickable-title" onClick={() => handleOpenModal(project)}>
                        {project.name}
                      </div>
                      {/* Description truncated via CSS class */}
                      {project.description && <div className="project-subtitle line-clamp">{project.description}</div>}
                      {project.url && (
                        <a href={project.url} target="_blank" rel="noopener noreferrer" className="project-link">
                          Live Link ↗
                        </a>
                      )}
                    </div>
                    <div className="col-text" data-label="Language">{project.language}</div>
                    <div className="col-text" data-label="Type">{project.type}</div>
                    <div className="col-stage" data-label="Status">
                      <span className="stage-dot" style={{ backgroundColor: getStatusColor(project.status) }}></span>
                      <span className="stage-text">{project.status}</span>
                    </div>
                    <div className="col-action" data-label="Timeline">
                       <span className="due-date-text">{project.startDate} to {project.endDate || 'Present'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* --- Layout: Limit on Left, Nav on Right --- */}
        {(totalPages > 1 || limit > 10) && (
          <div className="pagination-wrapper">
            
            <div className="limit-selector">
              <span className="page-dots">Show:</span>
              <select className="limit-dropdown" value={limit} onChange={handleLimitChange}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={0}>All</option>
              </select>
            </div>

            <div className="pagination-controls">
              <button 
                className="page-nav-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >
                PREV
              </button>

              {getPageNumbers().map((num, index) => (
                num === '...' ? (
                  <span key={`dots-${index}`} className="page-dots">...</span>
                ) : (
                  <button
                    key={index}
                    className={`page-num-btn ${currentPage === num ? 'active' : ''}`}
                    onClick={() => setCurrentPage(num)}
                  >
                    {num}
                  </button>
                )
              ))}

              <button 
                className="page-nav-btn"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              >
                NEXT
              </button>
            </div>
          </div>
        )}

      </div>

      {/* --- NEW: Project Details Modal Overlay --- */}
      {isModalOpen && selectedProject && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content project-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedProject.name}</h2>
              <button className="close-btn" onClick={handleCloseModal}>&times;</button>
            </div>
            
            <div className="modal-body">
              <div className="modal-meta">
                <span className="modal-tag">{selectedProject.language}</span>
                <span className="modal-tag">{selectedProject.type}</span>
                <span className="modal-status" style={{ color: getStatusColor(selectedProject.status) }}>
                  ● {selectedProject.status}
                </span>
              </div>
              
              <div className="modal-timeline">
                <strong>Timeline:</strong> {selectedProject.startDate} to {selectedProject.endDate || 'Present'}
              </div>
              
              <div className="modal-desc-section">
                <h3>About the Project</h3>
                <p>{selectedProject.description}</p>
              </div>

              {selectedProject.url && (
                <div className="modal-footer">
                  <a href={selectedProject.url} target="_blank" rel="noopener noreferrer" className="filter-btn active" style={{textDecoration: 'none'}}>
                    Visit Live Link ↗
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Project;
