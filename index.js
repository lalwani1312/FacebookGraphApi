var express           =     require('express')
  , https             =     require('https')
  , Config            =     require('./configuration/config.js')
  , app               =     express();

app.get('/', function(req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

// app.get('/account', ensureAuthenticated, function(req, res){
//   res.render('account', { user: req.user });
// });
//

app.get('/auth/facebook', function(req, res) {
  console.log('/dialog/oauth called 1');

  //Options to be used by request
  var options = {
    host: 'www.facebook.com',
    port: 443,
    path: '/v2.8/dialog/oauth?'
          + 'client_id=' + config.facebook_api_key
          + '&redirect_uri=http://localhost:3000/auth/facebook/callback'
  };

  console.log('oAuth code request: ' +JSON.stringify(options));
  // var oAuthDialogRequest = https.request(options,  function(response) {
  //   console.log('oAuthDialogRequest callback');
  //   var body;
  //   response.on('data', function(data) {
  //     body += data;
  //   });
  //
  //   response.on('end', function() {
  //     console.log('body: ' + body);
  //   });
  //
  //   response.on('error', function(e) {
  //     console.error(e);
  //   });
  // });
  // oAuthDialogRequest.end();

  res.redirect('http://' + options.host + options.path);
});

//
//
app.get('/auth/facebook/callback', function(req, res) {
  // Options to be used by request
  var options = {
    host: 'graph.facebook.com',
    port: 443,
    path: '/v2.8/oauth/access_token?'
          + 'client_id=' + config.facebook_api_key
          + '&redirect_uri=http://localhost:3000/auth/facebook/callback'
          + '&client_secret=' + config.facebook_api_secret
          + '&code=' + req.body.code,
    method: 'GET'
  };

  console.log('graph request: ' +JSON.stringify(options));
  var tokenExchangeRequest = https.request(options, accessTokenCallback);
  tokenExchangeRequest.end();
});

// Callback function is used to deal with access token response
var accessTokenCallback = function(response){
   var body = '';
   response.on('data', function(data) {
      body += data;
   });

   response.on('end', function() {
      var dataString = JSON.stringify(body);
      console.log(dataString);
   });

   response.on('error', function(e) {
      console.error(e);
   });
}
//
// app.get('/logout', function(req, res){
//   req.logout();
//   res.redirect('/');
// });


// function ensureAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) { return next(); }
//   res.redirect('/login')
// }

app.listen(8080);
