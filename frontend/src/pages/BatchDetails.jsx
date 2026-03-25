import { useEffect, useState } from "react";
import {
  getBatchById,
  removeItem,
  getBatchSummary,
} from "../api/batchApi";

const BatchDetails = () => {
  const batchId = "PUT_REAL_ID_HERE"; // 🔥 replace

  const [batch, setBatch] = useState(null);
  const [summary, setSummary] = useState(null);

  const loadData = async () => {
    try {
      const batchData = await getBatchById(batchId);
      const summaryData = await getBatchSummary(batchId);

      setBatch(batchData);
      setSummary(summaryData);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRemove = async (itemId) => {
    await removeItem(batchId, itemId);
    loadData(); // refresh
  };

  return (
    <div>
      <h2>Batch Details</h2>

      {batch?.items?.map((item) => (
        <div key={item._id}>
          <p>{item.name}</p>
          <button onClick={() => handleRemove(item._id)}>
            Remove ❌
          </button>
        </div>
      ))}

      <h3>Summary</h3>
      <p>Total Items: {summary?.totalItems}</p>
      <p>Total Price: ₹{summary?.totalPrice}</p>
    </div>
  );
};

export default BatchDetails;