import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BankSlipList = () => {
  const [bankSlips, setBankSlips] = useState([]);
  
  useEffect(() => {
    const fetchBankSlips = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/bankslip');
        setBankSlips(response.data);
      } catch (error) {
        console.error('Failed to fetch bank slips', error);
      }
    };
    
    fetchBankSlips();
  }, []);

  return (
    <div>
      <h2>Uploaded Bank Slips</h2>
      <ul>
        {bankSlips.map((bankSlip) => (
          <li key={bankSlip._id}>
            <a href={`http://localhost:3000/${bankSlip.filePath}`} target="_blank" rel="noopener noreferrer">
              View {bankSlip.filePath}
            </a>
            {/* Optionally, add update status or delete button */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BankSlipList;
