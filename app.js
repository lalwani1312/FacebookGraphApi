var express           =     require('express')
  , https             =     require('https')
  , config            =     require('./configuration/config.js')
  , app               =     express();

app.get('/', function(req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

// app.get('/account', ensureAuthenticated, function(req, res){
//   res.render('account', { user: req.user });
// });
//

app.get('/getCode', function(req, res) {
  console.log('/getCode called');

  //Options to be used by request
  var options = {
    host: 'www.facebook.com',
    port: 443,
    path: '/v2.8/dialog/oauth?'
          + 'client_id=' + config.facebook_api_key
          + '&redirect_uri=http://localhost:3000/auth/getAccessToken'
  };

  //console.log('oAuth code request: ' +JSON.stringify(options));
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
app.get('/getAccessToken', function(req, res) {
  // Options to be used by request
  var options = {
    host: 'graph.facebook.com',
    port: 443,
    path: '/v2.8/oauth/access_token?'
          + 'client_id=' + config.facebook_api_key
          + '&redirect_uri=http://localhost:3000/accessTokenReceived'
          + '&client_secret=' + config.facebook_api_secret
          + '&code=' + req.query.code,
    method: 'GET'
  };

  console.log('graph request: ' +JSON.stringify(options));
  var tokenExchangeRequest = https.request(options, accessTokenCallback, meRequest);
  tokenExchangeRequest.end();
});

app.get('/accessTokenReceived', function(req, res) {
  res.json(req.body);
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
	  next();
   });

   response.on('error', function(e) {
      console.error(e);
   });
}

var meRequest = function() {
	  
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

app.set('port', /*process.env.PORT ||*/ 3000);
app.listen(app.get('port'), /*'0.0.0.0', 511,*/ function(err) {
    console.log('server started');
});
