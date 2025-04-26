import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, Button, List, message, Tag } from 'antd';

const priorityColors = {
  High: 'red',
  Medium: 'orange',
  Low: 'green',
};

export default function WishlistPage() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const userId = currentUser?._id;
  const [wishlist, setWishlist] = useState([]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch(`/api/wishlist/${userId}`);
      const data = await response.json();
      if (response.ok) {
        setWishlist(data.data);
      } else {
        message.error(data.message || "Failed to fetch wishlist.");
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      message.error("Something went wrong.");
    }
  };

  useEffect(() => {
    if (userId) {
      fetchWishlist();
    }
  }, [userId]);

  const handleRemoveFromWishlist = async (itemId) => {
    try {
      const response = await fetch(`/api/wishlist/${userId}/${itemId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok) {
        message.success("Item removed from wishlist");
        setWishlist((prev) => prev.filter(item => item.itemId !== itemId));
      } else {
        message.error(data.message);
      }
    } catch (err) {
      console.error("Error removing from wishlist:", err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Card title="My Wishlist">
        <List
          itemLayout="vertical"
          dataSource={wishlist}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button type="link" danger onClick={() => handleRemoveFromWishlist(item.itemId)}>
                  Remove
                </Button>
              ]}
            >
              <List.Item.Meta
                title={item.name}
                description={
                  <>
                    <p>Rs {item.price}</p>
                    <p><strong>Category:</strong> {item.category || 'None'}</p>
                    <p><strong>Custom Category:</strong> {item.customCategory || 'N/A'}</p>
                    <p>
                      <strong>Priority:</strong>{' '}
                      <Tag color={priorityColors[item.priority] || 'blue'}>
                        {item.priority}
                      </Tag>
                    </p>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}
