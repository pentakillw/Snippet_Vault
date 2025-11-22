export const TEMPLATES = [
    {
      id: 'react-fc',
      label: 'React Functional Component',
      language: 'javascript',
      description: 'Componente básico con export default y props.',
      code: `export default function ComponentName({ prop }) {
    return (
      <div className="p-4">
        <h1>{prop}</h1>
      </div>
    );
  }`
    },
    {
      id: 'js-fetch',
      label: 'JS Fetch Async/Await',
      language: 'javascript',
      description: 'Petición HTTP moderna con manejo de errores.',
      code: `const fetchData = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };`
    },
    {
      id: 'py-request',
      label: 'Python Requests',
      language: 'python',
      description: 'Script básico para consultar una API.',
      code: `import requests
  
  def get_data(url):
      try:
          response = requests.get(url)
          response.raise_for_status()
          return response.json()
      except requests.exceptions.RequestException as e:
          print(f"Error: {e}")
          return None`
    },
    {
      id: 'sql-select',
      label: 'SQL Select + Join',
      language: 'sql',
      description: 'Consulta estándar uniendo dos tablas.',
      code: `SELECT 
      t1.id, 
      t1.name, 
      t2.detail 
  FROM table_one t1
  JOIN table_two t2 ON t1.id = t2.foreign_id
  WHERE t1.status = 'active'
  ORDER BY t1.created_at DESC;`
    },
    {
      id: 'html-boilerplate',
      label: 'HTML5 Boilerplate',
      language: 'html',
      description: 'Estructura base para un documento HTML.',
      code: `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
  </head>
  <body>
      
  </body>
  </html>`
    }
  ];