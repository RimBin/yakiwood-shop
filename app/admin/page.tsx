"use client";
import { useState, useEffect, useRef } from "react";
import { seedProducts } from "@/data/seed-products";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  basePrice: number;
  images: string[];
  inStock: boolean;
}

interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  location: string;
  images: string[];
  productsUsed: string[];
  description: string;
  fullDescription?: string;
  featured?: boolean;
  category: string;
}

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  date: string;
  category: string;
  published: boolean;
}

type ActiveTab = 'products' | 'projects' | 'posts';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('products');
  const [message, setMessage] = useState('');

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    description: '',
    category: 'facades',
    basePrice: 0,
    images: '',
    inStock: true,
  });
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileNames, setSelectedFileNames] = useState('No file selected');

  // Get unique categories from existing products
  const getUniqueCategories = () => {
    const defaultCategories = ['facades', 'terraces', 'fences', 'interiors'];
    const productCategories = products.map(p => p.category).filter(c => !defaultCategories.includes(c));
    return [...defaultCategories, ...Array.from(new Set(productCategories))];
  };

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectForm, setProjectForm] = useState({
    title: '',
    subtitle: '',
    slug: '',
    location: '',
    images: '',
    productsUsed: '',
    description: '',
    fullDescription: '',
    category: 'residential',
    featured: false,
  });

  // Posts state
  const [posts, setPosts] = useState<Post[]>([]);
  const [postForm, setPostForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    author: '',
    category: 'news',
    published: false,
  });

  useEffect(() => {
    const savedProducts = localStorage.getItem('yakiwood_products');
    if (savedProducts) setProducts(JSON.parse(savedProducts));

    const savedProjects = localStorage.getItem('yakiwood_projects');
    if (savedProjects) setProjects(JSON.parse(savedProjects));

    const savedPosts = localStorage.getItem('yakiwood_posts');
    if (savedPosts) setPosts(JSON.parse(savedPosts));
  }, []);

  useEffect(() => {
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.setAttribute('data-text', 'Choose files');
      fileInput.setAttribute('data-no-file', 'No file selected');
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setSelectedFileNames('No file selected');
      return;
    }
    const names = Array.from(files).map(f => f.name).join(', ');
    setSelectedFileNames(names);
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const readers: Promise<string>[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      const promise = new Promise<string>((resolve) => {
        reader.onload = (event) => {
          resolve(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
      
      readers.push(promise);
    }

    Promise.all(readers).then((base64Images) => {
      setImageFiles([...imageFiles, ...base64Images]);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const handleAddCustomCategory = () => {
    if (customCategory.trim()) {
      setProductForm({ ...productForm, category: customCategory.toLowerCase().replace(/\s+/g, '-') });
      setCustomCategory('');
      setShowCustomCategory(false);
    }
  };

  // Product handlers
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const urlImages = productForm.images.split(',').map(url => url.trim()).filter(Boolean);
    const allImages = [...imageFiles, ...urlImages];
    
    const newProduct: Product = {
      id: Date.now().toString(),
      ...productForm,
      images: allImages,
      basePrice: Number(productForm.basePrice),
    };
    
    const updated = [...products, newProduct];
    setProducts(updated);
    localStorage.setItem('yakiwood_products', JSON.stringify(updated));
    
    setProductForm({
      name: '',
      slug: '',
      description: '',
      category: 'facades',
      basePrice: 0,
      images: '',
      inStock: true,
    });
    setImageFiles([]);
    
    showMessage('Product added successfully!');
  };

  const handleProductDelete = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    localStorage.setItem('yakiwood_products', JSON.stringify(updated));
    showMessage('Product deleted');
  };

  const handleProductExport = () => {
    const dataStr = JSON.stringify(products, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'yakiwood-products.json';
    link.click();
  };

  // Project handlers
  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject: Project = {
      id: Date.now().toString(),
      ...projectForm,
      images: projectForm.images.split(',').map(url => url.trim()).filter(Boolean),
      productsUsed: projectForm.productsUsed.split(',').map(p => p.trim()).filter(Boolean),
    };
    
    const updated = [...projects, newProject];
    setProjects(updated);
    localStorage.setItem('yakiwood_projects', JSON.stringify(updated));
    
    setProjectForm({
      title: '',
      subtitle: '',
      slug: '',
      location: '',
      images: '',
      productsUsed: '',
      description: '',
      fullDescription: '',
      category: 'residential',
      featured: false,
    });
    
    showMessage('Project added successfully!');
  };

  const handleProjectDelete = (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem('yakiwood_projects', JSON.stringify(updated));
    showMessage('Project deleted');
  };

  const handleProjectExport = () => {
    const dataStr = JSON.stringify(projects, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'yakiwood-projects.json';
    link.click();
  };

  // Post handlers
  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPost: Post = {
      id: Date.now().toString(),
      ...postForm,
      date: new Date().toISOString(),
    };
    
    const updated = [...posts, newPost];
    setPosts(updated);
    localStorage.setItem('yakiwood_posts', JSON.stringify(updated));
    
    setPostForm({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      coverImage: '',
      author: '',
      category: 'news',
      published: false,
    });
    
    showMessage('Post added successfully!');
  };

  const handlePostDelete = (id: string) => {
    const updated = posts.filter(p => p.id !== id);
    setPosts(updated);
    localStorage.setItem('yakiwood_posts', JSON.stringify(updated));
    showMessage('Post deleted');
  };

  const handlePostExport = () => {
    const dataStr = JSON.stringify(posts, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'yakiwood-posts.json';
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#E1E1E1] py-[clamp(32px,5vw,64px)] px-[clamp(16px,3vw,40px)]">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-[clamp(32px,4vw,48px)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-[16px] mb-[8px]">
            <h1 className="font-['DM_Sans'] font-light text-[clamp(40px,6vw,72px)] leading-none tracking-[clamp(-1.6px,-0.025em,-2.88px)] text-[#161616]">
              Admin Panel
            </h1>
            {products.length === 0 && (
              <button
                onClick={() => {
                  setProducts(seedProducts as Product[]);
                  localStorage.setItem('yakiwood_products', JSON.stringify(seedProducts));
                  showMessage('8 products loaded!');
                }}
                className="h-[48px] px-[24px] rounded-[100px] bg-green-500 font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase text-white hover:bg-green-600 transition-colors whitespace-nowrap"
              >
                Load Sample Products
              </button>
            )}
          </div>
          <p className="font-['Outfit'] font-light text-[clamp(14px,1.5vw,16px)] text-[#535353]">
            Manage products, projects, and blog posts
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className="bg-[#161616] text-white px-[24px] py-[16px] rounded-[24px] mb-[32px] font-['Outfit'] text-[14px]">
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-[8px] mb-[32px] overflow-x-auto pb-[8px]">
          {[
            { key: 'products', label: 'Products', count: products.length },
            { key: 'projects', label: 'Projects', count: projects.length },
            { key: 'posts', label: 'Posts', count: posts.length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as ActiveTab)}
              className={`h-[48px] px-[24px] rounded-[100px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-[#161616] text-white'
                  : 'bg-white text-[#161616] hover:bg-[#EAEAEA]'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-[32px]">
            {/* Add Product Form */}
            <div className="bg-white rounded-[24px] p-[clamp(20px,3vw,32px)]">
              <h2 className="font-['DM_Sans'] font-light text-[clamp(24px,3vw,32px)] tracking-[-1.28px] text-[#161616] mb-[24px]">
                Add New Product
              </h2>
              
              <form onSubmit={handleProductSubmit} className="space-y-[20px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                  <div>
                    <label className="block font-['Outfit'] text-[14px] text-[#161616] mb-[8px]">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px] focus:border-[#161616] focus:outline-none"
                      placeholder="Black Larch Facade Board"
                    />
                  </div>

                  <div>
                    <label className="block font-['Outfit'] text-[14px] text-[#161616] mb-[8px]">
                      Slug (URL) *
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.slug}
                      onChange={(e) => setProductForm({ ...productForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px] focus:border-[#161616] focus:outline-none"
                      placeholder="black-larch-facade-board"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-['Outfit'] text-[14px] text-[#161616] mb-[8px]">
                    Description
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px] focus:border-[#161616] focus:outline-none resize-none"
                    placeholder="Enter product description..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
                  <div>
                    <label className="block font-['Outfit'] text-[14px] text-[#161616] mb-[8px]">
                      Category *
                    </label>
                    <select
                      value={productForm.category}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setShowCustomCategory(true);
                        } else {
                          setProductForm({ ...productForm, category: e.target.value });
                        }
                      }}
                      className="w-full px-[16px] py-[16px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px] focus:border-[#161616] focus:outline-none"
                    >
                      {getUniqueCategories().map(cat => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                      <option value="custom">+ Add Custom Category</option>
                    </select>
                    
                    {showCustomCategory && (
                      <div className="mt-[12px] flex gap-[8px]">
                        <input
                          type="text"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomCategory())}
                          placeholder="Enter custom category"
                          className="flex-1 px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px] focus:border-[#161616] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomCategory}
                          className="px-[16px] py-[12px] rounded-[12px] bg-[#161616] text-white font-['Outfit'] text-[12px] hover:bg-[#535353] transition-colors"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCustomCategory(false)}
                          className="px-[16px] py-[12px] rounded-[12px] border border-[#BBBBBB] font-['Outfit'] text-[12px] hover:bg-[#EAEAEA] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-['Outfit'] text-[14px] text-[#161616] mb-[8px]">
                      Base Price (EUR) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={productForm.basePrice}
                      onChange={(e) => setProductForm({ ...productForm, basePrice: Number(e.target.value) })}
                      className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px] focus:border-[#161616] focus:outline-none"
                      placeholder="89.00"
                    />
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center gap-[12px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.inStock}
                        onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                        className="w-[20px] h-[20px] cursor-pointer"
                      />
                      <span className="font-['Outfit'] text-[14px] text-[#161616]">
                        In Stock
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-['Outfit'] text-[14px] text-[#161616] mb-[8px]">
                    Upload Images
                  </label>
                  <div className="w-full border border-[#BBBBBB] rounded-[12px]">
                    <input
                      id="file-upload"
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => { handleFileInputChange(e); handleImageUpload(e); }}
                      className="sr-only"
                    />

                    <div className="flex items-center gap-4 p-[12px]">
                      <label htmlFor="file-upload" className="inline-flex items-center gap-3 bg-[#161616] text-white px-[16px] py-[8px] rounded-[100px] cursor-pointer font-['Outfit'] text-[12px]">
                        Choose files
                      </label>
                      <span className="text-[#535353] font-['Outfit'] text-[14px]">
                        {selectedFileNames}
                      </span>
                    </div>
                  </div>
                  
                  {imageFiles.length > 0 && (
                    <div className="mt-[16px] grid grid-cols-2 md:grid-cols-4 gap-[12px]">
                      {imageFiles.map((img, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={img} 
                            alt={`Preview ${index + 1}`} 
                            className="w-full h-[120px] object-cover rounded-[12px] border border-[#BBBBBB]"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-[4px] right-[4px] w-[24px] h-[24px] rounded-full bg-red-500 text-white text-[14px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">
                    Or add image URLs (comma-separated):
                  </p>
                  <input
                    type="text"
                    value={productForm.images}
                    onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                    className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px] focus:border-[#161616] focus:outline-none mt-[8px]"
                    placeholder="/assets/product1.jpg, https://example.com/image.jpg"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-[48px] rounded-[100px] bg-[#161616] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase text-white hover:bg-[#535353] transition-colors"
                >
                  Add Product
                </button>
              </form>
            </div>

            {/* Products List */}
            <div className="bg-white rounded-[24px] p-[clamp(20px,3vw,32px)]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-[16px] mb-[24px]">
                <h2 className="font-['DM_Sans'] font-light text-[clamp(24px,3vw,32px)] tracking-[-1.28px] text-[#161616]">
                  Products ({products.length})
                </h2>
                {products.length > 0 && (
                  <button
                    onClick={handleProductExport}
                    className="h-[40px] px-[20px] rounded-[100px] border border-[#161616] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase text-[#161616] hover:bg-[#161616] hover:text-white transition-colors"
                  >
                    Export JSON
                  </button>
                )}
              </div>

              {products.length === 0 ? (
                <p className="font-['Outfit'] text-[14px] text-[#535353] text-center py-[40px]">
                  No products yet. Add your first product above.
                </p>
              ) : (
                <div className="space-y-[16px]">
                  {products.map((product) => (
                    <div key={product.id} className="border border-[#BBBBBB] rounded-[16px] p-[20px] hover:border-[#161616] transition-colors">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-[16px]">
                        <div className="flex-1">
                          <h3 className="font-['DM_Sans'] font-light text-[20px] tracking-[-0.8px] text-[#161616] mb-[4px]">
                            {product.name}
                          </h3>
                          <p className="font-['Outfit'] text-[12px] text-[#535353] mb-[8px]">
                            /products/{product.slug}
                          </p>
                          <div className="flex flex-wrap gap-[8px] mb-[12px]">
                            <span className="px-[12px] py-[4px] rounded-[100px] bg-[#E1E1E1] font-['Outfit'] text-[11px] uppercase tracking-[0.55px] text-[#161616]">
                              {product.category}
                            </span>
                            <span className="px-[12px] py-[4px] rounded-[100px] bg-[#161616] font-['Outfit'] text-[11px] uppercase tracking-[0.55px] text-white">
                              €{product.basePrice}
                            </span>
                            {product.inStock && (
                              <span className="px-[12px] py-[4px] rounded-[100px] bg-green-500 font-['Outfit'] text-[11px] uppercase tracking-[0.55px] text-white">
                                In Stock
                              </span>
                            )}
                          </div>
                          {product.description && (
                            <p className="font-['Outfit'] text-[14px] text-[#535353] mb-[12px]">
                              {product.description}
                            </p>
                          )}
                          {product.images.length > 0 && (
                            <>
                              <div className="flex gap-[8px] mb-[8px] overflow-x-auto pb-[8px]">
                                {product.images.slice(0, 4).map((img, idx) => (
                                  <img 
                                    key={idx}
                                    src={img} 
                                    alt={`${product.name} ${idx + 1}`}
                                    className="w-[80px] h-[80px] object-cover rounded-[8px] border border-[#BBBBBB] flex-shrink-0"
                                  />
                                ))}
                                {product.images.length > 4 && (
                                  <div className="w-[80px] h-[80px] rounded-[8px] border border-[#BBBBBB] flex items-center justify-center bg-[#E1E1E1] flex-shrink-0">
                                    <span className="font-['Outfit'] text-[12px] text-[#535353]">
                                      +{product.images.length - 4}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <p className="font-['Outfit'] text-[12px] text-[#535353]">
                                {product.images.length} image(s) in gallery
                              </p>
                            </>
                          )}
                        </div>
                        <button
                          onClick={() => handleProductDelete(product.id)}
                          className="h-[36px] px-[16px] rounded-[100px] bg-red-500 font-['Outfit'] font-normal text-[11px] tracking-[0.55px] uppercase text-white hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-[32px]">
            <div className="bg-white rounded-[24px] p-[clamp(20px,3vw,32px)]">
              <h2 className="font-['DM_Sans'] font-light text-[clamp(24px,3vw,32px)] tracking-[-1.28px] text-[#161616] mb-[24px]">
                Add New Project
              </h2>
              
              <form onSubmit={handleProjectSubmit} className="space-y-[20px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                  <input type="text" required value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px]" placeholder="Project Title" />
                  <input type="text" required value={projectForm.slug} onChange={(e) => setProjectForm({ ...projectForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px]" placeholder="project-slug" />
                </div>
                <input type="text" required value={projectForm.location} onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px]" placeholder="Location" />
                <textarea required value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} rows={3} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px]" placeholder="Description" />
                <input type="text" required value={projectForm.images} onChange={(e) => setProjectForm({ ...projectForm, images: e.target.value })} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px]" placeholder="Image URLs (comma-separated)" />
                <button type="submit" className="w-full h-[48px] rounded-[100px] bg-[#161616] font-['Outfit'] text-[12px] uppercase text-white hover:bg-[#535353] transition-colors">Add Project</button>
              </form>
            </div>

            <div className="bg-white rounded-[24px] p-[clamp(20px,3vw,32px)]">
              <h2 className="font-['DM_Sans'] font-light text-[clamp(24px,3vw,32px)] tracking-[-1.28px] text-[#161616] mb-[24px]">Projects ({projects.length})</h2>
              {projects.length === 0 ? (
                <p className="font-['Outfit'] text-[14px] text-[#535353] text-center py-[40px]">No projects yet.</p>
              ) : (
                <div className="space-y-[16px]">
                  {projects.map((project) => (
                    <div key={project.id} className="border border-[#BBBBBB] rounded-[16px] p-[20px]">
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <h3 className="font-['DM_Sans'] text-[20px] tracking-[-0.8px]">{project.title}</h3>
                          <p className="font-['Outfit'] text-[12px] text-[#535353]">{project.location}</p>
                        </div>
                        <button onClick={() => handleProjectDelete(project.id)} className="h-[36px] px-[16px] rounded-[100px] bg-red-500 font-['Outfit'] text-[11px] uppercase text-white">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-[32px]">
            <div className="bg-white rounded-[24px] p-[clamp(20px,3vw,32px)]">
              <h2 className="font-['DM_Sans'] font-light text-[clamp(24px,3vw,32px)] tracking-[-1.28px] text-[#161616] mb-[24px]">
                Add New Post
              </h2>
              
              <form onSubmit={handlePostSubmit} className="space-y-[20px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                  <input type="text" required value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px]" placeholder="Post Title" />
                  <input type="text" required value={postForm.slug} onChange={(e) => setPostForm({ ...postForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px]" placeholder="post-slug" />
                </div>
                <textarea required value={postForm.excerpt} onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })} rows={2} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px]" placeholder="Excerpt" />
                <textarea required value={postForm.content} onChange={(e) => setPostForm({ ...postForm, content: e.target.value })} rows={6} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px]" placeholder="Content" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                  <input type="text" required value={postForm.author} onChange={(e) => setPostForm({ ...postForm, author: e.target.value })} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px]" placeholder="Author" />
                  <input type="text" required value={postForm.coverImage} onChange={(e) => setPostForm({ ...postForm, coverImage: e.target.value })} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px]" placeholder="Cover Image URL" />
                </div>
                <button type="submit" className="w-full h-[48px] rounded-[100px] bg-[#161616] font-['Outfit'] text-[12px] uppercase text-white hover:bg-[#535353] transition-colors">Add Post</button>
              </form>
            </div>

            <div className="bg-white rounded-[24px] p-[clamp(20px,3vw,32px)]">
              <h2 className="font-['DM_Sans'] font-light text-[clamp(24px,3vw,32px)] tracking-[-1.28px] text-[#161616] mb-[24px]">Posts ({posts.length})</h2>
              {posts.length === 0 ? (
                <p className="font-['Outfit'] text-[14px] text-[#535353] text-center py-[40px]">No posts yet.</p>
              ) : (
                <div className="space-y-[16px]">
                  {posts.map((post) => (
                    <div key={post.id} className="border border-[#BBBBBB] rounded-[16px] p-[20px]">
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <h3 className="font-['DM_Sans'] text-[20px] tracking-[-0.8px]">{post.title}</h3>
                          <p className="font-['Outfit'] text-[12px] text-[#535353]">By {post.author}</p>
                        </div>
                        <button onClick={() => handlePostDelete(post.id)} className="h-[36px] px-[16px] rounded-[100px] bg-red-500 font-['Outfit'] text-[11px] uppercase text-white">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Projects Tab - Due to character limit, rest of tabs omitted but follow same pattern */}
      </div>
    </div>
  );
}
