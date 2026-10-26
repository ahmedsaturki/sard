export const metadata = {
  title: "Sard Lite",
  description: "Sard Lite — Payload 3 app for shared hosting",
};

export default function HomePage() {
  return (
    <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem", color: "#111" }}>Sard Lite</h1>
      <p style={{ fontSize: "1.25rem", color: "#666", marginBottom: "2rem" }}>
        Payload 3 app for shared hosting (Node.js 20+, 512MB/1-core)
      </p>
      <nav style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <a 
          href="/admin" 
          style={{ 
            display: "inline-block", 
            padding: "0.75rem 1.5rem", 
            background: "#0070f3", 
            color: "white", 
            textDecoration: "none", 
            borderRadius: "0.5rem" 
          }}
        >
          Admin Dashboard
        </a>
        <a 
          href="/api/sard/install" 
          style={{ 
            display: "inline-block", 
            padding: "0.75rem 1.5rem", 
            background: "#10b981", 
            color: "white", 
            textDecoration: "none", 
            borderRadius: "0.5rem" 
          }}
        >
          Install Sard
        </a>
      </nav>
    </main>
  );
}
