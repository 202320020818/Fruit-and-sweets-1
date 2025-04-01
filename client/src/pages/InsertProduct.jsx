import React, { useState } from "react";
import "../assests/InsertProduct.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const InsertProduct = () => {
    const navigate = useNavigate();
    const [inventoryData, setInventoryData] = useState({
        product_ID: "",
        name: "",
        category: "",
        description: "",
        price: "",
        quantity: "",
        image: null, 
      
    });

    const [previewImage, setPreviewImage] = useState(null); // Image preview state
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInventoryData({
            ...inventoryData,
            [name]: value,
        });
    };

    // Handle image file selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setInventoryData({
            ...inventoryData,
            image: file, // Save file to state
        });

        // Generate preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result);
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        return (
            inventoryData.product_ID &&
            inventoryData.name &&
            inventoryData.category &&
            inventoryData.description &&
            inventoryData.price &&
            inventoryData.quantity &&
            inventoryData.image // Ensure image is uploaded
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setMessage("Please fill out all fields and upload an image.");
            setMessageType("error");
            return;
        }

        if (isNaN(inventoryData.price) || inventoryData.price <= 0) {
            setMessage("Price must be a positive number.");
            setMessageType("error");
            return false;
        }
    
        if (isNaN(inventoryData.quantity) || inventoryData.quantity < 0) {
            setMessage("Quantity cannot be negative.");
            setMessageType("error");
            return false;
        }

        setIsLoading(true);

        const formData = new FormData();
        formData.append("product_ID", inventoryData.product_ID);
        formData.append("name", inventoryData.name);
        formData.append("category", inventoryData.category);
        formData.append("description", inventoryData.description);
        formData.append("price", inventoryData.price);
        formData.append("quantity", inventoryData.quantity);
        formData.append("image", inventoryData.image); // Append image file

        try {
            await axios.post("http://localhost:3000/api/inventory", formData, {
                headers: {
                    "Content-Type": "multipart/form-data", // Ensure correct headers
                },
            });

            setInventoryData({
                product_ID: "",
                name: "",
                category: "",
                description: "",
                price: "",
                quantity: "",
                image: null,
            });

            setPreviewImage(null); // Reset preview image

            setMessage("Product added successfully!");
            setMessageType("success");
            setIsLoading(false);

            setTimeout(() => {
                navigate("/");
            }, 500);
        } catch (err) {
            setMessage("Error adding product. Please try again.");
            setMessageType("error");
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="divcontainer">
                <h2>Add Product</h2>

                {message && (
                    <div className={`message ${messageType === "success" ? "success" : "error"}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="product_ID">Product ID</label>
                        <input type="text" id="product_ID" name="product_ID" onChange={handleChange} value={inventoryData.product_ID} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="name">Product Name</label>
                        <input type="text" id="name" name="name" onChange={handleChange} value={inventoryData.name} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select id="category" name="category" onChange={handleChange} value={inventoryData.category}>
                            <option value="">Select a Category</option>
                            <option value="Imported">Imported Fruits</option>
                            <option value="Local">Local Fruits</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea id="description" name="description" rows="3" onChange={handleChange} value={inventoryData.description}></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="price">Price</label>
                        <input type="text" id="price" name="price" onChange={handleChange} value={inventoryData.price} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="quantity">Quantity</label>
                        <input type="number" id="quantity" name="quantity" onChange={handleChange} value={inventoryData.quantity} />
                    </div>

                
                    {/* Image Upload Field */}
                    <div className="form-group">
                        <label htmlFor="image">Product Image</label>
                        <input type="file" id="image" name="image" accept="image/*" onChange={handleImageChange} />
                    </div>

                    {/* Image Preview */}
                    {previewImage && (
                        <div className="image-preview">
                            <p>Image Preview:</p>
                            <img src={previewImage} alt="Preview" width="150px" />
                        </div>
                    )}

                    <div className="form-group">
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? "Adding..." : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InsertProduct;
