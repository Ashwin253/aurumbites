"use client";

import { useState } from "react";
import { addProduct, deleteProduct, addCategory, deleteCategory, addBrand, deleteBrand, updateProduct, updateBrand } from "./actions";

export default function InventoryTab({ initialProducts, initialCategories, initialBrands }) {
  const [activeSubTab, setActiveSubTab] = useState("products");
  
  const [products, setProducts] = useState(initialProducts || []);
  const [categories, setCategories] = useState(initialCategories || []);
  const [brands, setBrands] = useState(initialBrands || []);
  
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [variants, setVariants] = useState([{ weight: "250gm", customWeight: "", sellingPrice: "", originalPrice: "", sellingUnitPrice: "", originalUnitPrice: "" }]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingBrand, setEditingBrand] = useState(null);
  const [existingImages, setExistingImages] = useState([]);

  const resetFormState = () => {
    setIsAdding(false);
    setEditingProduct(null);
    setEditingBrand(null);
    setExistingImages([]);
    setSelectedImages([]);
    setVariants([{ weight: "250gm", customWeight: "", sellingPrice: "", originalPrice: "", sellingUnitPrice: "", originalUnitPrice: "" }]);
    setImportQueue([]);
    setIsPastingData(false);
  };

  const handleEditClick = (p) => {
    setEditingProduct(p);
    
    // Map variants back
    const loadedVariants = p.variants && p.variants.length > 0 ? p.variants.map(v => {
      const title = v.title || "";
      const isStandard = ["250gm", "500gm", "1kg", "2kg", "5kg"].includes(title.toLowerCase().replace(" ", ""));
      return {
        id: v.id,
        weight: isStandard ? title.toLowerCase().replace(" ", "") : "Custom",
        customWeight: isStandard ? "" : title,
        sellingPrice: v.price?.amount ?? v.price ?? "",
        originalPrice: v.compareAtPrice?.amount ?? v.compareAtPrice ?? "",
        sellingUnitPrice: v.unitPrice?.amount ?? v.unitPrice ?? "",
        originalUnitPrice: v.originalUnitPrice?.amount ?? v.originalUnitPrice ?? ""
      };
    }) : [{ weight: "250gm", customWeight: "", sellingPrice: "", originalPrice: "", sellingUnitPrice: "", originalUnitPrice: "" }];
    
    setVariants(loadedVariants);
    
    // Map existing images
    const imgs = p.images || (p.image_url ? [p.image_url] : []);
    setExistingImages(imgs);
    setSelectedImages([]); // Clear newly selected images when loading edit mode
    
    setIsAdding(true); // Open the form
    setIsPastingData(false);
    setImportQueue([]);
  };

  const handleEditBrandClick = (b) => {
    setEditingBrand(b);
    
    // Map existing image
    const imgs = b.image_url ? [b.image_url] : [];
    setExistingImages(imgs);
    setSelectedImages([]);
    
    setIsAdding(true);
    setIsPastingData(false);
    setImportQueue([]);
  };

  // Import State
  const [importQueue, setImportQueue] = useState([]);
  const [currentImportIndex, setCurrentImportIndex] = useState(0);
  
  const [isPastingData, setIsPastingData] = useState(false);
  const [pasteText, setPasteText] = useState("");

  const handleJsonSubmit = () => {
    if (!pasteText.trim()) return;

    try {
      const json = JSON.parse(pasteText);
      
      let productsArray = [];
      if (Array.isArray(json)) {
        // Check if it's an array of brand groups (each containing a "products" array) or just an array of products
        json.forEach(item => {
          if (item.products && Array.isArray(item.products)) {
            productsArray.push(...item.products);
          } else {
            productsArray.push(item);
          }
        });
      } else if (json.products && Array.isArray(json.products)) {
        productsArray = json.products;
      } else {
        productsArray = [json];
      }
      
      const mappedQueue = productsArray.map((item, idx) => {
        const title = item.productName || item.title || `Imported Product ${idx + 1}`;
        const rawHandle = (item.productName || item.title || "").toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
        const handle = `${rawHandle}-${item.sno || Date.now() + idx}`;
        
        let weight = "250gm";
        let customWeight = "";
        const itemWeight = item.packSize || item.weight || "";
        if (["250gm", "500gm", "1kg", "2kg", "5kg"].includes(itemWeight.toLowerCase().replace(" ", ""))) {
          weight = itemWeight.toLowerCase().replace(" ", "");
        } else if (itemWeight) {
          weight = "Custom";
          customWeight = itemWeight;
        }

        const rawSellingPrice = item.MRP !== undefined ? item.MRP : item.mrp;
        const rawOriginalPrice = item.Price !== undefined ? item.Price : (item.price !== undefined ? item.price : item.compare_at_price);

        const isObjectSelling = typeof rawSellingPrice === 'object' && rawSellingPrice !== null;
        const isObjectOriginal = typeof rawOriginalPrice === 'object' && rawOriginalPrice !== null;

        const sellingPriceVal = isObjectSelling ? (rawSellingPrice.perPcs ?? rawSellingPrice.perKg ?? "") : (rawSellingPrice ?? "");
        const sellingUnitPriceVal = isObjectSelling ? (rawSellingPrice.perKg ?? "") : "";

        const originalPriceVal = isObjectOriginal ? (rawOriginalPrice.perPcs ?? rawOriginalPrice.perKg ?? "") : (rawOriginalPrice ?? "");
        const originalUnitPriceVal = isObjectOriginal ? (rawOriginalPrice.perKg ?? "") : "";

        return {
          title,
          handle,
          vendor: item.brand || item.vendor || "",
          productType: item.category || item.productType || "",
          description: item.description || "",
          variants: [
            {
              weight,
              customWeight,
              sellingPrice: sellingPriceVal,
              originalPrice: originalPriceVal,
              sellingUnitPrice: sellingUnitPriceVal,
              originalUnitPrice: originalUnitPriceVal
            }
          ]
        };
      });

      setImportQueue(mappedQueue);
      setCurrentImportIndex(0);
      setIsAdding(true);
      setIsPastingData(false);
      setPasteText("");
      setActiveSubTab("products");
      if (mappedQueue.length > 0) {
        setVariants(mappedQueue[0].variants);
      }
    } catch (err) {
      alert("Failed to parse JSON. Please ensure it is valid JSON format.");
    }
  };

  const handleExcelSubmit = () => {
    if (!pasteText.trim()) return;
    try {
      const rows = pasteText.trim().split('\n').map(row => row.split('\t'));
      if (rows.length < 2) throw new Error("Need at least a header row and one data row.");
      
      const headers = rows[0].map(h => h.trim().toLowerCase());
      
      const productsArray = rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((h, idx) => {
          obj[h] = row[idx] ? row[idx].trim() : "";
        });
        return obj;
      });

      const mappedQueue = productsArray.map((item, idx) => {
        const itemTitle = item["productname"] || item["title"] || item["name"] || item["product name"] || `Imported Product ${idx + 1}`;
        const itemBrand = item["brand"] || item["vendor"] || "";
        const itemCategory = item["category"] || item["producttype"] || item["product type"] || item["type"] || "";
        const itemSno = item["sno"] || item["id"] || Date.now() + idx;
        const itemMrp = item["mrp"] || item["mrp (per pcs)"] || item["mrp (per kg)"] || item["selling price"] || "";
        const itemPrice = item["price"] || item["price (per pcs)"] || item["price (per kg)"] || item["compare_at_price"] || item["original price"] || "";
        const itemPackSize = item["packsize"] || item["pack size"] || item["weight"] || "250gm";
        const itemDesc = item["description"] || item["desc"] || "";
        
        const rawHandle = itemTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
        const handle = `${rawHandle}-${itemSno}`;

        let weight = "250gm";
        let customWeight = "";
        if (["250gm", "500gm", "1kg", "2kg", "5kg"].includes(itemPackSize.toLowerCase().replace(" ", ""))) {
          weight = itemPackSize.toLowerCase().replace(" ", "");
        } else if (itemPackSize) {
          weight = "Custom";
          customWeight = itemPackSize;
        }

        return {
          title: itemTitle,
          handle,
          vendor: itemBrand,
          productType: itemCategory,
          description: itemDesc,
          variants: [
            {
              weight,
              customWeight,
              sellingPrice: itemMrp,
              originalPrice: itemPrice,
              sellingUnitPrice: "",
              originalUnitPrice: ""
            }
          ]
        };
      });

      setImportQueue(mappedQueue);
      setCurrentImportIndex(0);
      setIsAdding(true);
      setIsPastingData(false);
      setPasteText("");
      setActiveSubTab("products");
      if (mappedQueue.length > 0) {
        setVariants(mappedQueue[0].variants);
      }
    } catch (err) {
      alert("Failed to parse Excel data. Make sure you copied rows with headers from Excel.");
    }
  };

  const handleSkipImport = () => {
     const nextIndex = currentImportIndex + 1;
     if (nextIndex < importQueue.length) {
        setCurrentImportIndex(nextIndex);
        setVariants(importQueue[nextIndex].variants);
     } else {
        alert("All imported products processed!");
        setImportQueue([]);
        setIsAdding(false);
        window.location.reload();
     }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);

    formData.delete("imageFile");
    selectedImages.forEach((file) => {
      formData.append("imageFile", file);
    });
    
    if (activeSubTab === "products") {
      formData.append("variantsData", JSON.stringify(variants));
      if (editingProduct) {
        formData.append("existingImages", JSON.stringify(existingImages));
      }
    }
    
    let result;
    if (editingProduct) {
      result = await updateProduct(editingProduct.id, formData);
    } else if (editingBrand) {
      const existingUrl = existingImages.length > 0 ? existingImages[0] : "";
      formData.append("existingImageUrl", existingUrl);
      result = await updateBrand(editingBrand.id, formData);
    } else {
      if (activeSubTab === "products") {
        result = await addProduct(formData);
      } else if (activeSubTab === "categories") {
        result = await addCategory(formData);
      } else if (activeSubTab === "brands") {
        result = await addBrand(formData);
      }
    }
    
    if (result?.error) {
      alert(`Error ${editingProduct || editingBrand ? "updating" : "adding"} entry: ` + result.error);
    } else {
       if (editingProduct || editingBrand) {
         alert("Updated successfully!");
         resetFormState();
         window.location.reload();
       } else {
         if (activeSubTab === "products") {
           // Create a fake product object to display instantly in the table
           const newProduct = {
             id: Date.now(),
             title: formData.get("title") || "New Product",
             handle: formData.get("handle") || "new-product",
             vendor: formData.get("vendor") || "",
             Price: { perPcs: formData.getAll("variantsData").length ? JSON.parse(formData.get("variantsData") || "[]")?.[0]?.sellingPrice || 0 : 0 },
             variants: JSON.parse(formData.get("variantsData") || "[]")
           };
           setProducts(prev => [newProduct, ...prev]);
         } else if (activeSubTab === "categories") {
           setCategories(prev => [{ id: Date.now(), title: formData.get("title"), handle: formData.get("handle") }, ...prev]);
         } else if (activeSubTab === "brands") {
           setBrands(prev => [{ id: Date.now(), title: formData.get("title"), handle: formData.get("handle") }, ...prev]);
         }
  
         if (importQueue.length > 0) {
            const nextIndex = currentImportIndex + 1;
            if (nextIndex < importQueue.length) {
               setCurrentImportIndex(nextIndex);
               setVariants(importQueue[nextIndex].variants);
               setSelectedImages([]);
            } else {
               alert("All imported products processed!");
               setImportQueue([]);
               setIsAdding(false);
               setSelectedImages([]);
               window.location.reload();
            }
         } else {
           alert("Added successfully!");
           setIsAdding(false);
           setVariants([{ weight: "250gm", customWeight: "", sellingPrice: "", originalPrice: "", sellingUnitPrice: "", originalUnitPrice: "" }]);
           setSelectedImages([]);
         }
       }
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    
    let result;
    if (activeSubTab === "products") {
      result = await deleteProduct(id);
      if (!result?.error) setProducts(products.filter(p => p.id !== id));
    } else if (activeSubTab === "categories") {
      result = await deleteCategory(id);
      if (!result?.error) setCategories(categories.filter(c => c.id !== id));
    } else if (activeSubTab === "brands") {
      result = await deleteBrand(id);
      if (!result?.error) setBrands(brands.filter(b => b.id !== id));
    }
    
    if (result?.error) {
      alert("Error deleting entry: " + result.error);
    }
  };

  const currentImportItem = importQueue[currentImportIndex];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2 p-1 bg-neutral-100 rounded-full w-fit">
          <button
            onClick={() => { setActiveSubTab("products"); resetFormState(); }}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition ${activeSubTab === "products" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900"}`}
          >
            Products
          </button>
          <button
            onClick={() => { setActiveSubTab("categories"); resetFormState(); }}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition ${activeSubTab === "categories" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900"}`}
          >
            Categories
          </button>
          <button
            onClick={() => { setActiveSubTab("brands"); resetFormState(); }}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition ${activeSubTab === "brands" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900"}`}
          >
            Brands
          </button>
        </div>
        
        <div className="flex gap-2">
          {activeSubTab === "products" && (
            <button
              onClick={() => { setIsPastingData(!isPastingData); setIsAdding(false); }}
              className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-200 transition whitespace-nowrap"
            >
              {isPastingData ? "Cancel Paste" : "Paste Data"}
            </button>
          )}
          <button
            onClick={() => { if (isAdding) { resetFormState(); } else { setIsAdding(true); setImportQueue([]); setIsPastingData(false); } }}
            className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition whitespace-nowrap"
          >
            {isAdding ? "Cancel" : `Add ${activeSubTab === "products" ? "Product" : activeSubTab === "categories" ? "Category" : "Brand"}`}
          </button>
        </div>
      </div>

      {isPastingData && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-4">
          <h3 className="text-lg font-medium text-neutral-900">Paste Product Data</h3>
          <p className="text-sm text-neutral-500">Paste JSON or select rows directly from Excel / Google Sheets and paste them here.</p>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm focus:ring-2 focus:ring-neutral-900 font-mono text-xs"
            rows={8}
            placeholder='Either: { "productName": "BUTTER UNSALTED", ... }&#10;Or Excel: productName [TAB] brand [TAB] ...'
          />
          <div className="flex gap-3">
            <button
              onClick={handleExcelSubmit}
              className="rounded-full bg-[#107c41] px-6 py-2 text-sm font-medium text-white hover:bg-[#0c5e31] transition"
            >
              Load Excel
            </button>
            <button
              onClick={handleJsonSubmit}
              className="rounded-full bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition"
            >
              Load JSON
            </button>
          </div>
        </div>
      )}

      {isAdding && (
        <form key={`form-${editingProduct ? `edit-${editingProduct.id}` : editingBrand ? `edit-brand-${editingBrand.id}` : currentImportIndex}-${activeSubTab}`} onSubmit={handleAddSubmit} className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-5">
          {importQueue.length > 0 && (
             <div className="mb-4 flex items-center justify-between rounded-xl bg-amber-50 p-4 border border-amber-200">
               <p className="text-sm font-medium text-amber-900">
                 Importing product {currentImportIndex + 1} of {importQueue.length}
               </p>
               <button type="button" onClick={handleSkipImport} className="text-sm font-medium text-amber-700 hover:text-amber-900 underline">
                 Skip This Product
               </button>
             </div>
          )}
        
          <h3 className="text-lg font-medium text-neutral-900 mb-2">
            {editingProduct ? `Edit Product: ${editingProduct.title}` : editingBrand ? `Edit Brand: ${editingBrand.title}` : `New ${activeSubTab === "products" ? "Product" : activeSubTab === "categories" ? "Category" : "Brand"}`}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700">Title</label>
              <input name="title" defaultValue={editingProduct ? editingProduct.title : editingBrand ? editingBrand.title : (currentImportItem?.title || "")} required className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700">Handle (Slug)</label>
              <input name="handle" defaultValue={editingProduct ? editingProduct.handle : editingBrand ? editingBrand.handle : (currentImportItem?.handle || "")} required className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900" placeholder="e.g. fresh-milk" />
            </div>
            
            {activeSubTab === "products" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-neutral-700">Brand / Vendor</label>
                  <input name="vendor" defaultValue={editingProduct ? editingProduct.vendor : (currentImportItem?.vendor || "")} className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700">Category / Type</label>
                  <input name="productType" defaultValue={editingProduct ? editingProduct.productType : (currentImportItem?.productType || "")} className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900" />
                </div>
              </>
            )}
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {activeSubTab === "products" ? "Product Images" : activeSubTab === "categories" ? "Category Image" : "Brand Image"}
              </label>
              
              {(existingImages.length > 0 || selectedImages.length > 0) && (
                 <div className="flex gap-3 mb-3 overflow-x-auto pb-2">
                    {existingImages.map((url, idx) => (
                       <div key={`existing-${idx}`} className="relative group shrink-0">
                          <img 
                             src={url} 
                             alt={`Existing ${idx + 1}`} 
                             className="w-24 h-24 object-cover rounded-xl border border-neutral-200" 
                          />
                          <button 
                             type="button" 
                             onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== idx))}
                             className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md"
                             title="Remove image"
                          >
                             ✕
                          </button>
                       </div>
                    ))}
                    {selectedImages.map((file, idx) => (
                       <div key={`selected-${idx}`} className="relative group shrink-0">
                          <img 
                             src={URL.createObjectURL(file)} 
                             alt={`Preview ${idx + 1}`} 
                             className="w-24 h-24 object-cover rounded-xl border border-neutral-200" 
                          />
                          <button 
                             type="button" 
                             onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== idx))}
                             className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md"
                             title="Remove image"
                          >
                             ✕
                          </button>
                       </div>
                    ))}
                 </div>
              )}

              <div>
                 <input 
                    type="file" 
                    id="multi-image-upload"
                    accept="image/*" 
                    multiple
                    className="hidden"
                    onChange={(e) => {
                       if (e.target.files && e.target.files.length > 0) {
                          const files = Array.from(e.target.files);
                          setSelectedImages(prev => [...prev, ...files]);
                          
                          // Reset input value async so it doesn't destroy the File objects before React state updates
                          setTimeout(() => {
                             e.target.value = '';
                          }, 100);
                       }
                    }}
                 />
                 <label 
                    htmlFor="multi-image-upload" 
                    className="inline-flex items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-6 py-4 text-sm font-semibold text-emerald-600 hover:bg-neutral-100 hover:border-emerald-300 transition cursor-pointer w-full sm:w-auto"
                 >
                    + Add Image
                 </label>
              </div>
            </div>
          </div>
          
          {activeSubTab === "products" && (
            <>
              <div>
                <label className="block text-sm font-medium text-neutral-700">Description</label>
                <textarea name="description" defaultValue={editingProduct ? (editingProduct.descriptionHtml?.replace(/^<p>|<\/p>$/g, '') || "") : (currentImportItem?.description || "")} rows={3} className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900" />
              </div>
              
              <div className="space-y-3 pt-4 border-t border-neutral-100">
                <div className="flex items-center justify-between">
                   <h4 className="font-medium text-neutral-900">Variants & Pricing</h4>
                   <button type="button" onClick={() => setVariants([...variants, { weight: "250gm", customWeight: "", sellingPrice: "", originalPrice: "", sellingUnitPrice: "", originalUnitPrice: "" }])} className="text-sm font-medium text-emerald-600 hover:text-emerald-700">+ Add Variant</button>
                </div>
                {variants.map((v, i) => (
                  <div key={i} className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                     <div className="w-full sm:w-[20%]">
                        <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">Pack Size</label>
                        <select 
                           value={v.weight}
                           onChange={(e) => { const newV = [...variants]; newV[i].weight = e.target.value; setVariants(newV); }}
                           className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900"
                        >
                           <option value="250gm">250gm</option>
                           <option value="500gm">500gm</option>
                           <option value="1kg">1kg</option>
                           <option value="2kg">2kg</option>
                           <option value="5kg">5kg</option>
                           <option value="Custom">Custom</option>
                        </select>
                        {v.weight === "Custom" && (
                           <input placeholder="e.g. 1 Dozen" value={v.customWeight || ""} onChange={(e) => { const newV = [...variants]; newV[i].customWeight = e.target.value; setVariants(newV); }} className="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900" />
                        )}
                     </div>
                     
                     <div className="flex-1 w-full flex items-center gap-3">
                         <div className="flex-1 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                             <label className="block text-[11px] font-semibold text-emerald-800 uppercase tracking-wider mb-2">Selling Price</label>
                             <div className="flex flex-col xl:flex-row gap-2">
                                <div className="flex-1">
                                   <label className="block text-[10px] text-emerald-600 mb-1">Per Pack</label>
                                   <input type="number" placeholder="₹" value={v.sellingPrice} onChange={(e) => { const newV = [...variants]; newV[i].sellingPrice = e.target.value; setVariants(newV); }} className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 bg-white" required />
                                </div>
                                <div className="flex-1">
                                   <label className="block text-[10px] text-emerald-600 mb-1">Rs / Kg</label>
                                   <input type="number" placeholder="₹" value={v.sellingUnitPrice || ""} onChange={(e) => { const newV = [...variants]; newV[i].sellingUnitPrice = e.target.value; setVariants(newV); }} className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 bg-white" />
                                </div>
                             </div>
                         </div>
                         
                         <button type="button" onClick={() => {
                             const newV = [...variants];
                             const tempSp = newV[i].sellingPrice;
                             const tempSup = newV[i].sellingUnitPrice;
                             newV[i].sellingPrice = newV[i].originalPrice;
                             newV[i].sellingUnitPrice = newV[i].originalUnitPrice;
                             newV[i].originalPrice = tempSp;
                             newV[i].originalUnitPrice = tempSup;
                             setVariants(newV);
                         }} className="p-2 shrink-0 rounded-full bg-white border border-neutral-300 shadow-sm hover:bg-neutral-100 transition text-neutral-600" title="Swap Prices">
                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                               <path d="m16 3 4 4-4 4"/>
                               <path d="M20 7H4"/>
                               <path d="m8 21-4-4 4-4"/>
                               <path d="M4 17h16"/>
                             </svg>
                         </button>

                         <div className="flex-1 rounded-xl border border-neutral-200 bg-white p-3">
                             <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">Original Price (MRP)</label>
                             <div className="flex flex-col xl:flex-row gap-2">
                                <div className="flex-1">
                                   <label className="block text-[10px] text-neutral-500 mb-1">Per Pack</label>
                                   <input type="number" placeholder="₹" value={v.originalPrice || ""} onChange={(e) => { const newV = [...variants]; newV[i].originalPrice = e.target.value; setVariants(newV); }} className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900 bg-neutral-50" />
                                </div>
                                <div className="flex-1">
                                   <label className="block text-[10px] text-neutral-500 mb-1">Rs / Kg</label>
                                   <input type="number" placeholder="₹" value={v.originalUnitPrice || ""} onChange={(e) => { const newV = [...variants]; newV[i].originalUnitPrice = e.target.value; setVariants(newV); }} className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900 bg-neutral-50" />
                                </div>
                             </div>
                         </div>
                     </div>
                     
                     {variants.length > 1 && (
                        <div className="sm:w-auto flex items-start pt-5">
                          <button type="button" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="p-2 text-red-500 hover:text-red-700">✕</button>
                        </div>
                     )}
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-emerald-600 px-8 py-3 text-base font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition w-full sm:w-auto shadow-md"
            >
              {isSubmitting ? "Saving..." : (editingProduct || editingBrand) ? "Save Changes" : "Save Entry"}
            </button>
          </div>
        </form>
      )}

      {/* Render Tables based on active sub-tab */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              {activeSubTab === "products" ? (
                <>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Brand</th>
                  <th className="px-4 py-3 font-medium">Pricing</th>
                </>
              ) : (
                <>
                  <th className="px-4 py-3 font-medium">Image</th>
                  <th className="px-4 py-3 font-medium">Title & Slug</th>
                </>
              )}
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {activeSubTab === "products" && (
              products.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-neutral-500">No products found. Add some above.</td></tr>
              ) : (
                products.map((p) => {
                  const firstVar = p.variants?.[0] || {};
                  const rawSellingPrice = firstVar?.price?.amount || p.Price?.perPcs || p.price || 0;
                  const rawOriginalPrice = firstVar?.compareAtPrice?.amount || p.MRP?.perPcs || p.compare_at_price || 0;
                  
                  const sellingPrice = parseFloat(rawSellingPrice) || 0;
                  const originalPrice = parseFloat(rawOriginalPrice) || 0;
                  const showDiscount = originalPrice > sellingPrice;
                  const discountPercent = showDiscount ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0;
                  
                  const unitPrice = firstVar?.unitPrice?.amount || p.Price?.perKg || null;
                  const packSize = p.variants?.length === 1 ? firstVar.title : (p.weight || p.packSize || "");

                  return (
                    <tr key={p.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 font-medium text-neutral-900 flex items-center gap-3">
                        <button 
                          onClick={() => handleDelete(p.id)} 
                          className="text-red-500 hover:text-red-700 transition shrink-0"
                          title="Delete product"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                          </svg>
                        </button>
                        <div>
                          {p.title}
                          <div className="text-xs text-neutral-500 font-normal">{p.handle}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{p.vendor || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                           <span className="font-semibold text-neutral-900">₹{sellingPrice}</span>
                           {showDiscount && <span className="text-xs text-neutral-400 line-through">₹{originalPrice}</span>}
                        </div>
                        {(packSize || unitPrice || showDiscount) && (
                          <div className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-1.5">
                             {showDiscount && <span className="font-semibold text-emerald-600">{discountPercent}% OFF</span>}
                             {showDiscount && (packSize || unitPrice) && <span className="text-neutral-300">•</span>}
                             {packSize && <span>{packSize}</span>}
                             {unitPrice && <span>(₹{unitPrice}/kg)</span>}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleEditClick(p)} className="text-emerald-600 hover:text-emerald-800 font-medium">Edit</button>
                      </td>
                    </tr>
                  )
                })
              )
            )}

            {activeSubTab === "categories" && (
              categories.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-neutral-500">No categories found. Add some above.</td></tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      {c.image_url ? <img src={c.image_url} alt={c.title} className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-neutral-200" />}
                    </td>
                    <td className="px-4 py-3 font-medium text-neutral-900">
                      {c.title}
                      <div className="text-xs text-neutral-500 font-normal">{c.handle}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                    </td>
                  </tr>
                ))
              )
            )}

            {activeSubTab === "brands" && (
              brands.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-neutral-500">No brands found. Add some above.</td></tr>
              ) : (
                brands.map((b) => (
                  <tr key={b.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      {b.image_url ? <img src={b.image_url} alt={b.title} className="w-10 h-10 rounded-lg object-contain bg-neutral-50 p-1 border" /> : <div className="w-10 h-10 rounded-lg bg-neutral-200" />}
                    </td>
                    <td className="px-4 py-3 font-medium text-neutral-900 flex items-center gap-3">
                      <button 
                        onClick={() => handleDelete(b.id)} 
                        className="text-red-500 hover:text-red-700 transition shrink-0"
                        title="Delete brand"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"/>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        </svg>
                      </button>
                      <div>
                        {b.title}
                        <div className="text-xs text-neutral-500 font-normal">{b.handle}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleEditBrandClick(b)} className="text-emerald-600 hover:text-emerald-800 font-medium">Edit</button>
                    </td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
