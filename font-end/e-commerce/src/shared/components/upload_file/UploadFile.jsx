import React, { useState, useRef, useEffect } from 'react';
import uploadIcon from '../../../assets/icons/upload.png';
import './UploadFile.css';

const UploadFile = ({ label, onChange, previewUrl, accept = "image/*", error }) => {
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState(previewUrl || null);
    const inputRef = useRef(null);

    useEffect(() => {
        setPreview(previewUrl || null);
    }, [previewUrl]);

    // Xử lý kéo thả
    const handleDrag = function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    // Xử lý khi thả file
    const handleDrop = function(e) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    // Xử lý khi chọn file qua click
    const handleChange = function(e) {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        // Tạo preview URL nếu là ảnh
        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreview(url);
        } else {
            setPreview(null);
        }
        if (onChange) {
            onChange(file);
        }
    };

    // Nút xóa file đã chọn
    const handleRemoveFile = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setPreview(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
        if (onChange) {
            onChange(null);
        }
    };

    const onButtonClick = (e) => {
        e.preventDefault();
        inputRef.current.click();
    };

    return (
        <div className="upload-file-wrapper">
            {label && <label className="upload-file-label">{label}</label>}
            <div 
                className={`upload-file-container ${dragActive ? "drag-active" : ""}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={onButtonClick}
            >
                <input 
                    ref={inputRef} 
                    type="file" 
                    accept={accept}
                    onChange={handleChange} 
                    onClick={(e) => e.stopPropagation()}
                    className="upload-file-input"
                />
                
                {preview ? (
                    <div className="upload-file-preview-wrapper">
                        <img src={preview} alt="Preview" className="upload-file-preview" />
                        <button className="upload-file-remove-btn" onClick={handleRemoveFile}>
                            ✕
                        </button>
                    </div>
                ) : (
                    <div className="upload-file-placeholder">
                        <img src={uploadIcon} alt="upload" className="upload-file-icon" />
                        <p className="upload-file-text">Kéo thả file vào đây hoặc <span>chọn file</span></p>
                        <p className="upload-file-hint">Định dạng hỗ trợ: JPEG, PNG, SVG...</p>
                    </div>
                )}
            </div>
            {error && <span className="upload-file-error">{error}</span>}
        </div>
    );
};

export default UploadFile;
