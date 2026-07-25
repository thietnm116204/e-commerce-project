import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartAsync } from '../../../../shared/store/cartSlice';
import './ProductComponent.css';
import { categoryApi } from '../../api/categoryApi';
import { brandApi } from '../../api/brandApi';
import { productApi } from '../../api/productApi';
import { orderApi } from '../../api/orderApi';
import Toast from '../../../../shared/components/Toast';
import Loading from '../../../../shared/components/Loading/Loading';

export default function ProductComponent() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [expandedCats, setExpandedCats] = useState({});
  const [selectedCats, setSelectedCats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortOrder, setSortOrder] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [toasts, setToasts] = useState([]);
  const user = useSelector((state) => state.auth.user);

  const addToast = (type, message) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isCategoryGroupExpanded, setIsCategoryGroupExpanded] = useState(true);
  const [isBrandGroupExpanded, setIsBrandGroupExpanded] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getCategoryTree();
        if (res?.data) {
          setCategories(res.data);
          
          const queryParams = new URLSearchParams(location.search);
          const activeCatId = queryParams.get('category');
          
          const initialExpanded = {};
          const initialSelected = [];
          
          if (activeCatId) {
            let isParent = false;
            res.data.forEach(cat => {
              if (cat.categoryId === activeCatId) {
                initialExpanded[cat.categoryId] = true;
                if (cat.children && cat.children.length > 0) {
                  isParent = true;
                  cat.children.forEach(child => initialSelected.push(child.categoryId));
                }
              } else if (cat.children && cat.children.some(c => c.categoryId === activeCatId)) {
                initialExpanded[cat.categoryId] = true;
              }
            });
            if (!isParent) {
              initialSelected.push(activeCatId);
            }
          }
          
          setExpandedCats(initialExpanded);
          setSelectedCats(initialSelected);
          
          // Gọi API fetch products luôn sau khi đã có categories và selectedCats
          fetchProducts(0, initialSelected, res.data);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch root categories:", error);
        setLoading(false);
      }
    };
    
    const fetchBrands = async () => {
      try {
        const res = await brandApi.getAllBrands();
        if (res?.data) {
          setBrands(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch brands:", error);
      }
    };
    
    fetchCategories();
    fetchBrands();
  }, [location.search]);

  const fetchProducts = async (page = 0, initialCats = null) => {
    try {
      setLoading(true);
      const catsToUse = initialCats !== null ? initialCats : selectedCats;
      
      const payload = {
        page: page,
        size: 9
      };

      if (searchQuery) payload.productName = searchQuery;
      if (selectedBrands.length > 0) {
        payload.brandIds = selectedBrands; 
        payload.brandId = selectedBrands[0]; 
      }
      if (catsToUse.length > 0) {
        payload.categoryIds = catsToUse;
        payload.categoryId = catsToUse[0]; // Gửi thêm categoryId dự phòng trường hợp backend chỉ nhận 1
      }
      
      if (minPrice > 0) payload.minPrice = minPrice;
      if (maxPrice < 10000000) payload.maxPrice = maxPrice;

      const res = await productApi.searchHomeProducts(payload);
      if (res?.data) {
        setProducts(res.data.content || []);
        setTotalProducts(res.data.totalElements || 0);
        setTotalPages(res.data.totalPages || 1);
        setCurrentPage(res.data.pageNo || 0);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Không tự động fetch ở đây nữa vì fetchCategories sẽ gọi fetchProducts
  }, []);

  const handleMinPriceChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const val = parseInt(rawValue, 10);
    setMinPrice(isNaN(val) ? 0 : val);
  };

  const handleMinPriceBlur = () => {
    if (minPrice > maxPrice) {
      setMinPrice(0);
    } else if (minPrice < 0) {
      setMinPrice(0);
    }
  };

  const handleMaxPriceChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const val = parseInt(rawValue, 10);
    setMaxPrice(isNaN(val) ? 0 : val);
  };

  const handleMaxPriceBlur = () => {
    if (maxPrice < minPrice) {
      setMaxPrice(10000000);
    } else if (maxPrice > 10000000) {
      setMaxPrice(10000000);
    }
  };

  const toggleCategory = (categoryId) => {
    setExpandedCats(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCats(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  const handleParentCategoryClick = (cat) => {
    const childIds = cat.children.map(c => c.categoryId);
    const allSelected = childIds.every(id => selectedCats.includes(id));
    if (allSelected) {
      setSelectedCats(prev => prev.filter(id => !childIds.includes(id)));
    } else {
      setSelectedCats(prev => {
        const newSet = new Set(prev);
        childIds.forEach(id => newSet.add(id));
        return Array.from(newSet);
      });
    }
  };

  const handleBrandChange = (brandId) => {
    setSelectedBrands(prev => 
      prev.includes(brandId) 
        ? prev.filter(id => id !== brandId) 
        : [...prev, brandId]
    );
  };

  return (
    <div className="product-layout">
      
      {/* SIDEBAR BỘ LỌC */}
      <aside className="product-sidebar">
        <h2 className="sidebar-title">Bộ lọc</h2>

        {/* Tìm kiếm */}
        <div className="filter-group" style={{ marginBottom: '16px', paddingBottom: '16px' }}>
          <div className="search-input-wrapper">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Tìm kiếm sản phẩm..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Danh mục */}
        <div className="filter-group">
          <div 
            className="filter-title-wrapper" 
            onClick={() => setIsCategoryGroupExpanded(!isCategoryGroupExpanded)} 
            style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', alignItems: 'center', marginBottom: isCategoryGroupExpanded ? '12px' : '0' }}
          >
            <h3 className="filter-title" style={{ marginBottom: 0 }}>Danh mục</h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isCategoryGroupExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          
          {isCategoryGroupExpanded && (
            <div className="filter-group-content">
              {categories.length > 0 ? categories.map(cat => {
            const hasChildren = cat.children && cat.children.length > 0;
            const isExpanded = expandedCats[cat.categoryId];

            return (
              <div className={`filter-item ${hasChildren && isExpanded ? 'has-children expanded' : ''}`} key={cat.categoryId}>
                <div className="filter-header">
                  {hasChildren ? (
                    <div 
                      className="checkbox-label" 
                      style={{ paddingLeft: 0, fontWeight: '600', color: '#111827' }} 
                      onClick={() => handleParentCategoryClick(cat)}
                    >
                      <span className="label-text">{cat.categoryName}</span>
                    </div>
                  ) : (
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={selectedCats.includes(cat.categoryId)}
                        onChange={() => handleCategoryChange(cat.categoryId)}
                      />
                      <span className="checkmark"></span>
                      <span className="label-text">{cat.categoryName}</span>
                    </label>
                  )}
                  
                  {hasChildren && (
                    <button 
                      className={`toggle-btn ${isExpanded ? 'expanded' : ''}`} 
                      onClick={() => toggleCategory(cat.categoryId)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                  )}
                </div>
                
                {hasChildren && isExpanded && (
                  <div className="children-list">
                    {cat.children.map(child => (
                      <label className="checkbox-label" key={child.categoryId}>
                        <input 
                          type="checkbox" 
                          checked={selectedCats.includes(child.categoryId)}
                          onChange={() => handleCategoryChange(child.categoryId)}
                        />
                        <span className="checkmark"></span>
                        <span className="label-text">{child.categoryName}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          }) : (
            <div style={{fontSize: '13px', color: '#6B7280'}}>Đang tải...</div>
          )}
            </div>
          )}
        </div>

        {/* Thương hiệu */}
        <div className="filter-group">
          <div 
            className="filter-title-wrapper" 
            onClick={() => setIsBrandGroupExpanded(!isBrandGroupExpanded)} 
            style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', alignItems: 'center', marginBottom: isBrandGroupExpanded ? '12px' : '0' }}
          >
            <h3 className="filter-title" style={{ marginBottom: 0 }}>Thương hiệu</h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isBrandGroupExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          
          {isBrandGroupExpanded && (
            <div className="filter-group-content">
              {brands.length > 0 ? brands.map(brand => (
            <div className="filter-item" key={brand.brandId}>
              <label className="checkbox-label brand-label">
                <input 
                  type="checkbox" 
                  checked={selectedBrands.includes(brand.brandId)}
                  onChange={() => handleBrandChange(brand.brandId)}
                />
                <span className="checkmark"></span>
                {brand.brandLogo && (
                  <img src={brand.brandLogo} alt={brand.brandName} className="brand-logo-icon" />
                )}
                <span className="label-text">{brand.brandName}</span>
              </label>
            </div>
          )) : (
            <div style={{fontSize: '13px', color: '#6B7280'}}>Đang tải...</div>
          )}
            </div>
          )}
        </div>

        {/* Khoảng giá */}
        <div className="filter-group">
          <h3 className="filter-title">Khoảng giá</h3>
          
          <div className="price-inputs">
            <div className="price-input-wrapper">
              <input 
                type="text" 
                value={new Intl.NumberFormat('vi-VN').format(minPrice)} 
                onChange={handleMinPriceChange}
                onBlur={handleMinPriceBlur}
                className="price-input" 
              />
              <span className="price-suffix">đ</span>
            </div>
            <div className="price-input-wrapper">
              <input 
                type="text" 
                value={new Intl.NumberFormat('vi-VN').format(maxPrice)} 
                onChange={handleMaxPriceChange}
                onBlur={handleMaxPriceBlur}
                className="price-input" 
              />
              <span className="price-suffix">đ</span>
            </div>
          </div>

          <div className="price-slider-container">
            <div className="slider-track-bg"></div>
            <div className="slider-track-active" style={{
              left: `${(minPrice / 10000000) * 100}%`,
              right: `${100 - (maxPrice / 10000000) * 100}%`
            }}></div>
            <input 
              type="range" 
              min="0" 
              max="10000000" 
              value={minPrice} 
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (val <= maxPrice) setMinPrice(val);
              }} 
              className="range-min" 
            />
            <input 
              type="range" 
              min="0" 
              max="10000000" 
              value={maxPrice} 
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (val >= minPrice) setMaxPrice(val);
              }} 
              className="range-max" 
            />
          </div>
        </div>

        <div className="filter-actions">
          <button className="btn-apply-filter" onClick={() => fetchProducts(0)}>Áp dụng</button>
          <button className="btn-clear-filter" onClick={() => {
            setSearchQuery("");
            setSelectedCats([]);
            setSelectedBrands([]);
            setMinPrice(0);
            setMaxPrice(10000000);
          }}>Xóa bộ lọc</button>
        </div>
      </aside>

      {/* NỘI DUNG CHÍNH */}
      <div className="product-content">
        
        {/* Topbar */}
        <div className="product-topbar">
          <div className="topbar-left">
            <span className="product-count"><b>{totalProducts}</b> sản phẩm</span>
            <div className="active-filters">
              {selectedCats.map(catId => {
                // Find category name
                let catName = "";
                categories.forEach(c => {
                  if (c.categoryId === catId) catName = c.categoryName;
                  if (c.children) {
                    const child = c.children.find(child => child.categoryId === catId);
                    if (child) catName = child.categoryName;
                  }
                });
                return (
                  <span className="filter-chip" key={catId} onClick={() => handleCategoryChange(catId)}>
                    {catName} ✕
                  </span>
                )
              })}
              {selectedBrands.map(brandId => {
                const brand = brands.find(b => b.brandId === brandId);
                return brand ? (
                  <span className="filter-chip" key={brandId} onClick={() => handleBrandChange(brandId)}>
                    {brand.brandName} ✕
                  </span>
                ) : null;
              })}
            </div>
          </div>
          <div className="topbar-right">
            <div className="sort-dropdown">
              Phổ biến nhất <span className="arrow-down"></span>
            </div>
            <div className="view-toggles">
              <button className="view-btn active">▦</button>
              <button className="view-btn">☰</button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="product-grid">
            {[...Array(9)].map((_, idx) => (
              <div className="product-card" key={`skeleton-${idx}`}>
                <div className="card-thumb skeleton-box" style={{ borderRadius: '12px' }}></div>
                <div className="card-info">
                  <div className="skeleton-box" style={{ width: '40%', height: '14px', marginBottom: '8px', borderRadius: '4px' }}></div>
                  <div className="skeleton-box" style={{ width: '80%', height: '20px', marginBottom: '8px', borderRadius: '4px' }}></div>
                  <div className="skeleton-box" style={{ width: '60%', height: '14px', marginBottom: '16px', borderRadius: '4px' }}></div>
                  <div className="card-bottom">
                    <div className="card-price-wrap" style={{ flex: 1 }}>
                      <div className="skeleton-box" style={{ width: '70%', height: '20px', borderRadius: '4px' }}></div>
                    </div>
                    <div className="skeleton-box" style={{ width: '32px', height: '32px', borderRadius: '50%' }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="empty-products" style={{ textAlign: 'center', padding: '60px 20px', color: '#6B7280' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👟</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Không có sản phẩm nào</h3>
            <p>Rất tiếc, chúng tôi không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn.<br/>Vui lòng thử lại với các tiêu chí khác.</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((p) => {
              const imageUrl = p.images?.find(i => i.isPrimary)?.productImageUrl || p.images?.[0]?.productImageUrl;
              return (
              <div className="product-card" key={p.productId} onClick={() => navigate(`/product/${p.productSlug}`)} style={{ cursor: 'pointer' }}>
                <div className="card-thumb">
                  {p.productSale > 0 && <span className="badge sale">-{p.productSale}%</span>}
                  <div className="heart-icon">♡</div>
                  {imageUrl ? (
                    <img src={imageUrl} alt={p.productName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <svg className="shoe-svg" viewBox="0 0 100 100" fill="none" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 62 C 12 54, 22 52, 28 48 C 36 43, 42 34, 52 32 C 62 30, 70 34, 76 40 C 82 46, 86 46, 92 44 C 96 48, 96 58, 92 62 C 82 66, 34 66, 12 62 Z"/>
                      <line x1="12" y1="62" x2="94" y2="62"/>
                    </svg>
                  )}
                </div>
                <div className="card-info">
                  <div className="card-brand">{p.brandName}</div>
                  <div className="card-name">{p.productName}</div>
                  <div className="card-rating">
                    <span className="stars">★★★★★</span>
                    <span className="rating-score">5.0</span>
                    <span className="review-count">(0)</span>
                  </div>
                  <div className="card-bottom">
                    <div className="card-price-wrap">
                      <span className="card-price">{new Intl.NumberFormat('vi-VN').format(p.productPrice)}đ</span>
                      {p.productQuantity !== undefined && p.productQuantity !== null && (
                        <span className={`card-quantity ${p.productQuantity === 0 ? 'out-of-stock' : ''}`}>
                          {p.productQuantity === 0 ? 'Hết hàng' : `Còn ${p.productQuantity} sản phẩm`}
                        </span>
                      )}
                    </div>
                    <button 
                      className="card-add-btn" 
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!user) {
                          addToast("error", "Vui lòng đăng nhập để thêm vào giỏ hàng!");
                          return;
                        }
                        try {
                          await dispatch(addToCartAsync({ productId: p.productId, quantity: 1 })).unwrap();
                          addToast("success", "Đã thêm sản phẩm vào giỏ hàng!");
                        } catch (err) {
                          addToast("error", err || "Lỗi thêm giỏ hàng!");
                        }
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="product-pagination">
            <button 
              className="page-btn prev" 
              onClick={() => { if(currentPage > 0) fetchProducts(currentPage - 1) }}
              disabled={currentPage === 0}
            >‹</button>
            
            {[...Array(totalPages)].map((_, idx) => (
              <button 
                key={idx} 
                className={`page-btn ${currentPage === idx ? 'active' : ''}`}
                onClick={() => fetchProducts(idx)}
              >
                {idx + 1}
              </button>
            ))}
            
            <button 
              className="page-btn next" 
              onClick={() => { if(currentPage < totalPages - 1) fetchProducts(currentPage + 1) }}
              disabled={currentPage === totalPages - 1}
            >›</button>
          </div>
        )}
      </div>

      <div className="product-component-toast-container">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            type={t.type}
            message={t.message}
            onClose={() => removeToast(t.id)}
          />
        ))}
      </div>
    </div>
  );
}
