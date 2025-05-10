import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Client.css';
import { API_BASEURL } from '../../variables';

const Client = () => {
    const [clients, setClients] = useState([]); // List of clients
    const [selectedClient, setSelectedClient] = useState(null); // Currently selected client
    const [isUpdating, setIsUpdating] = useState(false); // Update mode flag
    const [formData, setFormData] = useState({
        clientName: '',
        contactPerson: '',
        role: '',
        email: '',
        phoneNumber: '',
        companyLogo: null
    });
    const formRef = useRef(null); // Form reference

    // Fetch clients on component mount
    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await axios.get(`${API_BASEURL}/client`);
            setClients(response.data);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'companyLogo' ? files[0] : value
        });
    };

    const saveClient = async () => {
        if (Object.values(formData).some(value => value === '' || (value instanceof File && !value.name))) {
            toast.error('Please fill in all required fields.');
            return;
        }

        const data = new FormData();
        for (const key in formData) {
            if (formData[key] !== null) {
                data.append(key, formData[key]);
            }
        }

        try {
            if (selectedClient) {
                // Update client
                await axios.put(`${API_BASEURL}/client/${selectedClient._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Add new client
                await axios.post(`${API_BASEURL}/client`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            toast.success('Client saved successfully!');
            resetForm();
            fetchClients();
        } catch (error) {
            console.error('Error saving client:', error);
            toast.error(`Error saving client: ${error.response?.data?.message || error.message}`);
        }
    };

    const resetForm = () => {
        setFormData({
            clientName: '',
            contactPerson: '',
            role: '',
            email: '',
            phoneNumber: '',
            companyLogo: null
        });
        if (formRef.current) {
            formRef.current.reset();
        }
        setSelectedClient(null);
        setIsUpdating(false);
    };

    const deleteClient = async () => {
        if (selectedClient && selectedClient.clientCode) {
            try {
                await axios.delete(`${API_BASEURL}/client/${selectedClient.clientCode}`);
                setClients(clients.filter(client => client.clientCode !== selectedClient.clientCode));
                toast.success('Client deleted successfully!');
                resetForm();
            } catch (error) {
                console.error('Error deleting client:', error);
                toast.error('Error deleting client: ' + (error.response?.data.message || error.message));
            }
        } else {
            toast.error('No client selected for deletion.');
        }
    };

    const selectClient = (client) => {
        setSelectedClient(client);
        setFormData({
            clientName: client.clientName,
            contactPerson: client.contactPerson,
            role: client.role,
            email: client.email,
            phoneNumber: client.phoneNumber,
            companyLogo: null
        });
        setIsUpdating(true);
    };

    return (
        <div className='client-container'>
            <ToastContainer />
            <h1>Manage Client</h1>

            <div className="clientform-container">
                <form ref={formRef} onSubmit={(e) => { e.preventDefault(); saveClient(); }}>
                    <div className="clientform-row">
                        <div className="clientform-group">
                            <label>Client Code:</label>
                            <input
                                type="text"
                                value={clients.length + 1}
                                readOnly
                            />
                        </div>
                        <div className="clientform-group">
                            <label htmlFor="clientName">Client Name:</label>
                            <input
                                type="text"
                                id="clientName"
                                name="clientName"
                                value={formData.clientName}
                                onChange={handleChange}
                                placeholder="Client Name"
                                required
                            />
                        </div>
                        <div className="clientform-group">
                            <label htmlFor="contactPerson">Contact Person:</label>
                            <input
                                type="text"
                                id="contactPerson"
                                name="contactPerson"
                                value={formData.contactPerson}
                                onChange={handleChange}
                                placeholder="Contact Person"
                                required
                            />
                        </div>
                    </div>

                    <div className="clientform-row">
                        <div className="clientform-group">
                            <label htmlFor="role">Role:</label>
                            <input
                                type="text"
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                placeholder="Role"
                                required
                            />
                        </div>
                        <div className="clientform-group">
                            <label htmlFor="email">Email:</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email"
                                required
                            />
                        </div>
                        <div className="clientform-group">
                            <label htmlFor="phoneNumber">Phone Number:</label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="Phone Number"
                                required
                            />
                        </div>
                    </div>

                    <div className="clientform-row">
                        <div className="clientform-group">
                            <label htmlFor="companyLogo">Company Logo:</label>
                            <input
                                type="file"
                                id="companyLogo"
                                name="companyLogo"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="clientform-row">
                        <div className="clientbutton-group">
                            <button type="submit" className="btn btn-save">
                                {isUpdating ? 'Update' : 'Save'}
                            </button>
                            <button type="button" className="btn btn-reset" onClick={resetForm}>
                                Reset
                            </button>
                            {isUpdating && (
                                <button type="button" className="btn btn-delete" onClick={deleteClient}>
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            <div className="clienttable-container">
                <table id="clientTable">
                    <thead>
                        <tr>
                            <th>Client Code</th>
                            <th>Client Name</th>
                            <th>Contact Person</th>
                            <th>Role</th>
                            <th>Email</th>
                            <th>Phone Number</th>
                            <th>Company Logo</th>
                            <th>Select</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.length > 0 ? (
                            clients.map((client, index) => (
                                <tr key={client._id}>
                                    <td>{index + 1}</td>
                                    <td>{client.clientName}</td>
                                    <td>{client.contactPerson}</td>
                                    <td>{client.role}</td>
                                    <td>{client.email}</td>
                                    <td>{client.phoneNumber}</td>
                                    <td>
                                        {client.companyLogo && (
                                            <img
                                                src={`${API_BASEURL}/${client.companyLogo}`}
                                                alt="Company Logo"
                                                style={{ width: '80px', height: '50px' }}
                                            />
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            className="btn btn-select"
                                            onClick={() => selectClient(client)}
                                        >
                                            Select
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8">No clients found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Client;
