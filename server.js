const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('./webpack.config');
const bodyParser = require('body-parser');
const fs = require('fs');

// 启动服务
let server = new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    hot: true,
    stats: {
        colors: require('supports-color')
    }
});
// 获取json数据
let dataurl = __dirname + '/data.json';
// 利用解构复制获取服务器接口
let {app} = server;
// 再返回被解析过的url
app.use(bodyParser.urlencoded({
    extended: false
}));
// 先转化为json
app.use(bodyParser.json());

// 获取列表数据
app.get('/api/list', function (req, res) {
    res.sendFile(dataurl);
});

/**
 * 删除数据
 */
app.post('/api/del/:id', function (req, res) {
    fs.readFile(dataurl, 'utf-8', function (err, text) {
        if (err) {
            return res.json({
                msg: '获取内容失败',
                data: null,
                status: false
            });
        }

        let list = JSON.parse(text);
        let id = parseInt(req.body.id);
        for (let i = 0; i < list.length; i++) {
            if (list[i].id === id) {
                list.splice(i, 1);
                let j = 1;
                // 重排数据，使得序号有序且唯一
                for (let item of list) {
                    item.id = j++;
                }
                fs.writeFile(dataurl, JSON.stringify(list)); //保存删除后的文件
                return res.json({
                    msg: '删除成功',
                    data: list,
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

        let list = JSON.parse(text);
        let {id, image, name, age, phone, phrase} = req.body;
        id = parseInt(id);
        let data = {id, image, name, age, phone, phrase};

        for (let i = 0; i < list.length; i++) {
            if (list[i].id === id) {
                list[i] = data;
                fs.writeFile(dataurl, JSON.stringify(list)); //保存删除后的文件
                return res.json({
                    msg: '修改成功',
                    data: data,
                    status: true
                });
            }
        }

        // id 等于原有的数据项的长度加一，说明是新增
        if (id === list.length + 1) {
            list.push(data);
            fs.writeFile(dataurl, JSON.stringify(list)); // 保存删除后的文件
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