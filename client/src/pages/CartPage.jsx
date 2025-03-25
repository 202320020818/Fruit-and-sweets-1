import React, { useEffect, useState, useRef } from "react";
import { message,Card, Row, Col, Button, Form, Typography, DatePicker, Select, Input, List, Image } from "antd";
import { useSelector } from "react-redux";
import { loadStripe } from "@stripe/stripe-js";
import { useNavigate } from "react-router-dom";
import styles from '../Style.module.css'

const { Title, Text } = Typography;
const stripePromise = loadStripe("your-stripe-public-key");
const { RangePicker } = DatePicker;

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

  const handleCheckout = async () => {
    try {
      const orderDetails = {
        items: cartItems,
        totalAmount: cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
      };
      // Validate the form fields before proceeding
      await form.validateFields();
  
      // Get form data
      const formData = form.getFieldsValue();
  
      // Save delivery details
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
      const session = await fetch("/api/payment/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartItems }),
      }).then((res) => res.json());
  
      if (session.id) {
        await stripe.redirectToCheckout({ sessionId: session.id });
      }
    }
    } catch (error) {
      console.error("Checkout Error:", error);
  
      // Show a more specific error message
      message.error(error.message || "Please fill all required fields before proceeding!");
  
      // Scroll to form if validation failed
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
                    <Col span={4}><Image src={item.image} width={100} /></Col>
                    <Col span={10}><Title level={5}>{item.name}</Title></Col>
                    <Col span={6}><Text strong>${item.price.toFixed(2)}</Text></Col>
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
