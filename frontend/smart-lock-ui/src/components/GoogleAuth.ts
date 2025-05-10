import { gapi } from 'gapi-script';

const CLIENT_ID = '378065249483-h4lad2d3m51n5ag1m0e9he8j5c43tj9u.apps.googleusercontent.com';
//Cambio el scopes para tener más control sobre los eventos del calendario (antes solo se podía leer)
const SCOPES = 'https://www.googleapis.com/auth/calendar';

export const initGapi = () => {
  gapi.load('client:auth2', () => {
    gapi.client.init({
      clientId: CLIENT_ID,
      scope: SCOPES,
    });
  });
};

export const signInWithGoogle = async () => {
  const auth = gapi.auth2.getAuthInstance();
  if (!auth.isSignedIn.get()) {
    await auth.signIn();
  }
};

export const isLoggedIn = () => {
  return gapi.auth2.getAuthInstance().isSignedIn.get();
};

export const insertEventToCalendar = async (evento: any) => {
  return gapi.client.calendar.events.insert({
    calendarId: 'primary',
    resource: evento,
  });
};

export const deleteEventFromCalendar = async (eventId: string) => {
  return gapi.client.calendar.events.delete({
    calendarId: 'primary',
    eventId,
  });
};

// Interfaz simple para el objeto de evento que esperamos en el map
interface CalendarEventItem {
  id?: string; // El ID del evento, opcional si no siempre está presente
  summary?: string; // El resumen del evento, opcional
}

// Función para encontrar un evento por su resumen
export const findEventBySummary = async (summarySubstring: string): Promise<string | null> => {
  console.log(`[GoogleAuth] Iniciando findEventBySummary con: "${summarySubstring}"`);
  try {
    const response = await gapi.client.calendar.events.list({
      calendarId: 'primary',
      q: summarySubstring, // Usar el parámetro 'q' para búsqueda de texto libre
      maxResults: 10, // Aumentado ligeramente, pero se esperan pocos resultados
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    console.log('[GoogleAuth] Respuesta de events.list:', response);
    const events = response.result.items;

    if (events && events.length > 0) {
      // Especificamos el tipo para 'e' en la función map
      console.log(`[GoogleAuth] Eventos encontrados por 'q' (${events.length}):`, events.map((e: CalendarEventItem) => ({id: e.id, summary: e.summary})));
      // Buscar una coincidencia exacta del resumen, ya que 'q' puede ser amplio
      for (const event of events) {
        if (event.summary && event.summary === summarySubstring && event.id) {
          console.log(`[GoogleAuth] Coincidencia exacta encontrada: ID ${event.id}, Resumen: "${event.summary}"`);
          return event.id; // Devuelve el ID del primer evento que coincida exactamente
        }
      }
      console.log(`[GoogleAuth] No se encontró una coincidencia *exacta* de resumen para "${summarySubstring}" en los eventos filtrados por 'q'.`);
    } else {
      console.log(`[GoogleAuth] No se encontró ningún evento con 'q' para el resumen: "${summarySubstring}"`);
    }
    return null;
  } catch (error: unknown) { 
    console.error('[GoogleAuth] Error al buscar evento por resumen:', error);
    // Si necesitaras acceder a propiedades específicas de 'error', harías una comprobación de tipo:
    // if (error instanceof Error) {
    //   console.error('[GoogleAuth] Error al buscar evento por resumen:', error.message);
    // } else {
    //   console.error('[GoogleAuth] Error desconocido al buscar evento por resumen:', error);
    // }
    throw error;
  }
};