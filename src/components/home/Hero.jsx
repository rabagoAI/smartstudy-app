// src/components/home/Hero.js
import React from 'react';
import './Hero.css';
import { BackgroundGradientAnimation } from '../ui/background-gradient-animation';

function Hero() {
  return (
    <section className="hero !bg-none relative overflow-hidden w-full rounded-2xl my-8">
      <BackgroundGradientAnimation containerClassName="absolute inset-0 z-0 h-full w-full m-0 p-0 rounded-2xl" />
      <div className="container relative z-10 pointer-events-auto">
        <div className="hero-content py-10 md:py-16">
          <img 
            src="https://res.cloudinary.com/ds7shn66t/image/upload/v1759232770/Banner_Producto_del_Dia_Promocion_Cafe_Azul_vi0xs4.jpg" 
            alt="SmartStudy - Aprende de forma inteligente"
            className="hero-image relative z-20"
          />
        </div>
      </div>
    </section>
  );
}

export default Hero;