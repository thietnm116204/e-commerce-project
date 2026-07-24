import { useState, useEffect } from "react";
import { categoryApi } from "../../../api/categoryApi";
import InputField from "../../../../../shared/components/InputField/InputField";
import SelectField from "../../../../../shared/components/selectField/SelectField";
import Button from "../../../../../shared/components/Button/Button";
import AdminTable from "../../../../../shared/components/AdminTable/AdminTable";
import Modal from "../../../../../shared/components/Modal/Modal";
import ConfirmModal from "../../../../../shared/components/Modal/ConfirmModal";
import Toast from "../../../../../shared/components/Toast";
import searchIcon  from "../../../../../assets/icons/search.png";
import plusIcon    from "../../../../../assets/icons/plus.png";
import editIcon    from "../../../../../assets/icons/edit.svg";
import trashIcon   from "../../../../../assets/icons/xoa.png";
import folderIcon  from "../../../../../assets/icons/folder.svg";
import noDataIcon  from "../../../../../assets/icons/no_data.png";
import lockedIcon  from "../../../../../assets/icons/locked.png";
import "./CategoryInfoComponent.css";

/* ── Filter options ── */
const statusOptions = [
    { value: "active",   label: "Kích hoạt" },
    { value: "inactive", label: "Vô hiệu hoá" },
];

