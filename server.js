import express from "express";
import dotenv from "dotenv";
import db from "./utils/db.js";
import cors from "cors";
import { initiateSTKPush } from "./utils/mpesa/stkPush.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});


app.post("/initiate", async (req, res) => {
  try {
    const { phoneNumber, amount, productId, transactionDesc } = req.body;
    
    // Validate required fields
    if (!phoneNumber || !amount || !productId) {
      return res.status(400).json({ 
        success: false, 
        error: "Phone number, amount, and productId are required" 
      });
    }
    
    // Initiate STK Push
    const stkPushResponse = await initiateSTKPush({
      phoneNumber,
      amount: parseFloat(amount),
      accountReference: "Thrift Shop",
      transactionDesc: transactionDesc || `Payment for ${productId}`
    });
    
    // Create transaction record in database
    const transaction = await db.transaction.create({
      data: {
        checkoutRequestId: stkPushResponse.CheckoutRequestID,
        merchantRequestId: stkPushResponse.MerchantRequestID,
        status: "PENDING",
        productId,
        phoneNumber,
        amount: parseFloat(amount),
      },
    });

    res.json({ 
      success: true, 
      message: stkPushResponse.CustomerMessage || 'STK push sent to your phone',
      transaction,
      stkPushResponse
    });
  } catch (error) {
    console.error("Error initiating payment:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to initiate payment" 
    });
  }
});

// this endpoint is used to handle the callback from the payment gateway
app.post("/callback", async (req, res) => {
  try {
    const request = req.body;
    
    // Validate the request structure
    if (!request.Body || !request.Body.stkCallback) {
      return res.status(400).json({ error: "Invalid callback data structure" });
    }
    
    // Extract data from MPESA callback structure
    const { stkCallback } = request.Body;
    
    const { 
      MerchantRequestID, 
      CheckoutRequestID, 
      ResultCode, 
      ResultDesc, 
      CallbackMetadata 
    } = stkCallback;
    
    
    
    // Determine transaction status based on ResultCode
    let status = "FAILED";
    let receiptNumber = null;
    
    if (ResultCode === 0) {
      status = "SUCCESS";
      
      // Extract additional metadata for successful transactions
      if (CallbackMetadata && CallbackMetadata.Item) {
        const receiptItem = CallbackMetadata.Item.find(item => item.Name === "MpesaReceiptNumber");
        if (receiptItem) {
          receiptNumber = receiptItem.Value;
        }
      }
    }
    
    const transaction = await db.transaction.update({
      where: {
        checkoutRequestId: CheckoutRequestID,
      },
      data: {
        status,
        resultCode: ResultCode,
        resultDesc: ResultDesc,
        receiptNumber,
        merchantRequestId: MerchantRequestID
      },
    });
    
    res.json({ success: true, transaction });
  } catch (error) {
    console.error("Error processing callback:", error);
    res.status(500).json({ error: "Failed to process callback" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
