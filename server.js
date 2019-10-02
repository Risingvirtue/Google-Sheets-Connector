const fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({limit: '50mb', extended: true})); 
app.use(express.static('public'));
var post = null;
const {google} = require('googleapis');
const sheets = google.sheets('v4');
var testKey = "";


app.get('/', function(req, res) {
	try {
		var credentials = {client_email: req.headers.client_email, 
			private_key: req.headers.private_key.split('?').join('\n')}
		post = res;
		var auth = getAuthorize(credentials);
		var spreadsheetId = req.headers.spreadsheetid;
		var tab = req.headers.tab;
		var info = getInfo(auth, spreadsheetId, tab);
	} catch (e) {
		console.log('/', e);
		post.status(429);
	}

});

app.get('/tabs', function(req, res) {
	try {
		var credentials = {client_email: req.headers.client_email, 
			private_key: req.headers.private_key.split('?').join('\n')}
		post = res;
		var auth = getAuthorize(credentials);
		var spreadsheetId = req.headers.spreadsheetid;
		var info = getTabs(auth, spreadsheetId);
	} catch (e) {
		console.log('/', e);
		post.status(429);
	}
});

app.post('/', function(req, res) {
	try {
		var credentials = {client_email: req.headers.client_email, 
			private_key: req.headers.private_key.split('?').join('\n')}
		
		post = res;
		var auth = getAuthorize(credentials);
		var spreadsheetId = req.headers.spreadsheetid;
		var tab = req.body.tab;
		
		var values = req.body.values;
		
		var info = updateSheet(auth, spreadsheetId, tab, values);
	} catch (e) {
		console.log('/', e);
		post.status(429);
	}
});

app.post('/addtab', function (req, res) {
	try {
		var credentials = {client_email: req.headers.client_email, 
			private_key: req.headers.private_key.split('?').join('\n')}
		
		post = res;
		var auth = getAuthorize(credentials);
		var spreadsheetId = req.headers.spreadsheetid;
		var name = req.body.name;
		
		var info = addTab(auth, spreadsheetId, name);
	} catch (e) {
		console.log('/', e);
		post.status(429);
	}
	
});

function getInfo(auth, spreadsheetId, tab) {
	sheets.spreadsheets.values.get(
		{
			auth: auth,
			spreadsheetId: spreadsheetId,
			range: tab,
		},
		(err, res) => {
			if (err) {
				console.log(err);
				post.status(429).send(err);
			}
			console.log(res);
			post.send(JSON.stringify(res.data.values));
			
		}
	);
}

function getTabs(auth, spreadsheetId) {
	sheets.spreadsheets.get(
		{
			auth: auth,
			spreadsheetId: spreadsheetId,
		},
		(err, res) => {
			if (err) {
				console.log(err);
				post.status(429).send(err);
			}
			console.log(res.data.sheets);
			var tabs = [];
			res.data.sheets.forEach(function(tab) {
				tabs.push(tab.properties.title);
			})
			
			post.send(JSON.stringify(tabs));
			
		}
	);
}

function addTab(auth, spreadsheetId, name) {
	sheets.spreadsheets.batchUpdate({
			auth: auth,
			spreadsheetId: spreadsheetId,
			resource: {
				requests: [
					{
						'addSheet':{
							'properties':{
								'title': name
							}
						} 
					}
				],
			}
		},
		function(err, response) {
			if (err) {
				var message = err.errors[0].message;
				if (message.indexOf('already exists') != -1) {
					post.send(name);
				} else {
					console.log(err);
					post.status(429).send(err);
				}
			} else {
				post.send(name);
			}
			//console.log("success: ", response);
	});
}

function updateSheet(auth, spreadsheetId, tab, values) {
	
	sheets.spreadsheets.values.update(
		{
			auth: auth,
			spreadsheetId: spreadsheetId,
			range: tab,
			valueInputOption: 'USER_ENTERED',
			resource: {
				values: values
			}
		},
		(err, res) => {
			if (err) {
				console.log(err);
				post.status(429).send(err);
			}
			post.send('success');
		}
	);
}



function getAuthorize(credentials) {
  const jwtClient = new google.auth.JWT(
	  credentials.client_email,
	  null,
	  credentials.private_key,
	  ['https://www.googleapis.com/auth/spreadsheets'],
	  null
	);
	return jwtClient;
}

function getKey() {
	/*
	fs.readFile('./credentials.json', function(err, data) {
		if (err) {
			console.log(err);
		}
		data = JSON.parse(data);
		
		var auth = getAuthorize(data);
		var spreadsheetId = '1JObOhjq6M6ocIMdbyHYiVXWSLfD_PHfT9FGiEc56bgA';
		var info = addTab(auth, spreadsheetId, '1/17/19');
	})
	*/
	
}
//getKey();

var listener = app.listen(process.env.PORT, function() {
	console.log('Your app is listening on port ' + listener.address().port);
})