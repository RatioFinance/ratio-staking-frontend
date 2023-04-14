import ReactDOM from 'react-dom';

import './index.scss';
import './index.css';

import App from './App';

// const {} = configureStore();
require('@solana/wallet-adapter-react-ui/styles.css');
ReactDOM.render(<App />, document.getElementById('root'));
