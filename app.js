const { google } = require('googleapis');
const express = require('express')
const OAuth2Data = require('./gkeys.json')

const app = express()


const CLIENT_ID = OAuth2Data.web.client_id; 
const CLIENT_SECRET = OAuth2Data.web.client_secret;
const REDIRECT_URL = OAuth2Data.web.redirect_uris[0];

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)
var authed = false;
const oauth2;

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
       
       oauth2 = google.oauth2({auth: oAuth2Client, version: 'v2' });
       oauth2.userinfo.v2.me.get(function(err, result){
           if(err){
               console.log('Błąd');
               console.log(err);
           } else {
               loggedUser = result.data.name;
               console.log(err);
           }
           res.set('title', 'Auth App');
           //res.send('<button type="button">Wyloguj</button>'); 
           res.send('Logged in: <BR> '.
                    concat(loggedUser, ' <img src="', 
                           result.data.picture,
                           '"height="23" width="23">',
                           '<br>' +
                           '<button type="button">Wyloguj</button>'));
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
                res.redirect('/')
            }
        });
    }
});

app.get('/logout',  function (req, res) {
    /*
    res.send(
        '<script src="https://apis.google.com/js/platform.js?onload=init" async defer></script>' +
        '<script> ' +
            'var auth2 = gapi.auth2.getAuthInstance(); ' +
            'auth2.signOut().then(function () { ' +
            'console.log("User signed out."); ' +
            '});' +
            'alert("ok"); ' +
        '</script> '
    );
    */
    /*
    oAuth2Client.signOut().then(function () {
    });
    oAuth2Client.disconnect();
    */
    //
    oauth2.signOut();
    res.redirect('/');
});

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Server running at ${port}`));