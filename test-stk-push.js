import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';

/**
 * Test the STK Push functionality
 */
const testSTKPush = async () => {
  try {
    console.log('Testing STK Push...');
    
    // Request payload
    const payload = {
      phoneNumber: '254700000000', // Replace with a valid M-PESA registered phone number
      amount: 1, // Use 1 for testing
      productId: 'TEST001',
      accountReference: 'Test Payment',
      transactionDesc: 'Test Payment'
    };
    
    console.log('Request payload:', payload);
    
    // Make the API request
    const response = await fetch(`${SERVER_URL}/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    // Parse the response
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('STK Push initiated successfully!');
      console.log('Check your phone for the STK prompt...');
    } else {
      console.error('STK Push request failed');
    }
  } catch (error) {
    console.error('Error testing STK Push:', error);
  }
};

// Run the test
testSTKPush(); 