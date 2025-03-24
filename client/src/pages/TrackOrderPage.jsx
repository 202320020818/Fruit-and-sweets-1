import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // For extracting dynamic parameters from the URL
import { Timeline, Card, Typography } from 'antd'; // Import Ant Design components
import { CheckCircleOutlined } from '@ant-design/icons'; // Import check mark icon

const { Title } = Typography;

const TrackOrderPage = () => {
  const { orderId } = useParams(); // Get orderId from URL
  const [orderStatus, setOrderStatus] = useState([]);
  
  useEffect(() => {
    // Fetch the tracking status of the order
    const fetchOrderTracking = async () => {
      // For now, we'll mock the tracking statuses
      const dummyStatuses = [
        { timestamp: '2025-03-24 10:00', status: 'Order Placed', color: 'blue' },
        { timestamp: '2025-03-24 12:00', status: 'Payment Confirmed', color: 'blue' },
        { timestamp: '2025-03-24 14:00', status: 'Shipped', color: 'orange' },
        { timestamp: '2025-03-25 09:00', status: 'In Transit', color: 'orange' },
        { timestamp: '2025-03-26 11:00', status: 'Delivered', color: 'green', isCompleted: true }
      ];
      setOrderStatus(dummyStatuses);
    };

    fetchOrderTracking(); // Call the tracking fetch function
  }, [orderId]);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Card title={<span style={{ fontSize: '44px' }}>Track Your Package</span>} style={{ marginBottom: 40 }} >
        <Title level={4}>Order Tracking Timeline</Title>
        <Timeline mode="horizontal">
          {orderStatus.map((item, index) => (
            <Timeline.Item
              key={index}
              color={item.isCompleted ? 'green' : item.color}
              dot={
                item.isCompleted ? (
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      backgroundColor: 'green',
                      borderRadius: '50%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <CheckCircleOutlined style={{ color: 'white', fontSize: 16 }} />
                  </div>
                ) : (
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      backgroundColor: item.color,
                      borderRadius: '50%',
                    }}
                  />
                )
              }
            >
              <p>{item.status}</p>
              <small>{item.timestamp}</small>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>
    </div>
  );
};

export default TrackOrderPage;
