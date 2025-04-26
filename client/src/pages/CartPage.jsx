import React, { useEffect, useState, useRef } from "react";
import { message, Card, Modal, Collapse, Radio, Descriptions, Row, Col, Button, Form, InputNumber, Typography, Tooltip, Select, Input, List, Image } from "antd";
import { DeleteOutlined, DownOutlined, HeartOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { loadStripe } from "@stripe/stripe-js";
import { useNavigate } from "react-router-dom";
import styles from '../Style.module.css';
import DeliveryDetailsList from '../components/DeliveryDetailsList';

const { Panel } = Collapse;
const { Title, Text } = Typography;
const stripePromise = loadStripe("pk_test_51R1EIIDWYegqaTAkzg9ID8J9AvbcIW7Aq28MPvbwFRqlajzS5FWLldM4XGFW4Xp5NO2sGpGZWXow3ejmHIXChlkC00Dw1heT33");

export default function CartPage() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const userId = currentUser?._id;
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [cartItems, setCartItems] = useState([]);
  const [deliveryDetails, setDeliveryDetails] = useState([]);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(null);
  const [isNewDeliveryDetails, setIsNewDeliveryDetails] = useState(false);
  const [form] = Form.useForm();
  const totalAmount = (cartItems?.reduce((total, item) => total + item.price * item.quantity, 0)) || 0;
  const [expandedDetails, setExpandedDetails] = useState(null);

  useEffect(() => {
    if (currentUser?.email) {
      form.setFieldsValue({ email: currentUser.email });
    }
  }, [currentUser, form]);

  const toggleDetailsExpansion = (detailId) => {
    setExpandedDetails(prevExpanded => 
      prevExpanded === detailId ? null : detailId
    );
  };

  useEffect(() => {
    if (userId) {
      // Fetch delivery details
      fetch(`/api/delivery/getDeliveryDetailsByUser/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("API Response for Delivery Details:", data);
          const fetchedDeliveryDetails = data?.data || data || [];
          setDeliveryDetails(fetchedDeliveryDetails);

          // If there are saved delivery details, select the first one by default
          if (fetchedDeliveryDetails.length > 0) {
            setSelectedDeliveryId(fetchedDeliveryDetails[0]._id);
          }
        })
        .catch((error) => console.error("Error fetching delivery details:", error));

      // Fetch cart items
      fetch(`/api/cart/items/${userId}`)
        .then((res) => res.json())
        .then((data) => setCartItems(data.data))
        .catch((error) => console.error("Error fetching cart items:", error));
    }
  }, [userId]);

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

  const handleMoveToWishlist = async (item) => {
    try {
      const response = await fetch("/api/wishlist/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          productId: item.itemId,
          name: item.name,
          image: item.image,
          price: item.price,
          color: item.color,
          size: item.size,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        message.success("Item moved to wishlist!");
        handleDelete(item.itemId); // Optional: Remove item from cart
      } else {
        message.error(data.message || "Failed to move to wishlist.");
      }
    } catch (error) {
      console.error("Error moving item to wishlist:", error);
      message.error("Something went wrong.");
    }
  };

  const handleCheckout = async () => {
    try {
      if (!selectedDeliveryId && !isNewDeliveryDetails) {
        message.error("Please select a delivery option or add new delivery details.");
        return;
      }

      if (isNewDeliveryDetails) {
        await form.validateFields();
      }

      const formData = form.getFieldsValue();

      // Determine which delivery details to use
      const deliveryDetailsToUse = isNewDeliveryDetails 
        ? { ...formData, userId }
        : deliveryDetails.find(detail => detail._id === selectedDeliveryId);

      const saveResponse = await fetch("/api/delivery/saveDeliveryDetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(isNewDeliveryDetails ? deliveryDetailsToUse : deliveryDetailsToUse), 
      });

      const responseData = await saveResponse.json();
      if (!saveResponse.ok) {
        throw new Error("Failed to save order data!");
      }

      const stripe = await stripePromise;
      const orderDetails = {
        items: cartItems,
        totalAmount: cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
        userDeliveryDetailsId: responseData.data._id
      };

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
      console.error("Checkout Error:", error);
      message.error(error.message || "Please fill all required fields before proceeding!");

      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const variant = Form.useWatch("variant", form);
  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 14 },
    },
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
                        <Button type="text" icon={<HeartOutlined />} onClick={() => handleMoveToWishlist(item)} />
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
                      <Text strong>{`$${item.price * item.quantity}`}</Text>
                    </Col>
                  </Row>
                </List.Item>
              )}
            />
          </Card>

          <Button
            type="primary"
            block
            onClick={handleCheckout}
            disabled={cartItems.length === 0}
            style={{ marginTop: "20px" }}
          >
            Proceed to Checkout
          </Button>
        </Col>
      </Row>
    </div>
  );
}
