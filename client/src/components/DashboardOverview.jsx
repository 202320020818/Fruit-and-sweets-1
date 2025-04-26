import React, { useState, useEffect } from 'react';
import { Card, Row, Col } from 'antd';
import { ShoppingCartOutlined, ClockCircleOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0
  });
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const ordersResponse = await axios.get('http://localhost:3000/api/order/all');
      const orders = ordersResponse.data.data || [];

      // Calculate statistics
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      const totalRevenue = orders.reduce((sum, order) => sum + calculateOrderTotal(order), 0);
      const uniqueCustomers = new Set(orders.map(order => order.userId)).size;

      setStats({
        totalOrders,
        pendingOrders,
        totalRevenue,
        totalCustomers: uniqueCustomers
      });

      // Prepare order status distribution data
      const statusCounts = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});

      const statusData = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count
      }));
      setOrderStatusData(statusData);

      // Prepare sales data (last 7 days)
      const last7Days = [...Array(7)].map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const salesByDate = orders.reduce((acc, order) => {
        const date = new Date(order.createdAt).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + calculateOrderTotal(order);
        return acc;
      }, {});

      const formattedSalesData = last7Days.map(date => ({
        date,
        sales: salesByDate[date] || 0
      }));
      setSalesData(formattedSalesData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const calculateOrderTotal = (order) => {
    return order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Dashboard Overview</h1>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ShoppingCartOutlined style={{ fontSize: '24px', marginRight: '12px', color: '#1890ff' }} />
              <div>
                <p style={{ margin: 0, color: '#8c8c8c' }}>Total Orders</p>
                <h2 style={{ margin: 0 }}>{stats.totalOrders}</h2>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ClockCircleOutlined style={{ fontSize: '24px', marginRight: '12px', color: '#faad14' }} />
              <div>
                <p style={{ margin: 0, color: '#8c8c8c' }}>Pending Orders</p>
                <h2 style={{ margin: 0 }}>{stats.pendingOrders}</h2>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <DollarOutlined style={{ fontSize: '24px', marginRight: '12px', color: '#52c41a' }} />
              <div>
                <p style={{ margin: 0, color: '#8c8c8c' }}>Total Revenue</p>
                <h2 style={{ margin: 0 }}>Rs {stats.totalRevenue.toLocaleString()}</h2>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <UserOutlined style={{ fontSize: '24px', marginRight: '12px', color: '#722ed1' }} />
              <div>
                <p style={{ margin: 0, color: '#8c8c8c' }}>Total Customers</p>
                <h2 style={{ margin: 0 }}>{stats.totalCustomers}</h2>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="Sales Overview">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#1890ff" name="Sales (Rs)" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Order Status Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={orderStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#1890ff" name="Number of Orders" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardOverview; 