import React, { useEffect, useState } from "react";
import { Card, Row, Col, Button, InputNumber, Typography, Tooltip, List, Image } from "antd";
import { MinusOutlined, PlusOutlined, DeleteOutlined, HeartOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux"; // Import useSelector to get the userId
import { loadStripe } from "@stripe/stripe-js"; // Import Stripe

const { Title, Text } = Typography;

const stripePromise = loadStripe("pk_test_51R1EIIDWYegqaTAkzg9ID8J9AvbcIW7Aq28MPvbwFRqlajzS5FWLldM4XGFW4Xp5NO2sGpGZWXow3ejmHIXChlkC00Dw1heT33")


export default function ShoppingCart() {
  const currentUser = useSelector((state) => state.user.currentUser); // Get currentUser from Redux
  const userId = currentUser?._id; // Extract the userId from the logged-in user

  const [cartItems, setCartItems] = useState([]); // State to hold cart items

  // Fetch cart items from backend when component mounts
  useEffect(() => {
    if (userId) {
      const fetchCartItems = async () => {
        try {
          const response = await fetch(`/api/cart/items/${userId}`);
          const data = await response.json();

          if (response.ok) {
            setCartItems(data.data); // Set cart items from response data
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

  const handleCheckout = async () => {
    const stripe = await stripePromise;
  
    const orderDetails = {
      items: cartItems,
      totalAmount: cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    };
  
    try {
      const response = await fetch("/api/payment/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderDetails),
      });
  
      const session = await response.json();
  
      if (session.id) {
        // Redirect to Stripe checkout
        const { error } = await stripe.redirectToCheckout({
          sessionId: session.id,
        });
  
        if (error) {
          console.error("Error redirecting to checkout:", error);
          alert("An error occurred while redirecting to checkout");
          return;
        }
  
        // When the payment is successful, confirm payment on backend
        const paymentConfirmationResponse = await fetch("/api/payment/confirm-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentToken: session.id, // session ID from Stripe
            userId: userId, // user ID from Redux or session
            cartItems: cartItems,
          }),
        });
  
        const confirmationResult = await paymentConfirmationResponse.json();
  
        if (confirmationResult.success) {
          // Clear cart after successful payment
          setCartItems([]);
  
          // Redirect to the payment success page
          navigate("/payment-success"); // Assuming you have this route
        } else {
          alert("Payment confirmation failed, please try again.");
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
                        <Button type="text" danger icon={<DeleteOutlined />} />
                      </Tooltip>
                      <Tooltip title="Move to wishlist">
                        <Button type="text" icon={<HeartOutlined />} />
                      </Tooltip>
                    </Col>
                    <Col span={6}>
                      <InputNumber min={1} defaultValue={1} style={{ width: "60px" }} />
                      <Button icon={<MinusOutlined />} style={{ marginLeft: "5px" }} />
                      <Button icon={<PlusOutlined />} style={{ marginLeft: "5px" }} />
                    </Col>
                    <Col span={4}>
                      <Text strong>${item.price.toFixed(2)}</Text>
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
                <Text>${cartItems.reduce((total, item) => total + item.price, 0).toFixed(2)}</Text>
              </List.Item>
              <List.Item>
                <Text>Shipping</Text>
                <Text>Gratis</Text>
              </List.Item>
              <List.Item>
                <Text strong>Total (including VAT)</Text>
                <Text strong>${cartItems.reduce((total, item) => total + item.price, 0).toFixed(2)}</Text>
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
