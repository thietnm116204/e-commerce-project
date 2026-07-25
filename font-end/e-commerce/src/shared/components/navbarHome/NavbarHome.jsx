import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../../modules/auth/store/authSlice';
import { selectCartCount, fetchCart } from '../../../shared/store/cartSlice';
import { categoryApi } from '../../../modules/home/api/categoryApi';
import './NavbarHome.css';

// Import icons
import onlineShoppingIcon from '../../../assets/icons/online-shopping.png';
import notificationIcon from '../../../assets/icons/notification.png';
import avatarNotIcon from '../../../assets/icons/avatar-not.png';

export default function NavbarHome() {
  const { user } = useSelector((state) => state.auth);
  const cartCount = useSelector(selectCartCount);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const [categories, setCategories] = useState([]);

  const handleLogout = () => {
    dispatch(logout());
    setIsDropdownOpen(false);
    // Có thể navigate về /login hoặc ở lại trang chủ tuỳ ý
  };

  // Fetch root categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getCategoryTree();
        if (res?.data) {
          setCategories(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch root categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch cart data when user is logged in
  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [user, dispatch]);

  // Click ra ngoài để đóng dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Lấy kí tự đầu của tên để làm avatar chữ nếu không có avatar
  const getInitial = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="navbar-home-wrapper">
      <nav className="navbar-home">
        <div className="navbar-home-left">
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isMobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </>
              )}
            </svg>
          </button>
          <Link to="/" className="logo">mova.</Link>
        </div>
        
        <ul className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
          <li><Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Trang chủ</Link></li>
          <li><Link to="/product" onClick={() => setIsMobileMenuOpen(false)}>Sản Phẩm</Link></li>
          {categories.map((cat) => (
            <li key={cat.categoryId}>
              <Link to={`/product?category=${cat.categoryId}`} onClick={() => setIsMobileMenuOpen(false)}>{cat.categoryName}</Link>
            </li>
          ))}
        </ul>
        
        <div className="nav-right">
          {/* Nút giỏ hàng */}
          <div className="icon-btn" onClick={() => navigate('/cart')} style={{ cursor: 'pointer' }}>
            <img src={onlineShoppingIcon} alt="Shopping Cart" />
            {cartCount > 0 && <span className="dot">{cartCount}</span>}
          </div>
          
          {/* Nút thông báo */}
          <div className="icon-btn">
            <img src={notificationIcon} alt="Notifications" />
          </div>
          
          {/* User / Avatar Dropdown */}
          <div className="user-dropdown-container" ref={dropdownRef}>
            <div 
              className="icon-btn" 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{ overflow: 'hidden' }}
            >
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="User Avatar" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = avatarNotIcon; }}
                />
              ) : (
                <img src={avatarNotIcon} alt="Default Avatar" />
              )}
            </div>

            {/* Menu Dropdown */}
            {user && (
              <div className={`user-dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
                <div className="dropdown-user-info">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="Avatar" 
                      className="dropdown-avatar" 
                      onError={(e) => { 
                        e.target.style.display = 'none'; 
                        e.target.nextSibling.style.display = 'flex'; 
                      }} 
                    />
                  ) : null}
                  
                  <div 
                    className="dropdown-avatar" 
                    style={{ display: user.avatar ? 'none' : 'flex', background: '#5452F6' }}
                  >
                    {getInitial(user.userFullName || user.userName)}
                  </div>
                  
                  <div className="dropdown-user-details">
                    <span className="dropdown-username">{user.userFullName || user.userName || 'Người dùng'}</span>
                    <span className="dropdown-email">{user.userEmail || 'email@example.com'}</span>
                  </div>
                </div>
                
                <div className="dropdown-divider"></div>
                
                <Link to="/profile" className="dropdown-action-btn" onClick={() => setIsDropdownOpen(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span>Hồ sơ cá nhân</span>
                </Link>

                <Link to="/orders" className="dropdown-action-btn" onClick={() => setIsDropdownOpen(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path>
                    <rect x="9" y="3" width="6" height="4" rx="1"></rect>
                    <line x1="9" y1="12" x2="15" y2="12"></line>
                    <line x1="9" y1="16" x2="13" y2="16"></line>
                  </svg>
                  <span>Đơn hàng của tôi</span>
                </Link>

                <button className="dropdown-action-btn logout-btn" onClick={handleLogout}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
            
            {/* Menu Dropdown cho người chưa đăng nhập (Tuỳ chọn) */}
            {!user && (
              <div className={`user-dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Link to="/login" className="dropdown-action-btn" onClick={() => setIsDropdownOpen(false)}>
                    <span>Đăng nhập</span>
                  </Link>
                  <Link to="/register" className="dropdown-action-btn" onClick={() => setIsDropdownOpen(false)}>
                    <span>Đăng ký</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
