import React from 'react';
import NavbarHome from '../../../../shared/components/navbarHome/NavbarHome';
import ProductComponent from '../../components/product-components/ProductComponent';
import './ProductPage.css';

export default function ProductPage() {
  return (
    <div className="product-page-container">
      <NavbarHome />
      <main className="product-page-main">
        <ProductComponent />
      </main>
    </div>
  );
}
