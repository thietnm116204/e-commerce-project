import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productApi } from "../../../api/productApi";
import ConfirmModal from "../../../../../shared/components/Modal/ConfirmModal";
import Breadcrumb from "../../../../../shared/components/breadcrumb/Breadcrumb";
import InputField from "../../../../../shared/components/InputField/InputField";
import SelectField from "../../../../../shared/components/selectField/SelectField";
import Button from "../../../../../shared/components/Button/Button";
import AdminTable from "../../../../../shared/components/AdminTable/AdminTable";
import Toast from "../../../../../shared/components/Toast";
import Loading from "../../../../../shared/components/Loading/Loading";
import searchIcon from "../../../../../assets/icons/search.png";
import editIcon from "../../../../../assets/icons/edit.svg";
import trashIcon from "../../../../../assets/icons/xoa.png";
import "./ProductInfoComponent.css";

const statusOptions = [
    { value: "", label: "-- Tất cả trạng thái --" },
    { value: "true", label: "Kích hoạt" },
    { value: "false", label: "Vô hiệu hoá" },
];

export default function ProductInfoComponent() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState({
        productName: "",
        brandId: "",
        categoryId: "",
        isActive: "",
        minPrice: "",
        maxPrice: "",
    });

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Modal states
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedProductToDelete, setSelectedProductToDelete] = useState(null);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);

    // Modals & Toasts
    const [toasts, setToasts] = useState([]);

    const addToast = (type, message) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, type, message }]);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const fetchInitData = async () => {
        try {
            const res = await productApi.getInitData();
            if (res.data?.data) {
                setBrands(res.data.data.brands || []);
                setCategories(res.data.data.categories || []);
            }
        } catch (error) {
            console.error("Failed to fetch init data:", error);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const payload = {
                page: 0,
                size: 100
            };

            if (filter.productName) payload.productName = filter.productName;
            if (filter.brandId) payload.brandId = filter.brandId;
            if (filter.categoryId) payload.categoryId = filter.categoryId;
            if (filter.isActive !== "") payload.isActive = filter.isActive === "true";
            if (filter.minPrice && !isNaN(filter.minPrice)) payload.minPrice = Number(filter.minPrice);
            if (filter.maxPrice && !isNaN(filter.maxPrice)) payload.maxPrice = Number(filter.maxPrice);

            const res = await productApi.searchProducts(payload);
            const content = res?.data?.data?.content || [];

            // Map data for AdminTable
            const mappedData = content.map(item => ({
                ...item,
                id: item.productId
            }));

            setProducts(mappedData);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            const errMsg = error.response?.data?.message || error.message;
            addToast("error", `Lỗi khi tải danh sách sản phẩm: ${errMsg}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitData();
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilter((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => {
        fetchProducts();
    };

    const handleRefresh = () => {
        setFilter({
            productName: "",
            brandId: "",
            categoryId: "",
            isActive: "",
            minPrice: "",
            maxPrice: "",
        });
        // We need to wait for state to update, or pass empty filter manually
        setTimeout(() => {
            fetchProducts();
        }, 0);
    };

    const formatCurrency = (amount) => {
        if (amount == null) return "0đ";
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
    };

    const TABLE_COLUMNS = [
        {
            key: "images",
            label: "Hình ảnh",
            align: "center",
            render: (val) => {
                const img = val && val.length > 0 ? val[0].productImageUrl : null;
                return img
                    ? <img src={img} alt="Product" className="product-info__image" />
                    : <span className="product-info__none">—</span>;
            },
        },
        {
            key: "productName",
            label: "Tên sản phẩm",
        },
        {
            key: "brandName",
            label: "Thương hiệu",
            render: (val) => val || <span className="product-info__none">—</span>
        },
        {
            key: "categoryNames",
            label: "Danh mục",
            render: (val) => val && val.length > 0 ? val.join(", ") : <span className="product-info__none">—</span>
        },
        {
            key: "productPrice",
            label: "Giá bán",
            render: (val) => <span className="product-info__price">{formatCurrency(val)}</span>
        },
        {
            key: "isActive",
            label: "Trạng thái",
            align: "center",
            render: (val) => (
                <span className={`product-info__badge product-info__badge--${val ? 'active' : 'inactive'}`}>
                    {val ? "Kích hoạt" : "Vô hiệu hóa"}
                </span>
            ),
        }
    ];

    const handleDeleteClick = (row) => {
        setSelectedProductToDelete(row);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedProductToDelete) return;
        
        const id = selectedProductToDelete.productId || selectedProductToDelete.id;
        
        setLoading(true);
        setIsDeleteModalOpen(false);
        try {
            const res = await productApi.deleteProduct(id);
            if (res.data.code === 200 || res.data.code === 204) {
                addToast("success", "Đã xóa sản phẩm thành công!");
                fetchProducts(); // Tải lại danh sách
            } else {
                addToast("error", "Lỗi: " + (res.data.message || "Không xác định"));
            }
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm:", error);
            addToast("error", "Không thể xóa sản phẩm: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
            setSelectedProductToDelete(null);
        }
    };

    const TABLE_ACTIONS = [
        {
            label: "Sửa",
            icon: <img src={editIcon} alt="edit" className="adm-table-icon adm-table-icon--blue" />,
            onClick: (row) => navigate(`/admin/product_management/update/${row.productId || row.id}`),
            className: "adm-table-action-edit",
        },
        {
            label: "Xóa",
            icon: <img src={trashIcon} alt="delete" className="adm-table-icon adm-table-icon--red" />,
            onClick: handleDeleteClick,
            className: "adm-table-action-delete",
        },
    ];

    const brandOptions = [
        { value: "", label: "-- Tất cả thương hiệu --" },
        ...brands.map(b => ({ value: b.brandId, label: b.brandName }))
    ];

    const categoryOptions = [
        { value: "", label: "-- Tất cả danh mục --" },
        ...categories.map(c => ({ value: c.categoryId, label: c.categoryName }))
    ];

    return (
        <div className="product-info">
            {loading && <Loading overlay={true} text="Đang xử lý..." />}

            <div className="product-card">
                <h3 className="product-card__title">Lọc sản phẩm</h3>
                <div className="product-info__filters">
                    <InputField
                        label="Tên sản phẩm"
                        name="productName"
                        value={filter.productName}
                        onChange={handleChange}
                        placeholder="Nhập tên sản phẩm..."
                    />
                    <SelectField
                        label="Thương hiệu"
                        name="brandId"
                        value={filter.brandId}
                        onChange={handleChange}
                        options={brandOptions}
                    />
                    <SelectField
                        label="Danh mục"
                        name="categoryId"
                        value={filter.categoryId}
                        onChange={handleChange}
                        options={categoryOptions}
                    />
                    <SelectField
                        label="Trạng thái"
                        name="isActive"
                        value={filter.isActive}
                        onChange={handleChange}
                        options={statusOptions}
                    />
                    <InputField
                        label="Giá tối thiểu (VNĐ)"
                        name="minPrice"
                        type="number"
                        value={filter.minPrice}
                        onChange={handleChange}
                        placeholder="Từ..."
                    />
                    <InputField
                        label="Giá tối đa (VNĐ)"
                        name="maxPrice"
                        type="number"
                        value={filter.maxPrice}
                        onChange={handleChange}
                        placeholder="Đến..."
                    />
                </div>
                <div className="product-info__actions">
                    <Button variant="outline" onClick={handleRefresh}>
                        Làm mới
                    </Button>
                    <Button variant="blue" onClick={handleSearch}>
                        <img src={searchIcon} alt="search" className="product-info__btn-img-icon" />
                        Tìm kiếm
                    </Button>
                </div>
            </div>

            <div className="product-card" style={{ marginTop: "24px" }}>
                <AdminTable
                    columns={TABLE_COLUMNS}
                    data={products}
                    rowActions={TABLE_ACTIONS}
                    onRefresh={handleRefresh}
                    onDeleteRows={(ids) => {
                        addToast("info", `Tính năng xóa nhiều đang phát triển (ids: ${ids.join(', ')})`);
                    }}
                />
            </div>

            <div className="product-info-toast-container">
                {toasts.map((t) => (
                    <Toast
                        key={t.id}
                        type={t.type}
                        message={t.message}
                        onClose={() => removeToast(t.id)}
                    />
                ))}
            </div>
            {/* ── Confirm Delete Modal ── */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedProductToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                title={`Bạn có chắc chắn muốn xóa sản phẩm "${selectedProductToDelete?.productName || ''}" này hay không?`}
                message="Hành động này không thể hoàn tác."
                confirmText="Xóa"
                confirmVariant="danger"
            />
        </div>
    );
}
