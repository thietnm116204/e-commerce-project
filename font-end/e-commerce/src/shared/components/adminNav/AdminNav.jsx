import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ADMIN_NAV_ITEMS, findAdminRoute } from "../../../modules/admin/config/adminNavigation";
import "./AdminNav.css";

import downArrow from "../../../assets/icons/down-arrow.png";
import upArrow from "../../../assets/icons/arrow-up.png";
import productIcon from "../../../assets/icons/product.png";

/** Menu item có submenu */
function NavItemAccordion({ icon: Icon, label, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);

    useEffect(() => {
        setOpen(defaultOpen);
    }, [defaultOpen]);
    return (
        <div className="nav-accordion">
            <button
                className={`nav-item${open ? " active" : ""}`}
                onClick={() => setOpen((p) => !p)}
            >
                <Icon className="nav-item__icon" />
                <span className="nav-item__label">{label}</span>
                <img
                    src={open ? upArrow : downArrow}
                    alt={open ? "thu gọn" : "mở rộng"}
                    className="nav-item__chevron nav-item__chevron--img"
                />
            </button>
            <div className={`nav-submenu${open ? " nav-submenu--open" : ""}`}>
                {children}
            </div>
        </div>
    );
}

/** Menu item đơn giản */
function NavItem({ icon: Icon, label, active, onClick }) {
    return (
        <button className={`nav-item${active ? " active" : ""}`} onClick={onClick}>
            <Icon className="nav-item__icon" />
            <span className="nav-item__label">{label}</span>
        </button>
    );
}

/* ── Inline SVG icons (không cần thư viện) ── */
const IconDashboard = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
);

const IconCharts = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M3 3v18h18" />
        <path d="M7 13l4-4 3 3 5-5" />
    </svg>
);

const IconProduct = (props) => (
    <img src={productIcon} alt="product" {...props} style={{ filter: "brightness(0) invert(1)", objectFit: "contain" }} />
);

/** AdminNav — navigation menu dùng chung cho admin sidebar */
export default function AdminNav({ onMenuSelect }) {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;

    const activePath = useMemo(() => findAdminRoute(currentPath)?.path || currentPath, [currentPath]);

    const isActive = (path) => activePath === path || currentPath === path;

    return (
        <nav className="nav">
            {ADMIN_NAV_ITEMS.map((item) => {
                if (item.path) {
                    return (
                        <NavItem
                            key={item.path}
                            icon={IconDashboard}
                            label={item.label}
                            active={isActive(item.path)}
                            onClick={() => navigate(item.path)}
                        />
                    );
                }

                const sectionActive = item.children.some((child) => isActive(child.path));

                return (
                    <NavItemAccordion
                        key={item.label}
                        icon={item.label === "Quản lý sản phẩm" ? IconProduct : IconCharts}
                        label={item.label}
                        defaultOpen={sectionActive}
                    >
                        {item.children.map((child) => (
                            <button
                                key={child.path}
                                className={`nav-subitem${isActive(child.path) ? " active" : ""}`}
                                onClick={() => navigate(child.path)}
                            >
                                {child.label}
                            </button>
                        ))}
                    </NavItemAccordion>
                );
            })}
        </nav>
    );
}
