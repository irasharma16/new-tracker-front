import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import './Home.css';
import { API_BASEURL } from '../../variables';
function Home() {
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState({
        totalTickets: 0,
        openTickets: 0,
        totalHoursWorked: 0,
        financialYear: [],
        currentMonth: [],
        employeeTickets: [],
        clientTickets: []
    });

    useEffect(() => {
        const user = localStorage.getItem('loggedInUser');
        const role = localStorage.getItem('userRole');
        if (user) {
            setLoggedInUser(user);
            setUserRole(role);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                let response;
                if (userRole === 'client') {

                    const userResponse = await axios.get(`${API_BASEURL}/userlist/users`);
                    const user = userResponse.data.find((u) => u.name === loggedInUser);
    
                    if (!user || !user.company) {
                        throw new Error("Company not found for logged-in client.");
                    }
                    response = await axios.get(`${API_BASEURL}/registerissue`, {
                        params: { userRole, company: user.company },
                    });
                } else {

                    response = await axios.get(`${API_BASEURL}/registerissue`, {
                        params: {
                            userRole: userRole,
                            loggedInUser: loggedInUser
                        }
                    });
                }
    
                if (!response.data) {
                    throw new Error('No data received');
                }
    
                const issues = response.data;
                const totalTickets = issues.length;
                const openTickets = issues.filter(issue => issue.status !== 'Closed').length;

                const totalHoursWorked = !['admin', 'client'].includes(userRole)
                    ? issues.reduce((total, issue) => {
                        return total + (parseFloat(issue.estimatedTime) || 0);
                    }, 0).toFixed(2)
                    : 0;

                const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                                'July', 'August', 'September', 'October', 'November', 'December'];
                const currentDate = new Date();
                const currentMonth = months[currentDate.getMonth()] + ' ' + currentDate.getFullYear();

                const employeeTicketsMap = new Map();
                months.forEach(month => employeeTicketsMap.set(month, 0)); 
    
                issues.forEach(issue => {
                    if (issue.dateReported) {
                        const issueDate = new Date(issue.dateReported);
                        const monthKey = months[issueDate.getMonth()];
                        employeeTicketsMap.set(monthKey, (employeeTicketsMap.get(monthKey) || 0) + 1);
                    }
                });
    
                const employeeTickets = Array.from(employeeTicketsMap, ([month, tickets]) => ({
                    month,
                    tickets
                })).sort((a, b) => months.indexOf(a.month) - months.indexOf(b.month));

                const clientTicketsMap = new Map();
                issues.forEach(issue => {
                    const clientName = issue.client || 'Unassigned';
                    clientTicketsMap.set(clientName, (clientTicketsMap.get(clientName) || 0) + 1);
                });
    
                const clientTickets = Array.from(clientTicketsMap, ([client, tickets]) => ({
                    client,
                    tickets
                })).sort((a, b) => b.tickets - a.tickets);
    
                setDashboardData({
                    totalTickets,
                    openTickets,
                    totalHoursWorked,
                    currentMonth: [{ month: currentMonth }],
                    employeeTickets,
                    clientTickets
                });
            } catch (error) {
                console.error('Error details:', error);
                toast.error(`Error fetching dashboard data: ${error.message || 'Unknown error'}`);
            }
        };
    
        if (loggedInUser && userRole) {
            fetchDashboardData();
        }
    }, [loggedInUser, userRole]);

    return (
        <div className="home-container">
            <ToastContainer />
            
            <div className="table-container">
                <h3>Ticket Overview</h3>
                <div className="info-cards">
                    <div className="info-card">
                        <h4>Total Tickets</h4>
                        <p>{dashboardData.totalTickets}</p>
                    </div>
                    <div className="info-card">
                        <h4>Open Tickets</h4>
                        <p>{dashboardData.openTickets}</p>
                    </div>
                    {!['admin', 'client'].includes(userRole) && (
                        <div className="info-card">
                            <h4>Total Hours Worked</h4>
                            <p>{dashboardData.totalHoursWorked}</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="table-container">
                <h3>Employee Tickets Trend</h3>
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dashboardData.employeeTickets}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="tickets" 
                                stroke="#8884d8" 
                                name="Monthly Tickets"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <table className="table-content">
                    <thead>
                        <tr>
                            <th>Month</th>
                            <th>Tickets</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dashboardData.employeeTickets.map((item, index) => (
                            <tr key={index}>
                                <td>{item.month}</td>
                                <td>{item.tickets}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="table-container">
                <h3>Client Tickets Distribution</h3>
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dashboardData.clientTickets}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="client" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar 
                                dataKey="tickets" 
                                fill="#82ca9d" 
                                name="Total Tickets"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <table className="table-content">
                    <thead>
                        <tr>
                            <th>Client</th>
                            <th>Tickets</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dashboardData.clientTickets.map((item, index) => (
                            <tr key={index}>
                                <td>{item.client}</td>
                                <td>{item.tickets}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Home;