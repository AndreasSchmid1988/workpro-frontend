export default async () => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = 'https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css';
  document.head.appendChild(link);

  const script = document.createElement('script');
  script.src = 'https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js';
  document.body.appendChild(script);
};
