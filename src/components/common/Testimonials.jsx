import React from 'react';

function Testimonials() {
  return (
    <section className="testimonials">
      <div className="container">
        <h2 className="section-title">Opiniones de estudiantes</h2>
        <div className="testimonials-grid">
          <div className="testimonial">
            <p className="testimonial-text">"Gracias a nuestra plataforma he podido entender las matemáticas mucho mejor. Los ejercicios resueltos paso a paso son lo más útil."</p>
            <div className="testimonial-author">
              <div className="author-avatar">M</div>
              <div>
                <h4>María López</h4>
                <p>Estudiante de 1º ESO</p>
              </div>
            </div>
          </div>
          <div className="testimonial">
            <p className="testimonial-text">"La sección de Ciencias Naturales me salvó el trimestre. Los resúmenes son claros y fáciles de estudiar."</p>
            <div className="testimonial-author">
              <div className="author-avatar">J</div>
              <div>
                <h4>Javier Martínez</h4>
                <p>Estudiante de 1º ESO</p>
              </div>
            </div>
          </div>
          <div className="testimonial">
            <p className="testimonial-text">"Me encanta poder acceder a todo el material desde el móvil. Estudio en el autobús de camino al instituto."</p>
            <div className="testimonial-author">
              <div className="author-avatar">C</div>
              <div>
                <h4>Carlos Rodríguez</h4>
                <p>Estudiante de 2º ESO</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;