const app = document.querySelector<HTMLDivElement>("#app");

if (app) {
  app.innerHTML = `
    <div>
      <h1>Tiler</h1>
      <p>Scaffold running. Tiling algorithms land in the next build pass.</p>
    </div>
  `;
}
