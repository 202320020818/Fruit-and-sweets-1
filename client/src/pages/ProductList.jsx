import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../assests/ProductList.css";

const ProductList = () => {
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/inventory")
      .then((res) => {
        setInventory(res.data);
      })
      .catch(() => {
        setMessage("Failed to load inventory.");
        setMessageType("error");
      });
  }, []);

  const filteredInventory = inventory.filter((item) =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onDeleteClick = (id) => {
    axios
      .delete(`http://localhost:3000/api/inventory/${id}`)
      .then(() => {
        setInventory((prevInventory) => prevInventory.filter((item) => item._id !== id));
        setMessage("Product deleted successfully!");
        setMessageType("success");
      })
      .catch(() => {
        setMessage("Error deleting product.");
        setMessageType("error");
      });

    setTimeout(() => setMessage(""), 2000);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Product List", 14, 15);

    const tableRows = filteredInventory.map((item) => [
      item._id,
      item.name,
      item.description,
      item.category,
      `Rs.${item.price}`,
      `${item.quantity}kg`,
    ]);

    autoTable(doc, {
      head: [["Product ID", "Name", "Description", "Category", "Price", "Quantity"]],
      body: tableRows,
      startY: 20,
    });

    doc.save("inventory.pdf");
  };

  return (
    <div className="show_ProductList">
      <div className="container">
        {message && <div className={`message ${messageType}`}>{message}</div>}
        
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search Products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button onClick={generatePDF}>Download PDF</button>

        <table className="product-table">
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Image</th>
              <th>Name</th>
              <th>Description</th>
              <th>Category</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.length > 0 ? (
              filteredInventory.map((item) => (
                <tr key={item._id}>
                  <td>{item._id}</td>
                  <td>
                    {item.image ? (
                      <img src={`http://localhost:3000${item.image}`} alt={item.name} className="product-image" />
                    ) : (
                      "No Image"
                    )}
                  </td>
                  <td>{item.name}</td>
                  <td>{item.description}</td>
                  <td>{item.category}</td>
                  <td>Rs.{item.price}</td>
                  <td>{item.quantity}kg</td>
                  <td>
                    <button onClick={() => navigate(`/showdetails/${item._id}`)}>Details</button>
                    <Link to={`/updatedetails/${item._id}`} className="edit-btn">Edit</Link>
                    <button onClick={() => onDeleteClick(item._id)} className="delete-btn">Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">No inventory found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;