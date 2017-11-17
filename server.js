const express = require("express"),
      mysql = require("mysql"),
      bodyParser = require("body-parser"),
      PDFDocument = require('pdfkit'),
      fs = require('fs');


const app = express(),
      connection = mysql.createConnection({
          host: 'localhost',
          user: 'root',
          password: 'ff22e632'
      }),
      urlencodedParser = bodyParser.urlencoded({extended: false});


connection.connect(function (err) {
    if(err) {
         console.log(err)
    }else {
        console.log("Connected!");
    }
});

app.use(express.static(__dirname + '/public'));

app.post('/user', urlencodedParser, function (req, res) {
    connection.query('SELECT firstName, lastName, cast(image as CHAR) FROM userstest.user WHERE user.firstName="'+req.body.username+'"', function (err, result) {
        if (err) {
            console.log(err);
        } else {
            if(result.length > 0) {
                const doc = new PDFDocument(),
                      path = 'files/' + result[0].firstName + '.pdf',
                      content = 'Name: ' + result[0].firstName + '\nSurname: ' + result[0].lastName;

                doc.pipe(fs.createWriteStream(path));

                doc.fontSize(20).text(content, 100, 100);

                doc.image('img/' + result[0]['cast(image as CHAR)'] + '', 320, 15);

                doc.end();

                connection.query(
                    'UPDATE userstest.user SET user.pdf="' + result[0].firstName + '.pdf" WHERE user.firstName="' + result[0].firstName + '"',
                    function(err, result){
                        if(err){
                            console.log(err);
                        } else {
                            if (result) {
                                res.send('<h1>файл загружен.</h1>');
                                console.log(result);
                            }
                        }
                    }
                );
            } else {
                res.send('<h1>Пользователь не найден.</h1>')
            }
        }
    });
});

app.get('/', function (req, res) {
    console.log('OK');
});

app.listen(3000);
