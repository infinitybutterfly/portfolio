import React, { useState, useEffect, useRef } from 'react';
import './projects.css';

// --- Dynamic Description Formatter ---
const renderDescription = (desc) => {
  if (!desc) return null;
  
  // Check if the text contains bullet characters
  if (desc.includes('•')) {
    // Split by bullet, remove empty strings, and map to list items
    const points = desc.split('•').filter(point => point.trim() !== '');
    return (
      <ul className="dynamic-desc-list">
        {points.map((point, index) => (
          <li key={index}>{point.trim()}</li>
        ))}
      </ul>
    );
  }
  
  // Fallback for standard paragraph text
  return <p>{desc}</p>;
};

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

  // --- Modal State ---
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

  // Open/Close Modal Handlers
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
                  <div 
                    className="table-row interactive-row" 
                    key={project.id} 
                    onClick={() => handleOpenModal(project)}
                  >
                    <div className="col-project" data-label="Project">
                      
                      <div className="project-title">{project.name}</div>
                      
                      {project.description && (
                        <div className="project-subtitle line-clamp">
                          {/* Strip bullet points just for the table preview */}
                          {project.description.replace(/•/g, '').trim()}
                        </div>
                      )}
                      
                      {project.url && (
                        <a 
                          href={project.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="table-live-link"
                          onClick={(e) => e.stopPropagation()} 
                        >
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

      {/* --- REFINED: Project Details Modal Overlay --- */}
      {isModalOpen && selectedProject && (
        <div className="modal-overlay fade-in" onClick={handleCloseModal}>
          <div className="modal-content project-details-modal scale-in" onClick={(e) => e.stopPropagation()}>
            
            {/* Header: Title and Close Button properly aligned */}
            <div className="modal-header">
              <h2>{selectedProject.name}</h2>
              <button className="icon-close-btn" onClick={handleCloseModal} aria-label="Close">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              
              {/* Dynamic Pills for Meta Data */}
              <div className="modal-meta-container">
                <span className="tech-pill">{selectedProject.language}</span>
                <span className="type-pill">{selectedProject.type}</span>
                <div className="status-badge" style={{ color: getStatusColor(selectedProject.status), backgroundColor: `${getStatusColor(selectedProject.status)}15` }}>
                  <span className="status-indicator" style={{ backgroundColor: getStatusColor(selectedProject.status) }}></span>
                  {selectedProject.status}
                </div>
              </div>
              
              {/* Timeline with Icon */}
              <div className="modal-timeline-elegant">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>{selectedProject.startDate} &mdash; {selectedProject.endDate || 'Present'}</span>
              </div>
              
              {/* Parsed Description */}
              <div className="modal-desc-section">
                <h3>About the Project</h3>
                <div className="desc-content">
                  {renderDescription(selectedProject.description)}
                </div>
              </div>

              {/* Call to Action */}
              {selectedProject.url && (
                <div className="modal-footer">
                  <a href={selectedProject.url} target="_blank" rel="noopener noreferrer" className="live-link-btn">
                    Visit Live Link
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                      <line x1="7" y1="17" x2="17" y2="7"></line>
                      <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
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
