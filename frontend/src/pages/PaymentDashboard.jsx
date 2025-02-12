// File: frontend/src/pages/PaymentDashboard.jsx
import { useEffect, useState } from 'react';
import { PaymentCard } from '../components/PaymentCard';
import { api } from '../services/api';

export const PaymentDashboard = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await api.get('/api/payments/history');
        setPayments(response.data.payments);
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Payment History</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {payments.length > 0 ? (
            payments.map((payment) => (
              <PaymentCard key={payment._id} payment={payment} />
            ))
          ) : (
            <div className="text-gray-400 text-center col-span-full">
              No payments found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};