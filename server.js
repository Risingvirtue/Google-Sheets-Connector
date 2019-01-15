const fs = require('fs');
var express = require('express');
var app = express();
app.use(express.static('public'));

const {google} = require('googleapis');
const sheets = google.sheets('v4');

app.get('/', function(req, res) {
	var credentials = {client_email: req.query.client_email, 
						private_key: req.query.private_key}
	var auth = getAuthorize(credentials);
	var info = getInfo(auth, spreadsheetId);
	res.send(JSON.stringify(info));
	
	
});

app.post('/', function(req, res) {
	res.send(req);
});




function getInfo(auth, spreadsheetId) {
	
	sheets.spreadsheets.values.get(
		{
			auth: auth,
			spreadsheetId: spreadsheetId,
			range: 'A1:B',
		},
		(err, res) => {
			if (err) {
				console.error('The API returned an error.');
				return err;
			}
			console.log(res);
			return res;
			
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

//getKey(updateSheet);

var listener = app.listen(process.env.PORT, function() {
	console.log('Your app is listening on port ' + listener.address().port);
})