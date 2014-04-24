/*console.log(process.cwd());
console.log(require('optimist').argv)
require('hexo/lib/init')(process.cwd(), {
    _: ['server'],
    $0: require('optimist').argv.$0
});*/
var express = require('express');
var port = process.env.PORT || 8099;
var app = new express();
app.configure(function(){
    app.set('port', port);
    app.set('views', __dirname + '/views');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('expressdemo'));
    app.use(express.query());
    app.use(express.session());
    app.use(express.errorHandler());
    app.use('/demos', express.static(__dirname + '/demos'));
    app.use(express.static(__dirname + '/public'));
    app.use(app.router);
});
function not_found(req, res){
    require('fs').readFile(__dirname + '/404.html', 'utf-8', function(err, data){
        if (!err){
            res.send(data);
        }else{
            res.send('404 not found');
        }
    });
};
app.get('/ua', function(req, res){
    var headers = {};
    if ('all' in req.query){
        headers = req.headers;
    }else{
        for (var key in req.headers){
            if (key.indexOf('bae_') !== 0){
                headers[key] = req.headers[key];
            }
        }
    }
    res.send({
        headers: headers
        //route: req.route,
        //accepted: req.accepted,
        //ip: req.ip,
        //ips: req.ips,
        //cookies: req.cookies,
        //signedCookies: req.signedCookies
    });
});

app.get('/404.html', not_found)

app.get('*', function(req, res){
    res.statusCode = 404;
    not_found(req, res);
});

app.listen(port);
console.log('[express]', 'start listening', port, 'env:', process.env);
