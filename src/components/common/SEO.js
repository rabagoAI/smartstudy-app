// src/components/common/SEO.js
import { useEffect } from 'react';

const SEO = ({ title, description, image, url }) => {
  // Actualizar el título de la página
  useEffect(() => {
    document.title = title;
  }, [title]);

  // Añadir meta tags dinámicos
  useEffect(() => {
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.content = description;
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'description';
      newMeta.content = description;
      document.head.appendChild(newMeta);
    }

    // Open Graph
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.content = title;
    } else {
      const newOgTitle = document.createElement('meta');
      newOgTitle.property = 'og:title';
      newOgTitle.content = title;
      document.head.appendChild(newOgTitle);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.content = description;
    } else {
      const newOgDesc = document.createElement('meta');
      newOgDesc.property = 'og:description';
      newOgDesc.content = description;
      document.head.appendChild(newOgDesc);
    }

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.content = image;
    } else {
      const newOgImage = document.createElement('meta');
      newOgImage.property = 'og:image';
      newOgImage.content = image;
      document.head.appendChild(newOgImage);
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.content = url;
    } else {
      const newOgUrl = document.createElement('meta');
      newOgUrl.property = 'og:url';
      newOgUrl.content = url;
      document.head.appendChild(newOgUrl);
    }
  }, [title, description, image, url]);

  return null; // No renderiza nada, solo modifica el DOM
};

export default SEO;