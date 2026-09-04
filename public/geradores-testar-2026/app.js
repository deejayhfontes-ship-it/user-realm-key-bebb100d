/**
 * DESIGNBUILDER CLONE - ENGINE JAVASCRIPT
 */

document.addEventListener("DOMContentLoaded", () => {
  const configs = window.__DB_CONFIGS__ || {};
  const community = window.__DB_COMMUNITY__ || {};

  let activeSlug = "design-builder1-2";
  let activeFormData = {
    quantidade: "1",
    genero: "Masculino",
    subject_position: "center",
    dimensions: "4:5",
    quality: "2K",
    plano: "medium",
    sobriedade_criatividade: "50",
    estilo_visual: "ultra_realistic",
    usar_desfoque_blur: false,
    degrade: false
  };

  const formScrollEl = document.getElementById("form-scrollable");
  const livePromptBox = document.getElementById("live-prompt-box");
  const canvasFrame = document.getElementById("canvas-frame");
  const canvasAspectLabel = document.getElementById("canvas-aspect-label");
  const canvasPlaceholder = document.getElementById("canvas-placeholder");
  const renderedArt = document.getElementById("rendered-art");
  const btnConstruir = document.getElementById("btn-construir");

  // Abas do Palco
  const stagePills = document.querySelectorAll(".stage-pill");
  const views = {
    builder: document.getElementById("view-builder"),
    pinterest: document.getElementById("view-pinterest"),
    comunidade: document.getElementById("view-comunidade"),
    galeria: document.getElementById("view-galeria"),
    guia: document.getElementById("view-guia")
  };

  stagePills.forEach((pill) => {
    pill.onclick = () => {
      stagePills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      const target = pill.dataset.tab;
      for (const [key, el] of Object.entries(views)) {
        if (el) el.style.display = key === target ? (key === "builder" ? "flex" : "block") : "none";
      }
      if (target === "comunidade") renderCommunityGrid();
      if (target === "galeria") renderUserGallery();
    };
  });

  // Drawer Forense / Prompt Mágico
  const forensicDrawer = document.getElementById("forensic-drawer");
  const btnToggleForensic = document.getElementById("btn-toggle-forensic");
  const btnCloseForensic = document.getElementById("btn-close-forensic");
  const btnCopyPrompt = document.getElementById("btn-copy-prompt");

  btnToggleForensic.onclick = () => forensicDrawer.classList.toggle("open");
  btnCloseForensic.onclick = () => forensicDrawer.classList.remove("open");
  btnCopyPrompt.onclick = () => {
    navigator.clipboard.writeText(livePromptBox.value).then(() => {
      btnCopyPrompt.innerText = "✅ Copiado!";
      setTimeout(() => (btnCopyPrompt.innerText = "📋 Copiar"), 2000);
    });
  };

  // Modais de Agentes e API
  const agentsModal = document.getElementById("agents-modal");
  const btnAgentsMenu = document.getElementById("btn-agents-menu");
  const btnCloseAgentsModal = document.getElementById("btn-close-agents-modal");
  const modalAgentList = document.getElementById("modal-agent-list");

  btnAgentsMenu.onclick = () => {
    renderAgentsModal();
    agentsModal.style.display = "flex";
  };
  btnCloseAgentsModal.onclick = () => (agentsModal.style.display = "none");

  const apiModal = document.getElementById("api-modal");
  const dockApiKey = document.getElementById("dock-api-key");
  const btnCloseApi = document.getElementById("btn-close-api");
  const inputApiKey = document.getElementById("input-api-key");
  const btnSaveKey = document.getElementById("btn-save-key");

  inputApiKey.value = localStorage.getItem("DB_AI_API_KEY") || "";
  dockApiKey.onclick = () => (apiModal.style.display = "flex");
  btnCloseApi.onclick = () => (apiModal.style.display = "none");
  btnSaveKey.onclick = () => {
    localStorage.setItem("DB_AI_API_KEY", inputApiKey.value.trim());
    apiModal.style.display = "none";
    alert("✅ Chave de API salva com sucesso!");
  };

  function renderAgentsModal() {
    modalAgentList.innerHTML = "";
    for (const [slug, ag] of Object.entries(configs)) {
      const item = document.createElement("div");
      item.className = "pill-btn";
      item.style.justifyContent = "space-between";
      item.innerHTML = `<span>${ag.name || slug}</span><span style="font-size:11px;color:#94a3b8;">${slug}</span>`;
      item.onclick = () => {
        activeSlug = slug;
        agentsModal.style.display = "none";
        renderMainForm();
        updatePrompt();
      };
      modalAgentList.appendChild(item);
    }
  }

  // Renderizar Formulário Completo do Design Builder 1.2
  function renderMainForm() {
    formScrollEl.innerHTML = `
      <!-- Fotos do Sujeito / Produto -->
      <div>
        <div class="section-header">Fotos do Sujeito / Produto</div>
        <div class="upload-dropzone" id="drop-sujeito">
          <span style="font-size: 20px;">＋</span>
          <span>Clique, arraste ou cole (Ctrl+V)</span>
        </div>
      </div>

      <!-- Quantidade -->
      <div>
        <div class="section-header">Quantidade</div>
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px;">
          ${["1", "2", "3", "4", "5"].map(q => `
            <button class="pill-btn ${activeFormData.quantidade === q ? "selected" : ""}" data-bind="quantidade" data-val="${q}">${q}</button>
          `).join("")}
        </div>
      </div>

      <!-- Gênero -->
      <div>
        <div class="section-header">Gênero</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <button class="pill-btn ${activeFormData.genero === "Masculino" ? "selected" : ""}" data-bind="genero" data-val="Masculino">
            <span>♂</span> Masculino
          </button>
          <button class="pill-btn ${activeFormData.genero === "Feminino" ? "selected" : ""}" data-bind="genero" data-val="Feminino">
            <span>♀</span> Feminino
          </button>
        </div>
      </div>

      <!-- Descrição do Sujeito -->
      <div>
        <div class="section-header">Descrição do Sujeito</div>
        <textarea class="dark-textarea" id="input-subject-desc" placeholder="Descreva a aparência, roupas, pose ou detalhes do produto..."></textarea>
      </div>

      <!-- Posição do Sujeito -->
      <div>
        <div class="section-header">Posição do Sujeito</div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
          <button class="pill-btn ${activeFormData.subject_position === "left" ? "selected" : ""}" data-bind="subject_position" data-val="left">
            <span style="font-size:16px;">⫷</span> Esquerda
          </button>
          <button class="pill-btn ${activeFormData.subject_position === "center" ? "selected" : ""}" data-bind="subject_position" data-val="center">
            <span style="font-size:16px;">☰</span> Centro
          </button>
          <button class="pill-btn ${activeFormData.subject_position === "right" ? "selected" : ""}" data-bind="subject_position" data-val="right">
            <span style="font-size:16px;">⫸</span> Direita
          </button>
        </div>
      </div>

      <!-- Dimensões -->
      <div>
        <div class="section-header">Dimensões</div>
        <div class="dimensions-wrap">
          <div class="dim-list">
            <div class="dim-item ${activeFormData.dimensions === "9:16" ? "selected" : ""}" data-dim="9:16">
              <span>Stories</span> <span style="font-size:11px;opacity:0.7;">9:16</span>
            </div>
            <div class="dim-item ${activeFormData.dimensions === "4:5" ? "selected" : ""}" data-dim="4:5">
              <span>Feed Vertical</span> <span style="font-size:11px;opacity:0.7;">4:5</span>
            </div>
            <div class="dim-item ${activeFormData.dimensions === "1:1" ? "selected" : ""}" data-dim="1:1">
              <span>Feed</span> <span style="font-size:11px;opacity:0.7;">1:1</span>
            </div>
            <div class="dim-item ${activeFormData.dimensions === "16:9" ? "selected" : ""}" data-dim="16:9">
              <span>Cinema</span> <span style="font-size:11px;opacity:0.7;">16:9</span>
            </div>
          </div>
          <div class="dim-preview-box">
            <div class="dim-aspect-shape" id="dim-aspect-shape" style="width: 56px; height: 70px;"></div>
          </div>
        </div>
      </div>

      <!-- Qualidade de Renderização -->
      <div>
        <div class="section-header">
          <span>Qualidade de Renderização</span>
          <span class="badge-tag" style="color:#c084fc;border:1px solid #7c3aed;">ALTA 2752×1536</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
          <button class="pill-btn ${activeFormData.quality === "1K" ? "selected" : ""}" data-bind="quality" data-val="1K">1K <span style="font-size:10px;opacity:0.6;">RÁPIDO</span></button>
          <button class="pill-btn ${activeFormData.quality === "2K" ? "selected" : ""}" data-bind="quality" data-val="2K">2K <span style="font-size:10px;opacity:0.6;">MÉDIO</span></button>
          <button class="pill-btn ${activeFormData.quality === "4K" ? "selected" : ""}" data-bind="quality" data-val="4K">4K <span style="font-size:10px;opacity:0.6;">LENTO</span></button>
        </div>
      </div>

      <!-- Nicho / Projeto -->
      <div>
        <div class="section-header">Nicho/Projeto</div>
        <input type="text" class="dark-input" id="input-nicho" placeholder="ex: Campanha Verão 2026, Dentista Premium...">
      </div>

      <!-- Cenário / Contexto -->
      <div>
        <div class="section-header">Cenário / Contexto</div>
        <textarea class="dark-textarea" id="input-cenario" placeholder="Descreva o ambiente, cenário ou contexto da imagem..."></textarea>
      </div>

      <!-- Textos da Imagem -->
      <div>
        <div class="section-header">
          <span>Textos da Imagem</span>
          <span class="badge-tag">opcional 0/8</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
          <button class="pill-btn" style="flex-direction:column;gap:4px;padding:10px 4px;">
            <span style="font-size:11px;color:#a855f7;font-weight:800;">H1</span>
            <span style="font-size:10px;">Título principal</span>
          </button>
          <button class="pill-btn" style="flex-direction:column;gap:4px;padding:10px 4px;">
            <span style="font-size:11px;color:#38bdf8;font-weight:800;">H2</span>
            <span style="font-size:10px;">Subtítulo</span>
          </button>
          <button class="pill-btn" style="flex-direction:column;gap:4px;padding:10px 4px;">
            <span style="font-size:11px;color:#cbd5e1;font-weight:800;">≡</span>
            <span style="font-size:10px;">Texto curto</span>
          </button>
        </div>
      </div>

      <!-- Paleta de Cores -->
      <div>
        <div class="section-header">
          <span>Paleta de Cores</span>
          <span class="badge-tag">OPCIONAL</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
          <div class="pill-btn" style="flex-direction:column;font-size:9px;color:#64748b;padding:8px 4px;">
            <span>OPCIONAL</span>
            <span style="font-size:8px;">toque para ativar</span>
            <span style="color:#cbd5e1;font-size:9px;margin-top:2px;">COR AMBIENTE</span>
          </div>
          <div class="pill-btn" style="flex-direction:column;font-size:9px;color:#64748b;padding:8px 4px;">
            <span>OPCIONAL</span>
            <span style="font-size:8px;">toque para ativar</span>
            <span style="color:#cbd5e1;font-size:9px;margin-top:2px;">LUZ COMPLEMENTAR</span>
          </div>
          <div class="pill-btn" style="flex-direction:column;font-size:9px;color:#64748b;padding:8px 4px;">
            <span>OPCIONAL</span>
            <span style="font-size:8px;">toque para ativar</span>
            <span style="color:#cbd5e1;font-size:9px;margin-top:2px;">COR DESTAQUE</span>
          </div>
        </div>
      </div>

      <!-- Plano -->
      <div>
        <div class="section-header">Plano</div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
          <button class="pill-btn ${activeFormData.plano === "close_up" ? "selected" : ""}" data-bind="plano" data-val="close_up" style="flex-direction:column;font-size:11px;padding:12px 6px;">
            <span>👤</span> Close-up (Rosto)
          </button>
          <button class="pill-btn ${activeFormData.plano === "medium" ? "selected" : ""}" data-bind="plano" data-val="medium" style="flex-direction:column;font-size:11px;padding:12px 6px;">
            <span>🚶</span> Plano Médio (Busto)
          </button>
          <button class="pill-btn ${activeFormData.plano === "american" ? "selected" : ""}" data-bind="plano" data-val="american" style="flex-direction:column;font-size:11px;padding:12px 6px;">
            <span>🧍</span> Plano Americano
          </button>
        </div>
      </div>

      <!-- Barra de Sobriedade -->
      <div>
        <div class="section-header">
          <span>Estilo da Imagem (Sobriedade)</span>
          <span class="badge-tag" id="sobriety-val">50%</span>
        </div>
        <input type="range" min="0" max="100" value="50" class="dark-input" id="input-sobriety" style="cursor:pointer;accent-color:#7c3aed;padding:0;">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:#64748b;margin-top:4px;">
          <span>Criativo & Livre (0%)</span>
          <span>Equilibrado (50%)</span>
          <span>Fiel & Sóbrio (100%)</span>
        </div>
      </div>

      <!-- Usar Desfoque (Blur) -->
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size:13px;font-weight:600;">Usar Desfoque (Bokeh no Fundo)?</span>
        <input type="checkbox" id="chk-blur" style="width:18px;height:18px;accent-color:#7c3aed;cursor:pointer;">
      </div>
    `;

    bindFormEvents();
    updateCanvasDimension("4:5");
  }

  function bindFormEvents() {
    // Botões de Pills (Quantidade, Gênero, Posição, Qualidade, Plano)
    formScrollEl.querySelectorAll("[data-bind]").forEach((btn) => {
      btn.onclick = () => {
        const bindKey = btn.dataset.bind;
        const bindVal = btn.dataset.val;
        activeFormData[bindKey] = bindVal;

        formScrollEl.querySelectorAll(`[data-bind="${bindKey}"]`).forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        updatePrompt();
      };
    });

    // Dimensões
    formScrollEl.querySelectorAll(".dim-item").forEach((item) => {
      item.onclick = () => {
        const dim = item.dataset.dim;
        activeFormData.dimensions = dim;
        formScrollEl.querySelectorAll(".dim-item").forEach((i) => i.classList.remove("selected"));
        item.classList.add("selected");
        updateCanvasDimension(dim);
        updatePrompt();
      };
    });

    // Textareas e Inputs
    const descEl = document.getElementById("input-subject-desc");
    if (descEl) descEl.oninput = (e) => { activeFormData.subject_description = e.target.value; updatePrompt(); };

    const nichoEl = document.getElementById("input-nicho");
    if (nichoEl) nichoEl.oninput = (e) => { activeFormData.nicho_projeto = e.target.value; updatePrompt(); };

    const cenarioEl = document.getElementById("input-cenario");
    if (cenarioEl) cenarioEl.oninput = (e) => { activeFormData.cenario_contexto = e.target.value; updatePrompt(); };

    const sobEl = document.getElementById("input-sobriety");
    const sobVal = document.getElementById("sobriety-val");
    if (sobEl) sobEl.oninput = (e) => {
      activeFormData.sobriedade_criatividade = e.target.value;
      if (sobVal) sobVal.innerText = e.target.value + "%";
      updatePrompt();
    };

    const chkBlur = document.getElementById("chk-blur");
    if (chkBlur) chkBlur.onchange = (e) => {
      activeFormData.usar_desfoque_blur = e.target.checked;
      updatePrompt();
    };
  }

  // Atualizar visual da moldura do Canvas central
  function updateCanvasDimension(dim) {
    canvasAspectLabel.innerText = dim;
    const shape = document.getElementById("dim-aspect-shape");

    const sizes = {
      "9:16": { w: "380px", h: "675px", shapeW: "42px", shapeH: "75px" },
      "4:5":  { w: "480px", h: "600px", shapeW: "56px", shapeH: "70px" },
      "1:1":  { w: "540px", h: "540px", shapeW: "64px", shapeH: "64px" },
      "16:9": { w: "720px", h: "405px", shapeW: "80px", shapeH: "45px" }
    };

    const s = sizes[dim] || sizes["4:5"];
    canvasFrame.style.width = s.w;
    canvasFrame.style.height = s.h;
    if (shape) {
      shape.style.width = s.shapeW;
      shape.style.height = s.shapeH;
    }
  }

  // Atualizar Prompt no Drawer
  function updatePrompt() {
    const prompt = window.PromptEngine
      ? window.PromptEngine.compile(activeSlug, activeFormData)
      : "";
    livePromptBox.value = prompt;
  }

  // Renderizar Galeria da Comunidade
  function renderCommunityGrid() {
    const grid = document.getElementById("community-grid");
    grid.innerHTML = "";
    const items = (community.agentes && community.agentes[activeSlug]) || [];

    items.slice(0, 40).forEach((item) => {
      const card = document.createElement("div");
      card.className = "masonry-item";
      // Usar a thumbnail ou resultado local salvo
      card.innerHTML = `
        <img src="../Claude outputs/designbuilder_downloads/${item.hash}.avif" onerror="this.src='https://picsum.photos/seed/${item.hash}/400/500'" alt="${item.autor || 'Arte'}">
        <div style="padding: 8px 10px; font-size: 11px; display: flex; justify-content: space-between; color: #94a3b8;">
          <span>${item.autor || "Autor"}</span>
          <span>${item.dimensions || "4:5"}</span>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // Renderizar Galeria do Usuário
  function renderUserGallery() {
    const grid = document.getElementById("user-gallery-grid");
    grid.innerHTML = `
      <div class="masonry-item">
        <img src="sample.png" alt="Sua Geração">
        <div style="padding: 8px 10px; font-size: 11px; display: flex; justify-content: space-between; color: #a855f7; font-weight:700;">
          <span>Sua Geração (Dentista)</span>
          <span>4:5</span>
        </div>
      </div>
    `;
  }

  // ── Upload real das fotos do sujeito (a dropzone original era só visual) ──
  const uploadedImages = [];
  const hiddenFile = document.createElement("input");
  hiddenFile.type = "file";
  hiddenFile.accept = "image/*";
  hiddenFile.multiple = true;
  hiddenFile.style.display = "none";
  document.body.appendChild(hiddenFile);
  document.addEventListener("click", (e) => {
    if (e.target.closest && e.target.closest("#drop-sujeito")) hiddenFile.click();
  });
  hiddenFile.onchange = async () => {
    for (const f of hiddenFile.files) {
      const dataUrl = await new Promise((res) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.readAsDataURL(f);
      });
      uploadedImages.push(String(dataUrl).split(",")[1]);
      const drop = document.getElementById("drop-sujeito");
      if (drop) {
        const img = document.createElement("img");
        img.src = dataUrl;
        img.style.cssText = "width:56px;height:56px;object-fit:cover;border-radius:8px;margin:4px;border:1px solid #a855f7;";
        drop.appendChild(img);
      }
    }
    hiddenFile.value = "";
  };

  // ── Construir: pede a geração ao painel admin (aba GERADORES TESTAR 2026), que chama a
  //    edge function gerar-imagem-teste. Chave Google fica no servidor; modelo Pro;
  //    fotos enviadas vão como referência. ──
  let pendingReq = null;
  window.addEventListener("message", (ev) => {
    if (ev.source !== window.parent) return;
    const d = ev.data || {};
    if (d.type !== "GERAR_IMAGEM_RESULT" || !pendingReq) return;
    const { resolve, reject } = pendingReq;
    pendingReq = null;
    if (d.error) reject(new Error(d.error)); else resolve(d);
  });

  btnConstruir.onclick = async () => {
    const prompt = livePromptBox.value;
    btnConstruir.disabled = true;
    btnConstruir.innerHTML = `<span>Renderizando com IA...</span>`;
    try {
      if (window.parent === window) {
        throw new Error("Abra este gerador pela aba GERADORES TESTAR 2026 do painel admin.");
      }
      const data = await new Promise((resolve, reject) => {
        pendingReq = { resolve, reject };
        window.parent.postMessage({
          type: "GERAR_IMAGEM",
          prompt,
          imagens: uploadedImages,
          dimensions: activeFormData.dimensions,
          quality: activeFormData.quality,
        }, window.location.origin);
        setTimeout(() => {
          if (pendingReq) { pendingReq = null; reject(new Error("Tempo esgotado (3 min).")); }
        }, 180000);
      });
      renderedArt.src = `data:${data.mime || "image/png"};base64,${data.image_base64}`;
      renderedArt.style.display = "block";
      canvasPlaceholder.style.display = "none";
    } catch (e) {
      alert("❌ Falha na construção: " + e.message);
    } finally {
      btnConstruir.disabled = false;
      btnConstruir.innerHTML = `<span>Construir</span><span class="btn-construir-credit">1 crédito</span>`;
    }
  };

  // Inicialização
  renderMainForm();
  updatePrompt();
});
