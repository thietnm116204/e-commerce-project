import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "../../../shared/components/adminSidebar/AdminSidebar";
import AdminNavbar from "../../../shared/components/adminNavbar/AdminNavbar";
import Breadcrumb from "../../../shared/components/breadcrumb/Breadcrumb";
import { getAdminBreadcrumb } from "../config/adminNavigation";
import "./AdminLayout.css";

/**
 * AdminLayout — khung giao diện admin dùng chung.
 * Sidebar (trái) + Navbar (trên) + Breadcrumb + <Outlet />.
 * Không biết gì về nội dung các trang bên trong.
 */
export default function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    const breadcrumbItems = getAdminBreadcrumb(location.pathname);
    const title = breadcrumbItems.at(-1)?.label || "Dashboard";

    const handleBreadcrumbClick = (item) => {
        if (item?.path) navigate(item.path);
    };

    return (
        <div className="admin-layout">
            {/* Sidebar cố định bên trái */}
            <AdminSidebar
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen((v) => !v)}
            />

            {/* Vùng nội dung bên phải: Navbar + Content */}
            <div className="admin-layout__main">

                {/* Top navbar */}
                <AdminNavbar
                    onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
                />

                {/* Nội dung cuộn được */}
                <div className="admin-layout__content">
                    {/* Header trang: breadcrumb trên, tiêu đề dưới */}
                    <div className="admin-layout__page-header">
                        <Breadcrumb
                            items={breadcrumbItems}
                            onItemClick={handleBreadcrumbClick}
                        />
                        <h1 className="admin-layout__page-title">{title}</h1>
                    </div>

                    {/* React Router điền page vào đây */}
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
