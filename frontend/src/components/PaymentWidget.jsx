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
        onSuccess(response);
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

  useEffect(() => {
    if (order) {
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = openRazorpayCheckout;
        script.onerror = () => onError('Razorpay SDK failed to load');
        document.body.appendChild(script);
      } else {
        openRazorpayCheckout();
      }
    }

    // Optional: clean up by closing the modal on unmount
    return () => {
      if (rzpRef.current && typeof rzpRef.current.close === 'function') {
        rzpRef.current.close();
      }
    };
  }, [order]);

  return null;
};

export default PaymentWidget;
