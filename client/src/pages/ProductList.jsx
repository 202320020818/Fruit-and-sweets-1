import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../assests/ProductList.css";

const ProductList = () => {
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [message, setMessage] = useState(""); 
  const [messageType, setMessageType] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = inventory.filter((item) =>
      item.name.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredInventory(filtered);
  }, [searchQuery, inventory]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/inventory")
      .then((res) => {
        setInventory(res.data);
        setFilteredInventory(res.data);
      })
      .catch(() => {
        console.log("Error while getting data");
        setMessage("Failed to load inventory.");
        setMessageType("error");
      });
  }, []);

  const onDeleteClick = (id) => {
    axios
      .delete(`http://localhost:3000/api/inventory/${id}`)
      .then(() => {
        setInventory(inventory.filter((item) => item._id !== id));
        setMessage("Product deleted successfully!");
        setMessageType("success");

        setTimeout(() => {
          setMessage("");
        }, 1000);
      })
      .catch((err) => {
        console.log("Delete error", err);
        setMessage("Error deleting product.");
        setMessageType("error");

        setTimeout(() => {
          setMessage("");
        }, 300);
      });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Product List", 14, 15);

    const tableColumn = [
      "Product ID", 
      "Product Name", 
      "Description", 
      "Category", 
      "Price", 
      "Quantity",
    ];
    const tableRows = [];

    filteredInventory.forEach((item) => {
      tableRows.push([
        item._id,
        item.name,
        item.description,
        item.category,
        `$${item.price}`,
        item.quantity,
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("inventory.pdf");
  };

  return (
    <div className="show_EmployeeList">
      <div className="container">
        {message && (
          <div className={`message ${messageType === "success" ? "success" : "error"}`}>
            {message}
          </div>
        )}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search Products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="button">
          <button onClick={generatePDF}>Download PDF</button>
        </div>

        {/* Inventory Table */}
        <table className="product-table">
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Image</th> {/* Added Image Column */}
              <th>Name</th>
              <th>Description</th>
              <th>Category</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">No inventory found</td> 
              </tr>
            ) : (
              filteredInventory.map((item) => (
                <tr key={item._id}>
                  <td>{item._id}</td>
                  <td>
                    <img 
                      src={`http://localhost:3000${item.image}`} 
                      alt={item.name} 
                      className="product-image"
                    />
                  </td> {/* Display Image */}
                  <td>{item.name}</td>
                  <td>{item.description}</td>
                  <td>{item.category}</td>
                  <td>Rs.{item.price}</td>
                  <td>{item.quantity}kg</td> 
                  <td className="actions">
                    <button className="details-btn" onClick={() => navigate(`/showdetails/${item._id}`)}>Details</button>
                    <Link to={`/updatedetails/${item._id}`} className="btn btn-info btn-sm mx-1">Edit</Link>
                    <button className="delete-btn" onClick={() => onDeleteClick(item._id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;
