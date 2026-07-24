import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchCart, 
  updateQuantityAsync, 
  removeFromCartAsync, 
  selectCartItems, 
} from "../../../../shared/store/cartSlice";
import Loading from "../../../../shared/components/Loading/Loading";
import Button from "../../../../shared/components/Button/Button";
import Toast from "../../../../shared/components/Toast";
import lockedIcon from "../../../../assets/icons/locked.png";
import trashIcon from "../../../../assets/icons/xoa.png";
import cartEmptyIcon from "../../../../assets/icons/cart-empty.svg";
import OrderComponent from "../order/OrderComponent";
import OrderModal from "../order/OrderModal";
import { orderApi } from "../../api/orderApi";
import "./CartComponent.css";

const fmt = (n) => new Intl.NumberFormat("vi-VN").format(n) + "đ";

const TABS = [
  { id: 'CART', label: 'Giỏ hàng' },
  { id: 'AWAITING_PAYMENT', label: 'Chờ thanh toán' },
  { id: 'PENDING', label: 'Chờ xác nhận' },
  { id: 'SHIPPING', label: 'Giao hàng' },
  { id: 'COMPLETED', label: 'Hoàn thành' },
  { id: 'CANCELLED', label: 'Đã Hủy' }
];

const getApiMessage = (err, fallback) => {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallback
  );
};

