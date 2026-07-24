import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

import NavbarHome from '../../../../shared/components/navbarHome/NavbarHome';
import { categoryApi } from '../../api/categoryApi';

export default function HomePage() {
  const [categories, setCategories] = useState([]);

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

  const getCategoryIcon = (name) => {
    if (!name) return '✨';
    const n = name.toLowerCase();
    if (n.includes('nam')) return '🏃‍♂️';
    if (n.includes('nữ')) return '🏃‍♀️';
    if (n.includes('trẻ em')) return '🧸';
    if (n.includes('phụ kiện')) return '🎒';
    return '✨';
  };

  return (
    <div className="home-container">
      <NavbarHome />

      <section className="hero">
        <svg className="hero-shoe" viewBox="0 0 100 100" fill="none" stroke="#F7F7F5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 62 C 8 54, 18 52, 24 48 C 32 43, 38 34, 48 32 C 58 30, 66 34, 72 40 C 78 46, 82 46, 88 44 C 92 48, 92 58, 88 62 C 78 66, 30 66, 8 62 Z"/>
          <path d="M24 48 L 30 40 M38 44 L 44 36 M52 42 L 58 34"/>
          <line x1="8" y1="62" x2="90" y2="62"/>
        </svg>

        <div className="hero-copy">
          <div className="pill"><span className="flare"></span>Bộ sưu tập hè 2026 đã lên kệ</div>
          <h1 className="display">Bước đi<br/>theo <span>nhịp</span><br/>của bạn.</h1>
          <p>Giày chính hãng ASICS, PUMA và các thương hiệu thể thao hàng đầu — chọn đôi hợp với sải bước của bạn.</p>
          <div className="btn-row">
            <Link to="#" className="btn primary">Mua ngay →</Link>
            <Link to="#" className="btn ghost">Xem bộ sưu tập</Link>
          </div>
          <div className="stat-row">
            <div className="stat"><b>2.4k+</b><span>Sản phẩm</span></div>
            <div className="stat"><b>98%</b><span>Đánh giá tích cực</span></div>
            <div className="stat"><b>24h</b><span>Giao hàng nhanh</span></div>
          </div>
        </div>

        <div className="float-tag price">
          <div>
            <b>2.590.000đ</b>
            <span>Asics Gel-Kayano 30</span>
          </div>
        </div>
        <div className="float-tag rating">★ 4.9 (2.1k đánh giá)</div>

        <div className="hero-dots">
          <span className="active"></span><span></span><span></span>
        </div>
      </section>

      <div className="cats">
        {categories.length > 0 ? (
          categories.map((cat) => (
            <Link to={`/product?category=${cat.categoryId}`} className="cat-card" key={cat.categoryId}>
              <div className="icon">{getCategoryIcon(cat.categoryName)}</div>
              <div>
                <div className="name">{cat.categoryName}</div>
                <div className="count">
                  {cat.children ? cat.children.length : 0} danh mục con
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div style={{ textAlign: 'center', width: '100%', color: '#9CA3AF' }}>Đang tải danh mục...</div>
        )}
      </div>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Bán chạy nhất</h2>
            <p>Được yêu thích nhất trong tuần qua</p>
          </div>
          <Link to="#" className="see-all">Xem tất cả →</Link>
        </div>
        <div className="grid">
          <div className="card">
            <div className="thumb">
              <span className="badge new">Mới</span>
              <div className="heart">♡</div>
              <svg viewBox="0 0 100 100" fill="none" stroke="#14171F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 62 C 8 54, 18 52, 24 48 C 32 43, 38 34, 48 32 C 58 30, 66 34, 72 40 C 78 46, 82 46, 88 44 C 92 48, 92 58, 88 62 C 78 66, 30 66, 8 62 Z"/>
                <line x1="8" y1="62" x2="90" y2="62"/>
              </svg>
            </div>
            <div className="brand">Asics</div>
            <div className="pname">Gel-Kayano 30</div>
            <div className="price-row">
              <div><span className="price">2.590.000đ</span></div>
              <button className="add-btn">+</button>
            </div>
          </div>

          <div className="card">
            <div className="thumb">
              <span className="badge sale">-20%</span>
              <div className="heart">♡</div>
              <svg viewBox="0 0 100 100" fill="none" stroke="#14171F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 62 C 8 54, 18 52, 24 48 C 32 43, 38 34, 48 32 C 58 30, 66 34, 72 40 C 78 46, 82 46, 88 44 C 92 48, 92 58, 88 62 C 78 66, 30 66, 8 62 Z"/>
                <line x1="8" y1="62" x2="90" y2="62"/>
              </svg>
            </div>
            <div className="brand">Puma</div>
            <div className="pname">Velocity Nitro 3</div>
            <div className="price-row">
              <div><span className="price">1.520.000đ</span><span className="old-price">1.900.000đ</span></div>
              <button className="add-btn">+</button>
            </div>
          </div>

          <div className="card">
            <div className="thumb">
              <div className="heart">♡</div>
              <svg viewBox="0 0 100 100" fill="none" stroke="#14171F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 62 C 8 54, 18 52, 24 48 C 32 43, 38 34, 48 32 C 58 30, 66 34, 72 40 C 78 46, 82 46, 88 44 C 92 48, 92 58, 88 62 C 78 66, 30 66, 8 62 Z"/>
                <line x1="8" y1="62" x2="90" y2="62"/>
              </svg>
            </div>
            <div className="brand">Asics</div>
            <div className="pname">Novablast 4</div>
            <div className="price-row">
              <div><span className="price">2.190.000đ</span></div>
              <button className="add-btn">+</button>
            </div>
          </div>

          <div className="card">
            <div className="thumb">
              <span className="badge new">Sắp ra mắt</span>
              <div className="heart">♡</div>
              <svg viewBox="0 0 100 100" fill="none" stroke="#14171F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 62 C 8 54, 18 52, 24 48 C 32 43, 38 34, 48 32 C 58 30, 66 34, 72 40 C 78 46, 82 46, 88 44 C 92 48, 92 58, 88 62 C 78 66, 30 66, 8 62 Z"/>
                <line x1="8" y1="62" x2="90" y2="62"/>
              </svg>
            </div>
            <div className="brand">Puma</div>
            <div className="pname">Suede Classic XXI</div>
            <div className="price-row">
              <div><span className="price">1.290.000đ</span></div>
              <button className="add-btn">+</button>
            </div>
          </div>

        </div>
      </section>

      <section className="promo">
        <div className="promo-copy">
          <div className="eyebrow display">ƯU ĐÃI THÀNH VIÊN</div>
          <h3>Giảm 10% cho<br/>đơn hàng đầu tiên</h3>
          <p>Đăng ký tài khoản để nhận mã giảm giá và cập nhật hàng mới về trước tiên.</p>
          <Link to="#" className="btn" style={{ background: 'var(--accent)', color: '#fff' }}>Đăng ký ngay →</Link>
        </div>
        <div className="promo-visual">
          <svg viewBox="0 0 100 100" fill="none" stroke="#DCF454" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 62 C 8 54, 18 52, 24 48 C 32 43, 38 34, 48 32 C 58 30, 66 34, 72 40 C 78 46, 82 46, 88 44 C 92 48, 92 58, 88 62 C 78 66, 30 66, 8 62 Z"/>
            <path d="M24 48 L 30 40 M38 44 L 44 36 M52 42 L 58 34"/>
            <line x1="8" y1="62" x2="90" y2="62"/>
          </svg>
        </div>
      </section>

      <footer>
        <div className="foot-grid">
          <div>
            <div className="logo" style={{ marginBottom: '12px' }}>mova.</div>
            <p style={{ fontSize: '13px', color: 'var(--muted)', maxWidth: '260px', lineHeight: '1.6' }}>Cửa hàng giày thể thao chính hãng — mang đến những đôi giày phù hợp với từng sải bước.</p>
          </div>
          <div>
            <h4>Danh mục</h4>
            <ul>
              <li><Link to="#">Giày chạy</Link></li>
              <li><Link to="#">Bóng rổ</Link></li>
              <li><Link to="#">Lifestyle</Link></li>
            </ul>
          </div>
          <div>
            <h4>Hỗ trợ</h4>
            <ul>
              <li><Link to="#">Theo dõi đơn hàng</Link></li>
              <li><Link to="#">Đổi trả</Link></li>
              <li><Link to="#">Liên hệ</Link></li>
            </ul>
          </div>
          <div>
            <h4>Cửa hàng</h4>
            <ul>
              <li><Link to="#">Về chúng tôi</Link></li>
              <li><Link to="#">Tuyển dụng</Link></li>
              <li><Link to="#">Blog</Link></li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 Mova Sneaker Store</span>
          <span>Made in Ho Chi Minh City</span>
        </div>
      </footer>
    </div>
  );
}
