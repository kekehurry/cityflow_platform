import { Tuple, configureStore } from '@reduxjs/toolkit';
import reducer from './reducers';
import {thunk} from 'redux-thunk';

const store = configureStore({
    reducer,
    middleware: ()=> new Tuple(thunk),
});

export default store;