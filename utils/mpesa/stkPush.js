import { getAccessToken } from './auth.js';

/**
 * Generates a timestamp in the format YYYYMMDDHHmmss
 * @returns {string} Timestamp string
 */
const generateTimestamp = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

/**
 * Generate password for the STK Push request
 * @param {string} shortcode Business shortcode
 * @param {string} passkey Passkey provided by Safaricom
 * @param {string} timestamp Timestamp in YYYYMMDDHHmmss format
 * @returns {string} Base64 encoded password
 */
const generatePassword = (shortcode, passkey, timestamp) => {
  const str = shortcode + passkey + timestamp;
  return Buffer.from(str).toString('base64');
};

/**
 * Initiates an STK Push request to customer's phone
 * @param {object} params Parameters for the STK Push
 * @param {string} params.phoneNumber Customer's phone number in format 2547XXXXXXXX
 * @param {number} params.amount Amount to be paid
 * @param {string} params.accountReference Reference for the transaction
 * @param {string} params.transactionDesc Description of the transaction
 * @returns {Promise<object>} STK Push response
 */
export const initiateSTKPush = async ({ 
  phoneNumber, 
  amount, 
  accountReference = 'Payment',
  transactionDesc = 'Payment' 
}) => {
  try {
    // Validate required fields
    if (!phoneNumber || !amount) {
      throw new Error('Phone number and amount are required');
    }
    
    // Format phone number if needed (ensure it starts with 254)
    const formattedPhone = phoneNumber.startsWith('254') 
      ? phoneNumber 
      : `254${phoneNumber.replace(/^0+/, '')}`;
    
    // Get environment variables
    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    const callbackUrl = process.env.MPESA_CALLBACK_URL;
    
    if (!shortcode || !passkey || !callbackUrl) {
      throw new Error('MPESA_SHORTCODE, MPESA_PASSKEY, and MPESA_CALLBACK_URL must be defined in your environment');
    }
    
    // Determine the base URL based on environment
    const baseUrl = process.env.MPESA_ENV === 'production' 
      ? 'https://api.safaricom.co.ke' 
      : 'https://sandbox.safaricom.co.ke';
    
    // Generate timestamp and password
    const timestamp = generateTimestamp();
    const password = generatePassword(shortcode, passkey, timestamp);
    
    // Get access token
    const accessToken = await getAccessToken();
    
    // Prepare request payload
    const requestBody = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount), // Ensure it's a whole number
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: accountReference.substring(0, 12), // Max 12 chars
      TransactionDesc: transactionDesc.substring(0, 13)    // Max 13 chars
    };
    
    // Make the API request
    const response = await fetch(
      `${baseUrl}/mpesa/stkpush/v1/processrequest`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`STK Push request failed: ${response.status} ${errorData}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error initiating STK Push:', error);
    throw error;
  }
};

export default {
  initiateSTKPush
}; 