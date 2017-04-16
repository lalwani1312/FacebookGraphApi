var express           =     require('express')
  , bodyParser        =     require('body-parser')
  , https             =     require('https')
  , events            =     require('events')
  , config            =     require('./configuration/config.js')
  , app               =     express()
  , CryptoJS          =     require('crypto-js');

const EVENT_ACCESS_TOKEN_RECEIVED = 'accessTokenReceived'

var mAppsecretProof;

// Create an eventEmitter object
var eventEmitter = new events.EventEmitter();

// Create an accessTokenReceived handler
var accessTokenReceivedHandler = function accessTokenReceived(response, accessToken) {
   makeGraphApiRequest(accessToken, function(jsonString) {
     response.send(jsonString);
     response.end();
   });
}

// Bind event and even handler as follows
eventEmitter.on(EVENT_ACCESS_TOKEN_RECEIVED, accessTokenReceivedHandler);

function makeGraphApiRequest(accessToken, callback) {
  var options = {
    host: 'graph.facebook.com',
    port: 443,
    path: '/v2.8/100481773847232?'
          + 'fields=' + 'context.fields(all_mutual_friends)'
          + '&access_token=' + accessToken
          + '&appsecret_proof=' + mAppsecretProof,
    method: 'GET'
  };

  https.request(options, function(response) {
    var body = '';
    response.on('data', function(data) {
      body += data;
    });

    response.on('end', function() {
      console.log('graph api response: ' + body);
      callback(body);
    });

    response.on('error', function(e) {
      console.error(e);
      callback(e);
    });
  }).end();
}

//show home page
app.get('/', function(req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

app.get('/getAccessToken', function(request, response) {
  var code = request.param('code');

  console.log('code: ' + code);

  //This means we should exchange this code for access token.
  if(code) {
    var options = {
      host: 'graph.facebook.com',
      port: 443,
      path: '/v2.8/oauth/access_token?'
            + 'client_id=' + config.facebook_api_key
            + '&redirect_uri=http://localhost:3000/getAccessToken'
            + '&client_secret=' + config.facebook_api_secret
            + '&code=' + code,
      method: 'GET'
    };

    const accessTokenRequest = https.request(options, function(httpsResponse) {
      var body = '';
      httpsResponse.on('data', function(data) {
        body += data;
      });

      httpsResponse.on('end', function() {
        console.log('Got a response: ' + body);
        var json = JSON.parse(body);
        mAppsecretProof = CryptoJS.HmacSHA256(json.access_token, config.facebook_api_secret).toString(CryptoJS.enc.Hex);
        eventEmitter.emit(EVENT_ACCESS_TOKEN_RECEIVED, response, json.access_token);
      });

      httpsResponse.on('error', function(e) {
        console.error(e);
      });
    });
    accessTokenRequest.end();
  } else {
    var redirectUri = 'http://www.facebook.com/v2.8/dialog/oauth?'
          + 'client_id=' + config.facebook_api_key
          + '&redirect_uri=' + config.callback_url
          + '&scope=' + 'user_friends'

    response.redirect(redirectUri);
  }
});

app.set('port', /*process.env.PORT ||*/ 3000);
app.listen(app.get('port'), /*'0.0.0.0', 511,*/ function(err) {
    console.log('server started');
});
