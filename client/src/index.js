import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import App from './App';
import store from "./store";
import { Provider } from "react-redux";

window.store = store;

ReactDOM.render((

    <Provider store={store}>
        <App />
    </Provider>

), document.getElementById('root'));
registerServiceWorker();
