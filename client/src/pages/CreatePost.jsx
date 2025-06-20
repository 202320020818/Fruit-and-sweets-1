import React, { useState } from "react";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageBase64, setImageBase64] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setImageBase64(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newPost = {
      title,
      description,
      image: imageBase64,
      createdAt: new Date().toISOString(),
    };

    const storedPosts = JSON.parse(localStorage.getItem("posts")) || [];
    storedPosts.push(newPost);
    localStorage.setItem("posts", JSON.stringify(storedPosts));

    setTitle("");
    setDescription("");
    setImageBase64("");

    alert("Post saved ");
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white text-black dark:bg-gray-900 dark:text-white rounded-xl shadow-md mt-8">
      <h1 className="text-3xl font-bold mb-4 text-center">Create Post</h1>
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
        </div>

        {imageBase64 && (
          <div className="mt-2">
            <p className="text-sm font-medium">Preview:</p>
            <img
              src={imageBase64}
              alt="Preview"
              className="mt-1 rounded w-full h-auto"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded hover:opacity-90 transition"
        >
          Submit Post
        </button>
      </form>
    </div>
  );
}
