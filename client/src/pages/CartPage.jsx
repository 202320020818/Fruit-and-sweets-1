import React, { useEffect, useState } from "react";
import { Card, Row, Col, Button, InputNumber, Typography, Tooltip, List, Image, message, Modal, Spin } from "antd";
import { MinusOutlined, PlusOutlined, DeleteOutlined, HeartOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { loadStripe } from "@stripe/stripe-js";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

export default function ShoppingCart() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const userId = currentUser?._id;
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchCartItems();
    }
  }, [userId]);

  const fetchCartItems = async () => {
    try {
      const response = await fetch(`/api/cart/items/${userId}`);
      const data = await response.json();
      if (response.ok) {
        setCartItems(data.data);
      } else {
        message.error(data.message || "Failed to fetch cart items");
      }
    } catch (error) {
      message.error("Error fetching cart items");
    }
  };

  const handleQuantityChange = async (itemId, quantity) => {
    if (quantity < 1) return;
    try {
      setCartItems((prevItems) =>
        prevItems.map((item) => (item.itemId === itemId ? { ...item, quantity } : item))
      );
      await fetch(`/api/cart/item/update/${userId}/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
    } catch (error) {
      message.error("Failed to update quantity");
    }
  };

  const handleDelete = (itemId) => {
    Modal.confirm({
      title: "Are you sure you want to remove this item?",
      onOk: async () => {
        try {
          const response = await fetch(`/api/cart/item/${userId}/${itemId}`, { method: "DELETE" });
          const data = await response.json();
          if (response.ok) {
            setCartItems((prevItems) => prevItems.filter((item) => item.itemId !== itemId));
          } else {
            message.error(data.message || "Error deleting item");
          }
        } catch (error) {
          message.error("Failed to delete item");
        }
      },
    });
  };

  const handleCheckout = async () => {
    setLoading(true);
    const stripe = await stripePromise;
    const orderDetails = {
      items: cartItems,
      totalAmount: cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    };
    try {
      const response = await fetch("/api/payment/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderDetails),
      });
      const session = await response.json();
      if (session.id) {
        setCartItems([]);
        const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
        if (error) message.error("Payment error");
      } else {
        message.error("Failed to initiate checkout");
      }
    } catch (error) {
      message.error("Checkout error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Row gutter={16} justify="center">
        <Col md={16}>
          <Card title={`Cart - ${cartItems.length} items`}>
            <List
              dataSource={cartItems}
              renderItem={(item) => (
                <List.Item>
                  <Row gutter={16} align="middle" style={{ width: "100%" }}>
                    <Col span={4}><Image src={item.image} width={100} /></Col>
                    <Col span={10}>
                      <Title level={5}>{item.name}</Title>
                      <Text>Color: {item.color}</Text>
                      <br />
                      <Text>Size: {item.size}</Text>
                      <br />
                      <Tooltip title="Remove item">
                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(item.itemId)} />
                      </Tooltip>
                      <Tooltip title="Move to wishlist">
                        <Button type="text" icon={<HeartOutlined />} />
                      </Tooltip>
                    </Col>
                    <Col span={6}>
                      <InputNumber min={1} value={item.quantity} style={{ width: "60px" }} onChange={(value) => handleQuantityChange(item.itemId, value)} />
                      <Button icon={<MinusOutlined />} style={{ marginLeft: "5px" }} onClick={() => handleQuantityChange(item.itemId, Math.max(item.quantity - 1, 1))} />
                      <Button icon={<PlusOutlined />} style={{ marginLeft: "5px" }} onClick={() => handleQuantityChange(item.itemId, item.quantity + 1)} />
                    </Col>
                    <Col span={4}><Text strong>${(item.price * item.quantity).toFixed(2)}</Text></Col>
                  </Row>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col md={8}>
          <Card title="Summary">
            <List>
              <List.Item><Text>Products</Text><Text>${cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</Text></List.Item>
              <List.Item><Text>Shipping</Text><Text>Gratis</Text></List.Item>
              <List.Item><Text strong>Total (including VAT)</Text><Text strong>${cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</Text></List.Item>
            </List>
            <Button type="primary" block style={{ marginTop: 16 }} onClick={handleCheckout} disabled={loading}>{loading ? <Spin /> : "Go to checkout"}</Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
