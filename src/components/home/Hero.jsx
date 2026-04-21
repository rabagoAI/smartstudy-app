// src/components/home/Hero.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

function Hero() {
  const navigate = useNavigate();

  const handleStartFree = () => {
    navigate('/registrarse');
  };

  const handleWatchDemo = () => {
    const aiSection = document.querySelector('.ai-tools-teaser');
    if (aiSection) {
      aiSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="hero">
      <div className="hero-orb hero-orb-1"></div>
      <div className="hero-orb hero-orb-2"></div>
      <div className="hero-orb hero-orb-3"></div>

      <div className="hero-content">
        <div className="hero-badge">
          <div className="hero-badge-dot"></div>
          Nuevo: Tutor IA para 1° ESO · Curso 2025-26
        </div>

        <h1 className="hero-title">
          Estudia más listo,<br/><span>no más duro</span>
        </h1>

        <p className="hero-sub">
          La plataforma educativa con IA diseñada para estudiantes de ESO en España.
          Entiende cualquier asignatura con tu tutor personal.
        </p>

        <div className="hero-btns">
          <button className="btn-primary" onClick={handleStartFree}>Empezar gratis →</button>
          <button className="btn-secondary" onClick={handleWatchDemo}>Ver cómo funciona ▶</button>
        </div>
      </div>

      <div className="hero-mockup">
        <div className="hero-mockup-frame">
          <div className="mockup-topbar">
            <div className="mockup-dot" style={{background:"#ff5f57"}}></div>
            <div className="mockup-dot" style={{background:"#febc2e"}}></div>
            <div className="mockup-dot" style={{background:"#28c840"}}></div>
            <div className="mockup-url">smartstudia.com/home</div>
          </div>
          <div className="mockup-screen">
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"4px"}}>
              <div style={{width:"32px",height:"32px",borderRadius:"10px",background:"linear-gradient(135deg,#7c3aed,#2563eb)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>🧠</div>
              <span style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:"15px",color:"#fff"}}>Tutor IA · Matemáticas</span>
            </div>

            <div style={{display:"flex",justifyContent:"flex-end",gap:"8px",alignItems:"flex-start"}}>
              <div style={{padding:"9px 13px", borderRadius:"10px 10px 3px 10px",background:"linear-gradient(135deg,#7c3aed,#2563eb)",color:"rgba(255,255,255,0.85)", fontSize:"12px", lineHeight:1.5, maxWidth:"280px"}}>
                ¿Puedes explicarme las fracciones?
              </div>
            </div>

            <div style={{display:"flex",justifyContent:"flex-start",gap:"8px",alignItems:"flex-start"}}>
              <div style={{width:"24px",height:"24px",borderRadius:"7px",background:"linear-gradient(135deg,#7c3aed,#2563eb)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:700,color:"#fff",flexShrink:0}}>AI</div>
              <div style={{padding:"9px 13px", borderRadius:"10px 10px 10px 3px",background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.85)", fontSize:"12px", lineHeight:1.5, maxWidth:"280px"}}>
                ¡Claro! Una fracción representa una parte de un todo. El número de arriba se llama numerador y el de abajo denominador...
              </div>
            </div>

            <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
              <div style={{width:"24px",height:"24px",borderRadius:"7px",background:"linear-gradient(135deg,#7c3aed,#2563eb)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:700,color:"#fff",flexShrink:0}}>AI</div>
              <div className="mockup-typing">
                <div className="mockup-dot-anim"></div>
                <div className="mockup-dot-anim"></div>
                <div className="mockup-dot-anim"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;