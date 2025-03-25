import React, { useEffect, useState, useRef } from "react";
import { message,Card, Row, Col, Button, Form, InputNumber,Typography, Tooltip, Select, Input, List, Image } from "antd";
import { DeleteOutlined,HeartOutlined,MinusOutlined,PlusOutlined} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { loadStripe } from "@stripe/stripe-js";
import { useNavigate } from "react-router-dom";
import styles from '../Style.module.css'

const { Title, Text } = Typography;
const stripePromise = loadStripe("pk_test_51R1EIIDWYegqaTAkzg9ID8J9AvbcIW7Aq28MPvbwFRqlajzS5FWLldM4XGFW4Xp5NO2sGpGZWXow3ejmHIXChlkC00Dw1heT33");


export default function CartPage() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const userId = currentUser?._id;
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [cartItems, setCartItems] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    if (currentUser?.email) {
      form.setFieldsValue({ email: currentUser.email });
    }
  }, [currentUser, form]);

  useEffect(() => {
    if (userId) {
      fetch(`/api/cart/items/${userId}`)
        .then((res) => res.json())
        .then((data) => setCartItems(data.data))
       
        .catch((error) => console.error("Error fetching cart items:", error));
        console.log("Cart Items",cartItems)
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
  

  const handleCheckout = async () => {
  
  try {
    
      await form.validateFields();
      const formData = form.getFieldsValue();
      const saveResponse = await fetch("/api/delivery/saveDeliveryDetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // Send the form data to be saved in MongoDB
      });
      
      if (!saveResponse.ok) {
        throw new Error("Failed to save order data!");
      }
  
      if(saveResponse.ok){
        
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
            <div ref={formRef}>
              <Title style={{ marginBottom: 60 }} level={5}>
                Delivery Details
              </Title>
              <Form
                {...formItemLayout}
                form={form}
                variant={variant || "outlined"}
                style={{ maxWidth: 1200 }}
                initialValues={{ variant: "filled" }}
              >
                <Row gutter={14}>
                  {/* Left Section */}
                  <Col span={12}>
                    <Form.Item
                      label="Customer Name"
                      name="customerName"
                      labelCol={{ span: 7 }}
                      wrapperCol={{ span: 16 }}
                      rules={[{ required: true, message: "Please enter customer name!" }]}
                    >
                      <Input className={styles['ant-input']}/>
                    </Form.Item>
                    <Form.Item
                      label="Mobile Number"
                      name="mobileNumber"
                      labelCol={{ span: 7 }}
                      wrapperCol={{ span: 16 }}
                      rules={[{ required: true, message: "Please enter mobile number!" }]}
                    >
                       <Input className={styles['ant-input']}/>
                    </Form.Item>
                    <Form.Item
                      label="Delivery Address"
                      name="deliveryAddress"
                      labelCol={{ span: 7 }}
                      wrapperCol={{ span: 16 }}
                      rules={[{ required: true, message: "Please enter delivery address" }]}
                    >
                      <Input.TextArea />
                    </Form.Item>

                    <Form.Item
                      label="Postal Code"
                      name="postalCode"
                      labelCol={{ span: 7 }}
                      wrapperCol={{ span: 16 }}
                      rules={[{ required: true, message: "please enter your postal code !" }]}
                    >
                       <Input className={styles['ant-input']}/>
                    </Form.Item>
                  </Col>

                  {/* Right Section */}
                  <Col span={12}>
                    <Form.Item
                      label="Delivery Type"
                      name="deliveryType"
                      rules={[{ required: true, message: "Select delivery type!" }]}
                    >
                      <Select placeholder="Select Delivery Type">
                        <Select.Option value="0">Online Payment</Select.Option>
                        <Select.Option value="1">Cash On Delivery</Select.Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label={
                        <div style={{ whiteSpace: "pre-line" }}>
                          Delivery
                          {"\n"}
                          Service
                        </div>
                      }
                      name="deliveryService"
                      rules={[{ required: true, message: "Slelect delivery service provider" }]}
                    >
                      <Select placeholder="Select Delivery Service Provider">
                        <Select.Option value="uber">Uber</Select.Option>
                        <Select.Option value="pickme">Pick Me</Select.Option>
                        <Select.Option value="darazd">Daraz Delivery</Select.Option>
                        <Select.Option value="fardar">Fardar</Select.Option>
                        <Select.Option value="koombiyo">Koombiyo</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[{ required: true, message: "Please enter your email!" }]}
                    >
                       <Input className={styles['ant-input']}/>
                    </Form.Item>
                    <Form.Item
                      label="District"
                      name="district"
                      rules={[{ required: true, message: "Please input your district" }]}
                    >
                       <Input className={styles['ant-input']}/>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>
          </Card>
        </Col>

        <Col md={8}>
          <Card title="Order Summary">
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
                <Text strong>Total (incl. VAT)</Text>
                <Text strong>${cartItems.reduce((total, item) => total + item.price, 0).toFixed(2)}</Text>
              </List.Item>
            </List>
            <Button type="primary" block style={{ marginTop: 16 }} onClick={handleCheckout}>
              Go to Checkout
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
