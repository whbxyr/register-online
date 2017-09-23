// 首先引入样式表
import './sass/common.less';
import React from 'react';
import {render} from 'react-dom';

import App from './App.jsx';

render(<App />, document.getElementById('out'));