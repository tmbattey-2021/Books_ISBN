const http = require("http");
const fs = require("fs");
const path = require("path");

const url = require('url');
const mysql = require('mysql2');

const https = require('https');
const hostname = '127.0.0.1';


const form = fs.readFileSync(path.join(__dirname, "public", "books.html"));


const server = http.createServer((req, res) => {

  var q = url.parse(req.url, true).query;
  var txt = q.isbn;
  var path = url.parse(req.url, true).pathname;
 
  console.log(path);
  console.log(txt);
  var pathvar = "/book/" + txt;
  console.log(pathvar);

  if (path === "/") {
    get(res);
    return;
  }

 function get(res) {
  res.writeHead(200, {
    "Content-Type": "text/html",
  });
  res.end(form);
}   

  if (path === '/books') {

      const options =
      {
          hostname: 'api2.isbndb.com',
          port: 443,
          path: pathvar,
          headers: {
              Authorization: '46273_9ea83635b87cfb9ab07eb849cc18f14a',
              accept: 'application/json',
          },
          method: 'GET',
      };
  
      const req = https.request(options, res => {
          console.log(`statusCode: ${res.statusCode}`);
  
          res.on('data', d => {
              process.stdout.write(d);
  
              const obj = JSON.parse(d);
              console.log(obj.book.publisher);
              var $pub_var = obj.book.publisher;
              var $image = obj.book.image;
              var $title_long = obj.book.title_long;
              var $edition = obj.book.edition;
              var e = new Date(obj.book.date_published);
              var year_var = (e.getUTCFullYear());
              var str_year = year_var.toString();
              var $authors1 = obj.book.authors[0];
              var $authors2 = obj.book.authors[1];
              var $isbn13 = obj.book.isbn13;
              var $isbn = obj.book.isbn;
              var $binding = obj.book.binding;
  
              post = { publisher: $pub_var, image: $image, title_long: $title_long, edition: $edition, authors1: $authors1, authors2: $authors2, isbn13: $isbn13, isbn: $isbn, binding: $binding, yr_published: str_year };
  
  
  
              const connection = mysql.createConnection({
                  host: 'ls-25e22aea68953870fcc0d34c723d0d60e8a81892.cvwgk0rnptsm.us-east-1.rds.amazonaws.com',
                  database: 'dbmaster',
                  user: 'dbmasteruser',
                  password: 'Darwin01$',
                  //   host: 'localhost',
                  //       database: 'books',
                  //   user: 'tmbattey',
                  //     password: 'darwin',
              });
  
              connection.connect();
  
  
              connection.query(
                  'INSERT INTO books SET ?', post, (err, results) => {
                      if (err) console.log(err);
                      console.log(results);
  
                  });
  
  
  
              connection.end();
                  
        
          });
      });
  
      req.on('error', error => {
          console.error(error);
      });
  
      req.end();
  
  };
  
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write("The book was successfully created!");
  res.end(form);
 }
);

server.listen(3000, hostname, () => {
  console.log(`Server running at 3000`);
});
