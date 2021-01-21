import fs from 'fs';
import readline from 'readline';

import { Auth, google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const CRED_PATH = 'secrets/gsheets.json';

async function main() {
  const auth = authorize(JSON.parse(fs.readFileSync(CRED_PATH, 'utf8')));
  const sheets = google.sheets({ version: 'v4', auth });
  google.options({
    auth,
  });
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: '1jRYpOEqUWy0SYLalX6CL7quUDv4fP8yCIIGwjwF8dEw',
  });
  // @ts-ignore
  console.log(spreadsheet.data.sheets.map(s => s.properties.title).join('\n'));
}

function authorize(cred: any): Auth.OAuth2Client {
  const { client_email, private_key, private_key_id } = cred;
  const oAuth2Client = new google.auth.JWT({
    email: client_email,
    key: private_key,
    keyId: private_key_id,
    scopes: SCOPES,
  });

  return oAuth2Client;
}

async function readlineAsync(question: string) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

main();
