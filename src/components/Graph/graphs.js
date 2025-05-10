import axios from "axios";
import React, { useEffect, useState } from "react";
import { API_BASEURL } from "../../variables";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";



const TicketModal = ({ isOpen, onClose, tickets, title }) => {
  if (!isOpen) return null;

  const statusColors = {
    Open: "#FF6B6B",
    "In Progress": "#4ECDC4",
    Resolved: "#45B7D1",
    Closed: "#63FFD1"
  };
  
  const priorityColors = {
    High: "#FF6B6B",
    Medium: "#FFA07A",
    Low: "#4ECDC4"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[900px] max-h-[650px] overflow-hidden animate-slide-up">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-wide">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-white hover:text-gray-200 text-3xl transition-all duration-300 hover:rotate-90"
          >
            &times;
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[500px] p-6">
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-24 w-24 mb-4 text-gray-300" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h.01M15 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <p className="text-xl">No tickets found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tickets.map((ticket, index) => (
                <div 
                  key={ticket.id || index} 
                  className="border-2 border-gray-100 p-5 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">Ticket #{ticket.ticketNumber}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ticket.description}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor: statusColors[ticket.status] || '#gray',
                          color: 'white'
                        }}
                      >
                        {ticket.status}
                      </span>
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor: priorityColors[ticket.priority] || '#gray',
                          color: 'white'
                        }}
                      >
                        {ticket.priority}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-500 border-t pt-2">
                    <p className="flex items-center">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-4 w-4 mr-2 text-blue-500" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                        />
                      </svg>
                      {new Date(ticket.dateReported).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MetricBox = ({ title, value, color, change }) => (
  <div className="metric-box" style={{ backgroundColor: color }}>
    <div className="metric-content">
      <h3>{title}</h3>
      <p className="metric-value">{value}</p>
      <p className="metric-change">{change}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [financialYearData, setFinancialYearData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [openedTickets, setOpenedTickets] = useState(0);
  const [closedTickets, setClosedTickets] = useState(0);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [priorityDistribution, setPriorityDistribution] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#6C63FF", "#63FFD1"];
  const statusColors = {
    Open: "#FF6B6B",
    "In Progress": "#4ECDC4",
    Resolved: "#45B7D1",
    Closed: "#63FFD1"
  };
  
  const priorityColors = {
    High: "#FF6B6B",
    Medium: "#FFA07A",
    Low: "#4ECDC4"
  };

useEffect(() => {
}, [fetchTickets]);

  const fetchTickets = async () => {
    try {
      const userRole = localStorage.getItem('userRole');
      const loggedInUser = localStorage.getItem('loggedInUser');
      console.log('Fetching tickets with:', { userRole, loggedInUser });
      if (!userRole) {
        throw new Error('User role not found. Please log in again.');
      }
  
      let response;
      if (userRole === 'client') {
        const userResponse = await axios.get(`${API_BASEURL}/userlist/users`);
        const user = userResponse.data.find((u) => u.name === loggedInUser);
        if (!user || !user.company) {
          throw new Error('Company not found for logged-in client.');
        }
        response = await axios.get(`${API_BASEURL}/registerissue`, {
          params: { 
            userRole, 
            company: user.company 
          }
        });
      } else {

        response = await axios.get(`${API_BASEURL}/registerissue`, {
          params: { 
            userRole, 
            loggedInUser 
          }
        });
      }

      const formattedTickets = response.data.map(ticket => ({
        ...ticket,
        targetDate: ticket.targetDate?.split('T')[0] || '',
        dateReported: ticket.dateReported?.split('T')[0] || '',
        resolutionDate: ticket.resolutionDate?.split('T')[0] || ''
      }));
  
      setTickets(formattedTickets);
      processData(formattedTickets);
  
    } catch (error) {
      console.error("Error fetching tickets:", error);

      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
      }
      setTickets([]);
    }
  };

  const handleChartClick = (data, chartType) => {
    let filteredTickets = [];

    switch(chartType) {
      case 'yearly':
        filteredTickets = tickets.filter(ticket => 
          new Date(ticket.dateReported).getFullYear() === data.year
        );
        setModalTitle( `Tickets in ${data.year}`);
        break;
      case 'monthly':
        filteredTickets = tickets.filter(ticket => 
          new Date(ticket.dateReported).toLocaleString('default', { month: 'long' }) === data.month
        );
        setModalTitle(`Tickets in ${data.month}`);
        break;
      case 'weekly':
        filteredTickets = tickets.filter(ticket => {
          const weekDay = new Date(ticket.dateReported).toLocaleString('default', { weekday: 'long' });
          return weekDay === data.week;
        });
        setModalTitle(`Tickets on ${data.week}`);
        break;
      case 'financial':
        const quarterMonths = {
          'Q1': [0, 1, 2],
          'Q2': [3, 4, 5],
          'Q3': [6, 7, 8],
          'Q4': [9, 10, 11]
        };
        
        filteredTickets = tickets.filter(ticket => {
          const month = new Date(ticket.dateReported).getMonth();
          return quarterMonths[data.quarter].includes(month);
        });
        setModalTitle(`Tickets in ${data.quarter}`);
        break;
      case 'trend':
        filteredTickets = tickets.filter(ticket => 
          ticket.dateReported.split('T')[0] === data.date
        );
        setModalTitle(`Tickets on ${data.date}`);
        break;
      case 'status':
        filteredTickets = tickets.filter(ticket => ticket.status === data.name);
        setModalTitle(`${data.name} Tickets`);
        break;
      case 'priority':
        filteredTickets = tickets.filter(ticket => ticket.priority === data.name);
        setModalTitle(`${data.name} Priority Tickets`);
        break;
      default:
        filteredTickets = [];
    }

    setSelectedTickets(filteredTickets);
    setIsModalOpen(true);
  };

  const processData = (ticketsData) => {
    const yearlyStats = processYearlyData(ticketsData);
    setYearlyData(yearlyStats);
    const monthlyStats = processMonthlyData(ticketsData);
    setMonthlyData(monthlyStats);
    const financialStats = processFinancialYearData(ticketsData);
    setFinancialYearData(financialStats);
    const weeklyStats = processWeeklyData(ticketsData);
    setWeeklyData(weeklyStats);
    const opened = ticketsData.filter(ticket => ticket.status !== 'Closed').length;
    const closed = ticketsData.filter(ticket => ticket.status === 'Closed').length;
    setOpenedTickets(opened);
    setClosedTickets(closed);
    const statusStats = processStatusDistribution(ticketsData);
    setStatusDistribution(statusStats);
    const priorityStats = processPriorityDistribution(ticketsData);
    setPriorityDistribution(priorityStats);
    const trends = processTrendData(ticketsData);
    setTrendData(trends);
  };

  const processYearlyData = (data) => {
    return data.reduce((acc, ticket) => {
      const year = new Date(ticket.dateReported).getFullYear();
      const existingYear = acc.find(item => item.year === year);
      if (existingYear) {
        existingYear.Tickets++;
      } else {
        acc.push({ year, Tickets: 1 });
      }
      return acc;
    }, []).sort((a, b) => a.year - b.year);
  };

  const processMonthlyData = (data) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    
    return data.reduce((acc, ticket) => {
      const month = new Date(ticket.dateReported).getMonth();
      const existingMonth = acc.find(item => item.month === months[month]);
      if (existingMonth) {
        existingMonth.Tickets++;
      } else {
        acc.push({ month: months[month], Tickets: 1 });
      }
      return acc;
    }, []);
  };

  const processFinancialYearData = (data) => {
    return data.reduce((acc, ticket) => {
      const date = new Date(ticket.dateReported);
      const quarter = Math.floor((date.getMonth() / 3));
      const quarterName = `Q${quarter + 1}`;
      const existingQuarter = acc.find(item => item.quarter === quarterName);
      if (existingQuarter) {
        existingQuarter.Tickets++;
      } else {
        acc.push({ quarter: quarterName, Tickets: 1 });
      }
      return acc;
    }, []).sort((a, b) => a.quarter.slice(1) - b.quarter.slice(1));
  };

  const processWeeklyData = (data) => {
    const weekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return data.reduce((acc, ticket) => {
      const date = new Date(ticket.dateReported);
      const weekDay = weekNames[date.getDay()];
      const existingDay = acc.find(item => item.week === weekDay);
      if (existingDay) {
        existingDay.Tickets++;
      } else {
        acc.push({ week: weekDay, Tickets: 1 });
      }
      return acc;
    }, []);
  };

  const processStatusDistribution = (data) => {
    return Object.entries(
      data.reduce((acc, ticket) => {
        acc[ticket.status] = (acc[ticket.status] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));
  };

  const processPriorityDistribution = (data) => {
    return Object.entries(
      data.reduce((acc, ticket) => {
        acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));
  };

  const processTrendData = (data) => {
    const last30Days = [...Array(30)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last30Days.map(date => ({
      date,
      tickets: data.filter(ticket => 
        ticket.dateReported.split('T')[0] === date
      ).length
    }));
  };

  const calculateMetrics = () => {
    const today = new Date().toDateString();
    const dailyTickets = tickets.filter(ticket => 
      new Date(ticket.dateReported).toDateString() === today
    ).length;

    return {
      yearly: yearlyData.reduce((sum, data) => sum + data.Tickets, 0),
      monthly: monthlyData.reduce((sum, data) => sum + data.Tickets, 0),
      quarterly: financialYearData.reduce((sum, data) => sum + data.Tickets, 0),
      weekly: weeklyData.reduce((sum, data) => sum + data.Tickets, 0),
      daily: dailyTickets,
      opened: openedTickets,
      closed: closedTickets
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Tickets Dashboard</h1>
      
      <div className="metric-boxes">
        <MetricBox title="Yearly Tickets" value={metrics.yearly} color={colors[0]} />
        <MetricBox title="Monthly Tickets" value={metrics.monthly} color={colors[1]} />
        <MetricBox title="Financial Year Tickets" value={metrics.quarterly} color={colors[2]} />
        <MetricBox title="Weekly Tickets" value={metrics.weekly} color={colors[3]} />
        <MetricBox title="Current Day Tickets" value={metrics.daily} color={colors[4]} />
        <MetricBox 
          title="Open Tickets" 
          value={metrics.opened} 
          color={colors[5]} 
          change={`${((metrics.opened / (metrics.opened + metrics.closed)) * 100).toFixed(1)}% of total`} 
        />
        <MetricBox 
          title="Closed Tickets" 
          value={metrics.closed} 
          color={colors[6]} 
          change={`${((metrics.closed / (metrics.opened + metrics.closed)) * 100).toFixed(1)}% of total`} 
        />
      </div>

      <div className="charts-container">
        {/* Trend Line Chart */}
        <div className="chart-wrapper">
          <h2>Ticket Trend (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData} onClick={(e) => e.activePayload && handleChartClick(e.activePayload[0].payload, 'trend')}>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Line type="monotone" dataKey="tickets" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
          
        {/* Yearly Line Chart - Converted from Bar Chart */}
        <div className="chart-wrapper">
          <h2>Yearly Ticket Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={yearlyData} onClick={(e) => e.activePayload && handleChartClick(e.activePayload[0].payload, 'yearly')}>
              <XAxis dataKey="year" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Tickets" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
          
        {/* Monthly Line Chart - Converted from Bar Chart */}
        <div className="chart-wrapper">
          <h2>Monthly Ticket Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData} onClick={(e) => e.activePayload && handleChartClick(e.activePayload[0].payload, 'monthly')}>
              <XAxis dataKey="month" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Tickets" stroke="#82ca9d" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
          
        {/* Financial Year Bar Chart */}
        <div className="chart-wrapper">
          <h2>Financial Year Ticket Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={financialYearData} onClick={(e) => e.activePayload && handleChartClick(e.activePayload[0].payload, 'financial')}>
              <XAxis dataKey="quarter" />
              <YAxis />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Bar dataKey="Tickets" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
          
        {/* Weekly Bar Chart */}
        <div className="chart-wrapper">
          <h2>Weekly Ticket Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData} onClick={(e) => e.activePayload && handleChartClick(e.activePayload[0].payload, 'weekly')}>
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Bar dataKey="Tickets" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
          
        {/* Status Distribution Pie Chart */}
        <div className="chart-wrapper">
          <h2>Ticket Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={statusDistribution} 
                dataKey="value" 
                nameKey="name" 
                onClick={(e) => handleChartClick(e.payload, 'status')}
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={statusColors[entry.name] || colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
          
        {/* Priority Distribution Pie Chart */}
        <div className="chart-wrapper">
          <h2>Ticket Priority Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={priorityDistribution} 
                dataKey="value" 
                nameKey="name" 
                onClick={(e) => handleChartClick(e.payload, 'priority')}
              >
                {priorityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={priorityColors[entry.name] || colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
          
      {/* Ticket Modal */}
      <TicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tickets={selectedTickets}
        title={modalTitle}
      />
    </div>
  );
};
          
export default Dashboard;