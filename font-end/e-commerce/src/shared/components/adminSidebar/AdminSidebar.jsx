import "./AdminSidebar.css";
import AdminNav from "../adminNav/AdminNav";

import logoIcon from "../../../assets/icons/logo.png";

export default function AdminSidebar({ isOpen, onMenuSelect }) {
    return (
        <aside className={`sidebar ${isOpen ? "" : "sidebar--closed"}`}>
            {/* Brand */}
            <div className="sidebar__brand">
                <img src={logoIcon} alt="logo" className="sidebar__brand-logo" />
                <span className="sidebar__brand-name">ModernAdmin</span>
            </div>

            {/* Navigation */}
            <AdminNav onMenuSelect={onMenuSelect} />
        </aside>
    );
}
