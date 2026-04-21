import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AIToolsTeaser.css';

const aiFeatures = [
  {
    icon: "🧠",
    bg: "rgba(167, 139, 250, 0.2)",
    title: "Tutor IA personalizado",
    desc: "Explica cualquier concepto adaptándose a tu nivel y ritmo de aprendizaje."
  },
  {
    icon: "✍️",
    bg: "rgba(52, 211, 153, 0.2)",
    title: "Corrector inteligente",
    desc: "Revisa redacciones, ecuaciones y problemas dando feedback detallado."
  },
  {
    icon: "🎯",
    bg: "rgba(251, 146, 60, 0.2)",
    title: "Plan de estudio adaptativo",
    desc: "Genera un horario personalizado según tus objetivos y exámenes."
  },
  {
    icon: "⚡",
    bg: "rgba(250, 204, 21, 0.2)",
    title: "Flashcards automáticas",
    desc: "Transforma tus apuntes en tarjetas de memoria con repaso espaciado."
  }
];

const chatMessages = [
  { role: "user", text: "No entiendo las ecuaciones de 2º grado 😅" },
  { role: "ai", text: "¡Sin problema! Vamos por pasos. Primero identifiquemos los coeficientes a, b y c..." },
  { role: "ai", text: "Usa la fórmula: x = (-b ± √(b²-4ac)) / 2a. ¿Quieres que lo practiquemos con un ejemplo?" }
];

function ProductMockup() {
  return (
    <div className="product-mockup">
      <div className="mockup-header">
        <div className="mockup-header-dots">
          <div className="mockup-header-dot" style={{background:"#ff5f57"}}></div>
          <div className="mockup-header-dot" style={{background:"#febc2e"}}></div>
          <div className="mockup-header-dot" style={{background:"#28c840"}}></div>
        </div>
        <div className="mockup-header-title">smartstudia.com — Tutor IA</div>
      </div>
      <div className="mockup-body">
        <div className="mockup-sidebar">
          {["📚","🧮","🌍","⚙️","⭐"].map((ic, i) => (
            <div key={i} className={`mockup-sidebar-item ${i === 0 ? "active" : ""}`}>{ic}</div>
          ))}
        </div>
        <div style={{flex:1, display:"flex", flexDirection:"column"}}>
          <div className="mockup-main">
            <div style={{fontSize:"11px", color:"rgba(255,255,255,0.3)", marginBottom:"4px"}}>
              Matemáticas · Ecuaciones 2º grado
            </div>
            {chatMessages.map((m, i) => (
              <div key={i} className="mockup-chat-row" style={{justifyContent: m.role==="user" ? "flex-end" : "flex-start"}}>
                {m.role === "ai" && (
                  <div className="mockup-avatar" style={{background:"linear-gradient(135deg,#7c3aed,#2563eb)"}}>AI</div>
                )}
                <div className={`mockup-bubble ${m.role}`}>{m.text}</div>
              </div>
            ))}
            <div className="mockup-chat-row" style={{justifyContent:"flex-start"}}>
              <div className="mockup-avatar" style={{background:"linear-gradient(135deg,#7c3aed,#2563eb)"}}>AI</div>
              <div className="mockup-typing">
                <div className="mockup-dot-anim"></div>
                <div className="mockup-dot-anim"></div>
                <div className="mockup-dot-anim"></div>
              </div>
            </div>
          </div>
          <div className="mockup-input-bar">
            <div className="mockup-input">Escribe tu duda...</div>
            <div className="mockup-send">↑</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AIToolsTeaser() {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <section className="ai-tools-teaser">
      <div className="ai-grid">
        <div className="ai-left">
          <div className="section-eyebrow">Herramientas IA</div>
          <h2 className="section-title">Potencia tu estudio<br/>con Inteligencia Artificial</h2>
          <p className="section-sub">
            Más que un buscador. Un tutor que te conoce, te escucha y te ayuda a entender de verdad.
          </p>
          <div className="ai-feature-list">
            {aiFeatures.map((f, i) => (
              <div
                key={i}
                className={`ai-feature ${activeFeature === i ? "active" : ""}`}
                onClick={() => setActiveFeature(i)}
              >
                <div className="ai-feature-icon" style={{background: f.bg}}>{f.icon}</div>
                <div className="ai-feature-text">
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ai-right">
          <ProductMockup />
          <div className="stats-row">
            <div className="stat-chip">
              <div className="stat-chip-num">50K+</div>
              <div className="stat-chip-label">Estudiantes activos</div>
            </div>
            <div className="stat-chip">
              <div className="stat-chip-num">4.9★</div>
              <div className="stat-chip-label">Valoración media</div>
            </div>
            <div className="stat-chip">
              <div className="stat-chip-num">98%</div>
              <div className="stat-chip-label">Aprueban el curso</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AIToolsTeaser;
