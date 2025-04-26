import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Typography, List, Button, message, Space } from 'antd';
import { CheckCircleOutlined, ShoppingOutlined, CompassOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // First check localStorage for pending order
        const pendingOrder = localStorage.getItem('pendingOrder');
        if (pendingOrder) {
          const orderData = JSON.parse(pendingOrder);
          setOrderDetails(orderData);
          localStorage.removeItem('pendingOrder'); // Clear the stored order
          setLoading(false);
          return;
        }

        // If we have order details in location state, use them
        if (location.state?.orderDetails) {
          setOrderDetails(location.state.orderDetails);
          setLoading(false);
          return;
        }

        // Otherwise, try to fetch from session ID
        const sessionId = new URLSearchParams(window.location.search).get('session_id');
        if (sessionId) {
          const response = await axios.get(`http://localhost:3000/api/payment/order-details/${sessionId}`);
          if (response.data.success) {
            setOrderDetails(response.data.data);
          } else {
            message.error('Failed to fetch order details');
          }
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        message.error('Error fetching order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [location.state]);

  const handleTrackOrder = () => {
    if (orderDetails?.orderId) {
      navigate(`/trackOrder/${orderDetails.orderId}`);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={3}>Loading order details...</Title>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={3}>No order details found</Title>
        <Button type="primary" onClick={() => navigate('/')}>
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a' }} />
          <Title level={2}>Payment Successful!</Title>
          <Text type="secondary">Thank you for your purchase</Text>
        </div>

        <Card title="Order Details" style={{ marginBottom: '20px' }}>
          <List>
            <List.Item>
              <Text strong>Order ID:</Text> {orderDetails.orderId}
            </List.Item>
            <List.Item>
              <Text strong>Status:</Text> {orderDetails.status}
            </List.Item>
            <List.Item>
              <Text strong>Payment Method:</Text> {orderDetails.paymentMethod}
            </List.Item>
            <List.Item>
              <Text strong>Total Amount:</Text> ${orderDetails.totalAmount.toFixed(2)}
            </List.Item>
            <List.Item>
              <Text strong>Date:</Text> {new Date(orderDetails.createdAt).toLocaleString()}
            </List.Item>
          </List>
        </Card>

        <Card title="Order Items">
          <List
            dataSource={orderDetails.items}
            renderItem={item => (
              <List.Item>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <div>
                    <Text strong>{item.name}</Text>
                    <br />
                    <Text type="secondary">Quantity: {item.quantity}</Text>
                  </div>
                  <Text>${(item.price * item.quantity).toFixed(2)}</Text>
                </div>
              </List.Item>
            )}
          />
        </Card>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <Space size="middle">
            <Button 
              type="primary" 
              size="large" 
              icon={<ShoppingOutlined />}
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </Button>
            <Button 
              type="default" 
              size="large"
              onClick={() => navigate('/orders')}
            >
              See All Orders
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<CompassOutlined />}
              onClick={handleTrackOrder}
              style={{ backgroundColor: '#1890ff' }}
            >
              Track Order
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
}