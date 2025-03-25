import React, { useEffect, useState, useRef } from "react";
import { Card, Row, Col, Button, Input, Form, Typography, Mentions, Cascader, DatePicker, InputNumber, Select, TreeSelect, List, Image } from "antd";
import { useSelector } from "react-redux";
import { loadStripe } from "@stripe/stripe-js";
import { useNavigate } from "react-router-dom";

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
    if (userId) {
      fetch(`/api/cart/items/${userId}`)
        .then((res) => res.json())
        .then((data) => setCartItems(data.data))
        .catch((error) => console.error("Error fetching cart items:", error));
    }
  }, [userId]);

  const handleCheckout = async () => {
    try {
      await form.validateFields();
      const stripe = await stripePromise;
      const session = await fetch("/api/payment/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartItems })
      }).then(res => res.json());

      if (session.id) {
        await stripe.redirectToCheckout({ sessionId: session.id });
      }
    } catch (error) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const variant = Form.useWatch('variant', form);
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
              <Title level={5}>Delivery Details</Title>
              <Form
                {...formItemLayout}
                form={form}
                variant={variant || 'outlined'}
                style={{ maxWidth: 600 }}
                initialValues={{ variant: 'filled' }}
              >
                <Row gutter={16}>
                  {/* Left Section */}
                  <Col span={12}>
                 

                    <Form.Item
                      label="Customer Name"
                      name="customerName"
                      rules={[{ required: true, message: 'Please input!' }]}
                    >
                      <InputNumber style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                      label="Delivery Address"
                      name="deliveryAddress"
                      rules={[{ required: true, message: 'Please input!' }]}
                    >
                      <Input.TextArea />
                    </Form.Item>

                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[{ required: true, message: 'Please input!' }]}
                    >
                      <Mentions />
                    </Form.Item>
                  </Col>

                  {/* Right Section */}
                  <Col span={12}>
                    <Form.Item
                      label="Delivery Type"
                      name="deliveryType"
                      rules={[{ required: true, message: 'Please input!' }]}
                    >
                      <Select placeholder="Select province">
            <Option value="0">Online Payment</Option>
            <Option value="1">Cash On Delivery</Option>
          </Select>
                    </Form.Item>

                    <Form.Item
                      label="Cascader"
                      name="Cascader"
                      rules={[{ required: true, message: 'Please input!' }]}
                    >
                      <Cascader />
                    </Form.Item>

                    <Form.Item
                      label="TreeSelect"
                      name="TreeSelect"
                      rules={[{ required: true, message: 'Please input!' }]}
                    >
                      <TreeSelect />
                    </Form.Item>

                    <Form.Item
                      label="DatePicker"
                      name="DatePicker"
                      rules={[{ required: true, message: 'Please input!' }]}
                    >
                      <DatePicker />
                    </Form.Item>

                    <Form.Item
                      label="RangePicker"
                      name="RangePicker"
                      rules={[{ required: true, message: 'Please input!' }]}
                    >
                      <RangePicker />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>
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
