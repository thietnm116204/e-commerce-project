import React from "react";
import { useSelector } from "react-redux";
import NavbarHome from "../../../../shared/components/navbarHome/NavbarHome";
import CartComponent from "../../components/cart/CartComponent";
import "./CartPage.css";

export default function CartPage() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="cart-page-container">
      <NavbarHome />
      <main className="cart-page-main">
        <div className="cart-page-header">
          <h1>Giỏ hàng của bạn</h1>
          <p>Các đơn hàng đang chờ xác nhận của bạn</p>
        </div>
        <CartComponent user={user} />
      </main>
    </div>
  );
}
