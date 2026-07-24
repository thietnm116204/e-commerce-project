import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../modules/auth/store/authSlice";
import "./AdminNavbar.css";

/* ── Icons SVG ── */
const IconChevronDown = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

const IconLogout = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

const IconUser = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

/**
 * Avatar — hiện ảnh nếu có avatarUrl, fallback chữ cái đầu
 */
function UserAvatar({ avatarUrl, name, size = "sm" }) {
    const [imgError, setImgError] = useState(false);
    const letter = (name || "A").charAt(0).toUpperCase();
    const className = `admin-navbar__avatar admin-navbar__avatar--${size}`;

    if (avatarUrl && !imgError) {
        return (
            <img
                src={avatarUrl}
                alt={name}
                className={`${className} admin-navbar__avatar--img`}
                onError={() => setImgError(true)}
            />
        );
    }

    return <div className={className}>{letter}</div>;
}

export default function AdminNavbar({ onToggleSidebar }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef(null);

    // Lấy thông tin từ API response: userFullName, avatarUrl, userEmail
    const displayName = user?.userFullName || user?.userEmail || "Quản trị viên";
    const avatarUrl = user?.avatarUrl || null;
    const userEmail = user?.userEmail || "";

    /* Đóng dropdown khi click ngoài */
    useEffect(() => {
        function handleClickOutside(e) {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setShowUserMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    return (
        <header className="admin-navbar">
            {/* Trái: toggle sidebar */}
            <button
                className="admin-navbar__icon-btn admin-navbar__toggle"
                onClick={onToggleSidebar}
                title="Thu/mở sidebar"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
            </button>

            {/* Phải: user button */}
            <div className="admin-navbar__actions">
                <div className="admin-navbar__dropdown-wrap" ref={userMenuRef}>
                    <button
                        className={`admin-navbar__user-btn${showUserMenu ? " admin-navbar__user-btn--active" : ""}`}
                        onClick={() => setShowUserMenu((v) => !v)}
                    >
                        <UserAvatar avatarUrl={avatarUrl} name={displayName} size="sm" />
                        <span className="admin-navbar__username">{displayName}</span>
                        <span className={`admin-navbar__chevron${showUserMenu ? " admin-navbar__chevron--up" : ""}`}>
                            <IconChevronDown />
                        </span>
                    </button>

                    {showUserMenu && (
                        <div className="admin-navbar__dropdown admin-navbar__dropdown--user">
                            {/* Thông tin user */}
                            <div className="admin-navbar__user-info">
                                <UserAvatar avatarUrl={avatarUrl} name={displayName} size="lg" />
                                <div>
                                    <p className="admin-navbar__user-name">{displayName}</p>
                                    <p className="admin-navbar__user-role">{userEmail}</p>
                                </div>
                            </div>
                            <hr className="admin-navbar__divider" />
                            <button className="admin-navbar__menu-item">
                                <IconUser /> Hồ sơ cá nhân
                            </button>
                            <hr className="admin-navbar__divider" />
                            <button
                                className="admin-navbar__menu-item admin-navbar__menu-item--danger"
                                onClick={handleLogout}
                            >
                                <IconLogout /> Đăng xuất
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
