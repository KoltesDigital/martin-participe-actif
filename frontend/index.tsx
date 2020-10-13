import 'core-js/stable';
import 'regenerator-runtime/runtime';

import './style.global.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import { Layout } from './avis/layout';

const root = document.getElementById('root');

const render = () => {
	const App = <Layout />;

	ReactDOM.render(App, root);
};

render();

if (module.hot) {
	module.hot.accept(render);
}
