import "./Breadcrumb.css";

export default function Breadcrumb({ items = [], onItemClick }) {
    if (!items || items.length === 0) return null;

    return (
        <nav className="breadcrumb" aria-label="Breadcrumb">
            <ol className="breadcrumb__list">
            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                const label = typeof item === "string" ? item : item?.label;
                const clickable = !isLast && typeof onItemClick === "function" && !!item?.path;
                
                return (
                    <li key={`${label}-${index}`} className="breadcrumb__item-wrapper">
                        {clickable ? (
                            <button
                                type="button"
                                className="breadcrumb__text breadcrumb__text--clickable"
                                onClick={() => onItemClick(item, index)}
                            >
                                {index === 0 && (
                                    <svg className="breadcrumb__home-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                    </svg>
                                )}
                                {label}
                            </button>
                        ) : (
                            <span className={`breadcrumb__text ${isLast ? 'breadcrumb__text--active' : ''}`}>
                                {index === 0 && (
                                    <svg className="breadcrumb__home-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                    </svg>
                                )}
                                {label}
                            </span>
                        )}
                        
                        {!isLast && (
                            <span className="breadcrumb__separator">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 18l6-6-6-6"/>
                                </svg>
                            </span>
                        )}
                    </li>
                );
            })}
            </ol>
        </nav>
    );
}
