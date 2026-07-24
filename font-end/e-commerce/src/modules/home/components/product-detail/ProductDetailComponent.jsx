import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartAsync } from '../../../../shared/store/cartSlice';
import { productApi } from '../../api/productApi';
import { orderApi } from '../../api/orderApi';
import Toast from '../../../../shared/components/Toast';
import OrderModal from '../order/OrderModal';
import './ProductDetailComponent.css';

export default function ProductDetailComponent() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const user = useSelector((state) => state.auth.user);

  const addToast = (type, message) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await productApi.getProductBySlug(slug);
        if (res && res.data) {
          setProduct(res.data);
          // Set primary image as active initially
          const primaryImg = res.data.images?.find(img => img.isPrimary);
          if (primaryImg) {
            setActiveImage(primaryImg.productImageUrl);
          } else if (res.data.images && res.data.images.length > 0) {
            setActiveImage(res.data.images[0].productImageUrl);
          }
        } else {
          setError("Không tìm thấy thông tin sản phẩm");
        }
      } catch (err) {
        console.error("Failed to fetch product details:", err);
        setError("Có lỗi xảy ra khi tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const handleQuantityChange = (type) => {
    if (type === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    } else if (type === 'increase') {
      setQuantity(prev => prev + 1);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="error-container">
        <h2>Opps!</h2>
        <p>{error || "Sản phẩm không tồn tại."}</p>
        <Link to="/product" style={{ color: '#4f46e5', marginTop: '16px', textDecoration: 'underline' }}>
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  // Sắp xếp ảnh: ảnh chính (isPrimary = true) lên đầu, hoặc theo sortOrder
  const sortedImages = [...(product.images || [])].sort((a, b) => {
    if (a.isPrimary) return -1;
    if (b.isPrimary) return 1;
    return (a.sortOrder || 0) - (b.sortOrder || 0);
  });

  return (
    <div className="product-detail-wrapper">
      
      {/* Cột trái: Thư viện ảnh */}
      <div className="product-gallery">
        <div className="main-image-container">
          {activeImage ? (
            <img src={activeImage} alt={product.productName} className="main-image" />
          ) : (
            <div style={{ color: '#9ca3af' }}>Không có ảnh</div>
          )}
        </div>
        
        {sortedImages.length > 1 && (
          <div className="thumbnail-list">
            {sortedImages.map((img) => (
              <div 
                key={img.productImageId} 
                className={`thumbnail-item ${activeImage === img.productImageUrl ? 'active' : ''}`}
                onClick={() => setActiveImage(img.productImageUrl)}
              >
                <img src={img.productImageUrl} alt={product.productName} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cột phải: Thông tin sản phẩm */}
      <div className="product-info">
        <h1 className="product-name">{product.productName}</h1>
        
        <div className="product-price-section">
          {product.productSale > 0 ? (
            <>
              <div className="product-price">{formatPrice(product.productPrice - product.productSale)}</div>
              <div className="product-price-old">{formatPrice(product.productPrice)}</div>
            </>
          ) : (
            <div className="product-price">{formatPrice(product.productPrice)}</div>
          )}
          {product.productQuantity !== undefined && product.productQuantity !== null && (
            <div className={`detail-quantity-badge ${product.productQuantity === 0 ? 'out-of-stock' : ''}`}>
              {product.productQuantity === 0
                ? '⚠ Hết hàng'
                : `✓ Còn ${product.productQuantity} sản phẩm`}
            </div>
          )}
        </div>

        <div className="product-description-box">
          <h3 className="product-description-title">Mô tả sản phẩm</h3>
          <div className="product-description-content">
            {product.productDescription || "Đang cập nhật mô tả..."}
          </div>
        </div>

        <div className="product-actions">
          <div className="quantity-selector">
            <button className="qty-btn" onClick={() => handleQuantityChange('decrease')}>-</button>
            <input type="text" className="qty-input" value={quantity} readOnly />
            <button className="qty-btn" onClick={() => handleQuantityChange('increase')}>+</button>
          </div>

          <div className="btn-group">
            <button 
              className="btn-add-cart" 
              disabled={addingToCart}
              onClick={async () => {
                if (!user) {
                  addToast("error", "Vui lòng đăng nhập để thêm vào giỏ hàng!");
                  return;
                }
                setAddingToCart(true);
                try {
                  await dispatch(addToCartAsync({ productId: product.productId, quantity })).unwrap();
                  addToast("success", "Đã thêm sản phẩm vào giỏ hàng!");
                } catch (err) {
                  addToast("error", err || "Lỗi thêm giỏ hàng!");
                } finally {
                  setAddingToCart(false);
                }
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Thêm vào giỏ hàng
            </button>
            <button 
              className="btn-buy-now" 
              onClick={() => {
                if (!user) {
                  addToast("error", "Vui lòng đăng nhập để mua hàng!");
                  return;
                }
                setIsModalOpen(true);
              }}
            >
              Mua ngay
            </button>
          </div>
        </div>
        
      </div>

      {/* ── Toast Container ── */}
      <div className="product-detail-toast-container">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            type={t.type}
            message={t.message}
            onClose={() => removeToast(t.id)}
          />
        ))}
      </div>

      <OrderModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isSubmitting={addingToCart}
        onSubmit={async (formData) => {
          setAddingToCart(true);
          try {
            const payload = {
              productId: product.productId,
              quantity: quantity,
              shippingAddress: formData.shippingAddress,
              receiverPhone: formData.receiverPhone,
              note: formData.note,
              paymentMethod: formData.paymentMethod || "CASH"
            };
            await orderApi.buyNow(payload);

            addToast("success", "Mua hàng thành công!");
            setIsModalOpen(false);
          } catch (err) {
            console.error("Lỗi khi mua hàng:", err);
            addToast("error", "Có lỗi xảy ra khi mua hàng!");
          } finally {
            setAddingToCart(false);
          }
        }}
      />
    </div>
  );
}
