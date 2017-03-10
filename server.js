var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');
var bodyParser = require('body-parser');
var fs = require('fs');

//启动服务
var server = new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    stats: {
        colors: require('supports-color')
    }
});
// 获取json数据
var dataurl = __dirname + '/data.json';
// 利用解构复制获取服务器接口
var {app} = server;
// 先转化为json
app.use(bodyParser.json());
// console.log(req);
// 再返回被解析过的url
app.use(bodyParser.urlencoded({
    extended: false
}));
//获取列表数据
app.get('/api/list', function (req, res) {
    res.sendFile(dataurl)
});

/**
 * 删除数据
 */
app.get('/api/del/:id', function (req, res) {
    fs.readFile(dataurl, 'utf-8', function (err, text) {
        if (err) {
            return res.json({
                msg: '获取内容失败',
                data: null,
                status: false
            });
        }

        var list = JSON.parse(text);
        var {id} = req.params;
        for (let i = 0; i < list.length; i++) {
            if (list[i].id == id) {
                list.splice(i, 1);
                fs.writeFile(dataurl, JSON.stringify(list)); //保存删除后的文件
                return res.json({
                    msg: '删除成功',
                    data: null,
                    status: true
                });
            }
        }
        return res.json({
            msg: '删除失败，数据不存在',
            data: null,
            status: false
        });
    });
});
/**
 * 修改或新增数据
 */
app.post('/api/edit/:id', function (req, res) {
    fs.readFile(dataurl, 'utf-8', function (err, text) {
        if (err) {
            return res.json({
                msg: '修改失败',
                data: null,
                status: false
            });
        }

        var list = JSON.parse(text);
        var {id, image, name, age, phone, phrase} = req.body;
        var data = {id, image, name, age, phone, phrase};

        for (let i = 0; i < list.length; i++) {
            if (list[i].id == id) {
                list[i] = data;
                fs.writeFile(dataurl, JSON.stringify(list)); //保存删除后的文件
                return res.json({
                    msg: '修改成功',
                    data: data,
                    status: true
                });
            }
        }

        //id < 0 说明是新增
        if (req.params.id < 0) {
            data.id = new Date().getTime(); //暂时用它模拟生成唯一id
            list.push(data);
            // console.log(data);
            fs.writeFile(dataurl, JSON.stringify(list)); //保存删除后的文件
            return res.json({
                msg: '保存成功',
                data: data,
                status: true
            });
        } else {
            return res.json({
                msg: '操作失败，数据不存在',
                data: null,
                status: false
            });
        }
    });
});

app.listen(3001);