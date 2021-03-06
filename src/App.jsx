import React, {Component} from 'react';
import PropTypes from 'prop-types';

// 序列化参数
function formData(data) {
    let arr = [];
    for (let key in data) {
        arr.push(`${key}=${data[key]}`);
    }
    return arr.join('&');
}
export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            list: []
        };
        this.searchName = this.searchName.bind(this);
        this.editItem = this.editItem.bind(this);
        this.updateItem = this.updateItem.bind(this);
        this.delItem = this.delItem.bind(this);
        this.addItem = this.addItem.bind(this);
        this.sortMax = this.sortMax.bind(this);
        this.sortMin = this.sortMin.bind(this);
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
        fetch(`/api/edit/${data.id}`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData(data)
        }).then((res) => {
            return res.json();
        }).then((res) => {
            alert(res.msg);
            // 表示更新成功
            if (res.data) {
                let {list} = this.state;
                for (let i = 0; i < list.length; i++) {
                    if (list[i].id === res.data.id) {
                        list[i] = res.data;
                        break;
                    }
                }
                this.setState({list});
            } else {
                data.editState = true;
            }
        }).catch((e) => {
            alert('更新失败');
        });
    };
    // 删除项目
    delItem(data) {
        fetch(`/api/del/${data.id}`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `id=${data.id}`
        }).then((res) => {
                return res.json();
            })
            .then((res) => {
                alert(res.msg);
                if (res.data) {
                    this.setState({
                        list: res.data
                    });
                }
            })
            .catch((e) => {
                alert('删除失败');
            });
    };

    // 添加项目
    addItem() {
        let {list} = this.state;
        list.push({
            id: this.state.list.length + 1,
            name: '',
            image: `/images/${Math.floor(9 * Math.random() + 1)}.jpg`,
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

    // 一般均在componentDidMount的时候才去做异步请求，这样能保障安全挂载安全使用setState
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
}
class Item extends Component {
    constructor(props) {
        super(props);
        this.editItem = this.editItem.bind(this);
    }

    editItem() {
        let {id, image, editState = true} = this.props.item;
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
        let {id, image, name, age, phone, phrase, display, editState = true} = this.props.item;
        let btnname = editState ? '修改' : '保存';
        return (
            <tr style={{display}}>
                <td>{id}</td>
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