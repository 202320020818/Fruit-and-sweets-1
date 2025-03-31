import React from "react";
import { Card, Col, Row, Button } from "antd";
import { AiOutlineShoppingCart } from "react-icons/ai";
import DummyImg from "../assests/img1.jpg";
import { useSelector } from "react-redux";

const dummyData = Array.from({ length: 30 }, (_, index) => ({
  itemName: `Product ${index + 1}`,
  price: (Math.random() * 50 + 10).toFixed(2), 
  image: DummyImg,
  description: "test description",
  createdBy: `User ${Math.floor(Math.random() * 5) + 1}`,
  updatedBy: `User ${Math.floor(Math.random() * 5) + 1}`,
  category: index % 2 === 0 ? "Fruits" : "Sweets",
}));

// Function to handle adding an item to the cart
const addToCart = async (product, userId) => {
  if (!userId) {
    alert("Please log in to add items to the cart");
    return;
  }

  const cartItem = {
    userId,          // Pass userId from Redux to backend
    itemName: product.itemName,
    price: product.price,
    image: product.image,
    createdBy: product.createdBy,
    updatedBy: product.updatedBy,
    description: product.description, 
    category: product.category,
  };

  try {
    const res = await fetch('/api/cart/add-to-cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cartItem),  
    });

    const data = await res.json();

    if (res.ok) {
      alert('Item added to cart successfully!');
    } else {
      console.error('Error adding item to cart:', data.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

const Products = () => {
  // Access the userId from Redux store
  const currentUser = useSelector((state) => state.user.currentUser);
  const userId = currentUser?._id;  
  console.log("Ussss",userId)
  return (
    <div style={{ padding: "30px" }}>
      <h2>Products</h2>
      <Row gutter={[16, 16]}>
        {dummyData.map((product, index) => (
          <Col span={8} key={index}>
            <Card
              hoverable
              cover={<img alt={product.itemName} src={product.image} style={{ width: "100%", height: "200px", objectFit: "cover" }} />}
              actions={[
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 10 }}>
                  <span style={{ color: 'green', fontWeight: 'bold', fontSize: '30px' }}>
                    Rs {product.price}
                  </span>
                  <Button 
                    type="primary" 
                    icon={<AiOutlineShoppingCart />} 
                    onClick={() => addToCart(product, userId)}  
                  >
                    Add to Cart
                  </Button>
                </div>
              ]}
            >
              <Card.Meta
                title={product.itemName}  
                description={product.description}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Products;
