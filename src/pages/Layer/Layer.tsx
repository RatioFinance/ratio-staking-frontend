/* eslint-disable @typescript-eslint/no-unused-vars */
import { useContext, useEffect, useState } from 'react';
// import { useHistory } from 'react-router-dom';
import classNames from 'classnames';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';

import { ThemeContext } from '../../contexts/ThemeContext';

import Header from '../../components/Header';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Stake from '../../components/Stake';

const Layer = () => {
  const theme = useContext(ThemeContext);
  const { darkMode } = theme.state;
  const isTabletOrMobile = useMediaQuery({ maxWidth: 991 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapseFlag, setCollapseFlag] = useState(false);

  return (
    <div className={classNames('layer', { dark: darkMode })} data-theme={darkMode ? 'dark' : 'light'}>
      <ToastContainer
        position="top-center"
        autoClose={1500}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        limit={2}
        pauseOnHover
      />

      <div
        className={classNames('layer_container dark:bg-gray-900 bg-white-900', {
          'ml-32': collapseFlag,
          'ml-0': !menuOpen && isTabletOrMobile,
        })}
      >
        <Header />
        <div>
          {/* <Navbar
              darkMode={darkMode}
              clickMenuItem={clickMenuTrigger}
              open={!isTabletOrMobile ? true : menuOpen}
              collapseFlag={collapseFlag}
              setCollapseFlag={onCollapseMenu}
            /> */}

          <div>
            <Switch>
              {/* <Route path="/app/dashboard" component={MyDashboardPage} exact /> */}
              {/* <Route path="/app/available-vaults" component={AllVaults} exact /> */}
              {/* <Route path="/app/active-vaults" component={ActiveVaults} exact /> */}
              {/* <Route path="/app/my-archived-vaults" component={ArchivedVaults} exact /> */}
              {/* <Route path="/app/instaswap" component={InstaBuyLp} exact /> */}
              <Route path="/app" component={Stake} exact />
              {/* <Route path="/app/vaultdashboard/:mint" component={VaultDashboard} exact /> */}
              {/* <Route path="/app/vaultsetup/:mint" component={VaultSetup} exact /> */}
              {/* <Route path="/app/fairdrop" component={FairdropPage} exact /> */}
              {/* <Route path="/app/compareVaults" component={CompareVaults} exact /> */}
              <Route exact path="/">
                <Redirect to={`/app`} />
              </Route>
            </Switch>
            {/* <Footer darkMode={darkMode} /> */}
          </div>
          {/* {isTabletOrMobile && <MobileMenuTrigger clickMenuTrigger={clickMenuTrigger} open={menuOpen} />} */}
        </div>
      </div>
    </div>
  );
};

export default Layer;
