let http = require('http');
let mysql = require('mysql');
let work = require('./lib/timeTrack.js');

let db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'myUser',
    password: 'myPassword',
    database: 'timeTrack'
});
let server = http.createServer(function(req, res){
    switch (req.method){
        case 'POST':
            switch(req.url){
                case '/':
                    work.add(db, req, res);
                    break;
                case '/archive':
                    work.archive(db, req, res);
                    break;
                case 'delete':
                    work.delete(db, req, res);
                    break;
            }
            break;
        case 'GET':
            switch(req.url){
                case '/':
                    work.show(db, res);
                    break;
                case '/archive':
                    work.showArchived(db, res);
                    break;
            }
            break;
    }
});

db.query(
    "CREATE TABLE IF NOT EXISTS work ("  //建表SQL
    + "id INT(10) NOT NULL AUTO_INCREMENT, "
    + "hours DECIMAL(5,2) DEFAULT 0, "
    + "date DATE, "
    + "archived INT(1) DEFAULT 0, "
    + "description LONGTEXT,"
    + "PRIMARY KEY(id))",
    function(err) {
        if (err) throw err;
        console.log('Server started...');
        server.listen(3000,'127.0.0.1');   //启动HTTP服务器
    }
);