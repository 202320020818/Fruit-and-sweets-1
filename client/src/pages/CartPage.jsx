import React, { useEffect, useState } from "react";
import { Card, Row, Col, Button, InputNumber, Typography, Tooltip, List, Image } from "antd";
import { MinusOutlined, PlusOutlined, DeleteOutlined, HeartOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux"; 
import { loadStripe } from "@stripe/stripe-js"; 
import { useNavigate } from "react-router-dom"; 

const { Title, Text } = Typography;

const stripePromise = loadStripe("pk_test_51R1EIIDWYegqaTAkzg9ID8J9AvbcIW7Aq28MPvbwFRqlajzS5FWLldM4XGFW4Xp5NO2sGpGZWXow3ejmHIXChlkC00Dw1heT33");

export default function CartPage() {
  const currentUser = useSelector((state) => state.user.currentUser); 
  const userId = currentUser?._id; 
  const navigate = useNavigate(); 

  const [cartItems, setCartItems] = useState([]); 

  // Fetch cart items when component mounts
  useEffect(() => {
    if (userId) {
      const fetchCartItems = async () => {
        try {
          const response = await fetch(`/api/cart/items/${userId}`);
          const data = await response.json();

          if (response.ok) {
            setCartItems(data.data); 
          } else {
            console.error("Error fetching cart items:", data.message);
          }
        } catch (error) {
          console.error("Error:", error);
        }
      };

      fetchCartItems();
    }
  }, [userId]);

  // Handle quantity update
const handleQuantityChange = async (itemId, quantity) => {
  try {
    const updatedCartItems = cartItems.map((item) =>
      item.itemId === itemId ? { ...item, quantity } : item
    );
    setCartItems(updatedCartItems);

    // Update in backend
    const response = await fetch(`/api/cart/item/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      throw new Error('Failed to update quantity');
    }
  } catch (error) {
    console.error('Error updating item quantity:', error);
  }
};

  // Handle item deletion
  const handleDelete = async (itemId) => {
    try {
      const response = await fetch(`/api/cart/item/${userId}/${itemId}`, { method: 'DELETE' });

      const data = await response.json();

      if (response.ok) {
        setCartItems((prevItems) => prevItems.filter((item) => item.itemId !== itemId));
      } else {
        alert(data.message || "Error deleting item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  // Handle checkout
  const handleCheckout = async () => {
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

        if (!error) {
          // Confirm payment in backend
          const paymentConfirmationResponse = await fetch("/api/payment/confirm-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentToken: session.id, 
              userId: userId, 
              cartItems: cartItems,
            }),
          });

          const confirmationResult = await paymentConfirmationResponse.json();

          if (confirmationResult.success) {
            localStorage.setItem("orderId", confirmationResult.orderId); 
            navigate("/payment-success");
          } else {
            alert("Payment confirmation failed, please try again.");
          }
        }
      } else {
        alert("Failed to create checkout session.");
      }
    } catch (error) {
      console.error("Error initiating checkout:", error);
      alert("An error occurred while processing the payment");
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
                    <Col span={4}>
                      <Image src={item.image} width={100} />
                    </Col>
                    <Col span={10}>
                      <Title level={5}>{item.name}</Title>
                      <Text>Color: {item.color}</Text>
                      <br />
                      <Text>Size: {item.size}</Text>
                      <br />
                      <Tooltip title="Remove item">
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDelete(item.itemId)} 
                        />
                      </Tooltip>
                      <Tooltip title="Move to wishlist">
                        <Button type="text" icon={<HeartOutlined />} />
                      </Tooltip>
                    </Col>
                    <Col span={6}>
                      <InputNumber
                        min={1}
                        value={item.quantity}
                        style={{ width: "60px" }}
                        onChange={(value) => handleQuantityChange(item.itemId, value)} 
                      />
                      <Button
                        icon={<MinusOutlined />}
                        style={{ marginLeft: "5px" }}
                        onClick={() => handleQuantityChange(item.itemId, Math.max(item.quantity - 1, 1))} 
                      />
                      <Button
                        icon={<PlusOutlined />}
                        style={{ marginLeft: "5px" }}
                        onClick={() => handleQuantityChange(item.itemId, item.quantity + 1)} 
                      />
                    </Col>
                    <Col span={4}>
                      <Text strong>${(item.price * item.quantity).toFixed(2)}</Text>
                    </Col>
                  </Row>
                </List.Item>
              )}
            />
          </Card>
          <Card style={{ marginTop: 16 }}>
            <Title level={5}>Expected shipping delivery</Title>
            <Text>12.10.2020 - 14.10.2020</Text>
          </Card>
        </Col>

        <Col md={8}>
          <Card title="Summary">
            <List>
              <List.Item>
                <Text>Products</Text>
                <Text>${cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</Text>
              </List.Item>
              <List.Item>
                <Text>Shipping</Text>
                <Text>Gratis</Text>
              </List.Item>
              <List.Item>
                <Text strong>Total (including VAT)</Text>
                <Text strong>${cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</Text>
              </List.Item>
            </List>
            <Button type="primary" block style={{ marginTop: 16 }} onClick={handleCheckout}>
              Go to checkout
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
