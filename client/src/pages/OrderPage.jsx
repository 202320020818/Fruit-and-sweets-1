import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Table, Card, Typography, Button, message, Space } from 'antd';
import { EyeOutlined, DownloadOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';

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
          const response = await fetch(`/api/order/user-orders/${userId}`);
          const data = await response.json();
          console.log('Orders data:', data);
          if (data.success) {
            setOrders(data.data);
          } else {
            message.error(data.message || 'Failed to fetch orders');
          }
        } catch (error) {
          console.error('Error:', error);
          message.error('Failed to fetch orders');
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

  const downloadOrderPDF = (order) => {
    if (!order || !order.items) {
      message.error('Invalid order data');
      return;
    }

    try {
    const doc = new jsPDF();
      let currentY = 20;

    doc.setFontSize(16);
      doc.text('Order Details', 20, currentY);
      currentY += 15;

      const orderInfo = [
        ['Order ID:', order.orderId],
        ['Date:', new Date(order.createdAt).toLocaleString()],
        ['Status:', order.status.toUpperCase()],
        ['Payment Status:', order.paymentStatus.toUpperCase()]
      ];

      autoTable(doc, {
        startY: currentY,
        body: orderInfo,
        theme: 'plain',
        styles: { fontSize: 10 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
          1: { cellWidth: 100 }
        },
        didDrawPage: (data) => {
          currentY = data.cursor.y + 10;
        }
      });

      const itemsTableHead = [['Item', 'Quantity', 'Price', 'Total']];
      const itemsTableBody = order.items.map(item => [
        item.name,
        item.quantity,
        `Rs ${Number(item.price).toFixed(2)}`,
        `Rs ${(Number(item.price) * Number(item.quantity)).toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: currentY,
        head: itemsTableHead,
        body: itemsTableBody,
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 }
        },
        didDrawPage: (data) => {
          currentY = data.cursor.y + 10;
        }
      });

    doc.setFontSize(12);
      doc.text(`Total Amount: Rs ${calculateOrderTotal(order.items)}`, 20, currentY);

      doc.save(`Order_${order.orderId}.pdf`);
      message.success('PDF downloaded successfully');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      message.error('Error details: ' + error.message);
    }
  };

  const downloadAllOrdersPDF = () => {
    if (!orders || orders.length === 0) {
      message.error('No orders to generate PDF');
      return;
    }

    try {
      const doc = new jsPDF();
      let currentY = 20;

      doc.setFontSize(16);
      doc.text('My Orders Report', 20, currentY);
      currentY += 15;

      const summaryInfo = [
        ['Customer:', currentUser?.email || 'N/A'],
        ['Total Orders:', orders.length.toString()],
        ['Generated On:', new Date().toLocaleString()],
        ['Total Amount:', `Rs ${orders.reduce((sum, order) => 
          sum + parseFloat(calculateOrderTotal(order.items)), 0).toFixed(2)}`]
      ];

      autoTable(doc, {
        startY: currentY,
        body: summaryInfo,
        theme: 'plain',
        styles: { fontSize: 10 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
          1: { cellWidth: 100 }
        },
        didDrawPage: (data) => {
          currentY = data.cursor.y + 10;
        }
      });

      const ordersTableHead = [['Order ID', 'Status', 'Payment', 'Amount', 'Date']];
      const ordersTableBody = orders.map(order => [
        order.orderId.substring(0, 15),
        order.status.toUpperCase(),
        order.paymentStatus.toUpperCase(),
        `Rs ${calculateOrderTotal(order.items)}`,
        new Date(order.createdAt).toLocaleDateString()
      ]);

      autoTable(doc, {
        startY: currentY,
        head: ordersTableHead,
        body: ordersTableBody,
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 35 },
          2: { cellWidth: 35 },
          3: { cellWidth: 35 },
          4: { cellWidth: 35 }
        },
        didDrawPage: (data) => {
          currentY = data.cursor.y + 10;
        }
      });

      orders.forEach((order, index) => {
        doc.addPage();
        currentY = 20;

        doc.setFontSize(14);
        doc.text(`Order #${index + 1} Details`, 20, currentY);
        currentY += 15;

        const orderInfo = [
          ['Order ID:', order.orderId],
          ['Date:', new Date(order.createdAt).toLocaleString()],
          ['Status:', order.status.toUpperCase()],
          ['Payment:', order.paymentStatus.toUpperCase()]
        ];

        autoTable(doc, {
          startY: currentY,
          body: orderInfo,
          theme: 'plain',
          styles: { fontSize: 10 },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 40 },
            1: { cellWidth: 100 }
          },
          didDrawPage: (data) => {
            currentY = data.cursor.y + 10;
          }
        });

        const itemsHead = [['Item', 'Qty', 'Price', 'Total']];
        const itemsBody = order.items.map(item => [
      item.name,
      item.quantity,
          `Rs ${Number(item.price).toFixed(2)}`,
          `Rs ${(Number(item.price) * Number(item.quantity)).toFixed(2)}`
        ]);

        autoTable(doc, {
          startY: currentY,
          head: itemsHead,
          body: itemsBody,
          headStyles: { fillColor: [52, 152, 219] },
          styles: { fontSize: 9 },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 20 },
            2: { cellWidth: 30 },
            3: { cellWidth: 30 }
          },
          didDrawPage: (data) => {
            currentY = data.cursor.y + 10;
          }
        });

        doc.setFontSize(11);
        doc.text(`Order Total: Rs ${calculateOrderTotal(order.items)}`, 20, currentY);
      });

      doc.save('My_Orders_Report.pdf');
      message.success('All orders PDF downloaded successfully');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      message.error('Error details: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'pending':
        return 'orange';
      case 'processing':
        return 'blue';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span style={{ color: getStatusColor(status) }}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      ),
    },
    {
      title: 'Payment Status',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status) => (
        <span style={{ color: status === 'paid' ? 'green' : 'orange' }}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      ),
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
            onClick={() => {
              console.log('Download button clicked for order:', record);
              downloadOrderPDF(record);
            }}
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
    },
    {
      title: 'Total Price',
      key: 'totalPrice',
      render: (text, record) => `Rs ${(record.price * record.quantity).toFixed(2)}`,
    },
  ];

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Card 
        title={
          <Space>
            <span>My Orders - {orders.length} orders</span>
            {orders.length > 0 && (
              <Button
                type="primary"
                icon={<FilePdfOutlined />}
                onClick={downloadAllOrdersPDF}
              >
                Download All Orders
              </Button>
            )}
          </Space>
        } 
        style={{ marginBottom: 20 }}
      >
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Title level={4}>No Completed Orders Found</Title>
            <p>You haven't completed any orders yet. Your completed orders will appear here after successful payment.</p>
            <Button type="primary" onClick={() => navigate('/cart')}>
              Go to Cart
            </Button>
          </div>
        ) : (
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
        )}
      </Card>
    </div>
  );
}
