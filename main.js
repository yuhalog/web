var http = require('http');
var fs = require('fs');
var url = require('url');
const qs = require('querystring');

function templateHTML(title, list, body, control) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
    </head>
    
    <body>
        <h1><a href="/">WEB</a>
        </h1>
        ${list}
        ${control}
        ${body}
    </body>
    </html>
    `;
}
function templateList(filelist) {
    let list = '<ul>';
    let i = 0;

    while (i < filelist.length) {
        list = list + `<li><a href='/?id=${filelist[i]}'>${filelist[i]}</a></li>`
        i = i + 1;
    }

    list = list + '</ul>';
    return list;
}

var app = http.createServer(function (request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    const pathname = url.parse(_url, true).pathname;

    if (pathname === '/') {
        if (queryData.id === undefined) {
            fs.readdir('./data', function (error, filelist) {
                var title = 'welcome';
                var description = 'Hello, Node.js';
                const list = templateList(filelist);
                const template = templateHTML(title, list,
                    `<h2>${title}</h2>${description}`,
                    `<a href="/create">create</a>`);
                response.writeHead(200);
                response.end(template);
            })

        } else {
            fs.readdir('./data', function (error, filelist) {
                const list = templateList(filelist);
                var title = queryData.id;
                fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description) {
                    const template = templateHTML(title, list,
                        `<h2>${title}</h2>${description}`,
                        `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
                    response.writeHead(200);
                    response.end(template);
                });
            });
        }
    }
    else if (pathname === '/create') {
        fs.readdir('./data', function (error, filelist) {
            const title = 'WEB - create';
            const list = templateList(filelist);
            const template = templateHTML(title, list, `
            <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
            <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
            <input type="submit">
            </p>
            </form>
            `,'');
            response.writeHead(200);
            response.end(template);
        })
    }
    else if (pathname === '/create_process') {
        let body = ''
        request.on ('data', function (data) {
            body += data;
        });
        request.on ('end', function () {
            const post = qs.parse(body);
            const title = post.title;
            const description = post.description;
            fs.writeFile(`data/${title}`, description, 'utf8', function(err){
                response.writeHead(302, {Location: `/?id=${title}`});
                response.end('success');
            })
        });
        
    } else if (pathname=='/update') {
        fs.readdir('./data', function (error, filelist) {
            fs.readFile(`data/${queryData.id}`,'utf8', function(err, description){
                const title = queryData.id;
                const list = templateList(filelist);
                const template = templateHTML(title, list, `
                <form action="/update_process" method="post">
                <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                <p>
                <textarea name="description" placeholder="description"></textarea>
                </p>
                <p>
                <input type="submit">
                </p>
                </form>
                `,
                `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
            })
            
            response.writeHead(200);
            response.end(template);
        })

    } else {
        response.writeHead(404);
        response.end('Not Found');
    }

});
app.listen(3000);