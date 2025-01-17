import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import ConnectedUserPreferencesForm from '../../connectedComponents/ConnectedUserPreferencesForm';
import { Dropdown, AboutContent, withModal } from '@ohif/ui';
import OHIFLogo from '../OHIFLogo/OHIFLogo.js';
import './Header.css';

// Context
import AppContext from './../../context/AppContext';

class Header extends Component {
  static contextType = AppContext;
  static propTypes = {
    home: PropTypes.bool.isRequired,
    location: PropTypes.object.isRequired,
    children: PropTypes.node,
    t: PropTypes.func.isRequired,
    userManager: PropTypes.object,
    user: PropTypes.object,
    modal: PropTypes.object,
  };

  static defaultProps = {
    home: true,
    children: OHIFLogo(),
  };

  constructor(props) {
    super(props);
    this.state = { isOpen: false };

    this.loadOptions();
  }

  loadOptions() {
    const {
      t,
      user,
      userManager,
      modal: { show },
    } = this.props;
    this.options = [
      {
        title: t('About'),
        icon: { name: 'info' },
        onClick: () =>
          show(AboutContent, {
            title: t('OHIF Viewer - About'),
          }),
      },
      {
        title: 'Preferences ',
        icon: {
          name: 'user',
        },
        onClick: () =>
          show(ConnectedUserPreferencesForm, {
            title: t('User Preferences'),
          }),
      },
    ];

    if (user && userManager) {
      this.options.push({
        title: t('Logout'),
        icon: { name: 'power-off' },
        onClick: () => userManager.signoutRedirect(),
      });
    }
  }

  // ANTD -- Hamburger, Drawer, Menu
  render() {
    const { t, home, location, children } = this.props;
    const { appConfig = {} } = this.context;
    const showStudyList =
      appConfig.showStudyList !== undefined ? appConfig.showStudyList : true;
    return (
      <>
        <div className="notification-bar">{t('INVESTIGATIONAL USE ONLY')}</div>
        <div className={`entry-header ${home ? 'header-big' : ''}`}>
          <div className="header-left-box">
            {location && location.studyLink && (
              <Link
                to={location.studyLink}
                className="header-btn header-viewerLink"
              >
                {t('Back to Viewer')}
              </Link>
            )}

            {children}

            {showStudyList && !home && (
              <Link
                className="header-btn header-studyListLinkSection"
                to={{
                  pathname: '/',
                  state: { studyLink: location.pathname },
                }}
              >
                {t('Study list')}
              </Link>
            )}
          </div>

          <div className="header-menu">
            <span className="research-use">
              {t('INVESTIGATIONAL USE ONLY')}
            </span>
            <Dropdown title={t('Options')} list={this.options} align="right" />
          </div>
        </div>
      </>
    );
  }
}

export default withTranslation(['Header', 'AboutModal'])(
  withRouter(withModal(Header))
);
