import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';  // Import authentication methods
import { getFirestore, collection, addDoc } from 'firebase/firestore';  // Firestore methods

const ResourceRequestForm = () => {
  const [category, setCategory] = useState('');
  const [productName, setProductName] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');  // State to hold the user's email

  // Automatically retrieve the user's email on component mount
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;  // Get the currently signed-in user

    if (user) {
      setUserEmail(user.email);  // Set the user's email if they're signed in
    } else {
      // Handle case where the user is not logged in (optional)
      setError('User is not logged in');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userEmail) {
      setError('No user is logged in.');
      return;
    }

    // Get Firestore instance
    const firestore = getFirestore();
    const auth = getAuth();

    try {
      setLoading(true);

      // Get the current user's data from Firebase
      const user = auth.currentUser;

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Data to be stored in Firestore under 'recipientRequests'
      const requestData = {
        category,
        productName,
        details,
        userEmail, // User's email automatically retrieved
        userUid: user.uid,  // User's UID for reference
        createdAt: new Date(),
      };

      // Add request to Firestore in 'recipientRequests' collection
      await addDoc(collection(firestore, 'recipientRequests'), requestData);

      alert('Request Submitted Successfully');
      // Reset the form fields
      setCategory('');
      setProductName('');
      setDetails('');
    } catch (error) {
      setError('Error submitting request: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Resource Request Form</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="category">Category:</label>
        <select
          id="category"
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select Category</option>
          <option value="electronics">Electronics</option>
          <option value="furniture">Furniture</option>
          <option value="stationery">Stationery</option>
          <option value="software">Software</option>
        </select>
        <br /><br />

        <label htmlFor="product-name">Product Name:</label>
        <input
          type="text"
          id="product-name"
          name="product-name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          required
        />
        <br /><br />

        <label htmlFor="details">Product Details:</label>
        <textarea
          id="details"
          name="details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows="4"
          required
        />
        <br /><br />

        {/* User email is automatically filled in, no need for a manual input */}
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};

export default ResourceRequestForm;


