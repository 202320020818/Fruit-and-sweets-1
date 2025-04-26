import React, { useEffect, useState } from "react";
import { Card, Col, Row, Button, Tabs, Spin, message } from "antd";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import axios from "axios";

const { TabPane } = Tabs;

const SERVER_URL = "http://localhost:3000";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useSelector((state) => state.user.currentUser);
  const userId = currentUser?._id;
  const [wishlistItems, setWishlistItems] = useState([]);
  
  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/api/inventory`);
        const data = await res.json();

        if (res.ok) {
          setProducts(data);
        } else {
          toast.error("Failed to fetch products!");
        }
      } catch (error) {
        toast.error("Error fetching products:", error);
        toast.error("An error occurred while fetching products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch wishlist items when component mounts or userId changes
  useEffect(() => {
    if (userId) {
      fetchWishlistItems();
    }
  }, [userId]);

  const fetchWishlistItems = async () => {
    try {
      console.log('Fetching wishlist for userId:', userId);
      const response = await axios.get(`${SERVER_URL}/api/wishlist/${userId}`);
      console.log('Wishlist fetch response:', response.data);
      
      if (response.data.success) {
        setWishlistItems(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }
  };

  // Function to handle adding an item to the cart
  const addToCart = async (product) => {
    if (!userId) {
      message.warning("Please log in to add items to the cart");
      return;
    }

    const cartItem = {
      userId,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1, // Default quantity
      category: product.category,
      description: product.description
    };

    try {
      const res = await fetch(`${SERVER_URL}/api/cart/add-to-cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cartItem),
      });

      const data = await res.json();

      if (res.ok) {
        message.success("Item added to cart successfully!");
      } else {
        message.error(data.message || "Failed to add item to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      message.error("An error occurred while adding to cart");
    }
  };

  const handleAddToWishlist = async (product) => {
    try {
      if (!userId) {
        message.error('Please login to add items to wishlist');
        return;
      }

      console.log('Current user:', currentUser);
      console.log('Adding product to wishlist:', product);

      // Ensure all required fields are present and properly formatted
      const wishlistItem = {
        userId: userId.toString(),
        productId: product._id.toString(), // Convert to string to ensure consistency
        name: product.name || '',
        price: Number(product.price) || 0,
        image: product.image || '',
        description: product.description || '',
        category: product.category || ''
      };

      console.log('Wishlist item to be added:', wishlistItem);

      const response = await axios.post(`${SERVER_URL}/api/wishlist/add`, wishlistItem, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Wishlist response:', response.data);

      if (response.data.success) {
        message.success('Added to wishlist');
        // Update wishlist items state
        setWishlistItems(prevItems => [...prevItems, response.data.data]);
      } else {
        message.error(response.data.message || 'Failed to add to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Failed to add to wishlist. Please try again.');
      }
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.productId === productId);
  };

  return (
    <div style={{ padding: "30px" }}>
      {loading ? (
        <Spin size="large" />
      ) : (
        <Tabs type="card" defaultActiveKey="Fruits" tabBarStyle={{ fontSize: 28, fontWeight: "bold" }}>
          <TabPane tab="Fruits" key="Fruits">
            <ProductGrid products={products.filter((p) => p.category === "fruit")} addToCart={addToCart} addToWishlist={handleAddToWishlist} isInWishlist={isInWishlist} />
          </TabPane>
          <TabPane tab="Sweets" key="Sweets">
            <ProductGrid products={products.filter((p) => p.category === "sweet")} addToCart={addToCart} addToWishlist={handleAddToWishlist} isInWishlist={isInWishlist} />
          </TabPane>
        </Tabs>
      )}
    </div>
  );
};

// Separate component for displaying products in a grid
const ProductGrid = ({ products, addToCart, addToWishlist, isInWishlist }) => (
  <Row gutter={[16, 16]}>
    {products.length > 0 ? (
      products.map((product, index) => (
        <Col span={8} key={index}>
          <Card
            hoverable
            cover={
              <img 
                alt={product.name} 
                src={`${SERVER_URL}${product.image}`}
                style={{ width: "100%", height: "200px", objectFit: "cover" }} 
                onError={(e) => { e.target.src = "/default-placeholder.png"; }}
              />
            }
            actions={[
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: 10 }}>
                <span style={{ color: "green", fontWeight: "bold", fontSize: "20px" }}>Rs {product.price}</span>
                <Button
                  type="text"
                  icon={isInWishlist(product._id) ? <HeartFilled style={{ color: 'red' }} /> : <HeartOutlined />}
                  onClick={() => addToWishlist(product)}
                >
                  {isInWishlist(product._id) ? 'In Wishlist' : 'Add to Wishlist'}
                </Button>
                <Button
                  type="text"
                  icon={<AiOutlineShoppingCart />}
                  onClick={() => addToCart(product)}
                >
                  Add to Cart
                </Button>
              </div>,
            ]}
          >
            <Card.Meta title={product.name} description={product.description} />
          </Card>
        </Col>
      ))
    ) : (
      <p>No products found.</p>
    )}
  </Row>
);

export default Products;
