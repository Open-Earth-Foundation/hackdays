export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "4rem 2rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
        Your Hackday App
      </h1>
      <p style={{ color: "#666", fontSize: "1.1rem" }}>
        Replace this page with your project. Open <code>src/app/page.tsx</code> and start building!
      </p>
      <p style={{ marginTop: "2rem", padding: "1rem", background: "#f5f5f5", borderRadius: 8 }}>
        Tip: Press <kbd>Cmd+L</kbd> in Cursor to chat with Claude. Tell it what you want to build
        and it will help you write the code.
      </p>
    </main>
  );
}
