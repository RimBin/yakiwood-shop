"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { seedProducts } from "@/data/seed-products";
import { projects as defaultProjects } from "@/data/projects";
import { Project } from "@/types/project";
import Image from "next/image";

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

function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>('products');
  const [message, setMessage] = useState('');

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
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
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  // Get all categories (default + custom)
  const getAllCategories = () => {
    const defaultCategories = ['facades', 'terraces', 'fences', 'interiors'];
    return [...defaultCategories, ...customCategories];
  };

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState({
    title: '',
    subtitle: '',
    slug: '',
    location: '',
    images: '',
    featuredImage: '',
    productsUsed: '',
    description: '',
    fullDescription: '',
    category: 'residential',
    featured: false,
  });
  const [projectImageFiles, setProjectImageFiles] = useState<string[]>([]);
  const [featuredImageFile, setFeaturedImageFile] = useState<string>('');
  const projectFileInputRef = useRef<HTMLInputElement | null>(null);
  const featuredImageInputRef = useRef<HTMLInputElement | null>(null);
  const [projectSelectedFileNames, setProjectSelectedFileNames] = useState('No file selected');

  // Posts state
  const [posts, setPosts] = useState<Post[]>([]);
  const [showAddPostForm, setShowAddPostForm] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
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
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    } else {
      // Load default projects from data/projects.ts if localStorage is empty
      setProjects(defaultProjects);
      localStorage.setItem('yakiwood_projects', JSON.stringify(defaultProjects));
    }

    const savedPosts = localStorage.getItem('yakiwood_posts');
    if (savedPosts) setPosts(JSON.parse(savedPosts));

    const savedCustomCategories = localStorage.getItem('yakiwood_custom_categories');
    if (savedCustomCategories) setCustomCategories(JSON.parse(savedCustomCategories));
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
      const newCat = customCategory.toLowerCase().replace(/\s+/g, '-');
      if (!customCategories.includes(newCat)) {
        const updated = [...customCategories, newCat];
        setCustomCategories(updated);
        localStorage.setItem('yakiwood_custom_categories', JSON.stringify(updated));
        setProductForm({ ...productForm, category: newCat });
        setCustomCategory('');
        setShowCustomCategory(false);
        showMessage('Custom category added!');
      } else {
        showMessage('Category already exists');
        setCustomCategory('');
      }
    }
  };

  const handleDeleteCustomCategory = (categoryToDelete: string) => {
    if (window.confirm(`Delete category "${categoryToDelete}"? Products using this category will keep it.`)) {
      const updated = customCategories.filter(c => c !== categoryToDelete);
      setCustomCategories(updated);
      localStorage.setItem('yakiwood_custom_categories', JSON.stringify(updated));
      showMessage('Category deleted');
    }
  };

  // Product handlers
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const safeSlug = productForm.slug?.trim() ? productForm.slug : slugify(productForm.name);
    
    const urlImages = productForm.images.split(',').map(url => url.trim()).filter(Boolean);
    const allImages = [...imageFiles, ...urlImages];
    
    if (editingProductId) {
      // Edit existing product
      const updated = products.map(product => {
        if (product.id === editingProductId) {
          return {
            ...product,
            name: productForm.name,
            slug: safeSlug,
            description: productForm.description,
            category: productForm.category,
            basePrice: Number(productForm.basePrice),
            images: allImages.length > 0 ? allImages : product.images,
            inStock: productForm.inStock,
          };
        }
        return product;
      });
      setProducts(updated);
      localStorage.setItem('yakiwood_products', JSON.stringify(updated));
      showMessage('Product updated successfully!');
      setEditingProductId(null);
    } else {
      // Add new product
      const newProduct: Product = {
        id: Date.now().toString(),
        ...productForm,
        slug: safeSlug,
        images: allImages,
        basePrice: Number(productForm.basePrice),
      };
      
      const updated = [...products, newProduct];
      setProducts(updated);
      localStorage.setItem('yakiwood_products', JSON.stringify(updated));
      showMessage('Product added successfully!');
    }
    
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
    setSelectedFileNames('No file selected');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProductDelete = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    localStorage.setItem('yakiwood_products', JSON.stringify(updated));
    showMessage('Product deleted');
  };

  const handleProductEdit = (product: Product) => {
    if (editingProductId === product.id) {
      handleProductCancelEdit();
      return;
    }
    
    setShowAddProductForm(false);
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      category: product.category,
      basePrice: product.basePrice,
      images: '',
      inStock: product.inStock,
    });
    if (product.images && product.images.length > 0) {
      setImageFiles(product.images);
    }
  };

  const handleProductCancelEdit = () => {
    setEditingProductId(null);
    setShowAddProductForm(false);
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
    setSelectedFileNames('No file selected');
  };

  const handleProductImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedProducts = JSON.parse(event.target?.result as string);
        const updated = [...products, ...importedProducts];
        setProducts(updated);
        localStorage.setItem('yakiwood_products', JSON.stringify(updated));
        showMessage(`Imported ${importedProducts.length} products successfully!`);
      } catch (error) {
        showMessage('Error importing products. Please check the JSON format.');
      }
    };
    reader.readAsText(file);
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
  const handleProjectImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setProjectImageFiles(prev => [...prev, ...base64Images]);
      
      const fileNames = Array.from(files).map(f => f.name).join(', ');
      setProjectSelectedFileNames(fileNames);
    });
  };

  const handleProjectFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setProjectSelectedFileNames('No file selected');
      return;
    }
    const names = Array.from(files).map(f => f.name).join(', ');
    setProjectSelectedFileNames(names);
  };

  const handleFeaturedImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFeaturedImageFile(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const urlImages = projectForm.images.split(',').map(url => url.trim()).filter(Boolean);
    const allImages = [...projectImageFiles, ...urlImages];
    const productsArray = projectForm.productsUsed
      .split(',')
      .map(p => ({ name: p.trim(), slug: slugify(p.trim()) }))
      .filter(p => p.name);
    const safeSlug = projectForm.slug?.trim() ? projectForm.slug : slugify(projectForm.title);
    const featuredImg = featuredImageFile || projectForm.featuredImage || (allImages.length > 0 ? allImages[0] : undefined);
    
    if (editingProjectId) {
      // Edit existing project
      const updated = projects.map(project => {
        if (project.id === editingProjectId) {
          return {
            ...project,
            title: projectForm.title,
            subtitle: projectForm.subtitle || undefined,
            slug: safeSlug,
            location: projectForm.location,
            images: allImages.length > 0 ? allImages : project.images,
            featuredImage: featuredImg,
            productsUsed: productsArray,
            description: projectForm.description,
            fullDescription: projectForm.fullDescription,
            category: projectForm.category as 'residential' | 'commercial',
            featured: projectForm.featured,
          };
        }
        return project;
      });
      setProjects(updated);
      localStorage.setItem('yakiwood_projects', JSON.stringify(updated));
      showMessage('Project updated successfully!');
      setEditingProjectId(null);
    } else {
      // Add new project
      const newProject: Project = {
        id: Date.now().toString(),
        ...projectForm,
        slug: safeSlug,
        images: allImages.length > 0 ? allImages : projectForm.images.split(',').map(url => url.trim()).filter(Boolean),
        featuredImage: featuredImg,
        productsUsed: productsArray,
      };
      
      const updated = [...projects, newProject];
      setProjects(updated);
      localStorage.setItem('yakiwood_projects', JSON.stringify(updated));
      showMessage('Project added successfully!');
    }
    
    setProjectForm({
      title: '',
      subtitle: '',
      slug: '',
      location: '',
      images: '',
      featuredImage: '',
      productsUsed: '',
      description: '',
      fullDescription: '',
      category: 'residential',
      featured: false,
    });
    setProjectImageFiles([]);
    setFeaturedImageFile('');
    setProjectSelectedFileNames('No file selected');
    if (projectFileInputRef.current) {
      projectFileInputRef.current.value = '';
    }
    if (featuredImageInputRef.current) {
      featuredImageInputRef.current.value = '';
    }
  };

  const handleProjectDelete = (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem('yakiwood_projects', JSON.stringify(updated));
    showMessage('Project deleted');
  };

  const handleProjectEdit = (project: Project) => {
    // If clicking on already editing project, close it
    if (editingProjectId === project.id) {
      handleProjectCancelEdit();
      return;
    }
    
    setShowAddForm(false);
    setEditingProjectId(project.id);
    setProjectForm({
      title: project.title,
      subtitle: project.subtitle || '',
      slug: project.slug,
      location: project.location,
      images: '',
      featuredImage: project.featuredImage || '',
      productsUsed: Array.isArray(project.productsUsed) 
        ? project.productsUsed.map(p => typeof p === 'string' ? p : p.name).join(', ')
        : project.productsUsed || '',
      description: project.description,
      fullDescription: project.fullDescription || '',
      category: project.category || 'residential',
      featured: project.featured || false,
    });
    // Load existing images to preview
    if (project.images && project.images.length > 0) {
      setProjectImageFiles(project.images.map(img => typeof img === 'string' ? img : (img as any).url || ''));
    }
    if (project.featuredImage) {
      setFeaturedImageFile(project.featuredImage);
    }
  };

  const handleProjectCancelEdit = () => {
    setEditingProjectId(null);
    setShowAddForm(false);
    setProjectForm({
      title: '',
      subtitle: '',
      slug: '',
      location: '',
      images: '',
      featuredImage: '',
      productsUsed: '',
      description: '',
      fullDescription: '',
      category: 'residential',
      featured: false,
    });
    setProjectImageFiles([]);
    setFeaturedImageFile('');
    setProjectSelectedFileNames('No file selected');
  };

  const handleProjectImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedProjects = JSON.parse(event.target?.result as string);
        const updated = [...projects, ...importedProjects];
        setProjects(updated);
        localStorage.setItem('yakiwood_projects', JSON.stringify(updated));
        showMessage(`Imported ${importedProjects.length} projects successfully!`);
      } catch (error) {
        showMessage('Error importing projects. Please check the JSON format.');
      }
    };
    reader.readAsText(file);
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

    const safeSlug = postForm.slug?.trim() ? postForm.slug : slugify(postForm.title);
    
    if (editingPostId) {
      // Edit existing post
      const updated = posts.map(post => {
        if (post.id === editingPostId) {
          return {
            ...post,
            title: postForm.title,
            slug: safeSlug,
            excerpt: postForm.excerpt,
            content: postForm.content,
            coverImage: postForm.coverImage,
            author: postForm.author,
            category: postForm.category,
            published: postForm.published,
          };
        }
        return post;
      });
      setPosts(updated);
      localStorage.setItem('yakiwood_posts', JSON.stringify(updated));
      showMessage('Post updated successfully!');
      setEditingPostId(null);
    } else {
      // Add new post
      const newPost: Post = {
        id: Date.now().toString(),
        ...postForm,
        slug: safeSlug,
        date: new Date().toISOString(),
      };
      
      const updated = [...posts, newPost];
      setPosts(updated);
      localStorage.setItem('yakiwood_posts', JSON.stringify(updated));
      showMessage('Post added successfully!');
    }
    
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
  };

  const handlePostDelete = (id: string) => {
    const updated = posts.filter(p => p.id !== id);
    setPosts(updated);
    localStorage.setItem('yakiwood_posts', JSON.stringify(updated));
    showMessage('Post deleted');
  };

  const handlePostEdit = (post: Post) => {
    if (editingPostId === post.id) {
      handlePostCancelEdit();
      return;
    }
    
    setShowAddPostForm(false);
    setEditingPostId(post.id);
    setPostForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage,
      author: post.author,
      category: post.category,
      published: post.published,
    });
  };

  const handlePostCancelEdit = () => {
    setEditingPostId(null);
    setShowAddPostForm(false);
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
  };

  const handlePostImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedPosts = JSON.parse(event.target?.result as string);
        const updated = [...posts, ...importedPosts];
        setPosts(updated);
        localStorage.setItem('yakiwood_posts', JSON.stringify(updated));
        showMessage(`Imported ${importedPosts.length} posts successfully!`);
      } catch (error) {
        showMessage('Error importing posts. Please check the JSON format.');
      }
    };
    reader.readAsText(file);
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
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'products', label: 'Products', count: products.length },
            { key: 'projects', label: 'Projects', count: projects.length },
            { key: 'posts', label: 'Posts', count: posts.length }
          ].map((tab) => {
            const isActive = 'count' in tab ? activeTab === tab.key : false;

            return (
              <button
                key={tab.key}
                onClick={() => {
                  if (tab.key === 'dashboard') {
                    router.push('/admin/dashboard');
                    return;
                  }
                  setActiveTab(tab.key as ActiveTab);
                }}
                className={`h-[48px] px-[24px] rounded-[100px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#161616] text-white'
                    : 'bg-[#EAEAEA] text-[#161616] hover:bg-[#DCDCDC]'
                }`}
              >
                {'count' in tab ? `${tab.label} (${tab.count})` : tab.label}
              </button>
            );
          })}
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-[32px]">
            {/* Add Product Form - Collapsible */}
            <div className="bg-[#EAEAEA] rounded-[24px] p-[clamp(20px,3vw,32px)]">
              <button
                onClick={() => {
                  setShowAddProductForm(!showAddProductForm);
                  setEditingProductId(null);
                  if (!showAddProductForm) {
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
                  }
                }}
                className="w-full flex items-center justify-between mb-[24px]"
              >
                <h2 className="font-['DM_Sans'] font-light text-[clamp(24px,3vw,32px)] tracking-[-1.28px] text-[#161616]">
                  Add New Product
                </h2>
                <span className="text-[24px] text-[#161616]">{showAddProductForm ? '−' : '+'}</span>
              </button>
              {showAddProductForm && (
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
                      onChange={(e) => {
                        const nextName = e.target.value
                        setProductForm((prev) => {
                          const prevAutoSlug = slugify(prev.name)
                          const shouldAuto = !prev.slug || prev.slug === prevAutoSlug
                          return {
                            ...prev,
                            name: nextName,
                            slug: shouldAuto ? slugify(nextName) : prev.slug,
                          }
                        })
                      }}
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
                      onChange={(e) => setProductForm({ ...productForm, slug: slugify(e.target.value) })}
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
                      {getAllCategories().map(cat => (
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
                    
                    {customCategories.length > 0 && (
                      <div className="mt-[12px]">
                        <p className="font-['Outfit'] text-[12px] text-[#535353] mb-[8px]">Custom Categories:</p>
                        <div className="flex flex-wrap gap-[8px]">
                          {customCategories.map(cat => (
                            <div key={cat} className="flex items-center gap-[8px] px-[12px] py-[6px] bg-[#EAEAEA] rounded-[100px] border border-[#BBBBBB]">
                              <span className="font-['Outfit'] text-[12px] text-[#161616]">{cat}</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteCustomCategory(cat)}
                                className="text-red-500 hover:text-red-700 text-[16px] font-bold leading-none"
                                title="Delete category"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
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
              )}
            </div>

            {/* Products List */}
            <div className="bg-[#EAEAEA] rounded-[24px] p-[clamp(20px,3vw,32px)]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-[16px] mb-[24px]">
                <h2 className="font-['DM_Sans'] font-light text-[clamp(24px,3vw,32px)] tracking-[-1.28px] text-[#161616]">
                  Products ({products.length})
                </h2>
                <div className="flex gap-[8px]">
                  <label 
                    htmlFor="productImportInput"
                    className="h-[36px] px-[16px] rounded-[100px] bg-[#535353] font-['Outfit'] text-[11px] uppercase text-white hover:bg-[#161616] transition-colors cursor-pointer flex items-center"
                  >
                    Import
                  </label>
                  <input 
                    id="productImportInput"
                    type="file" 
                    accept=".json" 
                    onChange={handleProductImport}
                    className="hidden"
                  />
                  {products.length > 0 && (
                    <button
                      onClick={handleProductExport}
                      className="h-[36px] px-[16px] rounded-[100px] bg-[#161616] font-['Outfit'] text-[11px] uppercase text-white hover:bg-[#535353] transition-colors"
                    >
                      Export
                    </button>
                  )}
                </div>
              </div>

              {products.length === 0 ? (
                <p className="font-['Outfit'] text-[14px] text-[#535353] text-center py-[40px]">
                  No products yet. Add your first product above.
                </p>
              ) : (
                <div className="space-y-[16px]">
                  {products.map((product) => (
                    <div key={product.id} className="border border-[#BBBBBB] rounded-[16px] overflow-hidden">
                      <div className="p-[20px]">
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
                          <div className="flex gap-[8px]">
                            <button 
                              onClick={() => handleProductEdit(product)} 
                              className={`h-[36px] px-[16px] rounded-[100px] font-['Outfit'] text-[11px] uppercase text-white transition-colors flex-shrink-0 ${
                                editingProductId === product.id ? 'bg-[#535353] hover:bg-[#161616]' : 'bg-[#161616] hover:bg-[#535353]'
                              }`}
                            >
                              {editingProductId === product.id ? 'Close' : 'Edit'}
                            </button>
                            <button
                              onClick={() => handleProductDelete(product.id)}
                              className="h-[36px] px-[16px] rounded-[100px] bg-red-500 font-['Outfit'] font-normal text-[11px] tracking-[0.55px] uppercase text-white hover:bg-red-600 transition-colors flex-shrink-0"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Accordion Edit Form */}
                      {editingProductId === product.id && (
                        <div className="border-t border-[#BBBBBB] bg-[#EAEAEA] p-[clamp(20px,3vw,32px)]">
                          <h3 className="font-['DM_Sans'] text-[18px] tracking-[-0.72px] text-[#161616] mb-[24px]">Edit Product</h3>
                          <form onSubmit={handleProductSubmit} className="space-y-[20px]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                              <div>
                                <input type="text" required value={productForm.name} onChange={(e) => {
                                  const nextName = e.target.value
                                  setProductForm((prev) => {
                                    const prevAutoSlug = slugify(prev.name)
                                    const shouldAuto = !prev.slug || prev.slug === prevAutoSlug
                                    return { ...prev, name: nextName, slug: shouldAuto ? slugify(nextName) : prev.slug }
                                  })
                                }} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px] bg-[#EAEAEA]" placeholder="Product Name" />
                                <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Product display name.</p>
                              </div>
                              <div>
                                <input type="text" required value={productForm.slug} onChange={(e) => setProductForm({ ...productForm, slug: slugify(e.target.value) })} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px] bg-[#EAEAEA]" placeholder="product-slug" />
                                <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">URL-friendly identifier.</p>
                              </div>
                            </div>
                            <div>
                              <textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} rows={3} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px] bg-[#EAEAEA]" placeholder="Description" />
                              <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Product description for listing.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
                              <div>
                                <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px] bg-[#EAEAEA]">
                                  {getAllCategories().map(cat => (
                                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                                  ))}
                                </select>
                                <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Product category.</p>
                              </div>
                              <div>
                                <input type="number" required min="0" step="0.01" value={productForm.basePrice} onChange={(e) => setProductForm({ ...productForm, basePrice: Number(e.target.value) })} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px] bg-[#EAEAEA]" placeholder="Price" />
                                <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Base price in EUR.</p>
                              </div>
                              <div>
                                <label className="flex items-center gap-[12px] px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] bg-[#EAEAEA] cursor-pointer">
                                  <input type="checkbox" checked={productForm.inStock} onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })} className="w-[20px] h-[20px]" />
                                  <span className="font-['Outfit'] text-[14px]">In Stock</span>
                                </label>
                                <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Product availability.</p>
                              </div>
                            </div>
                            <div>
                              <label className="block font-['Outfit'] text-[14px] text-[#535353] mb-[8px]">
                                Gallery Images {imageFiles.length > 0 && `(${imageFiles.length} selected)`}
                              </label>
                              <input 
                                ref={fileInputRef}
                                type="file" 
                                accept="image/*" 
                                multiple 
                                onChange={(e) => {
                                  handleFileInputChange(e);
                                  handleImageUpload(e);
                                }}
                                className="hidden"
                                id="product-edit-file-upload"
                              />
                              <label 
                                htmlFor="product-edit-file-upload"
                                className="flex items-center justify-center w-full h-[48px] px-[16px] border-2 border-dashed border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px] text-[#535353] hover:border-[#161616] hover:text-[#161616] transition-colors cursor-pointer bg-[#EAEAEA]"
                              >
                                {selectedFileNames}
                              </label>
                              {imageFiles.length > 0 && (
                                <div className="grid grid-cols-4 gap-[8px] mt-[12px]">
                                  {imageFiles.map((img, i) => (
                                    <div key={i} className="relative aspect-square rounded-[8px] overflow-hidden border border-[#BBBBBB]">
                                      <Image src={img} alt={`Preview ${i + 1}`} fill className="object-cover" />
                                      <button
                                        type="button"
                                        onClick={() => setImageFiles(prev => prev.filter((_, idx) => idx !== i))}
                                        className="absolute top-[4px] right-[4px] w-[24px] h-[24px] bg-red-500 text-white rounded-full flex items-center justify-center text-[12px] hover:bg-red-600 transition-colors"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Product images for gallery.</p>
                            </div>
                            <div className="flex gap-[12px] pt-[12px]">
                              <button type="submit" className="flex-1 h-[48px] rounded-[100px] bg-[#161616] font-['Outfit'] text-[12px] uppercase text-white hover:bg-[#535353] transition-colors">
                                Update Product
                              </button>
                              <button type="button" onClick={handleProductCancelEdit} className="h-[48px] px-[24px] rounded-[100px] bg-[#BBBBBB] font-['Outfit'] text-[12px] uppercase text-[#161616] hover:bg-[#535353] hover:text-white transition-colors">
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
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
            {/* Add New Project - Collapsible */}
            <div className="bg-[#EAEAEA] rounded-[24px] p-[clamp(20px,3vw,32px)]">
              <button
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  setEditingProjectId(null);
                  if (!showAddForm) {
                    setProjectForm({
                      title: '',
                      subtitle: '',
                      slug: '',
                      location: '',
                      images: '',
                      featuredImage: '',
                      productsUsed: '',
                      description: '',
                      fullDescription: '',
                      category: 'residential',
                      featured: false,
                    });
                    setProjectImageFiles([]);
                    setFeaturedImageFile('');
                  }
                }}
                className="w-full flex items-center justify-between mb-[24px]"
              >
                <h2 className="font-['DM_Sans'] font-light text-[clamp(24px,3vw,32px)] tracking-[-1.28px] text-[#161616]">
                  Add New Project
                </h2>
                <span className="text-[24px] text-[#161616]">{showAddForm ? '−' : '+'}</span>
              </button>
              {showAddForm && (
              
              <form onSubmit={handleProjectSubmit} className="space-y-[20px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                  <div>
                    <input 
                      type="text" 
                      required 
                      value={projectForm.title} 
                      onChange={(e) => {
                        const nextTitle = e.target.value
                        setProjectForm((prev) => {
                          const prevAutoSlug = slugify(prev.title)
                          const shouldAuto = !prev.slug || prev.slug === prevAutoSlug
                          return {
                            ...prev,
                            title: nextTitle,
                            slug: shouldAuto ? slugify(nextTitle) : prev.slug,
                          }
                        })
                      }} 
                      className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px]" 
                      placeholder="Project Title" 
                    />
                    <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Project title — shown in listings and project page header.</p>
                  </div>

                  <div>
                    <input 
                      type="text" 
                      value={projectForm.subtitle} 
                      onChange={(e) => setProjectForm({ ...projectForm, subtitle: e.target.value })} 
                      className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px]" 
                      placeholder="Subtitle (optional)" 
                    />
                    <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Optional short subtitle displayed beside the title.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                  <div>
                    <input 
                      type="text" 
                      required 
                      value={projectForm.slug} 
                      onChange={(e) => setProjectForm({ ...projectForm, slug: slugify(e.target.value) })} 
                      className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px]" 
                      placeholder="project-slug" 
                    />
                    <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">URL-friendly identifier, lowercase with hyphens. Auto-generated but editable.</p>
                  </div>

                  <div>
                    <input 
                      type="text" 
                      required 
                      value={projectForm.location} 
                      onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })} 
                      className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px]" 
                      placeholder="Location (e.g., Vilnius, Lithuania)" 
                    />
                    <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">City, Country (e.g., Vilnius, Lithuania).</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                  <select 
                    value={projectForm.category} 
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })} 
                    className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px]"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="public">Public</option>
                  </select>
                  <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Project category (residential / commercial / public).</p>
                  
                  <label className="flex items-center gap-[12px] px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px]">
                    <input 
                      type="checkbox" 
                      checked={projectForm.featured} 
                      onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })} 
                      className="w-[20px] h-[20px]"
                    />
                    <span className="font-['Outfit'] text-[14px]">Featured Project</span>
                  </label>
                  <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Toggle to mark the project as featured (appears in highlighted lists).</p>
                </div>

                <textarea 
                  required 
                  value={projectForm.description} 
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} 
                  rows={3} 
                  className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px]" 
                  placeholder="Short Description (for cards)" 
                />
                <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">One-line summary shown in project cards.</p>

                <textarea 
                  value={projectForm.fullDescription} 
                  onChange={(e) => setProjectForm({ ...projectForm, fullDescription: e.target.value })} 
                  rows={5} 
                  className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px]" 
                  placeholder="Full Description (optional, for project detail page)" 
                />
                <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Detailed content for the project details page.</p>

                <input 
                  type="text" 
                  value={projectForm.productsUsed} 
                  onChange={(e) => setProjectForm({ ...projectForm, productsUsed: e.target.value })} 
                  className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px]" 
                  placeholder="Products Used (comma-separated, e.g., Black larch, Brown larch)" 
                />
                <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Comma-separated list (e.g., Black larch, Brown larch).</p>

                <div className="space-y-[12px]">
                  <label className="block">
                    <span className="font-['Outfit'] text-[14px] font-medium text-[#161616] mb-[8px] block">Featured Image (katalogo nuotrauka)</span>
                    <div className="relative">
                      <input 
                        ref={featuredImageInputRef}
                        type="file" 
                        accept="image/*" 
                        onChange={handleFeaturedImageUpload}
                        className="hidden"
                        id="featuredImageInput"
                      />
                      <label 
                        htmlFor="featuredImageInput"
                        className="flex items-center justify-center w-full px-[16px] py-[12px] border-2 border-dashed border-[#161616] rounded-[12px] font-['Outfit'] text-[14px] cursor-pointer hover:bg-[#EAEAEA] transition-colors"
                      >
                        <span className="text-[#161616] font-medium">
                          {featuredImageFile ? 'Change Featured Image' : 'Upload Featured Image'}
                        </span>
                      </label>
                    </div>
                    <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Main catalog image (16:9). Displays in listings when set.</p>
                  </label>

                  {featuredImageFile && (
                    <div className="relative w-full aspect-[16/9] rounded-[12px] overflow-hidden border-2 border-[#161616]">
                      <Image src={featuredImageFile} alt="Featured preview" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setFeaturedImageFile('');
                          if (featuredImageInputRef.current) {
                            featuredImageInputRef.current.value = '';
                          }
                        }}
                        className="absolute top-[8px] right-[8px] w-[32px] h-[32px] bg-red-500 text-white rounded-full flex items-center justify-center text-[18px] hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-[12px]">
                  <label className="block">
                    <span className="font-['Outfit'] text-[14px] text-[#535353] mb-[8px] block">Gallery Images (papildomos nuotraukos)</span>
                    <div className="relative">
                      <input 
                        ref={projectFileInputRef}
                        type="file" 
                        multiple 
                        accept="image/*" 
                        onChange={(e) => {
                          handleProjectFileInputChange(e);
                          handleProjectImageUpload(e);
                        }}
                        className="hidden"
                        id="projectFileInput"
                      />
                      <label 
                        htmlFor="projectFileInput"
                        className="flex items-center justify-center w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px] cursor-pointer hover:bg-[#EAEAEA] transition-colors"
                      >
                        <span className="text-[#535353]">{projectSelectedFileNames}</span>
                      </label>
                    </div>
                    <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Additional gallery images (square thumbnails).</p>
                  </label>

                  {projectImageFiles.length > 0 && (
                    <div className="grid grid-cols-4 gap-[12px] mt-[12px]">
                      {projectImageFiles.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-[8px] overflow-hidden border border-[#BBBBBB]">
                          <Image src={img} alt={`Preview ${idx + 1}`} fill className="object-cover" />
                          <button 
                            type="button"
                            onClick={() => setProjectImageFiles(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute top-[4px] right-[4px] w-[24px] h-[24px] bg-red-500 text-white rounded-full flex items-center justify-center text-[12px] hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="font-['Outfit'] text-[12px] text-[#535353]">
                    Or paste image URLs (comma-separated):
                  </p>
                  <input 
                    type="text" 
                    value={projectForm.images} 
                    onChange={(e) => setProjectForm({ ...projectForm, images: e.target.value })} 
                    className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px]" 
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg" 
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full h-[48px] rounded-[100px] bg-[#161616] font-['Outfit'] text-[12px] uppercase text-white hover:bg-[#535353] transition-colors"
                >
                  Add Project
                </button>
              </form>
              )}
            </div>

            <div className="bg-[#EAEAEA] rounded-[24px] p-[clamp(20px,3vw,32px)]">
              <div className="flex justify-between items-center mb-[24px]">
                <h2 className="font-['DM_Sans'] font-light text-[clamp(24px,3vw,32px)] tracking-[-1.28px] text-[#161616]">
                  Projects ({projects.length})
                </h2>
                <div className="flex gap-[8px]">
                  <label 
                    htmlFor="projectImportInput"
                    className="h-[36px] px-[16px] rounded-[100px] bg-[#535353] font-['Outfit'] text-[11px] uppercase text-white hover:bg-[#161616] transition-colors cursor-pointer flex items-center"
                  >
                    Import
                  </label>
                  <input 
                    id="projectImportInput"
                    type="file" 
                    accept=".json" 
                    onChange={handleProjectImport}
                    className="hidden"
                  />
                  <button 
                    onClick={handleProjectExport}
                    className="h-[36px] px-[16px] rounded-[100px] bg-[#161616] font-['Outfit'] text-[11px] uppercase text-white hover:bg-[#535353] transition-colors"
                  >
                    Export
                  </button>
                </div>
              </div>
              
              {projects.length === 0 ? (
                <p className="font-['Outfit'] text-[14px] text-[#535353] text-center py-[40px]">No projects yet. Add your first project above!</p>
              ) : (
                <div className="space-y-[16px]">
                  {projects.map((project) => (
                    <div key={project.id} className="border border-[#BBBBBB] rounded-[16px] overflow-hidden">
                      <div className="p-[20px]">
                        <div className="flex gap-[16px]">
                          {project.images && project.images.length > 0 && (
                            <div className="w-[120px] h-[80px] relative rounded-[8px] overflow-hidden flex-shrink-0">
                              <Image 
                                src={typeof project.images[0] === 'string' ? project.images[0] : (project.images[0] as any).url || ''} 
                                alt={project.title} 
                                fill 
                                className="object-cover" 
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-['DM_Sans'] text-[20px] tracking-[-0.8px]">
                                  {project.title}
                                  {project.subtitle && <span className="text-[#535353] ml-[8px]">— {project.subtitle}</span>}
                                  {project.featured && <span className="ml-[8px] text-[12px] bg-[#161616] text-white px-[8px] py-[2px] rounded-[4px]">Featured</span>}
                                </h3>
                                <p className="font-['Outfit'] text-[12px] text-[#535353] mt-[4px]">{project.location}</p>
                                <p className="font-['Outfit'] text-[14px] text-[#161616] mt-[8px] line-clamp-2">{project.description}</p>
                                {project.productsUsed && project.productsUsed.length > 0 && (
                                  <p className="font-['Outfit'] text-[12px] text-[#535353] mt-[4px]">
                                    Products: {Array.isArray(project.productsUsed) 
                                      ? project.productsUsed.map(p => typeof p === 'string' ? p : p.name).join(', ')
                                      : project.productsUsed}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-[8px]">
                                <button 
                                  onClick={() => handleProjectEdit(project)} 
                                  className={`h-[36px] px-[16px] rounded-[100px] font-['Outfit'] text-[11px] uppercase text-white transition-colors flex-shrink-0 ${
                                    editingProjectId === project.id ? 'bg-[#535353] hover:bg-[#161616]' : 'bg-[#161616] hover:bg-[#535353]'
                                  }`}
                                >
                                  {editingProjectId === project.id ? 'Close' : 'Edit'}
                                </button>
                                <button 
                                  onClick={() => handleProjectDelete(project.id)} 
                                  className="h-[36px] px-[16px] rounded-[100px] bg-red-500 font-['Outfit'] text-[11px] uppercase text-white hover:bg-red-600 transition-colors flex-shrink-0"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Accordion Edit Form */}
                      {editingProjectId === project.id && (
                        <div className="border-t border-[#BBBBBB] bg-[#EAEAEA] p-[clamp(20px,3vw,32px)]">
                          <h3 className="font-['DM_Sans'] text-[18px] tracking-[-0.72px] text-[#161616] mb-[24px]">Edit Project</h3>
                          <form onSubmit={handleProjectSubmit} className="space-y-[20px]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                              <div>
                                <input type="text" required value={projectForm.title} onChange={(e) => {
                                  const nextTitle = e.target.value
                                  setProjectForm((prev) => {
                                    const prevAutoSlug = slugify(prev.title)
                                    const shouldAuto = !prev.slug || prev.slug === prevAutoSlug
                                    return { ...prev, title: nextTitle, slug: shouldAuto ? slugify(nextTitle) : prev.slug }
                                  })
                                }} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px] bg-[#EAEAEA]" placeholder="Project Title" />
                                <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Project title — shown in listings and project page header.</p>
                              </div>
                              <div>
                                <input type="text" value={projectForm.subtitle} onChange={(e) => setProjectForm({ ...projectForm, subtitle: e.target.value })} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px] bg-[#EAEAEA]" placeholder="Subtitle (optional)" />
                                <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Optional short subtitle displayed beside the title.</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                              <div>
                                <input type="text" required value={projectForm.slug} onChange={(e) => setProjectForm({ ...projectForm, slug: slugify(e.target.value) })} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px] bg-[#EAEAEA]" placeholder="project-slug" />
                                <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">URL-friendly identifier, lowercase with hyphens. Auto-generated but editable.</p>
                              </div>
                              <div>
                                <input type="text" required value={projectForm.location} onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px] bg-[#EAEAEA]" placeholder="Location" />
                                <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">City, Country (e.g., Vilnius, Lithuania).</p>
                              </div>
                            </div>
                            <div>
                              <textarea required value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} rows={3} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px] bg-[#EAEAEA]" placeholder="Description" />
                              <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">One-line summary shown in project cards.</p>
                            </div>
                            <div>
                              <textarea value={projectForm.fullDescription} onChange={(e) => setProjectForm({ ...projectForm, fullDescription: e.target.value })} rows={4} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px] bg-[#EAEAEA]" placeholder="Full Description (optional)" />
                              <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Detailed content for the project details page.</p>
                            </div>
                            <div>
                              <input type="text" value={projectForm.productsUsed} onChange={(e) => setProjectForm({ ...projectForm, productsUsed: e.target.value })} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px] bg-[#EAEAEA]" placeholder="Products Used (comma-separated)" />
                              <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Comma-separated list (e.g., Black larch, Brown larch).</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                              <div>
                                <select value={projectForm.category} onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px] bg-[#EAEAEA]">
                                  <option value="residential">Residential</option>
                                  <option value="commercial">Commercial</option>
                                  <option value="public">Public</option>
                                </select>
                                <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Project category (residential / commercial / public).</p>
                              </div>
                              <div>
                                <label className="flex items-center gap-[12px] px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] bg-[#EAEAEA] cursor-pointer">
                                  <input type="checkbox" checked={projectForm.featured} onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })} className="w-[20px] h-[20px]" />
                                  <span className="font-['Outfit'] text-[14px]">Featured Project</span>
                                </label>
                                <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Toggle to mark the project as featured (appears in highlighted lists).</p>
                              </div>
                            </div>

                            <div>
                              <label className="block">
                                <span className="font-['Outfit'] text-[14px] font-medium text-[#161616] mb-[8px] block">Featured Image</span>
                                <div className="relative">
                                  <input 
                                    ref={featuredImageInputRef}
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleFeaturedImageUpload}
                                    className="hidden"
                                    id="editFeaturedImageInput"
                                  />
                                  <label 
                                    htmlFor="editFeaturedImageInput"
                                    className="flex items-center justify-center w-full px-[16px] py-[12px] border-2 border-dashed border-[#161616] rounded-[12px] font-['Outfit'] text-[14px] cursor-pointer hover:bg-[#f0f0f0] transition-colors bg-[#EAEAEA]"
                                  >
                                    <span className="text-[#161616] font-medium">
                                      {featuredImageFile ? 'Change Featured Image' : 'Upload Featured Image'}
                                    </span>
                                  </label>
                                </div>
                                <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Main catalog image (16:9). Displays in listings when set.</p>
                              </label>

                              {featuredImageFile && (
                                <div className="relative w-full aspect-[16/9] rounded-[12px] overflow-hidden border-2 border-[#161616]">
                                  <Image src={featuredImageFile} alt="Featured preview" fill className="object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFeaturedImageFile('');
                                      if (featuredImageInputRef.current) {
                                        featuredImageInputRef.current.value = '';
                                      }
                                    }}
                                    className="absolute top-[8px] right-[8px] w-[32px] h-[32px] bg-red-500 text-white rounded-full flex items-center justify-center text-[18px] hover:bg-red-600 transition-colors"
                                  >
                                    ×
                                  </button>
                                </div>
                              )}
                            </div>

                              <div>
                              <label className="block font-['Outfit'] text-[14px] text-[#535353] mb-[8px]">
                                Gallery Images {projectImageFiles.length > 0 && `(${projectImageFiles.length} selected)`}
                              </label>
                              <input 
                                ref={projectFileInputRef}
                                type="file" 
                                accept="image/*" 
                                multiple 
                                onChange={(e) => {
                                  handleProjectFileInputChange(e);
                                  handleProjectImageUpload(e);
                                }}
                                className="hidden"
                                id="project-file-upload"
                              />
                              <label 
                                htmlFor="project-file-upload"
                                className="flex items-center justify-center w-full h-[48px] px-[16px] border-2 border-dashed border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px] text-[#535353] hover:border-[#161616] hover:text-[#161616] transition-colors cursor-pointer bg-[#EAEAEA]"
                              >
                                {projectSelectedFileNames}
                              </label>
                              {projectImageFiles.length > 0 && (
                                <div className="grid grid-cols-4 gap-[8px] mt-[12px]">
                                  {projectImageFiles.map((img, i) => (
                                    <div key={i} className="relative aspect-square rounded-[8px] overflow-hidden border border-[#BBBBBB]">
                                      <Image src={img} alt={`Preview ${i + 1}`} fill className="object-cover" />
                                      <button
                                        type="button"
                                        onClick={() => setProjectImageFiles(prev => prev.filter((_, idx) => idx !== i))}
                                        className="absolute top-[4px] right-[4px] w-[24px] h-[24px] bg-red-500 text-white rounded-full flex items-center justify-center text-[12px] hover:bg-red-600 transition-colors"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Additional gallery images (square thumbnails).</p>
                            </div>

                            <div className="flex gap-[12px] pt-[12px]">
                              <button type="submit" className="flex-1 h-[48px] rounded-[100px] bg-[#161616] font-['Outfit'] text-[12px] uppercase text-white hover:bg-[#535353] transition-colors">
                                Update Project
                              </button>
                              <button type="button" onClick={handleProjectCancelEdit} className="h-[48px] px-[24px] rounded-[100px] bg-[#BBBBBB] font-['Outfit'] text-[12px] uppercase text-[#161616] hover:bg-[#535353] hover:text-white transition-colors">
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
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
            <div className="bg-[#EAEAEA] rounded-[24px] p-[clamp(20px,3vw,32px)]">
              <button
                onClick={() => {
                  setShowAddPostForm(!showAddPostForm);
                  setEditingPostId(null);
                  if (!showAddPostForm) {
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
                  }
                }}
                className="w-full flex items-center justify-between mb-[24px]"
              >
                <h2 className="font-['DM_Sans'] font-light text-[clamp(24px,3vw,32px)] tracking-[-1.28px] text-[#161616]">
                  Add New Post
                </h2>
                <span className="text-[24px] text-[#161616]">{showAddPostForm ? '−' : '+'}</span>
              </button>
              {showAddPostForm && (
              
              <form onSubmit={handlePostSubmit} className="space-y-[20px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                  <div>
                    <input type="text" required value={postForm.title} onChange={(e) => {
                      const nextTitle = e.target.value
                      setPostForm((prev) => {
                        const prevAutoSlug = slugify(prev.title)
                        const shouldAuto = !prev.slug || prev.slug === prevAutoSlug
                        return { ...prev, title: nextTitle, slug: shouldAuto ? slugify(nextTitle) : prev.slug }
                      })
                    }} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px]" placeholder="Post Title" />
                    <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Post title for display.</p>
                  </div>
                  <div>
                    <input type="text" required value={postForm.slug} onChange={(e) => setPostForm({ ...postForm, slug: slugify(e.target.value) })} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px]" placeholder="post-slug" />
                    <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">URL-friendly identifier.</p>
                  </div>
                </div>
                <div>
                  <textarea required value={postForm.excerpt} onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })} rows={2} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px]" placeholder="Excerpt" />
                  <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Short summary for listing.</p>
                </div>
                <div>
                  <textarea required value={postForm.content} onChange={(e) => setPostForm({ ...postForm, content: e.target.value })} rows={6} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px]" placeholder="Content" />
                  <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Full post content.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                  <div>
                    <input type="text" required value={postForm.author} onChange={(e) => setPostForm({ ...postForm, author: e.target.value })} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px]" placeholder="Author" />
                    <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Author name.</p>
                  </div>
                  <div>
                    <input type="text" required value={postForm.coverImage} onChange={(e) => setPostForm({ ...postForm, coverImage: e.target.value })} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px]" placeholder="Cover Image URL" />
                    <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Cover image URL.</p>
                  </div>
                </div>
                <button type="submit" className="w-full h-[48px] rounded-[100px] bg-[#161616] font-['Outfit'] text-[12px] uppercase text-white hover:bg-[#535353] transition-colors">Add Post</button>
              </form>
              )}
            </div>

            <div className="bg-[#EAEAEA] rounded-[24px] p-[clamp(20px,3vw,32px)]">
              <div className="flex items-center justify-between mb-[24px]">
                <h2 className="font-['DM_Sans'] font-light text-[clamp(24px,3vw,32px)] tracking-[-1.28px] text-[#161616]">Posts ({posts.length})</h2>
                <div className="flex gap-[12px]">
                  <input
                    type="file"
                    accept="application/json"
                    onChange={handlePostImport}
                    className="hidden"
                    id="importPostsFile"
                  />
                  <label
                    htmlFor="importPostsFile"
                    className="h-[36px] px-[20px] rounded-[100px] border border-[#535353] font-['Outfit'] text-[11px] uppercase text-[#535353] hover:bg-[#DCDCDC] transition-colors cursor-pointer flex items-center"
                  >
                    Import
                  </label>
                  <button
                    onClick={handlePostExport}
                    className="h-[36px] px-[20px] rounded-[100px] bg-[#161616] font-['Outfit'] text-[11px] uppercase text-white hover:bg-[#535353] transition-colors"
                  >
                    Export
                  </button>
                </div>
              </div>
              {posts.length === 0 ? (
                <p className="font-['Outfit'] text-[14px] text-[#535353] text-center py-[40px]">No posts yet.</p>
              ) : (
                <div className="space-y-[16px]">
                  {posts.map((post) => (
                    <div key={post.id} className="border border-[#BBBBBB] rounded-[16px] p-[20px]">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-['DM_Sans'] text-[20px] tracking-[-0.8px]">{post.title}</h3>
                          <p className="font-['Outfit'] text-[12px] text-[#535353]">By {post.author}</p>
                        </div>
                        <div className="flex gap-[12px]">
                          <button
                            onClick={() => handlePostEdit(post)}
                            className="h-[36px] px-[20px] rounded-[100px] border border-[#161616] font-['Outfit'] text-[11px] uppercase text-[#161616] hover:bg-[#DCDCDC] transition-colors"
                          >
                            {editingPostId === post.id ? 'Close' : 'Edit'}
                          </button>
                          <button onClick={() => handlePostDelete(post.id)} className="h-[36px] px-[20px] rounded-[100px] bg-[#161616] font-['Outfit'] text-[11px] uppercase text-white hover:bg-[#535353] transition-colors">Delete</button>
                        </div>
                      </div>
                      
                      {/* Accordion Edit Form */}
                      {editingPostId === post.id && (
                        <div className="mt-[24px] pt-[24px] border-t border-[#BBBBBB]">
                          <form onSubmit={handlePostSubmit} className="space-y-[20px]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                              <div>
                                <input type="text" required value={postForm.title} onChange={(e) => {
                                  const nextTitle = e.target.value
                                  setPostForm((prev) => {
                                    const prevAutoSlug = slugify(prev.title)
                                    const shouldAuto = !prev.slug || prev.slug === prevAutoSlug
                                    return { ...prev, title: nextTitle, slug: shouldAuto ? slugify(nextTitle) : prev.slug }
                                  })
                                }} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px]" placeholder="Post Title" />
                                <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Post title for display.</p>
                              </div>
                              <div>
                                <input type="text" required value={postForm.slug} onChange={(e) => setPostForm({ ...postForm, slug: slugify(e.target.value) })} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px]" placeholder="post-slug" />
                                <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">URL-friendly identifier.</p>
                              </div>
                            </div>
                            <div>
                              <textarea required value={postForm.excerpt} onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })} rows={2} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px]" placeholder="Excerpt" />
                              <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Short summary for listing.</p>
                            </div>
                            <div>
                              <textarea required value={postForm.content} onChange={(e) => setPostForm({ ...postForm, content: e.target.value })} rows={6} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px]" placeholder="Content" />
                              <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Full post content.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                              <div>
                                <input type="text" required value={postForm.author} onChange={(e) => setPostForm({ ...postForm, author: e.target.value })} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px]" placeholder="Author" />
                                <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Author name.</p>
                              </div>
                              <div>
                                <input type="text" required value={postForm.coverImage} onChange={(e) => setPostForm({ ...postForm, coverImage: e.target.value })} className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[12px] font-['Outfit'] text-[14px]" placeholder="Cover Image URL" />
                                <p className="mt-[8px] font-['Outfit'] text-[12px] text-[#535353]">Cover image URL.</p>
                              </div>
                            </div>
                            <div className="flex gap-[12px]">
                              <button type="submit" className="flex-1 h-[48px] rounded-[100px] bg-[#161616] font-['Outfit'] text-[12px] uppercase text-white hover:bg-[#535353] transition-colors">Update Post</button>
                              <button type="button" onClick={handlePostCancelEdit} className="h-[48px] px-[32px] rounded-[100px] border border-[#161616] font-['Outfit'] text-[12px] uppercase text-[#161616] hover:bg-[#DCDCDC] transition-colors">Cancel</button>
                            </div>
                          </form>
                        </div>
                      )}
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
