import { Helmet } from 'react-helmet-async';

const OG_IMAGE = 'https://res.cloudinary.com/ds7shn66t/image/upload/v1778588655/Create_a_professional_Open_Graph_202605121410_1_sckige.jpg';
const BASE_URL = 'https://www.smartstudia.com';

const SEO = ({ title, description, image = OG_IMAGE, url }) => {
  const canonical = url ? (url.startsWith('http') ? url : `${BASE_URL}${url}`) : BASE_URL;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;
