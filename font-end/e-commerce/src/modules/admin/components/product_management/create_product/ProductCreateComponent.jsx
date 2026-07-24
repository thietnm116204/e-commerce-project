import React, { useState, useRef, useEffect, useCallback } from "react";
import InputField from "../../../../../shared/components/InputField/InputField";
import SelectField from "../../../../../shared/components/selectField/SelectField";
import Button from "../../../../../shared/components/Button/Button";
import { axiosClient } from "../../../../../config/api";
import Toast from "../../../../../shared/components/Toast";
import Loading from "../../../../../shared/components/Loading/Loading";
import "./ProductCreateComponent.css";

import uploadIcon from "../../../../../assets/icons/upload.png";

// ── Tạo sản phẩm mặc định ──
const createDefaultProduct = () => ({
    id: Math.random().toString(36).substring(2, 9),
    productName: "",
    categoryId: "",
    brandId: "",
    price: "",
    productQuantity: "",
    description: "",
    images: [],
});

// ─────────────────────────────────────────────
// Sub-component: một card sản phẩm
// ─────────────────────────────────────────────
function ProductEntryCard({ index, product, onChange, onRemove, brands, categories, loadingInit, canRemove }) {
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);
    const editorRef = useRef(null);

    const execCmd = useCallback((command, value = null) => {
        editorRef.current?.focus();
        document.execCommand(command, false, value);
    }, []);

    const handleInsertLink = () => {
        const url = prompt("Nhập URL liên kết:");
        if (url) execCmd("createLink", url);
    };

    // ── Drag & Drop ──
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.length > 0) handleFiles(e.dataTransfer.files);
    };

    const handleFileChange = (e) => {
        if (e.target.files?.length > 0) handleFiles(e.target.files);
        // Reset input value để có thể chọn lại cùng file
        e.target.value = "";
    };

    const handleFiles = (files) => {
        const newImages = Array.from(files).map((file) => ({
            id: Math.random().toString(36).substring(2, 9),
            file,
            name: file.name,
            size: (file.size / 1024).toFixed(0) + " KB",
            url: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
        }));
        onChange("images", [...product.images, ...newImages]);
    };

    const removeImage = (id) => onChange("images", product.images.filter((img) => img.id !== id));
    const clearImages = () => onChange("images", []);

    const categoryOptions = [
        { value: "", label: "-- Chọn danh mục --" },
        ...categories.map((c) => ({ value: c.categoryId, label: c.categoryName })),
    ];

    const brandOptions = [
        { value: "", label: "-- Chọn thương hiệu --" },
        ...brands.map((b) => ({ value: b.brandId, label: b.brandName })),
    ];

    return (
        <div className="product-entry-card">
            {/* ── Header card ── */}
            <div className="product-entry-header">
                <div className="product-entry-header__left">
                    <span className="product-entry-badge">#{index + 1}</span>
                    <span className="product-entry-title">Sản phẩm {index + 1}</span>
                    {product.productName && (
                        <span className="product-entry-name-preview">— {product.productName}</span>
                    )}
                </div>
                {canRemove && (
                    <button className="product-entry-remove" onClick={onRemove} title="Xóa sản phẩm này">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                        Xóa
                    </button>
                )}
            </div>

            {/* ── Body: 2 cột ── */}
            <div className="product-entry-body">

                {/* CỘT TRÁI: Form thông tin */}
                <div className="product-entry__form">
                    <InputField
                        label="Tên sản phẩm"
                        placeholder="Ví dụ: Giày thể thao Nike Air Max"
                        value={product.productName}
                        onChange={(e) => onChange("productName", e.target.value)}
                    />

                    <SelectField
                        label="Danh mục"
                        value={product.categoryId}
                        onChange={(e) => onChange("categoryId", e.target.value)}
                        options={loadingInit ? [{ value: "", label: "Đang tải..." }] : categoryOptions}
                    />

                    <SelectField
                        label="Thương hiệu"
                        value={product.brandId}
                        onChange={(e) => onChange("brandId", e.target.value)}
                        options={loadingInit ? [{ value: "", label: "Đang tải..." }] : brandOptions}
                    />

                    <InputField
                        label="Giá (VNĐ)"
                        placeholder="Ví dụ: 1750000"
                        type="number"
                        min="1"
                        value={product.price}
                        onChange={(e) => onChange("price", e.target.value)}
                    />

                    <InputField
                        label="Số lượng"
                        placeholder="Ví dụ: 100"
                        type="number"
                        min="0"
                        value={product.productQuantity}
                        onChange={(e) => onChange("productQuantity", e.target.value)}
                    />

                    {/* Rich Text Editor - Mô tả */}
                    <div className="input-field-wrapper">
                        <label className="input-field-label">Mô tả</label>
                        <div className="rich-editor">
                            <div className="rich-editor__toolbar">
                                <button type="button" className="rich-editor__btn" title="In đậm"
                                    onMouseDown={(e) => { e.preventDefault(); execCmd("bold"); }}>
                                    <b>B</b>
                                </button>
                                <button type="button" className="rich-editor__btn" title="In nghiêng"
                                    onMouseDown={(e) => { e.preventDefault(); execCmd("italic"); }}>
                                    <i>I</i>
                                </button>
                                <button type="button" className="rich-editor__btn" title="Danh sách có thứ tự"
                                    onMouseDown={(e) => { e.preventDefault(); execCmd("insertOrderedList"); }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="10" y1="6" x2="21" y2="6" />
                                        <line x1="10" y1="12" x2="21" y2="12" />
                                        <line x1="10" y1="18" x2="21" y2="18" />
                                        <path d="M4 6h1v4M4 6H3M6 10H3M3 14h1a1 1 0 0 1 0 2H3M5 18H3" />
                                    </svg>
                                </button>
                                <button type="button" className="rich-editor__btn" title="Danh sách không thứ tự"
                                    onMouseDown={(e) => { e.preventDefault(); execCmd("insertUnorderedList"); }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="9" y1="6" x2="20" y2="6" />
                                        <line x1="9" y1="12" x2="20" y2="12" />
                                        <line x1="9" y1="18" x2="20" y2="18" />
                                        <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" />
                                        <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
                                        <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" />
                                    </svg>
                                </button>
                                <button type="button" className="rich-editor__btn" title="Chèn liên kết"
                                    onMouseDown={(e) => { e.preventDefault(); handleInsertLink(); }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                    </svg>
                                </button>
                            </div>
                            <div
                                ref={editorRef}
                                className="rich-editor__body"
                                contentEditable
                                suppressContentEditableWarning
                                data-placeholder="Mô tả sản phẩm của bạn tại đây..."
                                onInput={() => onChange("description", editorRef.current?.innerHTML || "")}
                            />
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: Upload ảnh */}
                <div className="product-entry__images">
                    <label className="input-field-label">Ảnh sản phẩm</label>

                    {/* Input nằm ngoài dropzone để tránh event bubbling */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                    />

                    <div
                        className={`dropzone ${dragActive ? "drag-active" : ""} ${product.images.length > 0 ? "dropzone--compact" : ""}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current.click()}
                    >
                        <img src={uploadIcon} alt="upload" className="dropzone-icon" />
                        <p className="dropzone-text">
                            {product.images.length > 0
                                ? <span className="text-blue">+ Thêm ảnh</span>
                                : <>Kéo thả ảnh vào đây hoặc <span className="text-blue">Chọn file</span></>}
                        </p>
                    </div>

                    {product.images.length > 0 && (
                        <>
                            <div className="image-grid-header">
                                <span className="image-grid-count">{product.images.length} ảnh đã chọn</span>
                                <button className="btn-clear-all" onClick={clearImages}>Xóa tất cả</button>
                            </div>
                            <div className="image-grid">
                                {product.images.map((img) => (
                                    <div key={img.id} className="image-grid__item">
                                        {img.url ? (
                                            <img src={img.url} alt={img.name} className="image-grid__thumb" />
                                        ) : (
                                            <div className="image-grid__placeholder"><span>?</span></div>
                                        )}
                                        <button
                                            className="image-grid__remove"
                                            onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                                            title="Xóa ảnh"
                                        >✕</button>
                                        <div className="image-grid__name" title={img.name}>{img.name}</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function ProductCreateComponent() {
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingInit, setLoadingInit] = useState(true);
    const [products, setProducts] = useState([createDefaultProduct()]);
    const [isPublishing, setIsPublishing] = useState(false);

    // Toast state
    const [toasts, setToasts] = useState([]);

    const addToast = (type, message) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, type, message }]);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    // ── Fetch init data ──
    useEffect(() => {
        axiosClient.get("/product/init")
            .then((res) => {
                const json = res.data;
                if (json.code === 200 && json.data) {
                    setBrands(json.data.brands || []);
                    setCategories(json.data.categories || []);
                }
            })
            .catch((err) => console.error("Lỗi tải dữ liệu khởi tạo:", err))
            .finally(() => setLoadingInit(false));
    }, []);

    const addProduct = () => {
        setProducts((prev) => [...prev, createDefaultProduct()]);
        // Cuộn xuống card mới sau khi render
        setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 100);
    };

    const removeProduct = (id) => {
        setProducts((prev) => prev.filter((p) => p.id !== id));
    };

    const updateProduct = (id, field, value) => {
        setProducts((prev) =>
            prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
        );
    };

    const handlePublishAll = async () => {
        // Validate products
        const invalidProducts = products.filter(p => !p.productName || !p.brandId || !p.categoryId || !p.price || p.productQuantity === "");
        if (invalidProducts.length > 0) {
            addToast("error", "Vui lòng điền đầy đủ thông tin (Tên, Thương hiệu, Danh mục, Giá, Số lượng) cho tất cả sản phẩm.");
            return;
        }

        // Validate price is a valid positive number
        const invalidPriceProducts = products.filter(p => isNaN(Number(p.price)) || Number(p.price) <= 0);
        if (invalidPriceProducts.length > 0) {
            addToast("error", "Giá sản phẩm phải là một số lớn hơn 0.");
            return;
        }

        setIsPublishing(true);

        try {
            const formData = new FormData();

            // Prepare JSON request
            const requestPayload = products.map(p => ({
                productName: p.productName,
                brandId: p.brandId,
                productDescription: p.description,
                productPrice: Number(p.price),
                productQuantity: Number(p.productQuantity),
                categoryIds: [p.categoryId]
            }));

            formData.append("request", JSON.stringify(requestPayload));

            // Append files
            products.forEach((p, index) => {
                if (p.images && p.images.length > 0) {
                    p.images.forEach(img => {
                        if (img.file) {
                            formData.append(`files_${index}`, img.file);
                        }
                    });
                }
            });

            const res = await axiosClient.post("/product/created-batch", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (res.data.code === 200 || res.data.code === 201) {
                addToast("success", "Đăng nhiều sản phẩm thành công!");
                setProducts([createDefaultProduct()]); // Reset form
            } else {
                addToast("error", "Có lỗi xảy ra: " + (res.data.message || "Không xác định"));
            }
        } catch (error) {
            console.error("Lỗi khi đăng sản phẩm:", error);
            addToast("error", "Lỗi khi đăng sản phẩm. Vui lòng kiểm tra lại console.");
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="product-create-wrapper">
            <div className="product-create-container">

                {/* ── Hero Header ── */}
                <div className="page-hero">
                    <div className="page-hero__bg" />
                    <div className="page-hero__content">
                        <h2 className="page-hero__title">Thêm sản phẩm mới</h2>
                        <p className="page-hero__subtitle">Tạo và đăng nhiều sản phẩm cùng lúc, tiết kiệm thời gian quản lý</p>
                    </div>
                    <div className="page-hero__stats">
                        <div className="page-hero__stat">
                            <span className="page-hero__stat-value">{products.length}</span>
                            <span className="page-hero__stat-label">Sản phẩm chuẩn bị đăng</span>
                        </div>
                        <div className="page-hero__stat-divider" />
                        <div className="page-hero__stat">
                            <span className="page-hero__stat-value">
                                {products.reduce((sum, p) => sum + p.images.length, 0)}
                            </span>
                            <span className="page-hero__stat-label">Ảnh đã chọn</span>
                        </div>
                        <div className="page-hero__stat-divider" />
                        <div className="page-hero__stat">
                            <span className="page-hero__stat-value">
                                {products.filter(p => p.productName && p.categoryId && p.brandId && p.price).length}
                            </span>
                            <span className="page-hero__stat-label">Sẵn sàng đăng</span>
                        </div>
                    </div>
                </div>

                {/* ── Danh sách sản phẩm ── */}
                <div className="product-entries">
                    {products.map((product, index) => (
                        <ProductEntryCard
                            key={product.id}
                            index={index}
                            product={product}
                            onChange={(field, value) => updateProduct(product.id, field, value)}
                            onRemove={() => removeProduct(product.id)}
                            brands={brands}
                            categories={categories}
                            loadingInit={loadingInit}
                            canRemove={products.length > 1}
                        />
                    ))}
                </div>

                {/* ── Nút thêm sản phẩm ── */}
                <button className="add-product-btn" onClick={addProduct}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Thêm sản phẩm
                </button>

                {/* ── Nút đăng ── */}
                <div className="product-create__actions">
                    <Button variant="blue" onClick={handlePublishAll}>
                        Đăng {products.length > 1 ? `${products.length} sản phẩm` : "sản phẩm"}
                    </Button>
                </div>
            </div>

            {/* ── Toast Container ── */}
            <div className="brand-info-toast-container" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {toasts.map((t) => (
                    <Toast
                        key={t.id}
                        type={t.type}
                        message={t.message}
                        onClose={() => removeToast(t.id)}
                    />
                ))}
            </div>

            {/* ── Loading Overlay ── */}
            {isPublishing && <Loading text="Đang đăng sản phẩm..." overlay={true} />}
        </div>
    );
}
