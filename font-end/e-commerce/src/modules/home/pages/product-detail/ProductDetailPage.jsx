import React from 'react';
import NavbarHome from '../../../../shared/components/navbarHome/NavbarHome';
import ProductDetailComponent from '../../components/product-detail/ProductDetailComponent';
import './ProductDetailPage.css'; // Optional, but good for page layout

export default function ProductDetailPage() {
  return (
    <div className="product-detail-page-container">
      <NavbarHome />
      <main className="product-detail-page-main">
        <ProductDetailComponent />
      </main>
    </div>
  );
}
