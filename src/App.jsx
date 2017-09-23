import React, {Component, PropTypes} from 'react';

// 序列化参数
function formData(data) {
    let arr = [];
    for (let key in data) {
        arr.push(`${key}=${data[key]}`);
    }
    return arr.join('&');
}
export default class App extends Component {
    render() {
        return (
            <div className="container">
                <header><input className="search" placeholder="输入搜索"/></header>
                <main>
                    <div className="table">
                        <table>
                            <thead>
                            <tr>
                                <th>序号</th>
                                <th>头像</th>
                                <th>名字</th>
                                <th>
                                    年龄(<a href="javascript:;" onClick={this.sortMax}>大</a> | <a href="javascript:;" onClick={this.sortMin}>小</a>)
                                </th>
                                <th>手机</th>
                                <th>座右铭</th>
                                <th>操作</th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                this.state.list.map((item) => {
                                    return <Item item={item} key={item.id} editItem={this.editItem} updateItem={this.updateItem} delItem={this.delItem}/>
                                })
                            }
                            </tbody>
                        </table>
                    </div>
                </main>
                <footer>
                    <button className="adddata" onClick={this.addItem}>添加数据</button>
                </footer>
            </div>
        );
    }

    constructor(props) {
        super(props);
        this.state = {
            list: [],
            aid: 0
        };
        this.searchName = this.searchName.bind(this);
        this.editItem = this.editItem.bind(this);
        this.updateItem = this.updateItem.bind(this);
        this.delItem = this.delItem.bind(this);
        this.addItem = this.addItem.bind(this);
        this.sortMax = this.sortMax.bind(this);
        this.sortMin = this.sortMin.bind(this);
        this.aid = 0;
    }

    // 查询姓名
    searchName(e) {
        let name = e.target.value;
        let {list} = this.state;
        list.map((item) => {
            for (let key in item) {
                if (Boolean(new RegExp(name).exec(item[key] + ''))) {
                    return item.display = '';
                }
            }
            item.display = 'none';
        });
        this.setState({list});
    };
    // 编辑项目
    editItem(data) {
        let {list} = this.state;
        for (let i = 0; i < list.length; i++) {
            if (list[i].id === data.id) {
                let {editState = true} = list[i];
                list[i].editState = !editState;
                return this.setState({list});
            }
        }
    };
    // 更新数据
    updateItem(data) {
        let {list} = this.state;
        for (let i = 0; i < list.length; i++) {
            if (list[i].id === data.id) {
                list[i] = data;
                break;
            }
        }
        this.setState({list});
        fetch(`/api/edit/${data.id}`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/x-www-form-urlencode'
            },
            body: formData(data)
        }).then((res) => {
            return res.json();
        }).then((res) => {
            // 表示更新成功
            alert(res.msg);
            if (res.data) {
                data.id = res.data.id;
                this.setState({list});
            }
        }).catch((e) => {
            alert('更新失败');
        });
    };
    // 删除项目
    delItem(data) {
        let {list} = this.state;
        for (let i = 0; i < list.length; i++) {
            if (list[i].id === data.id) {
                list.splice(i, 1);
                break;
            }
        }
        this.setState({list});
        if (data.id > 0) {
            fetch(`/api/del/${data.id}`)
                .then((res) => {
                    return res.json();
                })
                .then((res) => {
                    alert(res.msg);
                })
                .catch((e) => {
                    alert('删除失败');
                });
        }
    };
    // aid = 0;
    // 添加项目
    addItem() {
        let {list} = this.state;
        list.push({
            id: --this.aid,
            name: '',
            image: 'http://localhost:3000/images/4.jpg',
            age: 18,
            phone: '',
            phrase: '',
            display: '',
            editState: false
        });
        this.setState({list});
    };
    // 按照年龄最大排序
    sortMax() {
        let {list} = this.state;
        list.sort((o1, o2) => o1.age > o2.age ? 1 : -1);
        this.setState({list});
    }
    // 按照年龄最小排序
    sortMin() {
        let {list} = this.state;
        list.sort((o1, o2) => o1.age < o2.age ? 1 : -1);
        this.setState({list});
    }

    componentDidMount() {
        //从服务器拉取数据
        fetch('/api/list')
            .then((res) => {
                return res.json();
            })
            .then((list) => {
                this.setState({list});
            })
            .catch((e) => {
                alert('加载失败，请稍后重试！');
            });
    }
}
class Item extends Component {
    constructor(props) {
        super(props);
        this.editItem = this.editItem.bind(this);
    }

    editItem() {
        let {id, image, editState = true, editItem} = this.props.item;
        if (editState) {
            this.props.editItem(this.props.item);
        }
        else {
            let name = this.refs.name.value;
            let age = parseInt(this.refs.age.value);
            let phone = this.refs.phone.value;
            let phrase = this.refs.phrase.value;

            if (!name) {
                return alert('姓名不能为空');
            }
            else if (!age || age < 0) {
                return alert('年龄不合法');
            }
            else if (!/^\d+$/.test(phone)) {
                return alert('手机号码不合法');
            }

            this.props.updateItem({id, image, name, age, phone, phrase, editState: true});
        }
    };

    render() {
        var {id, image, name, age, phone, phrase, display, editState = true} = this.props.item;
        var btnname = editState ? '修改' : '保存';
        return (
            <tr style={{display}}>
                <td>{id > 0 ? id : ''}</td>
                <td>
                    <img className="headimg" src={image} alt={name}/>
                </td>
                <td>
                    <input type="text" disabled={editState} ref="name" defaultValue={name}/>
                </td>
                <td>
                    <input type="number" disabled={editState} ref="age" defaultValue={age}/>
                </td>
                <td>
                    <input type="tel" disabled={editState} ref="phone" defaultValue={phone}/>
                </td>
                <td>
                    <textarea type="tel" disabled={editState} ref="phrase" defaultValue={phrase}></textarea>
                </td>
                <td>
                    <button onClick={this.editItem}>{btnname}</button>
                    <button onClick={() => this.props.delItem(this.props.item)}>删除</button>
                </td>
            </tr>
        )
    }
}
Item.propTypes = {
    item: PropTypes.object,
    editItem: PropTypes.func,
    updateItem: PropTypes.func,
    delItem: PropTypes.func
};
Item.defaultProps = {
    item: {}
};