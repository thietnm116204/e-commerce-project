import { useState } from "react";
import refreshIcon      from "../../../assets/icons/refresh.svg";
import reloadIcon       from "../../../assets/icons/reload.svg";
import settingsIcon     from "../../../assets/icons/settings.svg";
import trashIcon        from "../../../assets/icons/xoa.png";
import chevronLeftIcon  from "../../../assets/icons/chevron-left.svg";
import chevronRightIcon from "../../../assets/icons/chevron-right.svg";
import inboxIcon        from "../../../assets/icons/inbox.svg";
import "./AdminTable.css";

const DEFAULT_PAGE_SIZES = [5, 10, 20, 50];

export default function AdminTable({
    columns = [],
    data = [],
    onRefresh,
    onDeleteRows,
    emptyIcon,
    emptyTitle = "Không có dữ liệu",
    emptySubtitle = "Chưa có bản ghi nào trong hệ thống",
    pageSizeOptions = DEFAULT_PAGE_SIZES,
    rowActions = [],
    toolbarExtra,
}) {
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(pageSizeOptions[1] ?? 10);

    /* ── Pagination ── */
    const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
    const paginated = data.slice((page - 1) * pageSize, page * pageSize);

    /* ── Checkbox ── */
    const allChecked = paginated.length > 0 && paginated.every((r) => selected.includes(r.id));
    const someChecked = paginated.some((r) => selected.includes(r.id));

    const toggleAll = () => {
        if (allChecked) {
            setSelected((prev) => prev.filter((id) => !paginated.find((r) => r.id === id)));
        } else {
            setSelected((prev) => [...new Set([...prev, ...paginated.map((r) => r.id)])]);
        }
    };

    const toggleOne = (id) => {
        setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    /* ── Actions ── */
    const handleDeleteSelected = () => {
        onDeleteRows?.(selected);
        setSelected([]);
    };

    const handlePageSizeChange = (e) => {
        setPageSize(Number(e.target.value));
        setPage(1);
    };

    /* ── Total visible columns (includes checkbox + actions) ── */
    const totalCols = columns.length + 1 + (rowActions.length > 0 ? 1 : 0);

    return (
        <div className="adm-table-wrap">
            {/* ── Toolbar ── */}
            <div className="adm-table-toolbar">
                <div className="adm-table-toolbar__left">
                    <input
                        type="checkbox"
                        className="adm-table-checkbox"
                        checked={allChecked}
                        ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked; }}
                        onChange={toggleAll}
                        aria-label="Chọn tất cả"
                    />
                    {selected.length > 0 && (
                        <button
                            className="adm-table-btn-delete"
                            onClick={handleDeleteSelected}
                            title={`Xóa ${selected.length} mục đã chọn`}
                        >
                            <img src={trashIcon} alt="" className="adm-table-icon adm-table-icon--red" />
                            Xóa
                        </button>
                    )}
                </div>

                <div className="adm-table-toolbar__right">
                    {toolbarExtra}
                    <button
                        className="adm-table-btn-icon"
                        title="Làm mới dữ liệu"
                        onClick={onRefresh}
                    >
                        <img src={refreshIcon} alt="" className="adm-table-icon" />
                        <span>Làm mới</span>
                    </button>
                    <button className="adm-table-btn-icon" title="Tải lại" onClick={onRefresh}>
                        <img src={reloadIcon} alt="" className="adm-table-icon" />
                    </button>
                    <button className="adm-table-btn-icon" title="Cài đặt cột">
                        <img src={settingsIcon} alt="" className="adm-table-icon" />
                    </button>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="adm-table-scroll">
                <table className="adm-table">
                    {/* colgroup: tính width chính xác để các cột data chia đều */}
                    <colgroup>
                        <col style={{ width: "44px" }} />
                        {columns.map((col) => {
                            const hasFixed = !!col.width;
                            const flexCount = columns.filter(c => !c.width).length;
                            const actPct = rowActions.length > 0 ? 8 : 0;
                            const equalPct = flexCount > 0
                                ? `${((100 - 4 - actPct) / flexCount).toFixed(2)}%`
                                : undefined;
                            return (
                                <col key={col.key} style={{ width: hasFixed ? col.width : equalPct }} />
                            );
                        })}
                        {rowActions.length > 0 && <col style={{ width: "90px" }} />}
                    </colgroup>

                    <thead>
                        <tr>
                            {/* Checkbox column */}
                            <th className="adm-table__th-check">
                                <input
                                    type="checkbox"
                                    className="adm-table-checkbox"
                                    checked={allChecked}
                                    ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked; }}
                                    onChange={toggleAll}
                                />
                            </th>

                            {/* Dynamic columns */}
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    style={{ textAlign: col.align ?? "left" }}
                                >
                                    {col.label}
                                </th>
                            ))}

                            {/* Actions column */}
                            {rowActions.length > 0 && (
                                <th className="adm-table__th-actions">Thao tác</th>
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {paginated.length === 0 ? (
                            <tr>
                                <td colSpan={totalCols}>
                                    <div className="adm-table-empty">
                                        {emptyIcon ?? <img src={inboxIcon} alt="" width="56" height="56" />}
                                        <p className="adm-table-empty__title">{emptyTitle}</p>
                                        <p className="adm-table-empty__sub">{emptySubtitle}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginated.map((row) => (
                                <tr
                                    key={row.id}
                                    className={selected.includes(row.id) ? "adm-table__tr--selected" : ""}
                                >
                                    {/* Checkbox */}
                                    <td className="adm-table__td-check">
                                        <input
                                            type="checkbox"
                                            className="adm-table-checkbox"
                                            checked={selected.includes(row.id)}
                                            onChange={() => toggleOne(row.id)}
                                        />
                                    </td>

                                    {/* Dynamic cells */}
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            style={{ textAlign: col.align ?? "left" }}
                                        >
                                            {col.render
                                                ? col.render(row[col.key], row)
                                                : (row[col.key] ?? <span className="adm-table__none">—</span>)
                                            }
                                        </td>
                                    ))}

                                    {/* Row actions */}
                                    {rowActions.length > 0 && (
                                        <td>
                                            <div className="adm-table__row-actions">
                                                {rowActions.map((action, idx) => (
                                                    <button
                                                        key={idx}
                                                        className={`adm-table__action-btn adm-table__action-btn--${action.variant ?? "default"}`}
                                                        title={action.label}
                                                        onClick={() => action.onClick?.(row)}
                                                    >
                                                        {action.icon}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Footer / Pagination ── */}
            <div className="adm-table-footer">
                <div className="adm-table-footer__left">
                    <span>Hiển thị</span>
                    <select
                        className="adm-table-page-size"
                        value={pageSize}
                        onChange={handlePageSizeChange}
                    >
                        {pageSizeOptions.map((n) => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                    <span>Kết quả/trang</span>
                    {data.length > 0 && (
                        <span className="adm-table-footer__total">
                            · Tổng <strong>{data.length}</strong> bản ghi
                        </span>
                    )}
                </div>

                <div className="adm-table-pagination">
                    <button
                        className="adm-table-page-btn"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        aria-label="Trang trước"
                    >
                        <img src={chevronLeftIcon} alt="" className="adm-table-icon" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            className={`adm-table-page-btn${page === p ? " adm-table-page-btn--active" : ""}`}
                            onClick={() => setPage(p)}
                        >
                            {p}
                        </button>
                    ))}

                    <button
                        className="adm-table-page-btn"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        aria-label="Trang sau"
                    >
                        <img src={chevronRightIcon} alt="" className="adm-table-icon" />
                    </button>
                </div>
            </div>
        </div>
    );
}
