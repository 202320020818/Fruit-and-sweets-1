import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux'; // Import useSelector to get the userId
import { Table, Card, Typography, Button, InputNumber, Collapse } from 'antd'; // Import Ant Design components
import { EyeOutlined } from '@ant-design/icons'; // Import EyeOutlined icon for "Track Order"
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook

const { Title } = Typography;
const { Panel } = Collapse;

export default function OrderPage() {
  const currentUser = useSelector((state) => state.user.currentUser); // Get currentUser from Redux state
  const userId = currentUser?._id; // Extract the userId from the logged-in user
  const [orders, setOrders] = useState([]); // State to hold the list of orders
  const navigate = useNavigate();
  // Fetch orders when component mounts or userId changes
  useEffect(() => {
    if (userId) {
      const fetchOrders = async () => {
        try {
          const response = await fetch(`/api/order/completed-orders/${userId}`);
          const data = await response.json();
          if (response.ok) {
            setOrders(data.data); // Update the orders state with the fetched data
          } else {
            console.error('Error fetching orders:', data.message);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };
      fetchOrders(); // Call the fetch function
    }
  }, [userId]); // Depend on userId to refetch orders if the user changes

  // Calculate total price for each order
  const calculateOrderTotal = (items) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };
 // Handle Track Order click event
 const handleTrackOrderClick = (orderId) => {
  console.log('Tracking order:', orderId);
  navigate(`/trackOrder/${orderId}`);
};

  // Define columns for the items in each order
  const itemColumns = [
    {
      title: 'Item Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Unit Price',
      dataIndex: 'price',
      key: 'price',
      render: (text) => `$${text.toFixed(2)}`,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text, record) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => handleQuantityChange(value, record, 'item')}
        />
      ),
    },
    {
      title: 'Total Price',
      key: 'totalPrice',
      render: (text, record) => `$${(record.price * record.quantity).toFixed(2)}`,
    },
  ];

  // Handle quantity change for an item
  const handleQuantityChange = (value, record, type) => {
    const updatedOrders = [...orders];
    if (type === 'item') {
      const orderIndex = updatedOrders.findIndex(order => order.orderId === record.orderId);
      const itemIndex = updatedOrders[orderIndex].items.findIndex(item => item._id === record._id);
      updatedOrders[orderIndex].items[itemIndex].quantity = value;
    }
    setOrders(updatedOrders);
  };

  // Define defaultActiveKey to open all panels
  const defaultActiveKey = orders.map((order) => order.orderId);

  // Create items for the Collapse component
  const collapseItems = orders.map((order) => ({
    key: order.orderId,
    header: (
      <div>
        <Title level={5}>Order ID: {order.orderId}</Title>
        <Title level={5}>Total: ${calculateOrderTotal(order.items)}</Title>
      </div>
    ),
    children: (
      <>
        <Table
          dataSource={order.items}
          columns={itemColumns}
          pagination={false}
          rowKey="_id"
          style={{ marginBottom: 20 }}
        />
        <div style={{ textAlign: 'right' }}>
        <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleTrackOrderClick(order.orderId)} // Track order button click handler
          >
            Track Order
          </Button>
        </div>
        <div style={{ marginTop: '10px', textAlign: 'left' }}>
        
        </div>
      </>
    ),
  }));

 
  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Card title={`My Orders - ${orders.length} orders`} style={{ marginBottom: 20 }}>
        {orders.length > 0 ? (
          <Collapse defaultActiveKey={defaultActiveKey} items={collapseItems} /> // Using items prop
        ) : (
          <p>No completed orders found.</p>
        )}
      </Card>
    </div>
  );
}
