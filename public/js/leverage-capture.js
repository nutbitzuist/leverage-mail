(function() {
  const SCRIPT_URL = "https://leverage-mail.vercel.app/api/capture"; // Replace with your production URL

  window.LeverageMail = {
    init: function(config) {
      this.config = config;
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
        background: #6d28d9;
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
        <form id="lm-capture-form">
          <input type="email" required placeholder="name@company.com" style="width:100%; padding:0.8rem; border:1px solid #ddd; border-radius:0.75rem; margin-bottom:1rem; outline:none;" />
          <button type="submit" style="width:100%; padding:0.8rem; background:#6d28d9; color:white; border-radius:0.75rem; border:none; font-weight:bold; cursor:pointer;">${this.config.cta || "Subscribe"}</button>
        </form>
      `;

      backdrop.onclick = (e) => { if(e.target === backdrop) backdrop.remove(); };
      backdrop.appendChild(modal);
      document.body.appendChild(backdrop);

      const form = modal.querySelector("#lm-capture-form");
      form.onsubmit = async (e) => {
        e.preventDefault();
        const email = form.querySelector("input").value;
        const btn = form.querySelector("button");
        btn.disabled = true;
        btn.innerHTML = "Processing...";

        try {
          const res = await fetch(SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              formId: this.config.formId,
              source: window.location.href,
              metadata: { userAgent: navigator.userAgent }
            })
          });
          
          if (res.ok) {
            modal.innerHTML = `<div style="text-align:center; padding: 1rem;">
              <h2 style="color: #059669;">Success!</h2>
              <p>${this.config.successMessage || "Check your inbox."}</p>
            </div>`;
            setTimeout(() => backdrop.remove(), 2500);
          } else {
            throw new Error();
          }
        } catch (err) {
          alert("Something went wrong. Please try again.");
          btn.disabled = false;
          btn.innerHTML = this.config.cta || "Subscribe";
        }
      };
    }
  };
})();
