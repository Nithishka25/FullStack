import { useNavigate } from 'react-router-dom';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 text-center">
      <div className="flex justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-green-600">
          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm14.28-2.28a.75.75 0 1 0-1.06-1.06L10.5 13.94l-1.97-1.97a.75.75 0 1 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l5.5-5.5Z" clipRule="evenodd" />
        </svg>
      </div>
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Payment successful</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Your order has been placed. You can continue browsing products.</p>
      <button
        onClick={() => navigate('/products')}
        className="mt-6 inline-flex items-center justify-center rounded-md bg-brand text-white px-4 py-2 hover:bg-brand-dark"
      >
        Go to Home
      </button>
    </div>
  );
}
