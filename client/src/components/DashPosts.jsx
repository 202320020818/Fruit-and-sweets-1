import React, { useState, useEffect } from "react";
import { Card, Button, message, Modal } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

export default function DashPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = () => {
    try {
      const storedPosts = JSON.parse(localStorage.getItem("posts")) || [];
      setPosts(storedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      message.error("Failed to fetch posts");
    }
  };

  const handleDelete = (postId) => {
    try {
      const updatedPosts = posts.filter((post) => post.createdAt !== postId);
      localStorage.setItem("posts", JSON.stringify(updatedPosts));
      setPosts(updatedPosts);
      message.success("Post deleted successfully");
    } catch (error) {
      console.error("Error deleting post:", error);
      message.error("Failed to delete post");
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setIsModalVisible(true);
  };

  const handleUpdate = (updatedPost) => {
    try {
      const updatedPosts = posts.map((post) =>
        post.createdAt === updatedPost.createdAt ? updatedPost : post
      );
      localStorage.setItem("posts", JSON.stringify(updatedPosts));
      setPosts(updatedPosts);
      setIsModalVisible(false);
      message.success("Post updated successfully");
    } catch (error) {
      console.error("Error updating post:", error);
      message.error("Failed to update post");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Posts</h1>
      {posts.length === 0 ? (
        <div className="text-center p-8">
          <p className="text-gray-500 text-lg">No posts available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <Card
              key={post.createdAt}
              className="dark:bg-gray-800 dark:text-white"
              cover={
                post.image && (
                  <img
                    alt="post"
                    src={post.image}
                    className="h-48 w-full object-cover"
                  />
                )
              }
              actions={[
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(post)}
                >
                  Edit
                </Button>,
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(post.createdAt)}
                >
                  Delete
                </Button>,
              ]}
            >
              <Card.Meta
                title={post.title}
                description={
                  <div>
                    <p className="text-gray-600 dark:text-gray-300">
                      {post.description}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Posted by: {post.username}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                }
              />
            </Card>
          ))}
        </div>
      )}

      <Modal
        title="Edit Post"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        {editingPost && (
          <EditPostForm
            post={editingPost}
            onUpdate={handleUpdate}
            onCancel={() => setIsModalVisible(false)}
          />
        )}
      </Modal>
    </div>
  );
}

function EditPostForm({ post, onUpdate, onCancel }) {
  const [title, setTitle] = useState(post.title);
  const [description, setDescription] = useState(post.description);
  const [imageBase64, setImageBase64] = useState(post.image);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      message.error("Image size should be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      message.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedPost = {
        ...post,
        title,
        description,
        image: imageBase64,
      };

      onUpdate(updatedPost);
    } catch (error) {
      console.error("Error updating post:", error);
      message.error("Failed to update post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-semibold">Title</label>
        <input
          type="text"
          className="w-full p-2 border rounded mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block font-semibold">Description</label>
        <textarea
          className="w-full p-2 border rounded mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block font-semibold">Upload Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full mt-1 dark:bg-gray-800 dark:text-white"
        />
        <p className="text-sm text-gray-500 mt-1">Max file size: 5MB</p>
      </div>

      {imageBase64 && (
        <div className="mt-2">
          <p className="text-sm font-medium">Preview:</p>
          <img
            src={imageBase64}
            alt="Preview"
            className="mt-1 rounded w-full h-auto max-h-60 object-cover"
          />
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          disabled={loading}
        >
          Update Post
        </Button>
      </div>
    </form>
  );
}
