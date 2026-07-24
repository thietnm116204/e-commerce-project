import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { orderApi } from "../../api/orderApi";
import Loading from "../../../../shared/components/Loading/Loading";
import lockedIcon from "../../../../assets/icons/locked.png";
import dinhviIcon from "../../../../assets/icons/dinhvi.png";
import donhangIcon from "../../../../assets/icons/donhang.svg";
import cashIcon from "../../../../assets/icons/cash.png";
import reloadIcon from "../../../../assets/icons/reload.svg";
import crossIcon from "../../../../assets/icons/cross.png";
import acceptIcon from "../../../../assets/icons/accept.png";
import calendarIcon from "../../../../assets/icons/calendar.png";
import phoneIcon from "../../../../assets/icons/notification.png";
import "./OrderComponent.css";

const fmt = (n) => new Intl.NumberFormat("vi-VN").format(n) + "đ";

const fmtDate = (str) => {
  const d = new Date(str);
  return d.toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" });
};

const STATUS_MAP = {
  AWAITING_PAYMENT: { label: "Chờ thanh toán", cls: "status--awaiting" },
  PENDING:          { label: "Chờ xác nhận",   cls: "status--pending" },
  CONFIRMED:        { label: "Đã xác nhận",    cls: "status--confirmed" },
  SHIPPING:         { label: "Đang giao",       cls: "status--shipping" },
  DELIVERED:        { label: "Đã giao",         cls: "status--delivered" },
  CANCELLED:        { label: "Đã hủy",          cls: "status--cancelled" },
};

const PAYMENT_LABEL = {
  CASH:  { label: "Tiền mặt (COD)", icon: cashIcon },
  VNPAY: { label: "VNPay",          icon: cashIcon }, // dùng cash icon cho cả vnpay
};

