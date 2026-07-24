export const ADMIN_HOME_PATH = "/admin";

export const ADMIN_NAV_ITEMS = [
  {
    label: "Dashboard",
    path: ADMIN_HOME_PATH,
  },
  {
    label: "Danh mục sản phẩm",
    children: [
      { label: "Thông tin danh mục", path: "/admin/category/info" },
      { label: "Thông tin thương hiệu", path: "/admin/category/brand" },
    ],
  },
  {
    label: "Quản lý sản phẩm",
    children: [
      { label: "Thêm sản phẩm mới", path: "/admin/product_management/create" },
      { label: "Thông tin sản phẩm", path: "/admin/product_management/info" },
    ],
  },
];


const toBreadcrumbItem = (label, path = null) => ({ label, path });

const ADMIN_ROUTES = [
  { path: ADMIN_HOME_PATH, breadcrumb: [toBreadcrumbItem("Dashboard", ADMIN_HOME_PATH)] },
  {
    path: "/admin/category/info",
    breadcrumb: [
      toBreadcrumbItem("Dashboard", ADMIN_HOME_PATH),
      toBreadcrumbItem("Danh mục sản phẩm", null),
      toBreadcrumbItem("Thông tin danh mục", "/admin/category/info"),
    ],
  },
  {
    path: "/admin/category/brand",
    breadcrumb: [
      toBreadcrumbItem("Dashboard", ADMIN_HOME_PATH),
      toBreadcrumbItem("Danh mục sản phẩm", null),
      toBreadcrumbItem("Thông tin thương hiệu", "/admin/category/brand"),
    ],
  },
  {
    path: "/admin/product_management/create",
    breadcrumb: [
      toBreadcrumbItem("Dashboard", ADMIN_HOME_PATH),
      toBreadcrumbItem("Quản lý sản phẩm", null),
      toBreadcrumbItem("Thêm sản phẩm mới", "/admin/product_management/create"),
    ],
  },
  {
    path: "/admin/product_management/info",
    breadcrumb: [
      toBreadcrumbItem("Dashboard", ADMIN_HOME_PATH),
      toBreadcrumbItem("Quản lý sản phẩm", null),
      toBreadcrumbItem("Thông tin sản phẩm", "/admin/product_management/info"),
    ],
  },
  {
    path: "/admin/product_management/update",
    breadcrumb: [
      toBreadcrumbItem("Dashboard", ADMIN_HOME_PATH),
      toBreadcrumbItem("Quản lý sản phẩm", null),
      toBreadcrumbItem("Thông tin sản phẩm", "/admin/product_management/info"),
      toBreadcrumbItem("Chỉnh sửa sản phẩm", null),
    ],
  },
];


export const findAdminRoute = (pathname) => {
  const exactMatch = ADMIN_ROUTES.find((route) => route.path === pathname);
  if (exactMatch) {
    return exactMatch;
  }

  const candidates = ADMIN_ROUTES.filter((route) => pathname.startsWith(route.path + "/"));
  if (candidates.length === 0) {
    return null;
  }

  return candidates.sort((left, right) => right.path.length - left.path.length)[0];
};

export const getAdminBreadcrumb = (pathname) => {
  const route = findAdminRoute(pathname);
  if (route) {
    return route.breadcrumb;
  }

  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) {
    return [];
  }

  return parts.map((part, index) => {
    const label = part.charAt(0).toUpperCase() + part.slice(1);
    const path = `/${parts.slice(0, index + 1).join("/")}`;
    return toBreadcrumbItem(label, path);
  });
};
