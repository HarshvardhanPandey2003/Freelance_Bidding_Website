// File: frontend/src/components/PaymentCard.jsx
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export const PaymentCard = ({ payment }) => {
  return (
    <div className="bg-gray-800/50 rounded-2xl p-6 min-h-[200px] h-full flex flex-col transition-shadow duration-300 hover:shadow-lg hover:shadow-indigo-500/30">
      <div className="flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-white pr-8">
            {payment.project?.title || 'Project Title'}
          </h3>
          <span
            className={`text-xs font-medium rounded-full px-2 py-1 uppercase ${
              payment.status === 'COMPLETED' ? 'bg-green-500/90 text-white' :
              payment.status === 'PENDING' ? 'bg-yellow-500/90 text-gray-800' :
              'bg-red-500/90 text-white'
            }`}
          >
            {payment.status}
          </span>
        </div>

        <div className="space-y-3 mb-4 flex-grow">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Client:</span>
            <span className="text-gray-300">{payment.client?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Freelancer:</span>
            <span className="text-gray-300">{payment.freelancer?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Amount:</span>
            <span className="text-gray-300">
              {payment.amount.toFixed(2)} {payment.currency}
            </span>
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex justify-between items-center text-sm text-gray-400">
            <span>Payment ID: {payment.razorpayOrderId}</span>
            <span>
              {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};