import ical from 'ical';
import fetch from 'node-fetch';

export async function GET(req) {
  const url = new URL(req.url).searchParams.get('url');

  if (!url) {
    return new Response(JSON.stringify({ error: 'No URL provided' }), { status: 400 });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error fetching iCal");

    const text = await response.text();
    const data = ical.parseICS(text);  // Corrected data assignment
    const events = Object.values(data)  // Changed parsedData to data here
      .filter(event => event.type === 'VEVENT')
      .map(event => ({
        id: event.uid,
        title: event.summary || 'Sin título',
        start: event.start,
        end: event.end,
        isICalEvent: true, // Marks as iCal event
      }));

    return new Response(JSON.stringify(events), { status: 200 });
  } catch (error) {
    console.error('iCal processing error:', error);
    return new Response(JSON.stringify({ error: 'Failed to retrieve iCal events' }), { status: 500 });
  }
}
