
/**
 * Generates an OAuth access token for MPESA API
 * @returns {Promise<string>} Access token
 */
export const getAccessToken = async () => {
  try {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    
    if (!consumerKey || !consumerSecret) {
      throw new Error('MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET must be defined in your environment');
    }
    
    // Determine the base URL based on environment
    const baseUrl = process.env.MPESA_ENV === 'production' 
      ? 'https://api.safaricom.co.ke' 
      : 'https://sandbox.safaricom.co.ke';
    
    // Create the auth string (base64 encoded)
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    
    const response = await fetch(
      `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, 
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`
        }
      }
    );
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to get access token: ${response.status} ${errorData}`);
    }
    
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting MPESA access token:', error);
    throw error;
  }
};

export default {
  getAccessToken
}; 