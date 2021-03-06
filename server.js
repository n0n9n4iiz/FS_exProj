var express = require('express');
var pgp = require('pg-promise')();//option ;
//var db = pgp('process.env.DATABASE_URL');
var db = pgp('postgres://ngrngfvwmjohqq:53c6e42c6c36a1e55cfd9f56460408fb4582eb4b4bfe6ce9f2f95b86a23d5887@ec2-54-243-61-194.compute-1.amazonaws.com:5432/dbka26q0kvcst3?ssl=true ');
//ดึง database
var app = express();
//ทำให้เป็น json
var bodyParser = require('body-parser');
var moment = require('moment'); //time 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/products/addnewform', function (req, res) {
    res.render('pages/product_Addnew');

})
app.post('/products/addnew', function (req, res) {
    var pid = req.body.pid;
    var title = req.body.title;
    var price = req.body.price;
    var sql = `insert into products (id,title,price) values ('${pid}','${title}','${price}')`;
    db.any(sql)
        .then(function (data) { //ทำหลังจากดีงฐานข้อมูล
            res.redirect('/products');
        })
        .catch(function (error) {
            console.log('ERROR:' + error);
        })

})

app.get('/', function (req, res) {
    res.render('pages/index');
});

app.get('/about', function (req, res) {
    var name = 'krittayot';
    var hobbie = ['1', '2', '3'];
    var bdate = '12/12/2541';
    res.render('pages/about', { fullname: name, hobbie: hobbie, bdate: bdate });
});
//progreSQL //Display all products
app.get('/products', function (req, res) { //get ดึงข้อมูล 
    // res.redirect('/about');         //res ส่งข้อมูลไปยังบราวเซอ  dowload ส่งไฟไปให้โหลด, redirect กลับไปหน้า...
    var pid = req.param('id');
    var sql = 'select * from products order by id';
    if (pid) {
        sql += ' where id =' + pid;
    }
    db.any(sql)//any ดึงข้อมูลทั้งหมด               
        .then(function (data) { //ทำหลังจากดีงฐานข้อมูล
            console.log('DATA:' + data);
            res.render('pages/products', { products: data });
        })
        .catch(function (error) {
            console.log('ERROR:' + error);
        })
});
//09/24/61
app.get('/products/:pid', function (req, res) {

    var pid = req.params.pid;
    var sql = "select * from products where id=" + pid;
    var time = moment.utc().toDate();
    time = moment(time).format('YYYY-MM-DD HH:mm:ss');
    db.any(sql)
        .then(function (data) {

            res.render('pages/productedit', { product: data[0], time: time });
        })
        .catch(function (error) {
            console.log('ERROR:' + error);
        })
});

app.get('/products/delete/:pid', function (req, res) {
    var pid = req.params.pid;

    var sql = 'delete from products where id=' + pid;

    db.any(sql)
        .then(function (data) {
            res.redirect('/products');
        })
        .catch(function (error) {
            console.log('ERROR:' + error);
        })

})


app.post('/products/update', function (req, res) {
    // โหลด body-parser มา ใช้ข้างบน
    var pid = req.body.pid;
    var title = req.body.title;
    var price = req.body.price;
    //var dateEdit = req.body.created_at;
    var sql = `Update products set title = '${title}', price = '${price}' where id = '${pid}'`;
    //db.none ไม่ต้องส่งอะไรกลับมา
    db.any(sql)
        .then(function (data) {

            res.redirect('/products');
        })
        .catch(function (error) {
            console.log('ERROR:' + error);
        })

});
//user
app.get('/users', function (req, res) { //get ดึงข้อมูล 
    var id = req.param('id');
    var sql = 'select * from users';
    if (id) {
        sql += ' where id =' + id;
    }
    db.any(sql)//any ดึงข้อมูลทั้งหมด               
        .then(function (data) { //ทำหลังจากดีงฐานข้อมูล
            console.log('DATA:' + data);
            res.render('pages/users', { users: data });
        })
        .catch(function (error) {
            console.log('ERROR:' + error);
        })
});
//USERS with id
app.get('/users/:id', function (req, res) {

    var id = req.params.id
    var sql = 'select * from users';
    if (id) {
        sql += ' where id =' + id;
    }
    db.any(sql)
        .then(function (data) {

            res.render('pages/users', { users: data });
        })
        .catch(function (error) {
            console.log('ERROR: ' + error);
        })

})

//reprotPChase
app.get('/report/productPurchases', function (req, res) {
    var sql = 'select title,sum(purchase_items.quantity) as quantity,products.price,sum(purchase_items.price*quantity) as totalprice from products inner join purchase_items on products.id = purchase_items.product_id group by title,products.price order by quantity desc;select sum(purchase_items.quantity) as Tquantity,sum(purchase_items.price*quantity) as Ttotalprice from purchase_items';
    db.multi(sql)
        .then(function (data) {
            res.render('pages/reportPurchase', { reportPChase: data[0], totalP: data[1] });

        })
        .catch(function (error) {
            console.log('ERROR:' + error);
        })


})
//reprotPChaser
app.get('/report/productPurchaser', function (req, res) {
    var sql = 'select purchases.id,name,sum(quantity) as quantity,sum(purchase_items.price*quantity) as totalprice from purchases inner join purchase_items on purchases.id = purchase_items.purchase_id' +
        ' group by purchases.id,name' +
        ' order by totalprice desc' +
        ' limit 25';
    db.any(sql)
        .then(function (data) {
            res.render('pages/reportPchaser', { reportPChaser: data });
        })
        .catch(function (error) {
            console.log('ERROR:' + error);
        })


})






var port = process.env.PORT || 8080;
app.listen(port, function () {
    console.log('App is running on http://localhost:' + port);
});




//console.log('App is runnig at http://localhost:8080')
//app.listen(8080);