import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, List, Typography, Button, Tag, Space, message, Table } from 'antd';
import { ArrowLeftOutlined, ShoppingOutlined, DownloadOutlined, CompassOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { generateOrderPDF } from '../utils/pdfService';

const { Title, Text } = Typography;

export default function Orders() {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?._id) {
      fetchOrders();
    }
  }, [currentUser?._id]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/api/order/user/${currentUser._id}`);
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        message.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackOrder = (orderId) => {
    navigate(`/trackOrder/${orderId}`);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'processing':
        return 'processing';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: '_id',
      key: '_id',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={`px-2 py-1 rounded-full text-sm ${
          status === 'completed' ? 'bg-green-100 text-green-800' :
          status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (_, record) => {
        const total = record.items.reduce((sum, item) => 
          sum + (item.price * item.quantity), 0
        );
        return `Rs ${total.toFixed(2)}`;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            onClick={() => generateOrderPDF(record)}
            size="small"
            icon={<DownloadOutlined />}
          >
            Download PDF
          </Button>
          <Button
            type="primary"
            onClick={() => handleTrackOrder(record.orderId)}
            size="small"
            icon={<CompassOutlined />}
            style={{ backgroundColor: '#1890ff' }}
          >
            Track Order
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Space style={{ marginBottom: '20px' }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
        <Title level={2}>My Orders</Title>
        {orders.length > 0 && (
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={() => window.open(`http://localhost:3000/api/order/all-pdf/${currentUser._id}`, '_blank')}
          >
            Download All Orders
          </Button>
        )}
      </Space>

      {loading ? (
        <Card loading={true} />
      ) : orders.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <ShoppingOutlined style={{ fontSize: '48px', color: '#ccc' }} />
            <Title level={4}>No orders found</Title>
            <Button type="primary" onClick={() => navigate('/products')}>
              Start Shopping
            </Button>
          </div>
        </Card>
      ) : (
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="_id"
          loading={loading}
          expandable={{
            expandedRowRender: (record) => (
              <Table
                columns={[
                  { title: 'Item', dataIndex: 'name', key: 'name' },
                  { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
                  { 
                    title: 'Price', 
                    dataIndex: 'price', 
                    key: 'price',
                    render: (price) => `Rs ${price.toFixed(2)}`
                  },
                  {
                    title: 'Subtotal',
                    key: 'subtotal',
                    render: (_, item) => `Rs ${(item.price * item.quantity).toFixed(2)}`
                  }
                ]}
                dataSource={record.items}
                pagination={false}
                rowKey="name"
              />
            ),
          }}
        />
      )}
    </div>
  );
} 