function OrderCard({ order, onRefresh }) {
  const [open, setOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const status = STATUS_MAP[order.orderStatus] || { label: order.orderStatus, cls: "status--pending" };
  const paymentInfo = PAYMENT_LABEL[order.paymentMethod] || { label: order.paymentMethod, icon: cashIcon };

  const handleCancelOrder = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
    setActionLoading(true);
    try {
      await orderApi.cancelOrder(order.orderId);
      onRefresh?.();
    } catch (err) {
      alert(err?.response?.data?.message || "Không thể hủy đơn hàng. Vui lòng thử lại.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayNow = async (e) => {
    e.stopPropagation();
    setActionLoading(true);
    try {
      const res = await orderApi.getVnpayUrl(order.orderId);
      const url = res?.data?.paymentUrl;
      if (url) {
        window.location.href = url;
      } else {
        alert("Không thể tạo link thanh toán. Vui lòng thử lại.");
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Lỗi tạo link thanh toán.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="order-card">
      {/* ── Header ── */}
      <div className="order-card__header" onClick={() => setOpen(!open)}>
        <div className="order-card__meta">
          <span className="order-card__id">#{order.orderId.slice(0, 8).toUpperCase()}</span>
          <span className="order-card__date">
            <img src={calendarIcon} alt="ngày" className="icon-meta" />
            {fmtDate(order.createdAt)}
          </span>
        </div>
        <div className="order-card__right">
          <span className={`order-status ${status.cls}`}>{status.label}</span>
          <span className="order-card__total">{fmt(order.totalAmount)}</span>
          <svg className={`order-card__chevron ${open ? "open" : ""}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* ── Nút hành động cho đơn AWAITING_PAYMENT ── */}
      {order.orderStatus === 'AWAITING_PAYMENT' && (
        <div className="order-card__awaiting-actions">
          <span className="order-card__awaiting-note">
            <img src={calendarIcon} alt="thời gian" className="icon-awaiting" />
            Đơn hàng chờ thanh toán — sẽ tự động hủy sau 15 phút nếu không thanh toán.
          </span>
          <div className="order-card__awaiting-btns">
            <button
              className="btn-pay-now"
              onClick={handlePayNow}
              disabled={actionLoading}
            >
              <img src={actionLoading ? reloadIcon : cashIcon} alt="" className="btn-icon" />
              {actionLoading ? "Đang xử lý..." : "Thanh toán ngay"}
            </button>
            <button
              className="btn-cancel-order"
              onClick={handleCancelOrder}
              disabled={actionLoading}
            >
              <img src={crossIcon} alt="" className="btn-icon" />
              Hủy đơn
            </button>
          </div>
        </div>
      )}

      {/* ── Body (collapsible) ── */}
      {open && (
        <div className="order-card__body">
          <div className="order-card__info-row">
            <span className="order-card__addr">
              <img src={dinhviIcon} alt="Địa chỉ" className="icon-addr" />
              {order.shippingAddress}
            </span>
            <span className="order-card__phone">
              <img src={donhangIcon} alt="SĐT" className="icon-addr" />
              {order.receiverPhone}
            </span>
            {order.note && (
              <span className="order-card__note-text">
                <img src={acceptIcon} alt="Ghi chú" className="icon-addr" />
                {order.note}
              </span>
            )}
          </div>

          <div className="order-items">
            <div className="order-items__head">
              <span>Sản phẩm</span>
              <span>Số lượng</span>
              <span>Đơn giá</span>
              <span>Thành tiền</span>
            </div>
            {order.items.map((item) => (
              <div key={item.productId} className="order-item">
                <div className="order-item__product">
                  <div className="order-item__img">
                    {item.productImageUrl ? (
                      <img src={item.productImageUrl} alt={item.productName} />
                    ) : (
                      <img src={donhangIcon} alt="sản phẩm" style={{ width: 32, opacity: 0.4 }} />
                    )}
                  </div>
                  <span className="order-item__name">{item.productName}</span>
                </div>
                <span>{item.quantity}</span>
                <span>{fmt(item.unitPrice)}</span>
                <span className="order-item__sub">{fmt(item.subtotal)}</span>
              </div>
            ))}
          </div>

          <div className="order-card__footer">
            <div className="order-card__payment">
              <img src={paymentInfo.icon} alt="Payment" className="icon-payment" />
              <span>Phương thức thanh toán: <strong>{paymentInfo.label}</strong></span>
            </div>
            <div className="order-card__total-section">
              <span className="order-card__items-count">{order.items.length} sản phẩm</span>
              <span className="order-card__total-label">Thành tiền: <strong>{fmt(order.totalAmount)}</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderComponent({ user, statusFilter }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let mappedStatus = null;
      if (statusFilter && statusFilter !== 'CART' && statusFilter !== 'ALL') {
        mappedStatus = statusFilter === 'COMPLETED' ? 'DELIVERED' : statusFilter;
      }

      const res = await orderApi.getMyOrders(page, 10, mappedStatus);
      const data = res?.data;
      const fetchedOrders = data?.content || [];

      setOrders(fetchedOrders);
      setTotalPages(data?.totalPages || 1);
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user, page, statusFilter]);

  if (!user) {
    return (
      <div className="order-auth-wall">
        <img src={lockedIcon} alt="Chưa đăng nhập" className="order-auth-wall__icon" />
        <h2>Vui lòng đăng nhập</h2>
        <p>Bạn cần đăng nhập để xem lịch sử đơn hàng.</p>
        <Link to="/login" className="order-auth-wall__btn">Đăng nhập ngay</Link>
      </div>
    );
  }

  if (loading) return <Loading text="Đang tải đơn hàng..." />;

  if (orders.length === 0) {
    return (
      <div className="order-empty">
        <div className="order-empty__icon">
          <img src={donhangIcon} alt="Đơn hàng" style={{ width: 80, height: 80, objectFit: 'contain' }} />
        </div>
        <h2>Chưa có đơn hàng nào</h2>
        <p>Hãy mua sắm và quay lại đây để theo dõi đơn hàng!</p>
        <Link to="/product" className="order-auth-wall__btn">Khám phá sản phẩm</Link>
      </div>
    );
  }

  return (
    <div className="order-list">
      <div className="order-list__head">
        <h2>Đơn hàng của tôi <span>({orders.length})</span></h2>
      </div>

      {orders.map((order) => (
        <OrderCard key={order.orderId} order={order} onRefresh={fetchOrders} />
      ))}

      {totalPages > 1 && (
        <div className="order-pagination">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>‹</button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} className={page === i ? "active" : ""} onClick={() => setPage(i)}>{i + 1}</button>
          ))}
          <button disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)}>›</button>
        </div>
      )}
    </div>
  );
}
