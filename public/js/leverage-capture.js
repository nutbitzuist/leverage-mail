(function() {
  window.LeverageMail = {
    init: function(config) {
      this.config = config;
      // Allow overriding the API endpoint
      this.baseUrl = config.baseUrl || "https://leverage-mail.vercel.app"; 
      this.endpoint = `${this.baseUrl}/api/leads`;
      
      if (config.type === "floating") {
        this.renderFloating();
      } else if (config.targetId) {
        this.renderInline(config.targetId);
      }
    },

    renderFloating: function() {
      const btn = document.createElement("button");
      btn.innerHTML = this.config.buttonText || "Join Newsletter";
      btn.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: ${this.config.primaryColor || '#6d28d9'};
        color: white;
        padding: 0.8rem 1.5rem;
        border-radius: 9999px;
        font-family: sans-serif;
        font-weight: bold;
        border: none;
        cursor: pointer;
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        z-index: 999999;
      `;
      btn.onclick = () => this.showModal();
      document.body.appendChild(btn);
    },

    renderInline: function(targetId) {
      const target = document.getElementById(targetId);
      if (!target) return;
      
      const container = document.createElement("div");
      container.style.cssText = `
        background: #f8fafc;
        padding: 2rem;
        border-radius: 1rem;
        border: 1px solid #e2e8f0;
        font-family: sans-serif;
      `;
      
      container.innerHTML = `
        <h3 style="margin:0 0 0.5rem 0; font-size: 1.25rem;">${this.config.title || "Subscribe"}</h3>
        <p style="margin:0 0 1.5rem 0; color: #64748b; font-size: 0.875rem;">${this.config.subheadline || "Get updates direct to your inbox."}</p>
        <form class="lm-form">
          <input type="email" required placeholder="your@email.com" style="width:100%; padding:0.75rem; border:1px solid #cbd5e1; border-radius:0.5rem; margin-bottom:1rem; outline:none;" />
          <button type="submit" style="width:100%; padding:0.75rem; background:${this.config.primaryColor || '#6d28d9'}; color:white; border-radius:0.5rem; border:none; font-weight:bold; cursor:pointer;">${this.config.cta || "Join Now"}</button>
        </form>
      `;
      
      const form = container.querySelector("form");
      form.onsubmit = (e) => this.handleSubmit(e, form, container);
      target.appendChild(container);
    },

    showModal: function() {
      const backdrop = document.createElement("div");
      backdrop.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999999;
      `;
      
      const modal = document.createElement("div");
      modal.style.cssText = `
        background: white;
        padding: 2.5rem;
        border-radius: 1.5rem;
        width: 100%;
        max-width: 400px;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
        font-family: sans-serif;
      `;

      modal.innerHTML = `
        <h2 style="margin:0 0 0.5rem 0; font-size: 1.5rem;">${this.config.title || "Capture Lead"}</h2>
        <p style="margin:0 0 1.5rem 0; color: #666; font-size: 0.9rem;">${this.config.subheadline || "Enter your email below."}</p>
        <form class="lm-form">
          <input type="email" required placeholder="name@company.com" style="width:100%; padding:0.8rem; border:1px solid #ddd; border-radius:0.75rem; margin-bottom:1rem; outline:none;" />
          <button type="submit" style="width:100%; padding:0.8rem; background:${this.config.primaryColor || '#6d28d9'}; color:white; border-radius:0.75rem; border:none; font-weight:bold; cursor:pointer;">${this.config.cta || "Subscribe"}</button>
        </form>
      `;

      backdrop.onclick = (e) => { if(e.target === backdrop) backdrop.remove(); };
      backdrop.appendChild(modal);
      document.body.appendChild(backdrop);

      const form = modal.querySelector("form");
      form.onsubmit = (e) => this.handleSubmit(e, form, modal, backdrop);
    },

    handleSubmit: async function(e, form, container, backdrop) {
      e.preventDefault();
      const email = form.querySelector("input").value;
      const btn = form.querySelector("button");
      btn.disabled = true;
      btn.innerHTML = "Processing...";

      try {
        const res = await fetch(this.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            target_user_id: this.config.userId,
            source: window.location.hostname + " (External)",
            tags: this.config.tags || ["Website Lead"],
            metadata: { 
              url: window.location.href,
              userAgent: navigator.userAgent 
            }
          })
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.redirect_url) {
            window.location.href = data.redirect_url;
            return;
          }
          container.innerHTML = `<div style="text-align:center; padding: 1rem;">
            <h2 style="color: #059669; margin: 0 0 0.5rem 0;">Success!</h2>
            <p style="color: #4b5563; font-size: 0.875rem;">${this.config.successMessage || "Check your inbox."}</p>
          </div>`;
          if (backdrop) setTimeout(() => backdrop.remove(), 2500);
        } else {
          throw new Error();
        }
      } catch {
        alert("Something went wrong. Please try again.");
        btn.disabled = false;
        btn.innerHTML = this.config.cta || "Subscribe";
      }
    }
  };
})();
