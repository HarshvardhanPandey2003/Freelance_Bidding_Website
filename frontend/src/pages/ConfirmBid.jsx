// frontend/src/pages/ConfirmBid.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api, initiatePayment } from '../services/api';
import PaymentWidget from '../components/PaymentWidget';

export const ConfirmBid = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { projectId, freelancerId, bidId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [initiatingPayment, setInitiatingPayment] = useState(false);
  const [order, setOrder] = useState(null);
  const [bid, setBid] = useState(null);

//You can't just use bid_id directly to get the bid amount
  // You have to write a function to fetch the bid data using the id 
      useEffect(() => {
      const fetchBid = async () => {
        try {
          const response = await api.get(`/api/bids/${bidId}`);
          setBid(response.data);
        } catch (err) {
          setError('Failed to fetch bid data.');
        } finally {
          setLoading(false);
        }
      };
      fetchBid();
    }, [bidId]);

    let bidAmount = bid?.bidAmount || 0;
    bidAmount = (bidAmount * 20) / 100;

  // Fetch the freelancer's profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log("freelancerId:", freelancerId, "Bid Amount:", bidAmount, "ProjectId:", projectId);
        const response = await api.get(`/api/profile/freelancer/${freelancerId}`);
        setProfile(response.data);
      } catch (err) {
        setError('Failed to load freelancer profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [freelancerId, projectId, bidAmount]);

  // Payment initiation similar to ConfirmationPage
  const handlePay = async () => {
    setInitiatingPayment(true);
    try {
      // Generate Razorpay order without creating a Payment record
      const data = await initiatePayment({ projectId, freelancerId, amount: bidAmount });
      setOrder(data.order);
    } catch (err) {
      console.error(err);
      setError('Failed to initiate payment');
    } finally {
      setInitiatingPayment(false);
    }
  };

  // Once the payment is successful, save the transaction
  const handlePaymentSuccess = async (paymentResponse) => {
    console.log('Payment successful:', paymentResponse);
    try {
      // Pass extra fields needed to create the Payment record
      await api.post('/api/payments/confirm', {
        razorpayPaymentId: paymentResponse.razorpay_payment_id,
        razorpayOrderId: order.id, // Order id from initiatePayment
        razorpaySignature: paymentResponse.razorpay_signature,
        paymentMethod: paymentResponse.method || 'card',
        projectId,         // Needed to create the Payment record
        freelancerId,      // Needed to create the Payment record
        amount: bidAmount, // Payment amount in INR
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving transaction:', err);
      setError('Failed to save transaction');
    }
  };

  const handlePaymentFailure = (paymentError) => {
    console.error('Payment failed:', paymentError);
    // Optionally, show an error message or let the user retry.
  };

  if (loading) return <div className="text-center text-gray-400">Loading...</div>;
  if (error) return <div className="text-center text-gray-400">{error}</div>;
  if (!profile) return <div className="text-center text-gray-400">Profile not found</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white relative flex flex-col items-center p-6">
      {/* Back button */}
      <button 
        onClick={() => navigate('/dashboard')}
        className="absolute top-4 left-4 text-indigo-400 hover:text-indigo-300"
      >
        Back
      </button>
      
      <h1 className="text-4xl font-bold mb-6">Confirmation Page</h1>
      
      <div className="bg-gray-800/50 rounded-xl p-8 max-w-4xl w-full">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center">
            <img
              src={profile.image}
              alt="Profile"
              className="w-40 h-40 rounded-full border-2 border-indigo-500"
            />
            <p className="text-gray-300 mt-4 text-xl font-semibold">{profile.name}</p>
          </div>
          <div className="flex flex-col space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300">Description:</label>
              <p className="text-gray-400">{profile.description}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">GitHub:</label>
              <p className="text-gray-400">{profile.links?.github || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">LinkedIn:</label>
              <p className="text-gray-400">{profile.links?.linkedin || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Resume URL:</label>
              <p className="text-gray-400">{profile.resume || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Pay button */}
        <div className="mt-8 flex justify-end">
          <button 
            onClick={handlePay}
            disabled={initiatingPayment || order}
            className="bg-teal-500 px-6 py-3 rounded hover:bg-teal-400"
          >
            {initiatingPayment ? 'Processing...' : order ? 'Payment Initiated' : 'Pay'}
          </button>
        </div>
        {/* After clicking on the pay button the order is created and the instead of storing it we give it to the PaymentWidget */}    
        {/* Render PaymentWidget if an order is available */}
        {order && (
          <PaymentWidget 
            order={order}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentFailure}
          />
        )}
      </div>
    </div>
  );
};
