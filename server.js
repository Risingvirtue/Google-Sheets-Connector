const fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 
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
		var info = getInfo(auth, spreadsheetId);
	} catch (e) {
		console.log('/', e);
	}
	
	//res.send(JSON.stringify(info));
	
	
});

app.post('/', function(req, res) {
	
	try {
		var credentials = {client_email: req.headers.client_email, 
			private_key: req.headers.private_key.split('?').join('\n')}
		
		post = res;
		var auth = getAuthorize(credentials);
		var spreadsheetId = req.headers.spreadsheetid;
		var tab = req.body.values;
		var values = req.body.values;
		var info = updateSheet(auth, spreadsheetId, tab, values);
	} catch (e) {
		console.log('/', e);
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
	}
	
});




function getInfo(auth, spreadsheetId) {
	
	
	//post.send(JSON.stringify({spreadsheetId: spreadsheetId, auth: auth}))
	sheets.spreadsheets.values.get(
		{
			auth: auth,
			spreadsheetId: spreadsheetId,
			range: tab,
		},
		(err, res) => {
			if (err) {
				console.log(err);
				post.send('There was an error');
			}
			console.log(res);
			post.send(JSON.stringify(res.data));
			
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
			if (err) post.send('failure');
			post.send(name);
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
				console.error(err);
				post.send('failure');
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
		var info = addTab(auth, spreadsheetId);
	})
	*/
}

//getKey();

var listener = app.listen(process.env.PORT, function() {
	console.log('Your app is listening on port ' + listener.address().port);
})