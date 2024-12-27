import db from '../../../../lib/db';

export async function GET(req) {
  try {
    // Consulta para obtener todas las etiquetas (tags) de la tabla
    const rows = await db.query('SELECT JSON_UNQUOTE(tags) AS tags FROM notas WHERE tags IS NOT NULL');

    //console.log('Rows from database:', rows); // Debug para ver los datos obtenidos

    // Verifica si `rows` tiene un primer nivel con los datos reales
    const actualRows = rows[0]; // Extraer el primer nivel de datos
    if (!actualRows || actualRows.length === 0) {
      console.warn('No se encontraron registros con tags válidos.');
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Consolidar todos los tags en un solo array
    const allTags = actualRows
      .map(row => {
        try {
          return JSON.parse(row.tags || '[]'); // Parsear cada string JSON a un array
        } catch (error) {
          console.error('Error parsing tags:', row.tags);
          return []; // En caso de error, devolver un array vacío
        }
      })
      .flat(); // Combinar todos los arrays en uno solo

    //console.log('Parsed tags:', allTags);

    // Obtener un conjunto único de tags
    const uniqueTags = [...new Set(allTags)];
    //console.log('Unique tags:', uniqueTags);

    return new Response(JSON.stringify(uniqueTags), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al obtener tags:', error);

    return new Response(
      JSON.stringify({ error: 'Error al obtener tags' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
