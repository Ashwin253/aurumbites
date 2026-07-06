"use client";

import { useState, useMemo, useEffect } from "react";
import { addProduct, deleteProduct, addCategory, deleteCategory, addBrand, deleteBrand, updateProduct, updateBrand, toggleProductArchive, toggleCategoryArchive, toggleBrandArchive } from "./actions";
import ImageEditorModal from "./ImageEditorModal";

function slugifySegment(text) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function buildRecommendedProductHandle(title, brand, category) {
  return [title, brand, category].map(slugifySegment).filter(Boolean).join("-");
}

export default function InventoryTab({ initialProducts, initialCategories, initialBrands }) {
  const [activeSubTab, setActiveSubTab] = useState("products");
  const [showArchived, setShowArchived] = useState(false);
  
  const [products, setProducts] = useState(initialProducts || []);
  const [categories, setCategories] = useState(initialCategories || []);
  const [brands, setBrands] = useState(initialBrands || []);
  const [brandFilter, setBrandFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const brandListForDropdown = useMemo(() => {
    const seen = new Set();
    const list = [];

    // Prioritize brands managed in the Brands tab
    brands.forEach((b) => {
      if (b.title) {
        const key = b.title.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          list.push(b.title);
        }
      }
    });

    // Also include any additional brands mentioned in products
    products.forEach((p) => {
      if (p.vendor) {
        const key = p.vendor.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          list.push(p.vendor);
        }
      }
    });

    return list.sort((a, b) => a.localeCompare(b));
  }, [brands, products]);

  const categoryListForDropdown = useMemo(() => {
    const seen = new Set();
    const list = [];

    // Prioritize categories managed in the Categories tab
    categories.forEach((c) => {
      if (c.title) {
        const key = c.title.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          list.push(c.title);
        }
      }
    });

    // Also include any additional categories mentioned in products
    products.forEach((p) => {
      if (p.productType) {
        const key = p.productType.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          list.push(p.productType);
        }
      }
    });

    return list.sort((a, b) => a.localeCompare(b));
  }, [categories, products]);
  
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [variants, setVariants] = useState([{ weight: "250gm", customWeight: "", unit: "g", sellingPrice: "", originalPrice: "", sellingUnitPrice: "", originalUnitPrice: "", stock: "", callForInventory: false }]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingBrand, setEditingBrand] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [editorFile, setEditorFile] = useState(null);
  const [editorIndex, setEditorIndex] = useState(-1);
  const [editorSource, setEditorSource] = useState(null);

  const handleSaveEditedImage = (editedFile) => {
    if (editorSource === "selected") {
      setSelectedImages(prev => prev.map((f, i) => i === editorIndex ? editedFile : f));
    } else if (editorSource === "existing") {
      setExistingImages(prev => prev.filter((_, i) => i !== editorIndex));
      setSelectedImages(prev => [...prev, editedFile]);
    }
    setEditorFile(null);
    setEditorIndex(-1);
    setEditorSource(null);
  };

  // Nutrition table state
  const UNIT_OPTIONS = ["", "g", "mg", "kg", "ml", "l", "kcal","mcg", "%", "IU"];
  const STANDARD_NUTRIENTS = ["Energy", "Total Fat", "Sodium", "Protein", "Carbohydrate"];

  const getPackUnit = (title) => {
    if (!title) return "g";
    const t = String(title).toLowerCase().replace(/\s/g, "");
    if (t.includes("kg")) return "kg";
    if (t.includes("gm") || t.includes("g")) return "g";
    if (t.includes("ml")) return "ml";
    if (t.includes("l") && !t.includes("ml")) return "l";
    return "g";
  };

  const getUnitDisplay = (u) => {
    if (!u) return "gm";
    if (u === "g") return "gm";
    if (u === "kg") return "kg";
    if (u === "l") return "L";
    if (u === "ml") return "ml";
    return u;
  };

  const getPricingUnit = (u) => {
    if (!u) return "kg";
    const lower = u.toLowerCase();
    if (lower === "g" || lower === "gm") return "kg";
    if (lower === "ml") return "L";
    if (lower === "kg") return "kg";
    if (lower === "l") return "L";
    return "kg";
  };

  const defaultNutrition = () => ({
    title: "NUTRITION",
    servingSize: "",
    columns: ["Nutrient", "Per Serving"],
    rows: [],
  });
  const [nutrition, setNutrition] = useState(defaultNutrition());
  const [showNutrition, setShowNutrition] = useState(false);

  const defaultFaq = () => ({
    title: "FAQ",
    rows: [],
  });
  const [faq, setFaq] = useState(defaultFaq());
  const [showFaq, setShowFaq] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formHandle, setFormHandle] = useState("");
  const [formVendor, setFormVendor] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [handleManuallyEdited, setHandleManuallyEdited] = useState(false);

  const applyRecommendedHandle = ({
    title = formTitle,
    vendor = formVendor,
    category = formCategory,
    force = false,
  } = {}) => {
    if (!force && handleManuallyEdited) return;

    if (activeSubTab === "products") {
      setFormHandle(buildRecommendedProductHandle(title, vendor, category));
      return;
    }

    setFormHandle(slugifySegment(title));
  };

  const initNewEntityForm = () => {
    setFormTitle("");
    setFormHandle("");
    setFormVendor("");
    setFormCategory("");
    setHandleManuallyEdited(false);
  };

  const syncFormFromProduct = (item, { preserveHandle = false } = {}) => {
    const title = item?.title || "";
    const vendor = item?.vendor || "";
    const category = item?.productType || "";

    setFormTitle(title);
    setFormVendor(vendor);
    setFormCategory(category);

    if (preserveHandle) {
      setFormHandle(item?.handle || "");
      setHandleManuallyEdited(true);
      return;
    }

    const recommended = buildRecommendedProductHandle(title, vendor, category);
    setFormHandle(recommended || item?.handle || "");
    setHandleManuallyEdited(false);
  };

  const resetFormState = () => {
    setIsAdding(false);
    setEditingProduct(null);
    setEditingBrand(null);
    setExistingImages([]);
    setSelectedImages([]);
    setVariants([{ weight: "250gm", customWeight: "", unit: "g", sellingPrice: "", originalPrice: "", sellingUnitPrice: "", originalUnitPrice: "", askPrice: false, stock: "", callForInventory: false }]);
    setNutrition(defaultNutrition());
    setShowNutrition(false);
    setFaq(defaultFaq());
    setShowFaq(false);
    setImportQueue([]);
    setIsPastingData(false);
    setBrandFilter("");
    initNewEntityForm();
  };

  const openAddBrand = () => {
    resetFormState();
    setActiveSubTab("brands");
    setIsAdding(true);
  };

  const openAddCategory = () => {
    resetFormState();
    setActiveSubTab("categories");
    setIsAdding(true);
  };

  const handleEditClick = (p) => {
    setEditingProduct(p);
    
    // Map variants back
    let loadedVariants = [{ weight: "250gm", customWeight: "", unit: "g", sellingPrice: "", originalPrice: "", sellingUnitPrice: "", originalUnitPrice: "", askPrice: false, stock: "", callForInventory: false }];
    
    try {
      let rawVariants = p.variants;
      if (typeof rawVariants === "string") {
        try {
          rawVariants = JSON.parse(rawVariants);
        } catch (e) {
          rawVariants = [];
        }
      }
      
      if (Array.isArray(rawVariants) && rawVariants.length > 0) {
        loadedVariants = rawVariants.filter(Boolean).map(v => {
          const title = String(v.title || v.weight || "");
          const isStandard = ["250gm", "500gm", "1kg", "2kg", "5kg"].includes(title.toLowerCase().replace(" ", ""));
          return {
            id: v.id,
            weight: isStandard ? title.toLowerCase().replace(" ", "") : "Custom",
            customWeight: isStandard ? "" : title,
            unit: v.unit || (isStandard ? getPackUnit(title) : "g"),
            sellingPrice: v.price?.amount ?? v.price ?? "",
            originalPrice: v.compareAtPrice?.amount ?? v.compareAtPrice ?? "",
            sellingUnitPrice: v.unitPrice?.amount ?? v.unitPrice ?? "",
            originalUnitPrice: v.originalUnitPrice?.amount ?? v.originalUnitPrice ?? "",
            askPrice: !!v.askPrice,
            stock: v.stock !== undefined && v.stock !== null ? v.stock : "",
            callForInventory: !!v.callForInventory
          };
        });
      }
    } catch (err) {
      console.error("Error mapping variants in handleEditClick:", err);
    }
    
    setVariants(loadedVariants);
    
    // Map existing images
    let imgs = [];
    try {
      let rawImages = p.images;
      if (typeof rawImages === "string") {
        try {
          rawImages = JSON.parse(rawImages);
        } catch (e) {
          rawImages = [];
        }
      }
      imgs = Array.isArray(rawImages) ? rawImages : (p.image_url ? [p.image_url] : []);
    } catch (err) {
      console.error("Error mapping images in handleEditClick:", err);
      imgs = p.image_url ? [p.image_url] : [];
    }
    
    setExistingImages(imgs);
    setSelectedImages([]); // Clear newly selected images when loading edit mode
    
    // Load existing nutrition
    if (p.nutrition && p.nutrition.rows) {
      setNutrition(p.nutrition);
      setShowNutrition(true);
    } else {
      setNutrition(defaultNutrition());
      setShowNutrition(false);
    }

    // Load existing FAQ
    if (p.faq && p.faq.rows?.length > 0) {
      setFaq(p.faq);
      setShowFaq(true);
    } else {
      setFaq(defaultFaq());
      setShowFaq(false);
    }
    
    syncFormFromProduct(p, { preserveHandle: true });
    setIsAdding(true); // Open the form
    setIsPastingData(false);
    setImportQueue([]);
  };

  const handleEditBrandClick = (b) => {
    setEditingBrand(b);
    setFormTitle(b.title || "");
    setFormHandle(b.handle || "");
    setFormVendor("");
    setFormCategory("");
    setHandleManuallyEdited(true);
    
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
        const vendor = item.brand || item.vendor || "";
        const productType = item.category || item.productType || "";
        const handle = buildRecommendedProductHandle(title, vendor, productType) || `imported-product-${item.sno || Date.now() + idx}`;
        
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
          vendor,
          productType,
          description: item.description || "",
          variants: [
            {
              weight,
              customWeight,
              unit: weight === "Custom" ? "g" : getPackUnit(weight),
              sellingPrice: sellingPriceVal,
              originalPrice: originalPriceVal,
              sellingUnitPrice: sellingUnitPriceVal,
              originalUnitPrice: originalUnitPriceVal,
              askPrice: false
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
        syncFormFromProduct(mappedQueue[0]);
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
        
        const handle = buildRecommendedProductHandle(itemTitle, itemBrand, itemCategory) || `imported-product-${itemSno}`;

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
              unit: weight === "Custom" ? "g" : getPackUnit(weight),
              sellingPrice: itemMrp,
              originalPrice: itemPrice,
              sellingUnitPrice: "",
              originalUnitPrice: "",
              askPrice: false
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
        syncFormFromProduct(mappedQueue[0]);
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
        syncFormFromProduct(importQueue[nextIndex]);
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
      if (showNutrition && nutrition.rows.length > 0) {
        formData.append("nutritionData", JSON.stringify(nutrition));
      }
      if (showFaq && faq.rows.some((r) => r.question?.trim())) {
        formData.append(
          "faqData",
          JSON.stringify({
            ...faq,
            rows: faq.rows.filter((r) => r.question?.trim()),
          })
        );
      }
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

           // Also add the vendor to local brands list so the dropdown immediately reflects it
           const vendorName = formData.get("vendor")?.trim();
           if (vendorName) {
             const lower = vendorName.toLowerCase();
             const alreadyExists = brands.some((b) => (b.title || "").toLowerCase() === lower);
             if (!alreadyExists) {
               setBrands((prev) => [
                 {
                   id: Date.now(),
                   title: vendorName,
                   handle: vendorName.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, ""),
                 },
                 ...prev,
               ]);
             }
           }
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
            setVariants([{ weight: "250gm", customWeight: "", unit: "g", sellingPrice: "", originalPrice: "", sellingUnitPrice: "", originalUnitPrice: "", askPrice: false, stock: "", callForInventory: false }]);
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

  const handleToggleArchive = async (id, isCurrentlyArchived) => {
    const actionText = isCurrentlyArchived ? "restore" : "archive";
    if (!confirm(`Are you sure you want to ${actionText} this entry?`)) return;

    let result;
    const targetStatus = !isCurrentlyArchived;

    if (activeSubTab === "products") {
      result = await toggleProductArchive(id, targetStatus);
      if (!result?.error) {
        setProducts(products.map(p => p.id === id ? { ...p, is_archived: targetStatus } : p));
      }
    } else if (activeSubTab === "categories") {
      result = await toggleCategoryArchive(id, targetStatus);
      if (!result?.error) {
        setCategories(categories.map(c => c.id === id ? { ...c, is_archived: targetStatus } : c));
      }
    } else if (activeSubTab === "brands") {
      result = await toggleBrandArchive(id, targetStatus);
      if (!result?.error) {
        setBrands(brands.map(b => b.id === id ? { ...b, is_archived: targetStatus } : b));
      }
    }

    if (result?.error) {
      alert(`Error trying to ${actionText} entry: ` + result.error);
    }
  };

  const currentImportItem = importQueue[currentImportIndex];

  const renderEditorForm = ({ inline = false } = {}) => (
    <form
      key={`form-${editingProduct ? `edit-${editingProduct.id}` : editingBrand ? `edit-brand-${editingBrand.id}` : currentImportIndex}-${activeSubTab}`}
      onSubmit={handleAddSubmit}
      className={`rounded-2xl border border-neutral-200 bg-white p-6 space-y-5 ${inline ? "m-4 shadow-sm" : ""}`}
    >
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
          <input
            name="title"
            value={formTitle}
            onChange={(e) => {
              const val = e.target.value;
              setFormTitle(val);
              applyRecommendedHandle({ title: val });
            }}
            required
            className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900"
          />
        </div>
        <div>
          <div className="flex items-center justify-between gap-2">
            <label className="block text-sm font-medium text-neutral-700">Handle (Slug)</label>
            {activeSubTab === "products" && handleManuallyEdited ? (
              <button
                type="button"
                onClick={() => {
                  setHandleManuallyEdited(false);
                  applyRecommendedHandle({ force: true });
                }}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900"
              >
                Use recommended
              </button>
            ) : null}
          </div>
          <input
            name="handle"
            value={formHandle}
            onChange={(e) => {
              setFormHandle(e.target.value);
              setHandleManuallyEdited(true);
            }}
            required
            className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900"
            placeholder={activeSubTab === "products" ? "title-brand-category" : "e.g. fresh-milk"}
          />
          {activeSubTab === "products" && !handleManuallyEdited ? (
            <p className="mt-1 text-[10px] text-neutral-500">
              Recommended from Title · Brand · Category
            </p>
          ) : null}
        </div>
        
        {activeSubTab === "products" && (
          <>
            <div>
              <label className="block text-sm font-medium text-neutral-700">Brand / Vendor</label>
              <div className="flex gap-2">
                <select
                  name="vendor"
                  value={formVendor}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormVendor(val);
                    applyRecommendedHandle({ vendor: val });
                  }}
                  className="flex-1 mt-1 rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="">-- Select brand --</option>
                  {brandListForDropdown.map((title, idx) => (
                    <option key={idx} value={title}>{title}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={openAddBrand}
                  className="mt-1 px-3 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 border border-emerald-200 rounded-xl whitespace-nowrap transition"
                >
                  + Add new brand
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700">Category / Type</label>
              <div className="flex gap-2">
                <select
                  name="productType"
                  value={formCategory}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormCategory(val);
                    applyRecommendedHandle({ category: val });
                  }}
                  className="flex-1 mt-1 rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="">-- Select category --</option>
                  {categoryListForDropdown.map((title, idx) => (
                    <option key={idx} value={title}>{title}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={openAddCategory}
                  className="mt-1 px-3 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 border border-emerald-200 rounded-xl whitespace-nowrap transition"
                >
                  + Add new category
                </button>
              </div>
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
                   <div key={`existing-${idx}`} className="flex flex-col gap-1.5 shrink-0 bg-neutral-50 p-2 rounded-2xl border border-neutral-200">
                      <img 
                         src={url} 
                         alt={`Existing ${idx + 1}`} 
                         className="w-24 h-24 object-cover rounded-xl" 
                      />
                      <div className="flex gap-1 w-full">
                         <button 
                            type="button" 
                            onClick={() => {
                               setEditorFile(url);
                               setEditorIndex(idx);
                               setEditorSource("existing");
                            }}
                            className="flex-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-1 text-[10px] font-bold transition cursor-pointer text-center"
                         >
                            Edit
                         </button>
                         <button 
                            type="button" 
                            onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== idx))}
                            className="rounded-lg bg-red-50 hover:bg-red-100 text-red-600 px-1.5 py-1 text-[10px] font-bold transition cursor-pointer text-center"
                         >
                            Del
                         </button>
                      </div>
                   </div>
                ))}
                {selectedImages.map((file, idx) => (
                   <div key={`selected-${idx}`} className="flex flex-col gap-1.5 shrink-0 bg-neutral-50 p-2 rounded-2xl border border-neutral-200">
                      <img 
                         src={URL.createObjectURL(file)} 
                         alt={`Preview ${idx + 1}`} 
                         className="w-24 h-24 object-cover rounded-xl" 
                      />
                      <div className="flex gap-1 w-full">
                         <button 
                            type="button" 
                            onClick={() => {
                               setEditorFile(file);
                               setEditorIndex(idx);
                               setEditorSource("selected");
                            }}
                            className="flex-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-1 text-[10px] font-bold transition cursor-pointer text-center"
                         >
                            Edit
                         </button>
                         <button 
                            type="button" 
                            onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== idx))}
                            className="rounded-lg bg-red-50 hover:bg-red-100 text-red-600 px-1.5 py-1 text-[10px] font-bold transition cursor-pointer text-center"
                         >
                            Del
                         </button>
                      </div>
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
                      
                      // Prevent exceeding Server Action body limits (10mb configured)
                      const MAX_FILES = 6;
                      const MAX_SINGLE_SIZE = 2 * 1024 * 1024; // 2MB per image
                      const tooMany = files.length > MAX_FILES;
                      const tooLarge = files.some((f) => f.size > MAX_SINGLE_SIZE);
                      
                      if (tooMany || tooLarge) {
                        alert(`Max ${MAX_FILES} images. Each image should be under 2MB.`);
                        e.target.value = '';
                        return;
                      }
                      
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

          {/* ── Nutrition Info Table ── */}
          <div className="pt-4 border-t border-neutral-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-neutral-900">Nutrition Info Table</h4>
              <button
                type="button"
                onClick={() => {
                  const newShow = !showNutrition;
                  if (newShow && (!nutrition.rows || nutrition.rows.length === 0)) {
                    // Pre-populate with common nutrients when first enabling
                    const initialRows = STANDARD_NUTRIENTS.map(nutrient => 
                      nutrition.columns.map((_, idx) => ({ 
                        value: idx === 0 ? nutrient : "", 
                        unit: "" 
                      }))
                    );
                    setNutrition(n => ({
                      ...n,
                      rows: initialRows
                    }));
                  }
                  setShowNutrition(newShow);
                }}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${showNutrition ? "bg-neutral-200 text-neutral-700" : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"}`}
              >
                {showNutrition ? "Remove Nutrition" : "+ Add Nutrition"}
              </button>
            </div>

            {showNutrition && (
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 space-y-4">
                {/* Title & Serving Size */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Table Title</label>
                    <input
                      type="text"
                      value={nutrition.title}
                      onChange={e => setNutrition(n => ({ ...n, title: e.target.value }))}
                      placeholder="NUTRITION"
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Serving Size</label>
                    <input
                      type="text"
                      value={nutrition.servingSize}
                      onChange={e => setNutrition(n => ({ ...n, servingSize: e.target.value }))}
                      placeholder="e.g. 100g"
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900 bg-white"
                    />
                  </div>
                </div>

                {/* Column headers */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Column Headers</label>
                  <div className="flex flex-wrap gap-2 items-center">
                    {nutrition.columns.map((col, ci) => (
                      <div key={ci} className="flex items-center gap-1">
                        <input
                          type="text"
                          value={col}
                          onChange={e => {
                            const cols = [...nutrition.columns];
                            cols[ci] = e.target.value;
                            setNutrition(n => ({ ...n, columns: cols }));
                          }}
                          className="w-28 rounded-lg border border-neutral-300 px-2 py-1.5 text-xs focus:ring-2 focus:ring-neutral-900 bg-white"
                        />
                        {nutrition.columns.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const cols = nutrition.columns.filter((_, i) => i !== ci);
                              const rows = nutrition.rows.map(row => row.filter((_, i) => i !== ci));
                              setNutrition(n => ({ ...n, columns: cols, rows }));
                            }}
                            className="text-red-400 hover:text-red-600 text-xs"
                          >✕</button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setNutrition(n => ({
                          ...n,
                          columns: [...n.columns, `Col ${n.columns.length + 1}`],
                          rows: n.rows.map(row => [...row, { value: "", unit: "" }]),
                        }));
                      }}
                      className="rounded-full bg-white border border-dashed border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:border-neutral-400"
                    >
                      + Column
                    </button>
                  </div>
                </div>

                {/* Rows */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Rows</label>
                  <div className="space-y-2">
                    {nutrition.rows.map((row, ri) => (
                      <div key={ri} className="flex items-center gap-2 flex-wrap">
                        {row.map((cell, ci) => (
                          <div key={ci} className="flex items-center gap-1">
                            {ci === 0 ? (
                              <>
                                <select
                                  value={STANDARD_NUTRIENTS.includes(cell.value) ? cell.value : (cell.value ? "__custom__" : "")}
                                  onChange={e => {
                                    const newVal = e.target.value;
                                    const updatedValue = newVal === "__custom__" 
                                      ? (cell.value && !STANDARD_NUTRIENTS.includes(cell.value) ? cell.value : "") 
                                      : newVal;
                                    const rows = nutrition.rows.map((r, rIdx) =>
                                      rIdx === ri ? r.map((c, cIdx) => cIdx === ci ? { ...c, value: updatedValue } : c) : r
                                    );
                                    setNutrition(n => ({ ...n, rows }));
                                  }}
                                  className="w-24 rounded-lg border border-neutral-300 px-1 py-1 text-xs focus:ring-2 focus:ring-neutral-900 bg-white"
                                >
                                  <option value="">--</option>
                                  {STANDARD_NUTRIENTS.map(n => (
                                    <option key={n} value={n}>{n}</option>
                                  ))}
                                  <option value="__custom__">Custom...</option>
                                </select>
                                {!STANDARD_NUTRIENTS.includes(cell.value) && (
                                  <input
                                    type="text"
                                    value={cell.value}
                                    onChange={e => {
                                      const rows = nutrition.rows.map((r, rIdx) =>
                                        rIdx === ri ? r.map((c, cIdx) => cIdx === ci ? { ...c, value: e.target.value } : c) : r
                                      );
                                      setNutrition(n => ({ ...n, rows }));
                                    }}
                                    placeholder="Nutrient name"
                                    className="w-28 rounded-lg border border-neutral-300 px-2 py-1 text-xs focus:ring-2 focus:ring-neutral-900 bg-white"
                                  />
                                )}
                              </>
                            ) : (
                              <input
                                type="text"
                                value={cell.value}
                                onChange={e => {
                                  const rows = nutrition.rows.map((r, rIdx) =>
                                    rIdx === ri ? r.map((c, cIdx) => cIdx === ci ? { ...c, value: e.target.value } : c) : r
                                  );
                                  setNutrition(n => ({ ...n, rows }));
                                }}
                                placeholder={nutrition.columns[ci] || "Value"}
                                className="w-24 rounded-lg border border-neutral-300 px-2 py-1.5 text-xs focus:ring-2 focus:ring-neutral-900 bg-white"
                              />
                            )}
                            {ci > 0 && (
                              <>
                                <select
                                  value={UNIT_OPTIONS.includes(cell.unit) ? cell.unit : ""}
                                  onChange={e => {
                                    const newUnit = e.target.value;
                                    const rows = nutrition.rows.map((r, rIdx) =>
                                      rIdx === ri ? r.map((c, cIdx) => cIdx === ci ? { ...c, unit: newUnit } : c) : r
                                    );
                                    setNutrition(n => ({ ...n, rows }));
                                  }}
                                  className="rounded-lg border border-neutral-300 px-1 py-1.5 text-xs focus:ring-2 focus:ring-neutral-900 bg-white"
                                >
                                  {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u || "—"}</option>)}
                                </select>
                                {!UNIT_OPTIONS.includes(cell.unit) && (
                                  <input
                                    type="text"
                                    value={cell.unit}
                                    onChange={e => {
                                      const rows = nutrition.rows.map((r, rIdx) =>
                                        rIdx === ri ? r.map((c, cIdx) => cIdx === ci ? { ...c, unit: e.target.value } : c) : r
                                      );
                                      setNutrition(n => ({ ...n, rows }));
                                    }}
                                    placeholder="Custom unit"
                                    className="w-20 rounded-lg border border-neutral-300 px-1.5 py-1 text-xs focus:ring-2 focus:ring-neutral-900 bg-white"
                                  />
                                )}
                              </>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setNutrition(n => ({ ...n, rows: n.rows.filter((_, i) => i !== ri) }))}
                          className="text-red-400 hover:text-red-600 text-xs ml-1"
                        >✕</button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setNutrition(n => ({
                      ...n,
                      rows: [...n.rows, n.columns.map(() => ({ value: "", unit: "" }))],
                    }))}
                    className="mt-2 rounded-full bg-white border border-dashed border-neutral-300 px-4 py-1.5 text-xs font-medium text-neutral-600 hover:border-neutral-400"
                  >
                    + Add Row
                  </button>
                </div>

                {/* SQL helper */}
                {/* <details className="rounded-xl border border-neutral-200 bg-white">
                  <summary className="px-4 py-2.5 text-xs font-semibold text-neutral-600 cursor-pointer hover:text-neutral-900 select-none">
                    View Supabase SQL (add nutrition column)
                  </summary>
                  <pre className="p-4 text-[11px] leading-5 text-emerald-800 bg-emerald-50 rounded-b-xl overflow-x-auto whitespace-pre-wrap select-all">{`-- Run this once in your Supabase SQL editor:
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS nutrition jsonb DEFAULT NULL;

-- nutrition column stores:
-- {
--   "title": "NUTRITION",
--   "servingSize": "100g",
--   "columns": ["Nutrient", "Per Serving"],
--   "rows": [
--     [{"value":"Energy","unit":""},{"value":"52","unit":"kcal"}],
--     [{"value":"Protein","unit":""},{"value":"0.3","unit":"g"}]
--   ]
-- }`}</pre>
                </details> */}
              </div>
            )}
          </div>

          {/* ── Ingredients ── */}
          <div className="pt-4 border-t border-neutral-100">
            <h4 className="font-medium text-neutral-900 mb-2">Ingredients</h4>
            <textarea
              name="ingredients"
              defaultValue={editingProduct ? (editingProduct.ingredients || "") : (currentImportItem?.ingredients || "")}
              rows={3}
              placeholder="Milk, Sugar, Cocoa Mass, Cocoa Butter, Emulsifier (Soy Lecithin), Natural Vanilla Flavour"
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900"
            />
            <p className="text-[10px] text-neutral-500 mt-1">Comma separated list of ingredients used in the product.</p>
            {/* <details className="mt-2">
              <summary className="text-[10px] text-neutral-500 cursor-pointer hover:text-neutral-700">Supabase: Run this once</summary>
              <pre className="mt-1 p-2 text-[10px] bg-neutral-100 rounded text-neutral-600 overflow-auto select-all">ALTER TABLE products ADD COLUMN IF NOT EXISTS ingredients text;</pre>
            </details> */}
          </div>

          {/* ── FAQ ── */}
          <div className="pt-4 border-t border-neutral-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-neutral-900">FAQ</h4>
              <button
                type="button"
                onClick={() => {
                  const newShow = !showFaq;
                  if (newShow && (!faq.rows || faq.rows.length === 0)) {
                    setFaq((f) => ({
                      ...f,
                      rows: [{ question: "", answer: "" }],
                    }));
                  }
                  setShowFaq(newShow);
                }}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${showFaq ? "bg-neutral-200 text-neutral-700" : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"}`}
              >
                {showFaq ? "Remove FAQ" : "+ Add FAQ"}
              </button>
            </div>

            {showFaq && (
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Section Title</label>
                  <input
                    type="text"
                    value={faq.title}
                    onChange={(e) => setFaq((f) => ({ ...f, title: e.target.value }))}
                    placeholder="FAQ"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Questions</label>
                  <div className="space-y-3">
                    {faq.rows.map((row, ri) => (
                      <div key={ri} className="rounded-xl border border-neutral-200 bg-white p-3 space-y-2">
                        <div className="flex items-start gap-2">
                          <input
                            type="text"
                            value={row.question}
                            onChange={(e) => {
                              const rows = faq.rows.map((r, rIdx) =>
                                rIdx === ri ? { ...r, question: e.target.value } : r
                              );
                              setFaq((f) => ({ ...f, rows }));
                            }}
                            placeholder="Question"
                            className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900"
                          />
                          <button
                            type="button"
                            onClick={() => setFaq((f) => ({ ...f, rows: f.rows.filter((_, i) => i !== ri) }))}
                            className="text-red-400 hover:text-red-600 text-xs px-2 py-2"
                          >
                            ✕
                          </button>
                        </div>
                        <textarea
                          value={row.answer}
                          onChange={(e) => {
                            const rows = faq.rows.map((r, rIdx) =>
                              rIdx === ri ? { ...r, answer: e.target.value } : r
                            );
                            setFaq((f) => ({ ...f, rows }));
                          }}
                          placeholder="Answer"
                          rows={2}
                          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setFaq((f) => ({ ...f, rows: [...f.rows, { question: "", answer: "" }] }))}
                    className="mt-2 rounded-full bg-white border border-dashed border-neutral-300 px-4 py-1.5 text-xs font-medium text-neutral-600 hover:border-neutral-400"
                  >
                    + Add Question
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-4 border-t border-neutral-100">
            <div className="flex items-center justify-between">
               <h4 className="font-medium text-neutral-900">Variants & Pricing</h4>
                <button type="button" onClick={() => setVariants([...variants, { weight: "250gm", customWeight: "", unit: "g", sellingPrice: "", originalPrice: "", sellingUnitPrice: "", originalUnitPrice: "", askPrice: false, stock: "", callForInventory: false }])} className="text-sm font-medium text-emerald-600 hover:text-emerald-700">+ Add Variant</button>
            </div>
            {variants.map((v, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                 <div className="w-full sm:w-[20%]">
                    <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">Pack Size</label>
                    <select 
                       value={v.weight}
                       onChange={(e) => { 
                         const newV = [...variants]; 
                         const val = e.target.value; 
                         newV[i].weight = val; 
                         if (val === "Custom") {
                           newV[i].unit = newV[i].unit || "g";
                         } else {
                           newV[i].unit = getPackUnit(val);
                           newV[i].customWeight = "";
                         }
                         setVariants(newV); 
                       }}
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
                      <>
                        <input placeholder="e.g. 1 Dozen or 500" value={v.customWeight || ""} onChange={(e) => { const newV = [...variants]; newV[i].customWeight = e.target.value; setVariants(newV); }} className="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900" />
                        <select 
                          value={v.unit || "g"} 
                          onChange={(e) => { const newV = [...variants]; newV[i].unit = e.target.value; setVariants(newV); }} 
                          className="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900"
                        >
                          <option value="g">g / gm</option>
                          <option value="kg">kg</option>
                          <option value="ml">ml</option>
                          <option value="l">L</option>
                        </select>
                      </>
                    )}
                 </div>
                 
                 <div className="w-full sm:w-[18%]">
                    <div className="flex justify-between items-center mb-1">
                       <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Stock Qty</label>
                       <label className="flex items-center gap-1 text-[10px] text-neutral-500 font-medium cursor-pointer">
                          <input 
                             type="checkbox" 
                             checked={v.callForInventory || false} 
                             onChange={(e) => { 
                                const newV = [...variants]; 
                                newV[i].callForInventory = e.target.checked; 
                                if(e.target.checked) { 
                                   newV[i].stock = ""; 
                                } 
                                setVariants(newV); 
                             }} 
                             className="rounded border-neutral-300 text-neutral-600 focus:ring-neutral-900 h-3 w-3" 
                          />
                          Call
                       </label>
                    </div>
                    <input 
                       type="number" 
                       min="0"
                       placeholder={v.callForInventory ? "Call for Stock" : "∞ (Unlimited)"} 
                       value={v.stock !== undefined && v.stock !== null ? v.stock : ""} 
                       disabled={v.callForInventory}
                       onChange={(e) => { const newV = [...variants]; newV[i].stock = e.target.value; setVariants(newV); }} 
                       className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900 bg-white disabled:bg-neutral-100 disabled:text-neutral-400" 
                    />
                 </div>

                 <div className="flex-1 w-full flex items-center gap-3">
                     <div className="flex-1 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                         <div className="flex justify-between items-center mb-2">
                            <label className="block text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Selling Price</label>
                            <label className="flex items-center gap-1.5 text-[10px] text-emerald-800 font-medium cursor-pointer">
                               <input type="checkbox" checked={v.askPrice || false} onChange={(e) => { const newV = [...variants]; newV[i].askPrice = e.target.checked; if(e.target.checked) { newV[i].sellingPrice = ""; newV[i].sellingUnitPrice = ""; } setVariants(newV); }} className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-600" />
                               Ask Price
                            </label>
                         </div>
                         <div className="flex flex-col xl:flex-row gap-2">
                            <div className="flex-1">
                               <label className="block text-[10px] text-emerald-600 mb-1">Per Pack</label>
                               <input type="number" placeholder="â‚¹" value={v.sellingPrice} disabled={v.askPrice} onChange={(e) => { const newV = [...variants]; newV[i].sellingPrice = e.target.value; setVariants(newV); }} className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 bg-white disabled:bg-neutral-100 disabled:text-neutral-400" required={!v.askPrice} />
                            </div>
                            <div className="flex-1">
                               <label className="block text-[10px] text-emerald-600 mb-1">Rs / {getPricingUnit(v.unit)}</label>
                               <input type="number" placeholder="â‚¹" value={v.sellingUnitPrice || ""} disabled={v.askPrice} onChange={(e) => { const newV = [...variants]; newV[i].sellingUnitPrice = e.target.value; setVariants(newV); }} className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 bg-white disabled:bg-neutral-100 disabled:text-neutral-400" />
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
                               <input type="number" placeholder="â‚¹" value={v.originalPrice || ""} onChange={(e) => { const newV = [...variants]; newV[i].originalPrice = e.target.value; setVariants(newV); }} className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900 bg-neutral-50" />
                            </div>
                            <div className="flex-1">
                               <label className="block text-[10px] text-neutral-500 mb-1">Rs / {getPricingUnit(v.unit)}</label>
                               <input type="number" placeholder="â‚¹" value={v.originalUnitPrice || ""} onChange={(e) => { const newV = [...variants]; newV[i].originalUnitPrice = e.target.value; setVariants(newV); }} className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900 bg-neutral-50" />
                            </div>
                         </div>
                     </div>
                 </div>
                 
                 {variants.length > 1 && (
                    <div className="sm:w-auto flex items-start pt-5">
                      <button type="button" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="p-2 text-red-500 hover:text-red-700">âœ•</button>
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
  );

  const filteredProducts = products.filter(p => showArchived ? p.is_archived : !p.is_archived);

  const displayedProducts = useMemo(() => {
    let list = filteredProducts;
    if (brandFilter) {
      list = list.filter((p) => (p.vendor || "") === brandFilter);
    }
    if (categoryFilter) {
      list = list.filter((p) => (p.productType || "") === categoryFilter);
    }
    return list;
  }, [filteredProducts, brandFilter, categoryFilter]);

  const displayedCategories = categories.filter(c => showArchived ? c.is_archived : !c.is_archived);
  const displayedBrands = brands.filter(b => showArchived ? b.is_archived : !b.is_archived);

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
          <button
            onClick={() => {
              setShowArchived(!showArchived);
              resetFormState();
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition whitespace-nowrap border cursor-pointer shadow-sm ${
              showArchived
                ? "bg-emerald-100 border-emerald-300 text-emerald-800 hover:bg-emerald-200"
                : "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
            }`}
          >
            {showArchived ? "Show Active" : "Show Archived"}
          </button>
          {!showArchived && (
            <>
              {activeSubTab === "products" && (
                <button
                  onClick={() => { setIsPastingData(!isPastingData); setIsAdding(false); }}
                  className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-200 transition whitespace-nowrap cursor-pointer"
                >
                  {isPastingData ? "Cancel Paste" : "Paste Data"}
                </button>
              )}
              <button
                onClick={() => {
                  if (isAdding) {
                    resetFormState();
                  } else {
                    setImportQueue([]);
                    setIsPastingData(false);
                    initNewEntityForm();
                    setIsAdding(true);
                  }
                }}
                className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition whitespace-nowrap cursor-pointer"
              >
                {isAdding ? "Cancel" : `Add ${activeSubTab === "products" ? "Product" : activeSubTab === "categories" ? "Category" : "Brand"}`}
              </button>
            </>
          )}
        </div>
      </div>

      {activeSubTab === "products" && (brandListForDropdown.length > 0 || categoryListForDropdown.length > 0) && (
        <div className="flex flex-wrap items-center gap-4 text-sm bg-neutral-50 p-4 rounded-2xl border border-neutral-200 w-fit">
          {brandListForDropdown.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-neutral-600 text-xs">Filter by Brand:</span>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-600 outline-none"
              >
                <option value="">All Brands</option>
                {brandListForDropdown.map((title, idx) => (
                  <option key={idx} value={title}>{title}</option>
                ))}
              </select>
            </div>
          )}

          {categoryListForDropdown.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-neutral-600 text-xs">Filter by Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-600 outline-none"
              >
                <option value="">All Categories</option>
                {categoryListForDropdown.map((title, idx) => (
                  <option key={idx} value={title}>{title}</option>
                ))}
              </select>
            </div>
          )}

          {(brandFilter || categoryFilter) && (
            <button
              type="button"
              onClick={() => {
                setBrandFilter("");
                setCategoryFilter("");
              }}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 underline cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

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

      {false && (
        <form
          ref={formRef}
          key={`form-${editingProduct ? `edit-${editingProduct.id}` : editingBrand ? `edit-brand-${editingBrand.id}` : currentImportIndex}-${activeSubTab}`}
          onSubmit={handleAddSubmit}
          className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-5"
        >
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
                  <div className="flex gap-2">
                    <select
                      name="vendor"
                      className="flex-1 mt-1 rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900"
                      defaultValue={editingProduct ? (editingProduct.vendor || "") : (currentImportItem?.vendor || "")}
                    >
                      <option value="">-- Select brand --</option>
                      {brandListForDropdown.map((title, idx) => (
                        <option key={idx} value={title}>{title}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={openAddBrand}
                      className="mt-1 px-3 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 border border-emerald-200 rounded-xl whitespace-nowrap transition"
                    >
                      + Add new brand
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700">Category / Type</label>
                  <div className="flex gap-2">
                    <select
                      name="productType"
                      className="flex-1 mt-1 rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900"
                      defaultValue={editingProduct ? (editingProduct.productType || "") : (currentImportItem?.productType || "")}
                    >
                      <option value="">-- Select category --</option>
                      {categoryListForDropdown.map((title, idx) => (
                        <option key={idx} value={title}>{title}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={openAddCategory}
                      className="mt-1 px-3 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 border border-emerald-200 rounded-xl whitespace-nowrap transition"
                    >
                      + Add new category
                    </button>
                  </div>
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
                       <div key={`existing-${idx}`} className="flex flex-col gap-1.5 shrink-0 bg-neutral-50 p-2 rounded-2xl border border-neutral-200">
                          <img 
                             src={url} 
                             alt={`Existing ${idx + 1}`} 
                             className="w-24 h-24 object-cover rounded-xl" 
                          />
                          <div className="flex gap-1 w-full">
                             <button 
                                type="button" 
                                onClick={() => {
                                   setEditorFile(url);
                                   setEditorIndex(idx);
                                   setEditorSource("existing");
                                }}
                                className="flex-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-1 text-[10px] font-bold transition cursor-pointer text-center"
                             >
                                Edit
                             </button>
                             <button 
                                type="button" 
                                onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== idx))}
                                className="rounded-lg bg-red-50 hover:bg-red-100 text-red-600 px-1.5 py-1 text-[10px] font-bold transition cursor-pointer text-center"
                             >
                                Del
                             </button>
                          </div>
                       </div>
                    ))}
                    {selectedImages.map((file, idx) => (
                       <div key={`selected-${idx}`} className="flex flex-col gap-1.5 shrink-0 bg-neutral-50 p-2 rounded-2xl border border-neutral-200">
                          <img 
                             src={URL.createObjectURL(file)} 
                             alt={`Preview ${idx + 1}`} 
                             className="w-24 h-24 object-cover rounded-xl" 
                          />
                          <div className="flex gap-1 w-full">
                             <button 
                                type="button" 
                                onClick={() => {
                                   setEditorFile(file);
                                   setEditorIndex(idx);
                                   setEditorSource("selected");
                                }}
                                className="flex-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-1 text-[10px] font-bold transition cursor-pointer text-center"
                             >
                                Edit
                             </button>
                             <button 
                                type="button" 
                                onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== idx))}
                                className="rounded-lg bg-red-50 hover:bg-red-100 text-red-600 px-1.5 py-1 text-[10px] font-bold transition cursor-pointer text-center"
                             >
                                Del
                             </button>
                          </div>
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
                          
                          // Prevent exceeding Server Action body limits (10mb configured)
                          const MAX_FILES = 6;
                          const MAX_SINGLE_SIZE = 2 * 1024 * 1024; // 2MB per image
                          const tooMany = files.length > MAX_FILES;
                          const tooLarge = files.some((f) => f.size > MAX_SINGLE_SIZE);
                          
                          if (tooMany || tooLarge) {
                            alert(`Max ${MAX_FILES} images. Each image should be under 2MB.`);
                            e.target.value = '';
                            return;
                          }
                          
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

              {/* ── Ingredients ── */}
              <div className="pt-4 border-t border-neutral-100">
                <h4 className="font-medium text-neutral-900 mb-2">Ingredients</h4>
                <textarea
                  name="ingredients"
                  defaultValue={editingProduct ? (editingProduct.ingredients || "") : (currentImportItem?.ingredients || "")}
                  rows={3}
                  placeholder="Milk, Sugar, Cocoa Mass, Cocoa Butter, Emulsifier (Soy Lecithin), Natural Vanilla Flavour"
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900"
                />
                <p className="text-[10px] text-neutral-500 mt-1">Comma separated list of ingredients used in the product.</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-neutral-100">
                <div className="flex items-center justify-between">
                   <h4 className="font-medium text-neutral-900">Variants & Pricing</h4>
                    <button type="button" onClick={() => setVariants([...variants, { weight: "250gm", customWeight: "", unit: "g", sellingPrice: "", originalPrice: "", sellingUnitPrice: "", originalUnitPrice: "", askPrice: false, stock: "", callForInventory: false }])} className="text-sm font-medium text-emerald-600 hover:text-emerald-700">+ Add Variant</button>
                </div>
                {variants.map((v, i) => (
                  <div key={i} className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                     <div className="w-full sm:w-[20%]">
                        <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">Pack Size</label>
                        <select 
                           value={v.weight}
                           onChange={(e) => { 
                             const newV = [...variants]; 
                             const val = e.target.value; 
                             newV[i].weight = val; 
                             if (val === "Custom") {
                               newV[i].unit = newV[i].unit || "g";
                             } else {
                               newV[i].unit = getPackUnit(val);
                               newV[i].customWeight = "";
                             }
                             setVariants(newV); 
                           }}
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
                          <>
                            <input placeholder="e.g. 1 Dozen or 500" value={v.customWeight || ""} onChange={(e) => { const newV = [...variants]; newV[i].customWeight = e.target.value; setVariants(newV); }} className="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900" />
                            <select 
                              value={v.unit || "g"} 
                              onChange={(e) => { const newV = [...variants]; newV[i].unit = e.target.value; setVariants(newV); }} 
                              className="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900"
                            >
                              <option value="g">g / gm</option>
                              <option value="kg">kg</option>
                              <option value="ml">ml</option>
                              <option value="l">L</option>
                            </select>
                          </>
                        )}
                     </div>
                     
                     <div className="w-full sm:w-[18%]">
                        <div className="flex justify-between items-center mb-1">
                           <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Stock Qty</label>
                           <label className="flex items-center gap-1 text-[10px] text-neutral-500 font-medium cursor-pointer">
                              <input 
                                 type="checkbox" 
                                 checked={v.callForInventory || false} 
                                 onChange={(e) => { 
                                    const newV = [...variants]; 
                                    newV[i].callForInventory = e.target.checked; 
                                    if(e.target.checked) { 
                                       newV[i].stock = ""; 
                                    } 
                                    setVariants(newV); 
                                 }} 
                                 className="rounded border-neutral-300 text-neutral-600 focus:ring-neutral-900 h-3 w-3" 
                              />
                              Call
                           </label>
                        </div>
                        <input 
                           type="number" 
                           min="0"
                           placeholder={v.callForInventory ? "Call for Stock" : "∞ (Unlimited)"} 
                           value={v.stock !== undefined && v.stock !== null ? v.stock : ""} 
                           disabled={v.callForInventory}
                           onChange={(e) => { const newV = [...variants]; newV[i].stock = e.target.value; setVariants(newV); }} 
                           className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900 bg-white disabled:bg-neutral-100 disabled:text-neutral-400" 
                        />
                     </div>

                     <div className="flex-1 w-full flex items-center gap-3">
                         <div className="flex-1 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                             <div className="flex justify-between items-center mb-2">
                                <label className="block text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Selling Price</label>
                                <label className="flex items-center gap-1.5 text-[10px] text-emerald-800 font-medium cursor-pointer">
                                   <input type="checkbox" checked={v.askPrice || false} onChange={(e) => { const newV = [...variants]; newV[i].askPrice = e.target.checked; if(e.target.checked) { newV[i].sellingPrice = ""; newV[i].sellingUnitPrice = ""; } setVariants(newV); }} className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-600" />
                                   Ask Price
                                </label>
                             </div>
                             <div className="flex flex-col xl:flex-row gap-2">
                                <div className="flex-1">
                                   <label className="block text-[10px] text-emerald-600 mb-1">Per Pack</label>
                                   <input type="number" placeholder="₹" value={v.sellingPrice} disabled={v.askPrice} onChange={(e) => { const newV = [...variants]; newV[i].sellingPrice = e.target.value; setVariants(newV); }} className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 bg-white disabled:bg-neutral-100 disabled:text-neutral-400" required={!v.askPrice} />
                                </div>
                                <div className="flex-1">
                                   <label className="block text-[10px] text-emerald-600 mb-1">Rs / {getPricingUnit(v.unit)}</label>
                                   <input type="number" placeholder="₹" value={v.sellingUnitPrice || ""} disabled={v.askPrice} onChange={(e) => { const newV = [...variants]; newV[i].sellingUnitPrice = e.target.value; setVariants(newV); }} className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 bg-white disabled:bg-neutral-100 disabled:text-neutral-400" />
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
                                   <label className="block text-[10px] text-neutral-500 mb-1">Rs / {getPricingUnit(v.unit)}</label>
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

      {isAdding && renderEditorForm()}

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
              displayedProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                    {brandFilter 
                      ? `No products found for brand "${brandFilter}".` 
                      : showArchived ? "No archived products found." : "No products found. Add some above."}
                  </td>
                </tr>
              ) : (
                displayedProducts.map((p) => {
                  const firstVar = p.variants?.[0] || {};
                  const rawSellingPrice = firstVar?.price?.amount || p.Price?.perPcs || p.price || 0;
                  const rawOriginalPrice = firstVar?.compareAtPrice?.amount || p.MRP?.perPcs || p.compare_at_price || 0;
                  
                  const sellingPrice = parseFloat(rawSellingPrice) || 0;
                  const originalPrice = parseFloat(rawOriginalPrice) || 0;
                  const showDiscount = originalPrice > sellingPrice;
                  const discountPercent = showDiscount ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0;
                  
                  const unitPrice = firstVar?.unitPrice?.amount || p.Price?.perKg || null;
                  const packSize = p.variants?.length === 1 ? firstVar.title : (p.weight || p.packSize || "");
 
                  const isEditingThisProduct = editingProduct?.id === p.id;
 
                  return (
                    <tr key={p.id} className={`${isEditingThisProduct ? "bg-emerald-50/60 ring-1 ring-inset ring-emerald-200" : "hover:bg-neutral-50"}`}>
                      <td className="px-4 py-3 font-medium text-neutral-900 flex items-center gap-3">
                        <button 
                          onClick={() => handleDelete(p.id)} 
                          className="text-red-500 hover:text-red-700 transition shrink-0 cursor-pointer"
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
                          {p.is_archived && <span className="ml-2 inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20">Archived</span>}
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
                        {p.variants && p.variants.length > 0 && p.variants.some(v => (v.stock !== undefined && v.stock !== null && v.stock !== "") || v.callForInventory) ? (
                          <div className="text-[10px] mt-1 text-neutral-500 font-normal flex flex-wrap gap-x-2 gap-y-0.5">
                            <span className="font-semibold text-neutral-700">Stock:</span>
                            {p.variants.map((v, idx) => {
                              const s = v.callForInventory ? "Call" : (v.stock === "" || v.stock === null ? "∞" : v.stock);
                              const isOut = s !== "∞" && s !== "Call" && parseInt(s) === 0;
                              const isCall = s === "Call";
                              return (
                                <span key={v.id || idx} className={isOut ? "text-red-500 font-semibold" : isCall ? "text-amber-600 font-semibold" : "text-neutral-600"}>
                                  {v.title || v.weight || "Default"}: {s}
                                </span>
                              );
                            }).reduce((prev, curr) => [prev, <span key={Math.random()} className="text-neutral-300">|</span>, curr])}
                          </div>
                        ) : (
                          <div className="text-[10px] mt-1 text-emerald-600 font-normal">
                            Stock: Unlimited (∞)
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleArchive(p.id, p.is_archived)}
                          className="mr-2 text-amber-600 hover:text-amber-800 font-semibold text-xs border border-amber-200 bg-amber-50/50 px-3.5 py-1.5 rounded-lg hover:bg-amber-100 transition cursor-pointer shadow-sm"
                        >
                          {p.is_archived ? "Restore" : "Archive"}
                        </button>
                        {!p.is_archived && (
                          <button
                            type="button"
                            onClick={() => handleEditClick(p)}
                            className={`font-semibold text-xs px-3.5 py-1.5 rounded-lg transition cursor-pointer shadow-sm ${
                              isEditingThisProduct
                                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                : "text-emerald-600 hover:text-emerald-800 border border-emerald-200 bg-emerald-50/50"
                            }`}
                            aria-pressed={isEditingThisProduct}
                          >
                            {isEditingThisProduct ? "Editing" : "Edit"}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )
            )}
 
            {activeSubTab === "categories" && (
              displayedCategories.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-neutral-500">{showArchived ? "No archived categories found." : "No categories found. Add some above."}</td></tr>
              ) : (
                displayedCategories.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      {c.image_url ? <img src={c.image_url} alt={c.title} className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-neutral-200" />}
                    </td>
                    <td className="px-4 py-3 font-medium text-neutral-900">
                      {c.title}
                      {c.is_archived && <span className="ml-2 inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20">Archived</span>}
                      <div className="text-xs text-neutral-500 font-normal">{c.handle}</div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleToggleArchive(c.id, c.is_archived)}
                        className="text-amber-600 hover:text-amber-800 font-semibold text-xs border border-amber-200 bg-amber-50/50 px-3.5 py-1.5 rounded-lg hover:bg-amber-100 transition cursor-pointer shadow-sm"
                      >
                        {c.is_archived ? "Restore" : "Archive"}
                      </button>
                      <button 
                        onClick={() => handleDelete(c.id)} 
                        className="text-red-600 hover:text-red-800 font-semibold text-xs border border-red-200 bg-red-50/50 px-3.5 py-1.5 rounded-lg hover:bg-red-100 transition cursor-pointer shadow-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )
            )}
 
            {activeSubTab === "brands" && (
              displayedBrands.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-neutral-500">{showArchived ? "No archived brands found." : "No brands found. Add some above."}</td></tr>
              ) : (
                displayedBrands.map((b) => (
                  <tr key={b.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      {b.image_url ? <img src={b.image_url} alt={b.title} className="w-10 h-10 rounded-lg object-contain bg-neutral-50 p-1 border" /> : <div className="w-10 h-10 rounded-lg bg-neutral-200" />}
                    </td>
                    <td className="px-4 py-3 font-medium text-neutral-900 flex items-center gap-3">
                      <button 
                        onClick={() => handleDelete(b.id)} 
                        className="text-red-500 hover:text-red-700 transition shrink-0 cursor-pointer"
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
                        {b.is_archived && <span className="ml-2 inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20">Archived</span>}
                        <div className="text-xs text-neutral-500 font-normal">{b.handle}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleToggleArchive(b.id, b.is_archived)}
                        className="text-amber-600 hover:text-amber-800 font-semibold text-xs border border-amber-200 bg-amber-50/50 px-3.5 py-1.5 rounded-lg hover:bg-amber-100 transition cursor-pointer shadow-sm"
                      >
                        {b.is_archived ? "Restore" : "Archive"}
                      </button>
                      {!b.is_archived && (
                        <button
                          type="button"
                          onClick={() => handleEditBrandClick(b)}
                          className={`font-semibold text-xs px-3.5 py-1.5 rounded-lg transition cursor-pointer shadow-sm ${
                            editingBrand?.id === b.id
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "text-emerald-600 hover:text-emerald-800 border border-emerald-200 bg-emerald-50/50"
                          }`}
                          aria-pressed={editingBrand?.id === b.id}
                        >
                          {editingBrand?.id === b.id ? "Editing" : "Edit"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>
      {editorFile && (
        <ImageEditorModal
          file={editorFile}
          onSave={handleSaveEditedImage}
          onClose={() => {
            setEditorFile(null);
            setEditorIndex(-1);
            setEditorSource(null);
          }}
        />
      )}
    </div>
  );
}
