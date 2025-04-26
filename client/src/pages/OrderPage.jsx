import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Table, Card, Typography, Button, InputNumber } from 'antd';
import { EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const { Title } = Typography;

export default function OrderPage() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const userId = currentUser?._id;
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

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

  const calculateOrderTotal = (items) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  const handleTrackOrderClick = (orderId) => {
    navigate(`/trackOrder/${orderId}`);
  };

  const handleQuantityChange = (value, record, type) => {
    const updatedOrders = [...orders];
    if (type === 'item') {
      const orderIndex = updatedOrders.findIndex(order => order.orderId === record.orderId);
      const itemIndex = updatedOrders[orderIndex].items.findIndex(item => item._id === record._id);
      updatedOrders[orderIndex].items[itemIndex].quantity = value;
    }
    setOrders(updatedOrders);
  };

  // 📄 Generate and download PDF for a given order
  const downloadOrderPDF = (order) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Order Details - ${order.orderId}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Customer: ${currentUser?.username || 'N/A'}`, 14, 28);
    doc.text(`Total Price: Rs ${calculateOrderTotal(order.items)}`, 14, 36);

    const tableData = order.items.map((item) => [
      item.name,
      `Rs ${item.price.toFixed(2)}`,
      item.quantity,
      `Rs ${(item.price * item.quantity).toFixed(2)}`
    ]);

    doc.autoTable({
      startY: 45,
      head: [['Item Name', 'Unit Price', 'Quantity', 'Total Price']],
      body: tableData,
    });

    doc.save(`Order_${order.orderId}.pdf`);
  };

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
        <>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleTrackOrderClick(record.orderId)}
            style={{ marginRight: 8 }}
          >
            Track
          </Button>
          <Button
            type="default"
            icon={<DownloadOutlined />}
            onClick={() => downloadOrderPDF(record)}
          >
            PDF
          </Button>
        </>
      ),
    },
  ];

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
      render: (text) => `Rs ${text.toFixed(2)}`,
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
      render: (text, record) => `Rs ${(record.price * record.quantity).toFixed(2)}`,
    },
  ];

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
