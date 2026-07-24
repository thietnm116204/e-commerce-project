import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import InputField from '../../../../../shared/components/InputField/InputField';
import SelectField from '../../../../../shared/components/selectField/SelectField';
import Button from '../../../../../shared/components/Button/Button';
import { axiosClient } from '../../../../../config/api';
import { productApi } from '../../../api/productApi';
import Toast from '../../../../../shared/components/Toast';
import Loading from '../../../../../shared/components/Loading/Loading';
import '../create_product/ProductCreateComponent.css';
import './ProductUpdateComponent.css';
import uploadIcon from '../../../../../assets/icons/upload.png';

function ProductUpdateEntryCard({ product, onChange, brands, categories, loadingInit }) {
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);
    const editorRef = useRef(null);

    useEffect(() => {
        if (editorRef.current && product.description !== undefined) {
            if (editorRef.current.innerHTML !== product.description) {
                editorRef.current.innerHTML = product.description;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product.description]);

    const execCmd = useCallback((command, value = null) => {
        editorRef.current?.focus();
        document.execCommand(command, false, value);
    }, []);

    const handleInsertLink = () => {
        const url = prompt('Nhap URL lien ket:');
        if (url) execCmd('createLink', url);
    };

    const handleDrag = (e) => {
        e.preventDefault(); e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation(); setDragActive(false);
        if (e.dataTransfer.files?.length > 0) handleFiles(e.dataTransfer.files);
    };

    const handleFileChange = (e) => {
        if (e.target.files?.length > 0) handleFiles(e.target.files);
        e.target.value = '';
    };

    const handleFiles = (files) => {
        const newImages = Array.from(files).map((file) => ({
            id: Math.random().toString(36).substring(2, 9),
            file, name: file.name,
            size: (file.size / 1024).toFixed(0) + ' KB',
            url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
            isNew: true,
        }));
        onChange('images', [...product.images, ...newImages]);
    };

    const removeImage = (id) => onChange('images', product.images.filter((img) => img.id !== id));
    const clearImages = () => onChange('images', []);

    const categoryOptions = [
        { value: '', label: '-- Chon danh muc --' },
        ...categories.map((c) => ({ value: c.categoryId, label: c.categoryName })),
    ];
    const brandOptions = [
        { value: '', label: '-- Chon thuong hieu --' },
        ...brands.map((b) => ({ value: b.brandId, label: b.brandName })),
    ];

    return (
        <div className='product-entry-card'>
            <div className='product-entry-body'>
                <div className='product-entry__form'>
                    <InputField label='Ten san pham' placeholder='Vi du: Giay the thao Nike Air Max' value={product.productName} onChange={(e) => onChange('productName', e.target.value)} />
                    <SelectField label='Danh muc' value={product.categoryId} onChange={(e) => onChange('categoryId', e.target.value)} options={loadingInit ? [{ value: '', label: 'Dang tai...' }] : categoryOptions} />
                    <SelectField label='Thuong hieu' value={product.brandId} onChange={(e) => onChange('brandId', e.target.value)} options={loadingInit ? [{ value: '', label: 'Dang tai...' }] : brandOptions} />
                    <InputField label='Gia (VND)' placeholder='Vi du: 1750000' type='number' min='1' value={product.price} onChange={(e) => onChange('price', e.target.value)} />
                    <InputField label='So luong' placeholder='Vi du: 100' type='number' min='0' value={product.productQuantity} onChange={(e) => onChange('productQuantity', e.target.value)} />
                    <div className='input-field-wrapper'>
                        <label className='input-field-label'>Mo ta</label>
                        <div className='rich-editor'>
                            <div className='rich-editor__toolbar'>
                                <button type='button' className='rich-editor__btn' title='In dam' onMouseDown={(e) => { e.preventDefault(); execCmd('bold'); }}><b>B</b></button>
                                <button type='button' className='rich-editor__btn' title='In nghieng' onMouseDown={(e) => { e.preventDefault(); execCmd('italic'); }}><i>I</i></button>
                                <button type='button' className='rich-editor__btn' title='Chen lien ket' onMouseDown={(e) => { e.preventDefault(); handleInsertLink(); }}>
                                    <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' /><path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' /></svg>
                                </button>
                            </div>
                            <div ref={editorRef} className='rich-editor__body' contentEditable suppressContentEditableWarning data-placeholder='Mo ta san pham cua ban tai day...' onInput={() => onChange('description', editorRef.current?.innerHTML || '')} />
                        </div>
                    </div>
                </div>
                <div className='product-entry__images'>
                    <label className='input-field-label'>Anh san pham</label>
                    <input ref={fileInputRef} type='file' multiple accept='image/*' onChange={handleFileChange} style={{ display: 'none' }} />
                    <div className={'dropzone' + (dragActive ? ' drag-active' : '') + (product.images.length > 0 ? ' dropzone--compact' : '')} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={() => fileInputRef.current.click()}>
                        <img src={uploadIcon} alt='upload' className='dropzone-icon' />
                        <p className='dropzone-text'>{product.images.length > 0 ? <span className='text-blue'>+ Them anh</span> : <><span>Keo tha anh vao day hoac </span><span className='text-blue'>Chon file</span></>}</p>
                    </div>
                    {product.images.length > 0 && (
                        <>
                            <div className='image-grid-header'>
                                <span className='image-grid-count'>{product.images.length} anh</span>
                                <button className='btn-clear-all' onClick={clearImages}>Xoa tat ca</button>
                            </div>
                            <div className='image-grid'>
                                {product.images.map((img) => (
                                    <div key={img.id} className={'image-grid__item' + (img.isNew ? ' image-grid__item--new' : '')}>
                                        {img.url ? <img src={img.url} alt={img.name} className='image-grid__thumb' /> : <div className='image-grid__placeholder'><span>?</span></div>}
                                        {img.isNew && <span className='image-grid__badge-new'>Moi</span>}
                                        <button className='image-grid__remove' onClick={(e) => { e.stopPropagation(); removeImage(img.id); }} title='Xoa anh'>x</button>
                                        <div className='image-grid__name' title={img.name}>{img.name}</div>
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

export default function ProductUpdateComponent() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingInit, setLoadingInit] = useState(true);
    const [loadingProduct, setLoadingProduct] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [product, setProduct] = useState({ productName: '', categoryId: '', brandId: '', price: '', productQuantity: '', description: '', images: [] });
    const [toasts, setToasts] = useState([]);

    const addToast = (type, message) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, type, message }]);
    };
    const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const initRes = await axiosClient.get('/product/init');
                const json = initRes.data;
                if (json.code === 200 && json.data) {
                    setBrands(json.data.brands || []);
                    setCategories(json.data.categories || []);
                }
                setLoadingInit(false);

                if (productId) {
                    const prodRes = await productApi.getProductById(productId);
                    const prodData = prodRes?.data?.data;
                    if (prodData) {
                        const existingImages = (prodData.images || []).map((img) => ({
                            id: img.productImageId || Math.random().toString(36).substring(2, 9),
                            name: img.productImageUrl?.split('/').pop() || 'image',
                            url: img.productImageUrl,
                            productImageId: img.productImageId,
                            isNew: false,
                        }));
                        setProduct({
                            productName: prodData.productName || '',
                            categoryId: prodData.categoryIds?.[0] || prodData.categories?.[0]?.categoryId || '',
                            brandId: prodData.brandId || prodData.brand?.brandId || '',
                            price: prodData.productPrice || '',
                            productQuantity: prodData.productQuantity !== undefined ? prodData.productQuantity : '',
                            description: prodData.productDescription || '',
                            images: existingImages,
                        });
                    }
                }
            } catch (err) {
                console.error('Loi tai du lieu:', err);
                addToast('error', 'Khong the tai thong tin san pham.');
            } finally {
                setLoadingProduct(false);
            }
        };
        fetchAll();
    }, [productId]);

    const updateField = (field, value) => setProduct((prev) => ({ ...prev, [field]: value }));

    const handleSave = async () => {
        if (!product.productName || !product.brandId || !product.categoryId || !product.price || product.productQuantity === '') {
            addToast('error', 'Vui long dien day du thong tin (Ten, Thuong hieu, Danh muc, Gia, So luong).');
            return;
        }
        if (isNaN(Number(product.price)) || Number(product.price) <= 0) {
            addToast('error', 'Gia san pham phai la mot so lon hon 0.');
            return;
        }
        setIsSaving(true);
        try {
            const formData = new FormData();
            const requestPayload = {
                productName: product.productName,
                brandId: product.brandId,
                productDescription: product.description,
                productPrice: Number(product.price),
                productQuantity: Number(product.productQuantity),
                productSale: 0,
                isActive: true,
                productStatus: "ACTIVE",
                categoryIds: [product.categoryId],
            };
            formData.append('data', JSON.stringify(requestPayload));
            product.images.filter((img) => img.isNew && img.file).forEach((img) => formData.append('files', img.file));
            const res = await productApi.updateProduct(productId, formData);
            if (res.data.code === 200 || res.data.code === 201) {
                addToast('success', 'Cap nhat san pham thanh cong!');
                setTimeout(() => {
                    setIsSaving(false);
                    navigate('/admin/product_management/info');
                }, 1500);
            } else {
                addToast('error', 'Co loi xay ra: ' + (res.data.message || 'Khong xac dinh'));
                setIsSaving(false);
            }
        } catch (error) {
            console.error('Loi khi cap nhat san pham:', error);
            addToast('error', 'Loi khi cap nhat san pham: ' + (error.response?.data?.message || error.message));
            setIsSaving(false);
        }
    };

    const isLoading = loadingProduct || loadingInit;

    return (
        <div className='product-create-wrapper'>
            {isLoading && <Loading text='Dang tai du lieu san pham...' overlay={true} />}
            {isSaving && <Loading text='Dang luu thay doi...' overlay={true} />}
            <div className='product-create-container'>

                {!isLoading && (
                    <div className='product-entries'>
                        <ProductUpdateEntryCard product={product} onChange={updateField} brands={brands} categories={categories} loadingInit={loadingInit} />
                    </div>
                )}
                <div className='product-update__actions'>
                    <Button variant='outline' onClick={() => navigate('/admin/product_management/info')}>Huy</Button>
                    <Button variant='blue' onClick={handleSave}>
                        <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' style={{ marginRight: 6 }}><path d='M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z' /><polyline points='17 21 17 13 7 13 7 21' /><polyline points='7 3 7 8 15 8' /></svg>
                        Luu thay doi
                    </Button>
                </div>
            </div>
            <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {toasts.map((t) => (<Toast key={t.id} type={t.type} message={t.message} onClose={() => removeToast(t.id)} />))}
            </div>
        </div>
    );
}
