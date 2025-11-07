'use client';

import { useEffect } from 'react';

/**
 * Documentation page that serves the OpenAPI/Swagger UI
 *
 * This component loads the Swagger UI library and renders
 * interactive API documentation based on the OpenAPI spec.
 *
 * Accessible at: http://localhost:3000/docs
 */
export default function DocsPage() {
  useEffect(() => {
    // Load Swagger UI script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/swagger-ui-dist@3/swagger-ui-bundle.js';
    script.async = true;
    script.onload = () => {
      // Initialize Swagger UI
      const ui = (window as any).SwaggerUIBundle({
        url: '/api/docs',
        dom_id: '#swagger-ui',
        presets: [
          (window as any).SwaggerUIBundle.presets.apis,
          (window as any).SwaggerUIBundle.SwaggerUIStandalonePreset,
        ],
        layout: 'BaseLayout',
        deepLinking: true,
      });
      (window as any).ui = ui;
    };
    document.body.appendChild(script);

    // Load Swagger UI CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/swagger-ui-dist@3/swagger-ui.css';
    document.head.appendChild(link);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div
        id="swagger-ui"
        className="w-full"
        style={{
          backgroundColor: '#fafafa',
          minHeight: '100vh',
        }}
      />
    </div>
  );
}
