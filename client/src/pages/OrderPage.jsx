import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Table, Card, Typography, Button, InputNumber } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

export default function OrderPage() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const userId = currentUser?._id;
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  // Fetch orders when component mounts or userId changes
  useEffect(() => {
    if (userId) {
      const fetchOrders = async () => {
        try {
          const response = await fetch(`/api/order/completed-orders/${userId}`);
          const data = await response.json();
          if (response.ok) {
            setOrders(data.data);
          } else {
            console.error('Error fetching orders:', data.message);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };
      fetchOrders();
    }
  }, [userId]);

  // Calculate total price for each order
  const calculateOrderTotal = (items) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  // Handle Track Order click event
  const handleTrackOrderClick = (orderId) => {
    console.log('Tracking order:', orderId);
    navigate(`/trackOrder/${orderId}`);
  };

  // Define columns for the order table
  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
    },
    {
      title: 'Total Price',
      key: 'totalPrice',
      render: (text, record) => `Rs ${calculateOrderTotal(record.items)}`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleTrackOrderClick(record.orderId)} // Track order button click handler
        >
          Track Order
        </Button>
      ),
    },
  ];

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

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Card title={`My Orders - ${orders.length} orders`} style={{ marginBottom: 20 }}>
        <Table
          dataSource={orders}
          columns={columns}
          rowKey="orderId"
          expandable={{
            expandedRowRender: (record) => (
              <Table
                dataSource={record.items}
                columns={itemColumns}
                pagination={false}
                rowKey="_id"
              />
            ),
            rowExpandable: (record) => record.items.length > 0,
          }}
          pagination={false}
        />
      </Card>
    </div>
  );
}
