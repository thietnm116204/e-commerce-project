import { useState, useEffect } from "react";
import { brandApi } from "../../../api/brandApi";
import InputField from "../../../../../shared/components/InputField/InputField";
import SelectField from "../../../../../shared/components/selectField/SelectField";
import Button from "../../../../../shared/components/Button/Button";
import AdminTable from "../../../../../shared/components/AdminTable/AdminTable";
import Modal from "../../../../../shared/components/Modal/Modal";
import ConfirmModal from "../../../../../shared/components/Modal/ConfirmModal";
import Toast from "../../../../../shared/components/Toast";
import UploadFile from "../../../../../shared/components/upload_file/UploadFile";
import searchIcon from "../../../../../assets/icons/search.png";
import plusIcon from "../../../../../assets/icons/plus.png";
import editIcon from "../../../../../assets/icons/edit.svg";
import trashIcon from "../../../../../assets/icons/xoa.png";
import noDataIcon from "../../../../../assets/icons/no_data.png";
import lockedIcon from "../../../../../assets/icons/locked.png";
import "./BrandInfoComponent.css";

/* ── Filter options ── */
const statusOptions = [
    { value: "active", label: "Kích hoạt" },
    { value: "inactive", label: "Vô hiệu hoá" },
];






export default function BrandInfoComponent() {
    const [filter, setFilter] = useState({
        keyword: "",
        origin: "",
        status: "",
    });

    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [originOptions, setOriginOptions] = useState([]);

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const payload = {
                brandName: filter.keyword || "",
                isActive: filter.status === "active" ? true : filter.status === "inactive" ? false : null,
                brandOrigin: filter.origin || "",
                page: 0,
                size: 10
            };
            const data = await brandApi.searchBrands(payload);
            
            console.log("fetchBrands response:", data);
            
            const content = data?.data?.content || (Array.isArray(data?.data) ? data.data : []);
            if (content) {
                const mappedData = content.map(item => ({
                    ...item,
                    id: item.brandId
                }));
                setBrands(mappedData);
            }
        } catch (error) {
            console.error("Failed to fetch brands:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrigins = async () => {
        try {
            const data = await brandApi.getOrigins();
            if (data?.data) {
                const opts = data.data.map(origin => ({
                    value: origin,
                    label: origin
                }));
                setOriginOptions(opts);
            }
        } catch (error) {
            console.error("Failed to fetch origins:", error);
        }
    };

    useEffect(() => {
        fetchOrigins();
        fetchBrands();
    }, []);


    // Form Modal state (Create/Edit)
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
    const [activeBrand, setActiveBrand] = useState({ brandId: null, brandName: "", brandLogo: "", brandOrigin: "", logoFile: null });

    // Status Modal state
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [statusTarget, setStatusTarget] = useState(null);

    // Delete Modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteIds, setDeleteIds] = useState([]);

    // Toast state
    const [toasts, setToasts] = useState([]);

    const addToast = (type, message) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, type, message }]);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilter((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => {
        fetchBrands();
    };

    const handleRefresh = async () => {
        setFilter({ keyword: "", origin: "", status: "" });
        try {
            setLoading(true);
            const data = await brandApi.searchBrands({
                brandName: "",
                isActive: null,
                brandOrigin: "",
                page: 0,
                size: 10
            });
            const content = data?.data?.content || (Array.isArray(data?.data) ? data.data : []);
            if (content) {
                const mappedData = content.map(item => ({
                    ...item,
                    id: item.brandId
                }));
                setBrands(mappedData);
            }
        } catch (error) {
            console.error("Failed to fetch brands:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenStatus = (id, currentStatus) => {
        setStatusTarget({ id, currentStatus });
        setIsStatusModalOpen(true);
    };

    const handleConfirmStatus = async () => {
        if (!statusTarget) return;
        try {
            await brandApi.updateBrandStatus(statusTarget.id, !statusTarget.currentStatus);
            addToast("success", "Cập nhật trạng thái thành công!");
            fetchBrands();
        } catch (error) {
            console.error("Failed to update status:", error);
            addToast("error", "Có lỗi xảy ra khi cập nhật trạng thái!");
        } finally {
            setIsStatusModalOpen(false);
            setStatusTarget(null);
        }
    };

    const BRAND_COLUMNS = [
        {
            key: "brandLogo",
            label: "Logo",
            align: "center",
            render: (val, row) => (
                val
                    ? <img src={val} alt={row.brandName} className="brand-info__logo" />
                    : <span className="brand-info__none">—</span>
            ),
        },
        {
            key: "brandName",
            label: "Tên thương hiệu",
        },
        { key: "brandOrigin", label: "Xuất xứ" },
        {
            key: "isActive",
            label: "Trạng thái",
            align: "center",
            render: (val, row) => (
                <span
                    className={`brand-info__badge brand-info__badge--${val ? 'active' : 'inactive'} brand-info__badge--clickable`}
                    onClick={() => handleOpenStatus(row.brandId, val)}
                >
                    {val ? "Kích hoạt" : "Vô hiệu hóa"}
                </span>
            ),
        },
        {
            key: "updatedAt",
            label: "Thời gian cập nhật",
            render: (val) => <span className="brand-info__time">{val ?? "—"}</span>,
        },
    ];

    /* ── CREATE / EDIT LOGIC ── */
    const handleOpenCreate = () => {
        setModalMode("create");
        setActiveBrand({ brandId: null, brandName: "", brandLogo: "", brandOrigin: "", logoFile: null });
        setIsFormModalOpen(true);
    };

    const handleOpenEdit = (row) => {
        setModalMode("edit");
        setActiveBrand({
            brandId: row.brandId,
            brandName: row.brandName || "",
            brandLogo: row.brandLogo || "",
            brandOrigin: row.brandOrigin || "",
            logoFile: null
        });
        setIsFormModalOpen(true);
    };

    const handleFormSubmit = async () => {
        if (!activeBrand.brandName.trim()) {
            addToast("error", "Vui lòng nhập tên thương hiệu!");
            return;
        }

        try {
            if (modalMode === "create") {
                const requestData = {
                    brandName: activeBrand.brandName,
                    brandOrigin: activeBrand.brandOrigin || ""
                };
                await brandApi.createBrand(requestData, activeBrand.logoFile);
                addToast("success", "Thêm thương hiệu thành công!");
                fetchBrands();
            } else {
                const requestData = {
                    brandName: activeBrand.brandName,
                    brandOrigin: activeBrand.brandOrigin || ""
                };
                await brandApi.updateBrand(activeBrand.brandId, requestData, activeBrand.logoFile);
                addToast("success", "Cập nhật thương hiệu thành công!");
                fetchBrands();
            }
            setIsFormModalOpen(false);
        } catch (error) {
            console.error("Failed to save brand:", error);
            addToast("error", "Có lỗi xảy ra khi lưu thương hiệu!");
        }
    };

    /* ── DELETE LOGIC ── */
    const handleOpenDelete = (ids) => {
        setDeleteIds(ids);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await Promise.all(deleteIds.map(id => brandApi.deleteBrand(id)));
            addToast("success", "Xóa thương hiệu thành công!");
            fetchBrands();
        } catch (error) {
            console.error("Failed to delete brands:", error);
            addToast("error", "Có lỗi xảy ra khi xóa thương hiệu!");
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteIds([]);
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
            onClick: (row) => handleOpenDelete([row.brandId]),
        },
    ];

    return (
        <div className="brand-info">
            <div className="brand-card">
                <p className="brand-card__title">Thông tin tìm kiếm</p>
                <div className="brand-info__filters">
                    <InputField
                        name="keyword"
                        label="Từ khóa"
                        placeholder="Nhập tên thương hiệu"
                        value={filter.keyword}
                        onChange={handleChange}
                    />
                    <SelectField
                        name="origin"
                        label="Xuất xứ"
                        value={filter.origin}
                        onChange={handleChange}
                        options={[
                            { value: "", label: "-- Tất cả xuất xứ --" },
                            ...originOptions
                        ]}
                        placeholder="Chọn xuất xứ"
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
                <div className="brand-info__actions">
                    <Button
                        variant="blue"
                        className="btn--sm"
                        onClick={handleSearch}
                        icon={<img src={searchIcon} alt="search" className="brand-info__btn-img-icon" />}
                    >
                        Tìm kiếm
                    </Button>
                    <Button
                        variant="blue"
                        className="btn--sm"
                        icon={<img src={plusIcon} alt="plus" className="brand-info__btn-img-icon" />}
                        onClick={handleOpenCreate}
                    >
                        Thêm thương hiệu mới
                    </Button>
                </div>
            </div>

            <AdminTable
                columns={BRAND_COLUMNS}
                data={brands}
                onRefresh={handleRefresh}
                onDeleteRows={(ids) => handleOpenDelete(ids)}
                rowActions={rowActions}
                emptyIcon={<img src={noDataIcon} alt="no data" width="112" height="112" />}
                emptyTitle="Không có dữ liệu"
                emptySubtitle="Chưa có thương hiệu nào trong hệ thống"
            />

            {/* ── Form Modal (Create/Edit) ── */}
            <Modal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                title={modalMode === "create" ? "Thêm thương hiệu mới" : "Cập nhật thương hiệu"}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsFormModalOpen(false)}>Hủy</Button>
                        <Button variant="blue" onClick={handleFormSubmit}>
                            Xác nhận
                        </Button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <InputField
                        name="brandName"
                        label="Tên thương hiệu"
                        placeholder="Nhập tên thương hiệu..."
                        value={activeBrand.brandName}
                        onChange={(e) => setActiveBrand(p => ({ ...p, brandName: e.target.value }))}
                    />
                    <UploadFile
                        label="Logo thương hiệu"
                        accept="image/*"
                        previewUrl={activeBrand.brandLogo}
                        onChange={(file) => {
                            if (file) {
                                const previewUrl = URL.createObjectURL(file);
                                setActiveBrand(p => ({ ...p, logoFile: file, brandLogo: previewUrl }));
                            } else {
                                setActiveBrand(p => ({ ...p, logoFile: null, brandLogo: "" }));
                            }
                        }}
                    />
                    <InputField
                        name="brandOrigin"
                        label="Xuất xứ"
                        placeholder="Nhập xuất xứ..."
                        value={activeBrand.brandOrigin}
                        onChange={(e) => setActiveBrand(p => ({ ...p, brandOrigin: e.target.value }))}
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
                        ? `Bạn có muốn xóa ${deleteIds.length} thương hiệu này hay không?`
                        : `Bạn có muốn xóa thương hiệu "${brands.find(b => b.brandId === deleteIds[0])?.brandName || ''}" này hay không?`
                }
                message="Hành động này không thể hoàn tác."
                confirmText="Xóa"
                confirmVariant="danger"
            />

            {/* ── Confirm Status Modal ── */}
            <ConfirmModal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                onConfirm={handleConfirmStatus}
                title={
                    statusTarget?.currentStatus
                        ? `Bạn có muốn vô hiệu hóa thương hiệu "${brands.find(b => b.brandId === statusTarget?.id)?.brandName || ''}" này hay không?`
                        : `Bạn có muốn kích hoạt thương hiệu "${brands.find(b => b.brandId === statusTarget?.id)?.brandName || ''}" này hay không?`
                }
                message="Trạng thái của thương hiệu sẽ được thay đổi ngay lập tức."
                icon={<img src={lockedIcon} alt="status" style={{ width: '20px', height: '20px' }} />}
                confirmText="Xác nhận"
                confirmVariant="primary"
            />

            {/* ── Toast Container ── */}
            <div className="brand-info-toast-container">
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