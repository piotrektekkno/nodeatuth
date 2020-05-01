const { google } = require('googleapis');
const express = require('express')
const request = require('request')
const OAuth2Data = require('./gkeys.json')
const { Client } = require('pg');

const app = express();


const CLIENT_ID = OAuth2Data.web.client_id; 
const CLIENT_SECRET = OAuth2Data.web.client_secret;
const REDIRECT_URL = OAuth2Data.web.redirect_uris[0];

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true
  });

  client.connect();

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
var appToken = '';
var authed = false;
app.get('/', (req, res) => {
    if (!authed) {
        
        // Generate an OAuth URL and redirect there
        const url = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://www.googleapis.com/auth/userinfo.profile'
        });
        //res.send(url);
        
        console.log(url);
        res.redirect(url);
    
       //res.send('Logged out');
    } else {
       
       const oauth2 = google.oauth2({auth: oAuth2Client, version: 'v2' });
       oauth2.userinfo.v2.me.get(function(err, result){
           if(err){
               console.log('Błąd');
               console.log(err);
           } else {
               loggedUser = result.data.name;
               console.log(err);
           }

           client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
            if (err) throw err;
            for (let row of res.rows) {
              console.log(JSON.stringify(row));
            }
            client.end();
          });
           
     
           res.send(
                   // logOutStrFunction +
                    'Logged in: <BR> '.
                    concat(loggedUser, ' <img src="', 
                           result.data.picture,
                           '"height="23" width="23">',
                           '<br>' +
                           '<button type="button" onClick="logout()">Wyloguj</button>'));
    });

      //res.send('Logged in');
    }
})

app.get('/auth/google/callback', function (req, res) {
    const code = req.query.code
    if (code) {
        // Get an access token based on our OAuth code
        oAuth2Client.getToken(code, function (err, tokens) {
            if (err) {
                console.log('Error authenticating')
                console.log(err);
            } else {
                console.log('Successfully authenticated');
                oAuth2Client.setCredentials(tokens);
                authed = true;
                appToken = tokens;
                res.redirect('/')
            }
        });
    }
});

app.get('/logout',  function (req, res) {
    authed = false;
    res.send(
        '<script src="https://apis.google.com/js/platform.js?onload=init" async defer></script>' +
        '<script>' +
            'function init() { ' +
            '   gapi.load("auth2", function() { ' +
            '        auth2 = gapi.auth2.init({ ' +
            "           client_id: '" + CLIENT_ID + "'," +
            "           scope: 'profile' " +
                    '}); ' +
            '   }); ' +
            ' alert("ok"); ' +
            '} '+


            'function logout() { '+
            '    var auth2 = gapi.auth2.getAuthInstance(); '+
            '    if (!auth2.isSignedIn.get()) { '+
            '        alert("Not signed in, cannot disconnect"); '+
          //  '        //return; '+
            '    } '+
            '    auth2.signOut(); '+
            '    auth2.disconnect(); '+
            '    alert("logout"); '+
            '} '+
        '</script>' +
        '<button type="button" onClick="logout()">Wyloguj</button>'
    );
    
});

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Server running at ${port}`));