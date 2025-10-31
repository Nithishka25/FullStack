import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    api.get(`/api/products/${id}`)
      .then((res) => setProduct(res.data.product))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load'));
  }, [id]);

  if (error) return <div className="text-red-600">{error}</div>;
  if (!product) return <div>Loading...</div>;
  const myId = user?._id || user?.id;
  const sellerId = typeof product.seller === 'string' ? product.seller : (product.seller?._id || product.seller?.id);
  const isOwner = !!myId && !!sellerId && myId === sellerId;

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-2">{product.title}</h2>
      {product.status === 'sold' && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-red-50 text-red-700 border border-red-200 px-3 py-1 text-sm">
          <span>Sold Out — This item is no longer available</span>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {Array.isArray(product.images) && product.images.length > 0 ? (
            <div>
              <div className="relative">
                <img
                  src={product.images[imgIndex]}
                  alt={`${product.title} ${imgIndex + 1}`}
                  className="w-full max-h-[460px] object-cover rounded-lg border border-gray-200"
                />
                {product.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setImgIndex((i) => (i - 1 + product.images.length) % product.images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center"
                      aria-label="Previous image"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => setImgIndex((i) => (i + 1) % product.images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center"
                      aria-label="Next image"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="mt-3 grid grid-cols-6 gap-2">
                  {product.images.map((src, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setImgIndex(idx)}
                      className={`border rounded-md overflow-hidden ${idx === imgIndex ? 'ring-2 ring-brand' : 'border-gray-200'}`}
                      aria-label={`Show image ${idx + 1}`}
                    >
                      <img src={src} alt={`thumb-${idx + 1}`} className="w-full h-14 object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-64 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">No image</div>
          )}
        </div>
        <div>
          <div className="text-3xl font-bold text-brand mb-2">₹{product.price}</div>
          <div className="prose max-w-none">
            <p>{product.description || 'No description provided.'}</p>
          </div>
          <div className="mt-4 text-sm text-gray-600 space-y-1">
            <div>Category: <span className="font-medium text-gray-800">{product.category || 'N/A'}</span></div>
            <div>Location: <span className="font-medium text-gray-800">{product.location || 'N/A'}</span></div>
          </div>
          {/* Actions area */}
          {isOwner ? (
            <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="text-sm text-gray-600">Seller</div>
              <div className="font-medium">{product.seller?.name || 'Unknown'}</div>
              <div className="mt-3 flex flex-wrap gap-3 items-center">
                <Button
                  onClick={() => navigate(`/products/${product._id}/edit`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Edit
                </Button>
                {isOwner && product.status !== 'sold' && (
                  <Button
                    onClick={async () => {
                      try {
                        const res = await api.put(`/api/products/${product._id}`, { status: 'sold' });
                        setProduct(res.data.product);
                        toast.success('Marked as Sold');
                      } catch (e) {
                        toast.error(e.response?.data?.error || 'Failed to mark as sold');
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Mark as Sold
                  </Button>
                )}
                {isOwner && product.status === 'sold' && (
                  <Button
                    onClick={async () => {
                      try {
                        const res = await api.put(`/api/products/${product._id}`, { status: 'available' });
                        setProduct(res.data.product);
                        toast.success('Marked as Available');
                      } catch (e) {
                        toast.error(e.response?.data?.error || 'Failed to mark as available');
                      }
                    }}
                  >
                    Mark as Available
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap gap-3 items-center">
              <Button
                disabled={product.status === 'sold' || (user && user.id === product.seller?._id)}
                onClick={async () => {
                  if (!user) {
                    toast('Please login to start a chat');
                    navigate('/login');
                    return;
                  }
                  if (user?.id === product.seller?._id) {
                    toast('You are the seller of this item');
                    return;
                  }
                  if (product.status === 'sold') {
                    toast('Item is sold out');
                    return;
                  }
                  try {
                    const res = await api.post('/api/chat/conversations', {
                      participantId: product.seller._id,
                      productId: product._id,
                    });
                    const convoId = res.data.conversation._id;
                    navigate(`/chat?open=${convoId}`);
                  } catch (e) {
                    toast.error(e.response?.data?.error || 'Failed to start chat');
                  }
                }}
              >
                Chat with Seller
              </Button>
              {/* Buy Now for buyers when available */}
              {product.status !== 'sold' && user?.id !== product.seller?._id && (
                <Button
                  onClick={() => {
                    navigate('/payment-success');
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Buy Now
                </Button>
              )}
              {/* Place Order (no payment) for buyers */}
              {product.status !== 'sold' && user?.id !== product.seller?._id && (
                <Button
                  onClick={async () => {
                    try {
                      const amount = Math.round(Number(product.price || 0) * 100) || 100;
                      await api.post('/api/orders', { productId: product._id, amount });
                      toast.success('Order placed');
                      navigate('/orders');
                    } catch (e) {
                      toast.error(e.response?.data?.error || 'Failed to place order');
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Place Order
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
