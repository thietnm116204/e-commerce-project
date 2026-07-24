/**
 * DashboardPage — trang /admin (index)
 * Hiển thị tổng quan hệ thống.
 */
export default function DashboardPage() {
    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "20px",
        }}>
            {[
                { label: "Tổng đơn hàng", value: "1,284", color: "#6366F1", icon: "📦" },
                { label: "Doanh thu tháng", value: "₫ 48.5M", color: "#10B981", icon: "💰" },
                { label: "Người dùng", value: "3,920", color: "#F59E0B", icon: "👥" },
                { label: "Danh mục", value: "42", color: "#EF4444", icon: "🗂️" },
            ].map((stat) => (
                <div key={stat.label} style={{
                    background: "#fff",
                    border: "1px solid #E2E8F0",
                    borderRadius: "16px",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                }}>
                    <span style={{ fontSize: 28 }}>{stat.icon}</span>
                    <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                    <div style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>{stat.label}</div>
                </div>
            ))}
        </div>
    );
}
