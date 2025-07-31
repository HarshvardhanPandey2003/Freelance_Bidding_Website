// File: frontend/src/components/PaymentWidget.jsx
import React, { useEffect, useRef } from 'react';

const PaymentWidget = ({ order, onSuccess, onError }) => {
  const rzpRef = useRef(null);

  const openRazorpayCheckout = () => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY,
      amount: order.amount, // Amount is in paise
      currency: order.currency,
      name: 'Freelance Bidding Website',
      description: 'Project Payment',
      order_id: order.id,
      handler: function (response) {
        // If needed, force-close the widget (typically auto-closed)
        if (rzpRef.current && typeof rzpRef.current.close === 'function') {
          rzpRef.current.close();
        }
        onSuccess(response);// Now this response contains the payment details and we call it in ConfrimBid.jsx 
        // as PaymentResponse which acts as a prop to handlePaymentSuccess
      },
      modal: {
        ondismiss: function () {
          onError('Payment popup closed');
        },
      },
    };

    // Create an instance and store it in a ref
    rzpRef.current = new window.Razorpay(options);
    rzpRef.current.open();
  };

  // useEffect runs when component mounts or order changes
  useEffect(() => {
    // Only proceed if we have an order object
    if (order) {
      // Check if Razorpay SDK is already loaded
      if (!window.Razorpay) {
        // SDK not loaded yet, so load it dynamically
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        
        // Once script loads successfully, open checkout
        script.onload = openRazorpayCheckout;
        
        // Handle script loading errors
        script.onerror = () => onError('Razorpay SDK failed to load');
        
        // Add script to page to start loading
        document.body.appendChild(script);
      } else {
        // SDK already loaded, directly open checkout
        openRazorpayCheckout();
      }
    }

    // CLEANUP FUNCTION: Runs when component unmounts
    return () => {
      // Close any open Razorpay modal to prevent memory leaks
      if (rzpRef.current && typeof rzpRef.current.close === 'function') {
        rzpRef.current.close();
      }
    };
  }, [order]); // Dependency array - effect runs when 'order' changes

  return null;
};

export default PaymentWidget;
