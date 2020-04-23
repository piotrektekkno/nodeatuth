var express = require('express');
var app = express();
app.get('/', function (req, res) {
  var strP = '<br>';
  var tmpStr =''
  var q = req.query;
  for (var a in q){
    tmpStr = 'Parametr w url: ' + a + ' wartość: ' + q[a];
    console.log(tmpStr);
    strP += '<br>' + tmpStr
  }
  res.send('Hello World! on Heroku platform :) ' +
  '<br>Deploy from Github details: <b>piotrektekkno/herokuNodeJS </b>' +
  strP);


});
app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});