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
