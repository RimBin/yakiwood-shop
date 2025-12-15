"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

export default function AdminPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  async function fetchProducts() {
    const { data, error } = await supabase.from("products").select("*");
    if (!error) setProducts(data || []);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    let imageUrl = "";
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${slug}-${Date.now()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, imageFile);
      if (uploadError) {
        setMessage("Klaida įkeliant nuotrauką: " + uploadError.message);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from("product-images").getPublicUrl(fileName);
      imageUrl = publicUrlData?.publicUrl || "";
    }
    const { error } = await supabase.from("products").insert([
      {
        name,
        slug,
        description,
        base_price: Number(basePrice),
        is_active: true,
        image: imageUrl,
      },
    ]);
    if (error) {
      setMessage("Klaida: " + error.message);
    } else {
      setMessage("Produktas sukurtas!");
      setName("");
      setSlug("");
      setDescription("");
      setBasePrice("");
      setImageFile(null);
      fetchProducts();
    }
  }

  return (
    <main className="min-h-screen bg-[#E1E1E1] flex flex-col items-center py-8 px-4">
      <div className="bg-white rounded-[12px] p-8 max-w-[480px] w-full mb-8 shadow-sm">
        <h1 className="font-['DM_Sans'] text-[32px] font-light tracking-tight text-[#161616] mb-4">Pridėti produktą</h1>
        <form onSubmit={handleAddProduct} className="flex flex-col gap-3">
          <input className="border rounded px-3 py-2" placeholder="Pavadinimas" value={name} onChange={e => setName(e.target.value)} required />
          <input className="border rounded px-3 py-2" placeholder="Slug (unikalus)" value={slug} onChange={e => setSlug(e.target.value)} required />
          <textarea className="border rounded px-3 py-2" placeholder="Aprašymas" value={description} onChange={e => setDescription(e.target.value)} required />
          <input className="border rounded px-3 py-2" placeholder="Kaina" type="number" value={basePrice} onChange={e => setBasePrice(e.target.value)} required />
          <input className="border rounded px-3 py-2" type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
          <button type="submit" className="bg-[#161616] text-white rounded-[100px] px-6 py-2 mt-2">Pridėti</button>
        </form>
        {message && <div className="mt-4 text-green-700">{message}</div>}
      </div>
      <div className="bg-white rounded-[12px] p-8 max-w-[700px] w-full shadow-sm">
        <h2 className="font-['DM_Sans'] text-[24px] font-light tracking-tight text-[#161616] mb-4">Produktų sąrašas</h2>
        <ul>
          {products.map((p) => (
            <li key={p.id} className="border-b py-2 flex gap-4 items-center">
              {p.image && (
                <Image src={p.image} alt={p.name} width={60} height={60} className="rounded object-cover" />
              )}
              <div>
                <b>{p.name}</b> ({p.slug}) – {p.base_price} €<br />
                <span className="text-[#535353] text-sm">{p.description}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
