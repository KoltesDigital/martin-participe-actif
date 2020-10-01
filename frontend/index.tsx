import 'core-js/stable';
import 'regenerator-runtime/runtime';

import './style.global.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import { Context } from './context';
import { Layout } from './avis/layout';

const root = document.getElementById('root');

const render = () => {
	const App = (
		<Context.Provider value={{}}>
			<Layout />
		</Context.Provider>
	);

	ReactDOM.render(App, root);
};

render();

if (module.hot) {
	module.hot.accept(render);
}
