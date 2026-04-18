import { useState, useEffect } from "react";
import { getProducts } from "../services/api";
import storage from "../services/storage";
import { Package, Search, Filter, Star, Plus, X, Edit2, Trash2, Save } from "lucide-react";

export default function Inventory() {
  const [apiProducts, setApiProducts] = useState([]);
  const [customProducts, setCustomProducts] = useState(() => storage.get("custom_products", []));
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: "", category: "", price: "", description: "", image: "" });

  useEffect(() => { const load = async () => { setLoading(true); setApiProducts(await getProducts()); setLoading(false); }; load(); }, []);
  useEffect(() => { storage.set("custom_products", customProducts); }, [customProducts]);

  const allProducts = [...customProducts, ...apiProducts];
  const categories = ["all", ...new Set(allProducts.map((p) => p.category))];
  const filtered = allProducts.filter((p) => {
    return p.title.toLowerCase().includes(searchTerm.toLowerCase()) && (selectedCategory === "all" || p.category === selectedCategory);
  });

  const saveProduct = () => {
    if (!form.title || !form.price) return;
    const product = {
      id: editId || `custom_${Date.now()}`,
      title: form.title,
      category: form.category || "Custom",
      price: parseFloat(form.price),
      description: form.description,
      image: form.image || null,
      rating: { rate: 0, count: 0 },
      isCustom: true,
    };
    if (editId) {
      setCustomProducts(customProducts.map((p) => p.id === editId ? product : p));
    } else {
      setCustomProducts([product, ...customProducts]);
    }
    setShowAddModal(false);
    setEditId(null);
    setForm({ title: "", category: "", price: "", description: "", image: "" });
  };

  const deleteProduct = (id) => {
    setCustomProducts(customProducts.filter((p) => p.id !== id));
    setSelectedProduct(null);
  };

  const openEdit = (p) => {
    setForm({ title: p.title, category: p.category, price: String(p.price), description: p.description || "", image: p.image || "" });
    setEditId(p.id);
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end animate-fade-in-up">
        <div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Inventory</h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Manage and browse your product catalog</p>
        </div>
        <button onClick={() => { setForm({ title: "", category: "", price: "", description: "", image: "" }); setEditId(null); setShowAddModal(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-white shadow-sm transition-all hover:shadow-md"
          style={{ background: "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))" }}>
          <Plus className="w-3.5 h-3.5" /> Add Product
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 animate-fade-in-up-delay-1">
        <div className="flex items-center px-4 py-2.5 rounded-xl border w-72 transition-all duration-200"
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}>
          <Search className="w-4 h-4 mr-2.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
          <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full" style={{ color: "var(--text-primary)" }} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
          {categories.map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
              style={{
                backgroundColor: selectedCategory === cat ? "var(--accent)" : "var(--bg-surface)",
                color: selectedCategory === cat ? "#ffffff" : "var(--text-secondary)",
                border: selectedCategory === cat ? "none" : "1px solid var(--border-main)",
              }}>{cat}</button>
          ))}
        </div>
        <span className="text-xs ml-auto" style={{ color: "var(--text-muted)" }}>{filtered.length} products found</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1,2,3,4,5,6,7,8].map((i) => <div key={i} className="skeleton h-64 rounded-2xl"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fade-in-up-delay-2">
          {filtered.map((product) => (
            <div key={product.id}
              className="rounded-2xl shadow-sm border overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer relative"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}
              onClick={() => setSelectedProduct(selectedProduct?.id === product.id ? null : product)}>
              {product.isCustom && (
                <span className="absolute top-2 right-2 z-10 text-[9px] font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "var(--accent)" }}>Custom</span>
              )}
              {product.image ? (
                <div className="h-40 flex items-center justify-center p-4" style={{ backgroundColor: "var(--bg-surface-warm)", borderBottom: "1px solid var(--border-light)" }}>
                  <img src={product.image} alt={product.title} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.style.display = "none"; }} />
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center" style={{ backgroundColor: "var(--bg-surface-warm)", borderBottom: "1px solid var(--border-light)" }}>
                  <Package className="w-10 h-10" style={{ color: "var(--border-main)" }} />
                </div>
              )}
              <div className="p-4">
                <p className="text-[10px] uppercase tracking-wider font-semibold mb-1 capitalize" style={{ color: "var(--text-muted)" }}>{product.category}</p>
                <h4 className="text-sm font-semibold line-clamp-2 leading-snug" style={{ color: "var(--text-primary)" }}>{product.title}</h4>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>${product.price}</span>
                  {product.rating?.rate > 0 && <span className="flex items-center gap-1 text-xs" style={{ color: "var(--accent-gold)" }}><Star className="w-3.5 h-3.5 fill-current" />{product.rating.rate}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
          <div className="relative rounded-2xl shadow-2xl border max-w-lg w-full max-h-[80vh] overflow-y-auto animate-fade-in-up"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}
            onClick={(e) => e.stopPropagation()}>
            {selectedProduct.image && (
              <div className="h-56 flex items-center justify-center p-6" style={{ backgroundColor: "var(--bg-surface-warm)", borderBottom: "1px solid var(--border-light)" }}>
                <img src={selectedProduct.image} alt={selectedProduct.title} className="max-h-full max-w-full object-contain" />
              </div>
            )}
            <div className="p-6">
              <p className="text-[10px] uppercase tracking-wider font-semibold mb-1 capitalize" style={{ color: "var(--text-muted)" }}>{selectedProduct.category}</p>
              <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{selectedProduct.title}</h3>
              {selectedProduct.description && <p className="text-sm mt-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{selectedProduct.description}</p>}
              <div className="flex items-center justify-between mt-5 pt-4" style={{ borderTop: "1px solid var(--border-light)" }}>
                <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>${selectedProduct.price}</span>
                {selectedProduct.rating?.rate > 0 && <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: "var(--accent-gold)" }}><Star className="w-4 h-4 fill-current" />{selectedProduct.rating.rate}</span>}
              </div>
              <div className="flex gap-2 mt-5">
                {selectedProduct.isCustom && (
                  <>
                    <button onClick={() => { openEdit(selectedProduct); setSelectedProduct(null); }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all"
                      style={{ borderColor: "var(--border-main)", color: "var(--text-primary)" }}>
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={() => deleteProduct(selectedProduct.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
                      style={{ backgroundColor: "var(--accent-red)" }}>
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </>
                )}
                <button onClick={() => setSelectedProduct(null)}
                  className={`${selectedProduct.isCustom ? "" : "w-full"} flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all`}
                  style={{ background: "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))" }}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
          <div className="relative rounded-2xl shadow-2xl border max-w-md w-full animate-fade-in-up"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }} onClick={(e) => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{editId ? "Edit Product" : "Add Product"}</h3>
                <button onClick={() => setShowAddModal(false)} style={{ color: "var(--text-muted)" }}><X className="w-5 h-5" /></button>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Product Name *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Wireless Earbuds" className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "var(--border-main)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Category</label>
                  <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g., Electronics" className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                    style={{ borderColor: "var(--border-main)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Price ($) *</label>
                  <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="e.g., 49.99" className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                    style={{ borderColor: "var(--border-main)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                  placeholder="Product description..." className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none resize-none"
                  style={{ borderColor: "var(--border-main)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Image URL (optional)</label>
                <input type="url" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..." className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "var(--border-main)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }} />
              </div>
              <button onClick={saveProduct} disabled={!form.title || !form.price}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white transition-all shadow-sm disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))" }}>
                <Save className="w-4 h-4" /> {editId ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