// ── Sản phẩm trong giỏ ──
function CartRow({ item, onUpdateQty, onRemove, isSelected, onToggleSelect }) {
  const imageUrl = item.images?.find((i) => i.isPrimary)?.productImageUrl || item.images?.[0]?.productImageUrl || item.imageUrl || item.productImageUrl;
  const unitPrice = item.unitPrice || item.productPrice || 0;
  const subtotal = unitPrice * item.quantity;
  const uniqueId = item.cartItemId || item.productId; // Dùng cartItemId nếu có, nếu không dùng productId

  return (
    <div className="cart-row">
      <div className="cart-row__checkbox">
        <input 
          type="checkbox" 
          checked={isSelected} 
          onChange={() => onToggleSelect(uniqueId)}
        />
      </div>
      <div className="cart-row__product">
        <div className="cart-row__img">
          {imageUrl ? <img src={imageUrl} alt={item.productName} /> : <span>🛍</span>}
        </div>
        <div className="cart-row__name-wrap">
          <p className="cart-row__name">{item.productName}</p>
          <p className="cart-row__price-unit">{fmt(unitPrice)} / sản phẩm</p>
        </div>
      </div>
      <div className="cart-row__qty">
        <div className="qty-stepper">
          <button onClick={() => onUpdateQty(uniqueId, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
          <span>{item.quantity}</span>
          <button onClick={() => onUpdateQty(uniqueId, item.quantity + 1)}>+</button>
        </div>
      </div>
      <div className="cart-row__subtotal">{fmt(subtotal)}</div>
      <div className="cart-row__action">
        <button className="btn-delete" onClick={() => onRemove(uniqueId)}>
          <img src={trashIcon} alt="Xóa" />
        </button>
      </div>
    </div>
  );
}

export default function CartComponent({ user }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const loading = useSelector((state) => state.cart.loading);
  const [selectedIds, setSelectedIds] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [activeTab, setActiveTab] = useState('CART');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const addToast = (type, message) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (user && activeTab === 'CART') {
      dispatch(fetchCart());
    }
  }, [user, dispatch, activeTab]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.cartItemId || i.productId));
    }
  };

  const handleUpdateQty = async (id, newQuantity) => {
    try {
      await dispatch(updateQuantityAsync({ itemId: id, quantity: newQuantity })).unwrap();
    } catch (err) {
      addToast("error", "Lỗi cập nhật số lượng");
    }
  };

  const handleRemoveItem = async (id) => {
    try {
      await dispatch(removeFromCartAsync(id)).unwrap();
      addToast("success", "Đã xóa sản phẩm khỏi giỏ hàng");
      setSelectedIds((prev) => prev.filter(x => x !== id));
    } catch (err) {
      addToast("error", "Lỗi xóa sản phẩm");
    }
  };

  const handleCheckout = async (formData) => {
    setIsSubmittingOrder(true);
    try {
      // Lấy danh sách cartItemId của các sản phẩm được chọn
      const cartItemIds = items
        .filter((i) => selectedIds.includes(i.cartItemId || i.productId))
        .map((i) => i.cartItemId)
        .filter(Boolean);

      if (cartItemIds.length === 0) {
        throw new Error("Không tìm thấy cartItemId hợp lệ cho các sản phẩm đã chọn.");
      }

      const payload = { cartItemIds, ...formData };
      const res = await orderApi.checkoutCart(payload);
      const paymentData = res?.data;

      if (formData.paymentMethod === 'VNPAY' && paymentData?.vnpayUrl) {
        // VNPay: redirect sang cổng thanh toán
        dispatch(fetchCart()); // clear giỏ hàng trước khi rời trang
        setIsOrderModalOpen(false);
        window.location.href = paymentData.vnpayUrl;
      } else {
        // CASH: xử lý ngay
        addToast("success", "Đặt hàng thành công! Đơn hàng của bạn đang được xử lý.");
        setIsOrderModalOpen(false);
        setSelectedIds([]);
        dispatch(fetchCart());
        setActiveTab('PENDING');
      }
    } catch (err) {
      addToast("error", getApiMessage(err, "Lỗi đặt hàng"));
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (!user) {
    return (
      <div className="cart-auth-wall">
        <img src={lockedIcon} alt="Chưa đăng nhập" className="cart-auth-wall__icon" />
        <h2>Vui lòng đăng nhập</h2>
        <p>Bạn cần đăng nhập để xem giỏ hàng và đơn hàng.</p>
        <Link to="/login" className="cart-auth-wall__btn">Đăng nhập ngay</Link>
      </div>
    );
  }

  const renderCartContent = () => {
    if (loading && items.length === 0) return <Loading text="Đang tải giỏ hàng..." />;

    if (items.length === 0) {
      return (
        <div className="cart-empty">
          <div className="cart-empty__icon">
            <img src={cartEmptyIcon} alt="Giỏ hàng trống" style={{ width: 80, height: 80, objectFit: 'contain' }} />
          </div>
          <h2>Giỏ hàng trống</h2>
          <p>Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
          <Link to="/product" className="cart-auth-wall__btn">
            Khám phá sản phẩm
          </Link>
        </div>
      );
    }

    const selectedItems = items.filter((i) => selectedIds.includes(i.cartItemId || i.productId));
    const grandTotal = selectedItems.reduce((sum, i) => sum + ((i.unitPrice || i.productPrice || 0) * i.quantity), 0);
    const totalQuantity = selectedItems.reduce((sum, i) => sum + i.quantity, 0);
    const allChecked = items.length > 0 && selectedIds.length === items.length;

    return (
      <div className="cart-layout">
        {/* ── Cột trái: Danh sách ── */}
        <div className="cart-list">
          <div className="cart-list__header">
            <label className="cart-select-all">
              <input type="checkbox" checked={allChecked} onChange={toggleAll} />
              <span>Chọn tất cả ({items.length} sản phẩm)</span>
            </label>
          </div>
          
          <div className="cart-list__cols">
            <span style={{ flex: '0 0 40px' }}></span>
            <span>Sản phẩm</span>
            <span>Số lượng</span>
            <span>Thành tiền</span>
          </div>

          <div className="cart-groups">
            {items.map((item) => (
              <CartRow
                key={item.cartItemId || item.productId}
                item={item}
                isSelected={selectedIds.includes(item.cartItemId || item.productId)}
                onToggleSelect={toggleSelect}
                onUpdateQty={handleUpdateQty}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>
        </div>

        {/* ── Cột phải: Summary Panel ── */}
        <div className="cart-summary">
          <h3 className="cart-summary__title">Tóm tắt đơn hàng</h3>

          <div className="cart-summary__rows">
            <div className="cart-summary__row">
              <span>Đã chọn</span>
              <span>{selectedIds.length} sản phẩm</span>
            </div>
            <div className="cart-summary__row">
              <span>Tạm tính ({totalQuantity} sản phẩm)</span>
              <span>{fmt(grandTotal)}</span>
            </div>
            <div className="cart-summary__row">
              <span>Phí vận chuyển</span>
              <span className="free">Miễn phí</span>
            </div>
          </div>

          <div className="cart-summary__divider" />

          <div className="cart-summary__total">
            <span>Tổng cộng</span>
            <span>{fmt(grandTotal)}</span>
          </div>

          <Button
            variant="primary"
            disabled={selectedIds.length === 0}
            onClick={() => setIsOrderModalOpen(true)}
            className="w-100"
          >
            Mua hàng
          </Button>

          {selectedIds.length === 0 && (
            <p className="cart-no-select-hint">Vui lòng chọn ít nhất 1 sản phẩm</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="cart-page-wrapper">
      <div className="cart-tabs-container">
        {TABS.map(tab => (
          <div 
            key={tab.id}
            className={`cart-tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      <div className="cart-tab-content">
        {activeTab === 'CART' ? (
          renderCartContent()
        ) : (
          <OrderComponent user={user} statusFilter={activeTab} />
        )}
      </div>

      {/* ── Toast Container ── */}
      <div className="cart-toast-container">
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
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSubmit={handleCheckout}
        isSubmitting={isSubmittingOrder}
      />
    </div>
  );
}