export default function CategoryInfoComponent() {
    const [parentOptions, setParentOptions] = useState([]);
    const [filter, setFilter] = useState({
        keyword: "",
        parentCategory: "",
        status: "",
    });
    
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Form Modal state (Create/Edit)
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
    const [activeCategory, setActiveCategory] = useState({ categoryId: null, categoryName: "", parentId: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete Modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteIds, setDeleteIds] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);

    // Status Modal state
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [statusTarget, setStatusTarget] = useState(null);

    // Toast state
    const [toasts, setToasts] = useState([]);
    
    const addToast = (type, message) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, type, message }]);
    };
    
    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await categoryApi.searchCategories({
                categoryName: filter.keyword,
                parentId: filter.parentCategory || "",
                isActive: filter.status === "active" ? true : filter.status === "inactive" ? false : null,
                page: 0,
                size: 100
            });
            if (data?.data?.content) {
                // Map categoryId to id for AdminTable checkboxes
                const mappedData = data.data.content.map(item => ({
                    ...item,
                    id: item.categoryId
                }));
                setCategories(mappedData);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoots = async () => {
        try {
            const res = await categoryApi.getRootCategories();
            if (res?.data) {
                const opts = res.data.map(item => ({
                    value: item.categoryId,
                    label: item.categoryName
                }));
                setParentOptions(opts);
            }
        } catch (error) {
            console.error("Failed to fetch root categories:", error);
        }
    };

    useEffect(() => {
        fetchRoots();
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilter((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => {
        fetchCategories();
    };

    const handleRefresh = () => {
        fetchCategories();
    };

    const handleOpenStatus = (id, currentStatus) => {
        setStatusTarget({ id, currentStatus });
        setIsStatusModalOpen(true);
    };

    const handleConfirmStatus = async () => {
        if (!statusTarget) return;
        try {
            await categoryApi.updateCategoryStatus(statusTarget.id, !statusTarget.currentStatus);
            addToast("success", "Cập nhật trạng thái thành công!");
            fetchCategories();
        } catch (error) {
            console.error("Failed to update status:", error);
            addToast("error", "Có lỗi xảy ra khi cập nhật trạng thái!");
        } finally {
            setIsStatusModalOpen(false);
            setStatusTarget(null);
        }
    };

    const CATEGORY_COLUMNS = [
        { 
            key: "categoryName",   
            label: "Tên thư mục",
            render: (val) => val ? String(val).replace(/^[\.\s…]+/, '') : val
        },
        { key: "parentName", label: "Thư mục cha" },
        {
            key: "isActive",
            label: "Trạng thái",
            align: "center",
            render: (val, row) => (
                <span 
                    className={`cat-info__badge cat-info__badge--${val ? 'active' : 'inactive'} cat-info__badge--clickable`}
                    onClick={() => handleOpenStatus(row.categoryId, val)}
                >
                    {val ? "Kích hoạt" : "Vô hiệu hóa"}
                </span>
            ),
        },
        {
            key: "updatedAt",
            label: "Thời gian cập nhật",
            render: (val) => <span className="cat-info__time">{val ?? "—"}</span>,
        },
    ];

    /* ── CREATE / EDIT LOGIC ── */
    const handleOpenCreate = () => {
        setModalMode("create");
        setActiveCategory({ categoryId: null, categoryName: "", parentId: "" });
        setIsFormModalOpen(true);
    };

    const handleOpenEdit = (row) => {
        setModalMode("edit");
        setActiveCategory({
            categoryId: row.categoryId,
            categoryName: row.categoryName || "",
            parentId: row.parentId || ""
        });
        setIsFormModalOpen(true);
    };

    const handleFormSubmit = async () => {
        if (!activeCategory.categoryName.trim()) {
            addToast("error", "Vui lòng nhập tên thư mục!");
            return;
        }
        try {
            setIsSubmitting(true);
            const payload = {
                categoryName: activeCategory.categoryName,
                parentId: activeCategory.parentId || null
            };
            if (modalMode === "create") {
                await categoryApi.createCategory(payload);
                addToast("success", "Thêm thư mục thành công!");
            } else {
                await categoryApi.updateCategory(activeCategory.categoryId, payload);
                addToast("success", "Cập nhật thư mục thành công!");
            }
            setIsFormModalOpen(false);
            fetchCategories();
            fetchRoots();
        } catch (error) {
            console.error("Failed to save category:", error);
            addToast("error", "Có lỗi xảy ra khi lưu thư mục!");
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ── DELETE LOGIC ── */
    const handleOpenDelete = (ids) => {
        setDeleteIds(ids);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            setIsDeleting(true);
            // Run deletions in parallel
            await Promise.all(deleteIds.map(id => categoryApi.deleteCategory(id)));
            setIsDeleteModalOpen(false);
            setDeleteIds([]);
            addToast("success", "Xóa thư mục thành công!");
            fetchCategories();
            fetchRoots();
        } catch (error) {
            console.error("Failed to delete categories:", error);
            addToast("error", "Có lỗi xảy ra khi xóa thư mục!");
        } finally {
            setIsDeleting(false);
        }
    };

    const rowActions = [
        {
            label: "Chỉnh sửa",
            icon: <img src={editIcon} alt="edit" className="adm-table-icon adm-table-icon--blue" />,
            variant: "edit",
            onClick: handleOpenEdit,
        },
        {
            label: "Xóa",
            icon: <img src={trashIcon} alt="delete" className="adm-table-icon adm-table-icon--red" />,
            variant: "delete",
            onClick: (row) => handleOpenDelete([row.categoryId]),
        },
    ];

    return (
        <div className="cat-info">
            <div className="cat-card">
                <p className="cat-card__title">Thông tin tìm kiếm</p>
                <div className="cat-info__filters">
                    <InputField
                        name="keyword"
                        label="Từ khóa"
                        placeholder="Nhập tên thư mục"
                        value={filter.keyword}
                        onChange={handleChange}
                    />
                    <SelectField
                        name="parentCategory"
                        label="Thư mục cha"
                        value={filter.parentCategory}
                        onChange={handleChange}
                        options={parentOptions}
                        placeholder="Chọn thư mục cha"
                    />
                    <SelectField
                        name="status"
                        label="Trạng thái"
                        value={filter.status}
                        onChange={handleChange}
                        options={statusOptions}
                        placeholder="Chọn trạng thái"
                    />
                </div>
                <div className="cat-info__actions">
                    <Button
                        variant="blue"
                        className="btn--sm"
                        onClick={handleSearch}
                        icon={<img src={searchIcon} alt="search" className="cat-info__btn-img-icon" />}
                    >
                        Tìm kiếm
                    </Button>
                    <Button
                        variant="blue"
                        className="btn--sm"
                        icon={<img src={plusIcon} alt="plus" className="cat-info__btn-img-icon" />}
                        onClick={handleOpenCreate}
                    >
                        Thêm thư mục mới
                    </Button>
                </div>
            </div>

            <AdminTable
                columns={CATEGORY_COLUMNS}
                data={categories}
                onRefresh={handleRefresh}
                onDeleteRows={(ids) => handleOpenDelete(ids)}
                rowActions={rowActions}
                emptyIcon={<img src={noDataIcon} alt="no data" width="112" height="112" />}
                emptyTitle="Không có dữ liệu"
                emptySubtitle="Chưa có thư mục nào trong hệ thống"
            />

            {/* ── Form Modal (Create/Edit) ── */}
            <Modal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                title={modalMode === "create" ? "Thêm thư mục mới" : "Cập nhật thư mục"}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsFormModalOpen(false)}>Hủy</Button>
                        <Button variant="blue" onClick={handleFormSubmit} disabled={isSubmitting}>
                            {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
                        </Button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <InputField
                        name="categoryName"
                        label="Tên thư mục"
                        placeholder="Nhập tên thư mục..."
                        value={activeCategory.categoryName}
                        onChange={(e) => setActiveCategory(p => ({ ...p, categoryName: e.target.value }))}
                    />
                    <SelectField
                        name="parentId"
                        label="Thư mục cha"
                        value={activeCategory.parentId}
                        onChange={(e) => setActiveCategory(p => ({ ...p, parentId: e.target.value }))}
                        options={[
                            { value: "", label: "-- Không có (Thư mục gốc) --" },
                            ...parentOptions
                        ]}
                        placeholder="Chọn thư mục cha (nếu có)"
                    />
                </div>
            </Modal>

            {/* ── Confirm Delete Modal ── */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title={
                    deleteIds.length > 1
                        ? `Bạn có muốn xóa ${deleteIds.length} thư mục này hay không?`
                        : `Bạn có muốn xóa thư mục "${categories.find(c => c.categoryId === deleteIds[0])?.categoryName || ''}" này hay không?`
                }
                message="Hành động này không thể hoàn tác."
                confirmText="Xóa"
                confirmVariant="danger"
                isLoading={isDeleting}
            />

            {/* ── Confirm Status Modal ── */}
            <ConfirmModal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                onConfirm={handleConfirmStatus}
                title={
                    statusTarget?.currentStatus 
                    ? `Bạn có muốn vô hiệu hóa thư mục "${categories.find(c => c.categoryId === statusTarget?.id)?.categoryName || ''}" này hay không?`
                    : `Bạn có muốn kích hoạt thư mục "${categories.find(c => c.categoryId === statusTarget?.id)?.categoryName || ''}" này hay không?`
                }
                message="Trạng thái của thư mục sẽ được thay đổi ngay lập tức."
                icon={<img src={lockedIcon} alt="status" style={{ width: '20px', height: '20px' }} />}
                confirmText="Xác nhận"
                confirmVariant="primary"
            />

            {/* ── Toast Container ── */}
            <div className="cat-info-toast-container">
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
