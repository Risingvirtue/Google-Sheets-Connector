const fs = require('fs');
var express = require('express');
var app = express();
app.use(express.static('public'));
var post = null;
const {google} = require('googleapis');
const sheets = google.sheets('v4');
var testKey = "";
app.get('/', function(req, res) {
	
	try {
		res.send(req.headers);
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
	res.send(req);
});




function getInfo(auth, spreadsheetId) {
	
	
	//post.send(JSON.stringify({spreadsheetId: spreadsheetId, auth: auth}))
	sheets.spreadsheets.values.get(
		{
			auth: auth,
			spreadsheetId: spreadsheetId,
			range: 'A1:B',
		},
		(err, res) => {
			if (err) {
				console.log(err);
				post.send('There was an error');
				
				
			}
			console.log(res);
			post.send(res.data);
			
		}
	);
}

function addTab(auth, spreadsheetId) {
	var today = new Date();
	var dateString = (today.getMonth + 1) + '/' + today.getDate() + '/' + (today.getFullYear() % 100);
	sheets.spreadsheets.batchUpdate({
			auth: auth,
			spreadsheetId: spreadsheetId,
			resource: {
				requests: [
					{
						'addSheet':{
							'properties':{
								'title': dateString
							}
						} 
					}
				],
			}
		},
		function(err, response) {
			if (err) return console.log(err);
			//console.log("success: ", response);
	});
}

function updateSheet(auth, spreadsheetId, values) {
	sheets.spreadsheets.values.append(
		{
			auth: auth,
			spreadsheetId: spreadsheetId,
			range: 'Test',
			valueInputOption: 'USER_ENTERED',
			resource: {
				values: [['test1', 'testing'],['test1', 'konichiwa']]
			}
			
		},
		(err, res) => {
			if (err) {
				console.error('The API returned an error.');
				throw err;
			}
			console.log(res.data);
			return;
			const rows = res.data.values;
			if (rows.length === 0) {
				console.log('No data found.');
			} else {
				console.log('Name, Major:');
				for (const row of rows) {
					// Print columns A and E, which correspond to indices 0 and 4.
					console.log(`${row[0]}, ${row[4]}`);
				}
			}
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
	fs.readFile('./credentials.json', function(err, data) {
		if (err) {
			console.log(err);
		}
		data = JSON.parse(data);
		
		testKey = data.private_key;
		//var auth = getAuthorize(data);
		//var spreadsheetId = '1JObOhjq6M6ocIMdbyHYiVXWSLfD_PHfT9FGiEc56bgA';
		//var info = getInfo(auth, spreadsheetId);
	})
}

//getKey(updateSheet);

var listener = app.listen(process.env.PORT, function() {
	console.log('Your app is listening on port ' + listener.address().port);
})