const { google } = require('googleapis');
const express = require('express')
const request = require('request')
const OAuth2Data = require('./gkeys.json')
const { Client } = require('pg');

const app = express();


const CLIENT_ID = OAuth2Data.web.client_id; 
const CLIENT_SECRET = OAuth2Data.web.client_secret;
const REDIRECT_URL = OAuth2Data.web.redirect_uris[0];


const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
var appToken = '';
var authed = false;

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});
client.connect();

var sTable  = 
    ' <table style="width:100%" border="2"> ' +
    ' <tr> ' +
    '   <th>Id</th> ' +
    '   <th>Name</th> ' +
    '   <th>Joined</th> ' +
    '   <th>Last visit</th> ' +
    '   <th>Counter</th> ' +
    ' </tr> ';
    client.connect();

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
        var str =' ';
       const oauth2 = google.oauth2({auth: oAuth2Client, version: 'v2' });
       oauth2.userinfo.v2.me.get(function(err, result){
           if(err){
               console.log('Błąd');
               console.log(err);
           } else {
               loggedUser = result.data.name;
               console.log(err);
           }
        
        // Nowy użytkownik czy zalogowany ?

        
        var sRows =' ';
        var userExists = 0;

        client.query('SELECT Count(1) isUser FROM public."Users" WHERE Name = \'' + loggedUser + '\'' , (err, r) => {
            if (err) throw err;
            for (let row of r.rows) {
              console.log(JSON.stringify(row));
              userExists = parseInt(JSON.parse(JSON.stringify(row)),10);
            }
        });

        if(userExists){
            console.log(loggedUser + ' został stworzony już isnieje dodanie 1 do kolumny Count' );
            client.query('UPDATE public."Users" SET COUNT = COUNT + 1 WHERE Name = \'' + loggedUser + '\'' , (err, r) => {
                if (err) throw err;
            });
        } else {
            console.log(loggedUser + ' nie istnieje dodanie użutkowanika' );
        }
    

        
        client.query('SELECT * FROM public."Users"', (err, r) => {
          if (err) throw err;
          for (let row of r.rows) {
            console.log(JSON.stringify(row));
            var a = JSON.parse(JSON.stringify(row));
            console.log(a.name);
            sRows +=
                '<tr>' +
                '<td> ' + a.id + '</td>' +
                '<td> ' + a.name + '</td>' +
                '<td> ' + a.joined + '</td>' +
                '<td> ' + a.lastvisit + '</td>' +
                '<td> ' + a.counter + '</td>' +
                '</tr>'
          }
          //client.end();
          res.send(
            
            'Logged in: <BR> '.
            concat(loggedUser, ' <img src="', 
                    result.data.picture,
                    '"height="23" width="23">',
                    '<br>' +
                    '<button type="button" onClick="logout()">Wyloguj</button>') +
                    sTable + sRows + '</table>' 
                    );
            });
        });
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

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Server running at ${port}`));