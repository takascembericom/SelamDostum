import React, { useEffect, useState } from "react";

type Doc = {
  name: string;
  fields?: {
    title?: { stringValue?: string };
    description?: { stringValue?: string };
    status?: { stringValue?: string };
    visible?: { booleanValue?: boolean };
    isActive?: { booleanValue?: boolean };
    images?: { arrayValue?: { values?: { stringValue?: string }[] } };
  };
};

export default function Home() {
  const [items, setItems] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const url = "https://firestore.googleapis.com/v1/projects/takascemberi-37c23/databases/(default)/documents/listings?pageSize=24";
    fetch(url)
      .then(r => r.json())
      .then(d => {
        const docs: Doc[] = Array.isArray(d?.documents) ? d.documents : [];
        const filtered = docs.filter(x =>
          x?.fields?.status?.stringValue === "active" &&
          (x?.fields?.visible?.booleanValue ?? true) &&
          (x?.fields?.isActive?.booleanValue ?? true)
        );
        setItems(filtered);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div style={{maxWidth: 1140, margin: "0 auto", padding: "24px"}}>
      <header style={{display:"flex", alignItems:"center", gap:12, marginBottom:24}}>
        <img src="/assets/logo.svg" alt="Takas Çemberi" width={44} height={44}/>
        <h1 style={{margin:0}}>Takas Çemberi</h1>
      </header>
      {/* Kategoriler */}
      <section style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:16, marginBottom:32}}>
        <Category title="Teknolojik Ürünler" img="/assets/categories/teknolojik-urunler.svg" />
        <Category title="Beyaz Eşya"         img="/assets/categories/beyaz-esya.svg" />
        <Category title="Mobilya"             img="/assets/categories/mobilya.svg" />
        <Category title="Araba & Yedek Parça" img="/assets/categories/araba-ye-deg-parca.svg" />
        <Category title="Oyuncak"             img="/assets/categories/oyuncak.svg" />
        <Category title="Taşınmazlar"         img="/assets/categories/tasinmazlar.svg" />
        <Category title="Kitap"               img="/assets/categories/kitap.svg" />
      </section>
      {/* İlanlar */}
      <h2 style={{margin:"12px 0 16px"}}>Aktif İlanlar</h2>
      {loading ? (
        <p>Yükleniyor…</p>
      ) : items.length === 0 ? (
        <p>Şu anda gösterilecek aktif ilan yok.</p>
      ) : (
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:16}}>
          {items.map((doc, i) => {
            const f = doc.fields || {};
            const title = f.title?.stringValue || "İlan";
            const desc  = f.description?.stringValue || "";
            const img   = f.images?.arrayValue?.values?.[0]?.stringValue || "/assets/logo.svg";
            return (
              <article key={doc.name + i} style={{border:"1px solid #e5e7eb", borderRadius:12, padding:12}}>
                <img src={img} alt={title} style={{width:"100%", height:160, objectFit:"cover", borderRadius:8}} />
                <h3 style={{margin:"10px 0 6px", fontSize:18}}>{title}</h3>
                <p style={{margin:0, color:"#555"}}>{desc}</p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Category({ title, img }: { title: string; img: string }) {
  return (
    <div style={{border:"1px solid #e5e7eb", borderRadius:12, overflow:"hidden"}}>
      <img src={img} alt={title} style={{width:"100%", height:120, objectFit:"cover"}} />
      <div style={{padding:10, fontWeight:600}}>{title}</div>
    </div>
  );
}
