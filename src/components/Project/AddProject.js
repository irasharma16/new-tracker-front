import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import './AddProject.css';
import { API_BASEURL } from '../../variables';

Modal.setAppElement('#root');

const AddProjects = () => {
    const [projects, setProjects] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [modalMode, setModalMode] = useState('create');
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        srNo: '',
        projectName: '',
        client: '',
        module: '',
        activity: '',
        projectDescription: '',
        projectStartDate: '',
        projectEndDate: '',
        actualLiveDate: '',
        responsibleFunctional: '',
        sageTeamRemark: '',
        status: '',
        completionPercentage: '',
        projectCost: '',
        completionValue: '',
        attachment: null,
    });

    // Define required fields
    const requiredFields = [
        'srNo',
        'projectName'
    ];

    // Optional fields that can be empty
    const optionalFields = [
        'client',
        'module',
        'projectDescription',
        'projectStartDate',
        'projectEndDate',
        'status',
        'completionPercentage',
        'projectCost',
        'activity',
        'actualLiveDate',
        'responsibleFunctional',
        'sageTeamRemark',
        'attachment'
    ];

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        const cost = parseFloat(formData.projectCost) || 0;
        const percentage = parseFloat(formData.completionPercentage) || 0;
        const completionValue = (cost * percentage / 100).toFixed(2);
        
        setFormData(prev => ({
            ...prev,
            completionValue: completionValue
        }));
    }, [formData.projectCost, formData.completionPercentage]);

    // Add this function in your AddProjects component
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(value);
    };

    // New function to export projects to Excel
    const exportToExcel = () => {
        // Prepare data for export
        const exportData = projects.map(project => ({
            'Sr. No': project.srNo,
            'Project Name': project.projectName,
            'Client': project.client,
            'Module': project.module,
            'Status': project.status,
            'Project Start Date': new Date(project.projectStartDate).toLocaleDateString(),
            'Project End Date': new Date(project.projectEndDate).toLocaleDateString(),
            'Actual Live Date': project.actualLiveDate ? new Date(project.actualLiveDate).toLocaleDateString() : 'N/A',
            'Project Description': project.projectDescription,
            'Completion Percentage': `${project.completionPercentage}%`,
            'Project Cost': formatCurrency(project.projectCost),
            'Completion Value': formatCurrency(project.completionValue),
            'Sage Team Remark': project.sageTeamRemark || 'No remarks'
        }));

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(exportData);

        // Create workbook and add worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Projects');

        // Generate Excel file
        XLSX.writeFile(workbook, 'Projects_Export.xlsx');
    };

    const validateForm = () => {
        const missingFields = [];
        
        for (const field of requiredFields) {
            if (!formData[field] || formData[field].toString().trim() === '') {
                missingFields.push(field);
            }
        }

        if (missingFields.length > 0) {
            const formattedFields = missingFields
                .map(field => field
                    .replace(/([A-Z])/g, ' $1')
                    .toLowerCase()
                    .replace(/^./, str => str.toUpperCase())
                )
                .join(', ');
            toast.error(`Please fill in the following required fields: ${formattedFields}`);
            return false;
        }

        // Validate dates
        const startDate = new Date(formData.projectStartDate);
        const endDate = new Date(formData.projectEndDate);
        
        if (endDate < startDate) {
            toast.error('Project end date cannot be earlier than start date');
            return false;
        }

        // Validate completion percentage
        if (formData.completionPercentage < 0 || formData.completionPercentage > 100) {
            toast.error('Completion percentage must be between 0 and 100');
            return false;
        }

        // Validate project cost
        if (formData.projectCost < 0) {
            toast.error('Project cost cannot be negative');
            return false;
        }

        return true;
    };

    const fetchProjects = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_BASEURL}/Project`);
            setProjects(response.data);
        } catch (error) {
            toast.error('Error fetching projects');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        
        // Handle file input
        if (type === 'file') {
            setFormData(prev => ({
                ...prev,
                [name]: files[0] || null
            }));
            return;
        }
        
        // Handle number inputs
        if (type === 'number') {
            setFormData(prev => ({
                ...prev,
                [name]: value === '' ? '' : Number(value)
            }));
            return;
        }

        // Handle all other inputs
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetForm = () => {
        setFormData({
            srNo: '',
            projectCode: '',
            projectName: '',
            client: '',
            module: '',
            activity: '',
            projectDescription: '',
            projectStartDate: '',
            projectEndDate: '',
            actualLiveDate: '',
            responsibleFunctional: '',
            sageTeamRemark: '',
            status: '',
            completionPercentage: '',
            projectCost: '',
            completionValue: '',
            attachment: null,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const formDataToSend = new FormData();
            
            // Add all form fields to FormData
            Object.entries(formData).forEach(([key, value]) => {
                // Skip null or undefined values for optional fields
                if (value !== null && value !== undefined && value !== '') {
                    formDataToSend.append(key, value);
                }
            });

            if (modalMode === 'edit') {
                await axios.put(`${API_BASEURL}/Project/${formData.projectCode}`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Project updated successfully!');
            } else {
                await axios.post(`${API_BASEURL}/Project`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Project saved successfully!');
            }
            
            resetForm();
            setIsModalOpen(false);
            fetchProjects();
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            toast.error(`Error ${modalMode === 'create' ? 'saving' : 'updating'} project: ${errorMessage}`);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await axios.delete(`${API_BASEURL}/Project/${formData.projectCode}`);
                toast.success('Project deleted successfully!');
                resetForm();
                setIsModalOpen(false);
                fetchProjects();
            } catch (error) {
                toast.error(`Error deleting project: ${error.message}`);
            }
        }
    };

    const handleEdit = (project) => {
        setFormData(project);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const generateSerialNumber = () => {
        // Sort projects by srNo in descending order and get the highest
        const sortedProjects = [...projects].sort((a, b) => b.srNo - a.srNo);
        const highestSrNo = sortedProjects.length > 0 ? sortedProjects[0].srNo : 0;
        
        // Generate next serial number
        return highestSrNo + 1;
    };

    const handleNewProject = () => {
        setModalMode('create');
        // Auto-generate serial number when creating a new project
        const newSrNo = generateSerialNumber();
        resetForm();
        setFormData(prev => ({
            ...prev,
            srNo: newSrNo
        }));
        setIsModalOpen(true);
    };

    const handleProjectNameClick = (project) => {
        setSelectedProject(project);
        setIsDetailsModalOpen(true);
    };

    // Render detailed project information modal
    const ProjectDetailsModal = ({ project, isOpen, onClose }) => {
        if (!project) return null;

        return (
            <Modal
                isOpen={isOpen}
                onRequestClose={onClose}
                className="project-details-modal"
                overlayClassName="project-modal-overlay"
            >
                <div className="modal-header">
                    <h2>Project Details: {project.projectName}</h2>
                    <button 
                        className="modal-close-button"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <div className="project-details-content">
                    <div className="details-grid">
                        <div className="detail-item">
                            <strong>Sr. No:</strong> {project.srNo}
                        </div>
                        
                        <div className="detail-item">
                            <strong>Client:</strong> {project.client}
                        </div>
                        <div className="detail-item">
                            <strong>Module:</strong> {project.module}
                        </div>
                        <div className="detail-item">
                            <strong>Status:</strong> {project.status}
                        </div>
                    </div>

                    <div className="details-section">
                        <h3>Project Timeline</h3>
                        <div className="details-grid">
                            <div className="detail-item">
                                <strong>Start Date:</strong> {new Date(project.projectStartDate).toLocaleDateString()}
                            </div>
                            <div className="detail-item">
                                <strong>End Date:</strong> {new Date(project.projectEndDate).toLocaleDateString()}
                            </div>
                            <div className="detail-item">
                                <strong>Actual Live Date:</strong> {project.actualLiveDate ? new Date(project.actualLiveDate).toLocaleDateString() : 'N/A'}
                            </div>
                        </div>
                    </div>

                    <div className="details-section">
                        <h3>Project Description</h3>
                        <p>{project.projectDescription}</p>
                    </div>

                    <div className="details-section">
                        <h3>Financial Details</h3>
                        <div className="details-grid">
                            <div className="detail-item">
                                <strong>Project Cost:</strong> {formatCurrency(project.projectCost)}
                            </div>
                            <div className="detail-item">
                                <strong>Completion Percentage:</strong> {project.completionPercentage}%
                            </div>
                            <div className="detail-item">
                                <strong>Completion Value:</strong> {formatCurrency(project.completionValue)}
                            </div>
                        </div>
                    </div>

                    <div className="details-section">
                        <h3>Remarks</h3>
                        <div className="details-grid">
                            <div className="detail-item">
                                <strong>Sage Team Remark:</strong> {project.sageTeamRemark || 'No remarks'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-actions">
                    <button onClick={() => {
                        setSelectedProject(project);
                        setModalMode('edit');
                        setIsDetailsModalOpen(false);
                        setIsModalOpen(true);
                    }}>
                        Edit Project
                    </button>
                    <button onClick={onClose}>Close</button>
                </div>
            </Modal>
        );
    };

    return (
        <div className="project-container">
            <ToastContainer />
            <h1>Projects Management</h1>
            
            <div className="project-actions">
                <button 
                    className="new-project-button"
                    onClick={handleNewProject}
                >
                    Add New Project
                </button>
                
                <button 
                    className="export-excel-button"
                    onClick={exportToExcel}
                    disabled={projects.length === 0}
                >
                    Export to Excel
                </button>
            </div>

            <Modal
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                className="project-modal"
                overlayClassName="project-modal-overlay"
            >
                <div className="modal-header">
                    <h2>{modalMode === 'create' ? 'Add New Project' : 'Edit Project'}</h2>
                    <button 
                        className="modal-close-button"
                        onClick={() => setIsModalOpen(false)}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="project-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Sr. No:</label>
                            <input
                                type="number"
                                name="srNo"
                                value={formData.srNo}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Project Name:</label>
                            <input
                                type="text"
                                name="projectName"
                                value={formData.projectName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Client:</label>
                            <input
                                type="text"
                                name="client"
                                value={formData.client}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Module:</label>
                            <input
                                type="text"
                                name="module"
                                value={formData.module}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Status:</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="">Select Status</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="On Hold">On Hold</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Project Start Date:</label>
                            <input
                                type="date"
                                name="projectStartDate"
                                value={formData.projectStartDate}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Project End Date:</label>
                            <input
                                type="date"
                                name="projectEndDate"
                                value={formData.projectEndDate}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Actual Live Date:</label>
                            <input
                                type="date"
                                name="actualLiveDate"
                                value={formData.actualLiveDate}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group full-width">
                            <label>Project Description:</label>
                            <textarea
                                name="projectDescription"
                                value={formData.projectDescription}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Sage Team Remark:</label>
                            <textarea
                                name="sageTeamRemark"
                                value={formData.sageTeamRemark}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Completion Percentage:</label>
                            <input
                                type="number"
                                name="completionPercentage"
                                value={formData.completionPercentage}
                                onChange={handleChange}
                                min="0"
                                max="100"
                            />
                        </div>

                        <div className="form-group">
                            <label>Project Cost:</label>
                            <input
                                type="number"
                                name="projectCost"
                                value={formData.projectCost}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Completion Value:</label>
                            <input
                                type="number"
                                name="completionValue"
                                value={formData.completionValue}
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Attachment:</label>
                            <input
                                type="file"
                                name="attachment"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="submit">
                            {modalMode === 'create' ? 'Save Project' : 'Update Project'}
                        </button>
                        <button type="button" onClick={resetForm}>
                            Reset
                        </button>
                        {modalMode === 'edit' && (
                            <button type="button" onClick={handleDelete}>
                                Delete
                            </button>
                        )}
                        <button type="button" onClick={() => setIsModalOpen(false)}>
                            Close
                        </button>
                    </div>
                </form>
            </Modal>

            {/* New Project Details Modal */}
            <ProjectDetailsModal 
                project={selectedProject} 
                isOpen={isDetailsModalOpen} 
                onClose={() => setIsDetailsModalOpen(false)} 
            />

            <div className="projects-table">
                <table>
                    <thead>
                        <tr>
                            <th>Sr. No</th>
                            <th>Project Name</th>
                            <th>Client</th>
                            <th>Status</th>
                            <th>Completion %</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map((project) => (
                            <tr key={project.projectCode}>
                                <td>{project.srNo}</td>
                                <td>
                                    <span 
                                        className="project-name-clickable"
                                        onClick={() => handleProjectNameClick(project)}
                                    >
                                        {project.projectName}
                                    </span>
                                </td>
                                <td>{project.client}</td>
                                <td>{project.status}</td>
                                <td>{project.completionPercentage}%</td>
                                <td>{new Date(project.projectStartDate).toLocaleDateString()}</td>
                                <td>{new Date(project.projectEndDate).toLocaleDateString()}</td>
                                <td>
                                    <button
                                        className="edit-button"
                                        onClick={() => handleEdit(project)}
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AddProjects;