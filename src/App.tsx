import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import * as dotenv from 'dotenv';

import { ContextProvider } from './contexts/ContextProvider';
import { ThemeProvider } from './contexts/ThemeContext';
import Layer from './pages/Layer';

import { RFStateProvider } from './contexts/state';

dotenv.config();
const App: React.FC = () => {
  return (
    <ContextProvider>
      <ThemeProvider>
        <RFStateProvider>
          <Router>
            <Switch>
              <Route path="/app" component={Layer} />
              <Route path="/">
                <Redirect to="/app" />
              </Route>
            </Switch>
          </Router>
        </RFStateProvider>
      </ThemeProvider>
    </ContextProvider>
  );
};

export default App;
