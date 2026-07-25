import React, { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import acceptIcon from "../../../../assets/icons/accept.png";
import crossIcon from "../../../../assets/icons/cross.png";
import donhangIcon from "../../../../assets/icons/donhang.png";
import reloadIcon from "../../../../assets/icons/reload.svg";
import "./VnpayReturnPage.css";

export default function VnpayReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const status  = searchParams.get("status");
  const orderId = searchParams.get("orderId");
  const message = searchParams.get("message");

  const isSuccess = status === "success";

  const [countdown, setCountdown] = useState(5);
  useEffect(() => {
    if (!isSuccess) return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          navigate("/orders");
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSuccess, navigate]);

  return (
    <div className="vnpay-return-page">
      <div className="vnpay-return-card">
        {isSuccess ? (
          <>
            <div className="vnpay-return-icon-wrap success">
              <img src={acceptIcon} alt="Thành công" className="vnpay-return-icon-img" />
            </div>
            <h1 className="vnpay-return-title success">Thanh toán thành công!</h1>
            <p className="vnpay-return-desc">
              Đơn hàng của bạn đã được xác nhận và đang được xử lý.
            </p>
            {orderId && (
              <div className="vnpay-return-order-id">
                <img src={donhangIcon} alt="" className="vnpay-return-order-icon" />
                Mã đơn hàng: <strong>#{orderId.slice(0, 8).toUpperCase()}</strong>
              </div>
            )}
            <p className="vnpay-return-countdown">
              Tự động chuyển về trang đơn hàng sau <strong>{countdown}</strong> giây...
            </p>
            <div className="vnpay-return-actions">
              <Link to="/orders" className="btn-vnpay-primary">
                <img src={donhangIcon} alt="" className="btn-vnpay-icon" />
                Xem lịch sử đơn hàng
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="vnpay-return-icon-wrap failed">
              <img src={crossIcon} alt="Thất bại" className="vnpay-return-icon-img" />
            </div>
            <h1 className="vnpay-return-title failed">Thanh toán thất bại</h1>
            <p className="vnpay-return-desc">
              {message
                ? decodeURIComponent(message)
                : "Giao dịch không thành công hoặc đã bị hủy."}
            </p>
            {orderId && (
              <div className="vnpay-return-order-id">
                <img src={donhangIcon} alt="" className="vnpay-return-order-icon" />
                Mã đơn hàng: <strong>#{orderId.slice(0, 8).toUpperCase()}</strong>
              </div>
            )}
            <p className="vnpay-return-note">
              Đơn hàng đã được hủy. Bạn có thể thử lại hoặc chọn phương thức thanh toán khác.
            </p>
            <div className="vnpay-return-actions">
              <Link to="/cart" className="btn-vnpay-secondary">
                <img src={reloadIcon} alt="" className="btn-vnpay-icon dark" />
                Thử lại thanh toán (Giỏ hàng)
              </Link>
              <Link to="/product" className="btn-vnpay-primary">
                Tiếp tục mua sắm
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
