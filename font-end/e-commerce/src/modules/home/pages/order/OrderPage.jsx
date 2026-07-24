import React from "react";
import { useSelector } from "react-redux";
import NavbarHome from "../../../../shared/components/navbarHome/NavbarHome";
import OrderComponent from "../../components/order/OrderComponent";
import "./OrderPage.css";

export default function OrderPage() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="order-page-container">
      <NavbarHome />
      <main className="order-page-main">
        <div className="order-page-header">
          <h1>Lịch sử đơn hàng</h1>
          <p>Theo dõi trạng thái và chi tiết các đơn hàng của bạn</p>
        </div>
        <OrderComponent user={user} />
      </main>
    </div>
  );
}
