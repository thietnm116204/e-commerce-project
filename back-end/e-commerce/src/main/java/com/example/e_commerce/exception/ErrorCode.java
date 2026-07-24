package com.example.e_commerce.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    FILE_EMPTY(HttpStatus.BAD_REQUEST, "File is empty"),
    UPLOAD_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "Upload file failed"),
    EMAIL_ALREADY_EXISTS(HttpStatus.BAD_REQUEST,"Email đã tồn tại"),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng"),
    ACCOUNT_DISABLED(HttpStatus.FORBIDDEN, "Tài khoản đã bị khóa"),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "Bạn không có đủ quyền"),
    INVALID_REFRESH_TOKEN(HttpStatus.UNAUTHORIZED, "Refresh token không hợp lệ"),
    ROLE_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "Role đã tồn tại"),
    ROLE_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy role"),
    PERMISSION_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "Permission đã tồn tại"),
    PERMISSION_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy permission"),
    USER_NOT_FOUD(HttpStatus.NOT_FOUND,"Không tìm thấy tài khoản"),

    //product
    CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND,"Danh muc khong ton tai"),
    PRODUCT_LIST_EMPTY(HttpStatus.NOT_FOUND,"Danh sach san pham trong"),
    BRAND_NOT_FOUD(HttpStatus.NOT_FOUND,"Brand không tồn tại"),
    BRAND_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "Brand đã tồn tại"),
    CATEGORY_NOT_FOUD(HttpStatus.NOT_FOUND, "Category không tồn tại"),
    CATEGORY_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "Category đã tồn tại"),
    CATEGORY_PARENT_INVALID(HttpStatus.BAD_REQUEST, "Category cha không hợp lệ"),
    PRODUCT_NOT_FOUD(HttpStatus.NOT_FOUND, "Product không tồn tại"),
    PRODUCT_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "Product đã tồn tại"),
    PRODUCT_VARIANT_NOT_FOUD(HttpStatus.NOT_FOUND, "Product variant không tồn tại"),
    PRODUCT_VARIANT_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "Product variant đã tồn tại"),
    PRODUCT_IMAGE_NOT_FOUD(HttpStatus.NOT_FOUND, "Product image không tồn tại"),
    PRODUCT_NOT_FOUND(HttpStatus.NOT_FOUND, "San pham khong ton tai "),
    PRODUCT_INACTIVE(HttpStatus.NOT_FOUND, "San pham hien khong kha dung "),

    ORDER_NOT_FOUD(HttpStatus.NOT_FOUND, "order k ton tai "),
    ORDER_ACCESS_DENIED(HttpStatus.NOT_FOUND, "ORDER_ACCESS_DENIED"),


    CART_NOT_FOUND(HttpStatus.NOT_FOUND, "Cart ko ton tai"),
    CART_ITEM_NOT_FOUND(HttpStatus.NOT_FOUND, "Cart item ko ton tai"),
    CART_ACCESS_DENIED(HttpStatus.NOT_FOUND, "CART_ACCESS_DENIED"),


    PAYMENT_NOT_FOUD(HttpStatus.NOT_FOUND, "PAYMENT_NOT_FOUD"),


    ;

    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }
}
