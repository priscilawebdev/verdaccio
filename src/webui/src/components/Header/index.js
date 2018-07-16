import React, {Component} from 'react';
import {Form, Button, Dialog, Input, Alert} from 'element-react';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import {Link} from 'react-router-dom';

import API from '../../../utils/api';
import storage from '../../../utils/storage';
import {getRegistryURL} from '../../../utils/url';
import {HEADERS} from '../../../../lib/constants';

import classes from './header.scss';
import './logo.png';

export default class Header extends Component {
  state = {
    showLogin: false,
    username: '',
    password: '',
    logoURL: '',
    loginError: null
  };

  constructor(props) {
    super(props);
    this.toggleLoginModal = this.toggleLoginModal.bind(this);
    this.renderUserActionButton = this.renderUserActionButton.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.loadLogo = this.loadLogo.bind(this);
  }

  toggleLoginModal() {
    this.setState((prevState) => ({
      showLogin: !prevState.showLogin
    }));
    this.setState({loginError: null});
  }

  handleInput(name, e) {
    this.setState({
      [name]: e
    });
  }

  componentDidMount() {
    this.loadLogo();
  }

  async loadLogo() {
    try {
      const logoURL = await API.request('logo');
      this.setState({logoURL});
    } catch (error) {
      throw new Error(error);
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    const {username, password} = this.state;
    if (username === '' || password === '') {
      return this.setState({
        loginError: {
          title: 'Unable to login',
          type: 'error',
          description: 'Username or password can\'t be empty!'
        }
      });
    }

    try {
      const credentials = {
        username: username,
        password: password
      };
      const resp = await API.request(`login`, 'POST', {
        body: JSON.stringify(credentials),
        headers: {
          Accept: HEADERS.JSON,
          'Content-Type': HEADERS.JSON
        }
      });

      storage.setItem('token', resp.token);
      storage.setItem('username', resp.username);
      location.reload();
    } catch (e) {
      const errorObj = {
        title: 'Unable to login',
        type: 'error',
        description: e.error
      };
      this.setState({loginError: errorObj});
    }
  }

  get isTokenExpire() {
    const token = storage.getItem('token');

    if (!isString(token)) {
      return true;
    }

    let payload = token.split('.')[1];

    if (!payload) {
      return true;
    }

    try {
      payload = JSON.parse(atob(payload));
    } catch (err) {
      console.error('Invalid token:', err, token); // eslint-disable-line
      return false;
    }

    if (!payload.exp || !isNumber(payload.exp)) {
      return true;
    }

    // Report as expire before (real expire time - 30s)
    const jsTimestamp = payload.exp * 1000 - 30000;
    const expired = Date.now() >= jsTimestamp;

    if (expired) {
      storage.clear();
    }

    return expired;
  }

  handleLogout() {
    storage.clear();
    location.reload();
  }

  /**
   *
   * @todo Check jwt token expire
   */
  renderUserActionButton() {
    const username = storage.getItem('username');
    const {headerButton} = classes;
    if (!this.isTokenExpire) {
      return (
        <div className="user-logged">
          <span
            className="user-logged-greetings"
            style={{marginRight: '10px', textTransform: 'capitalize'}}
          >
            Hi, {username}
          </span>
          <Button
            className={`${headerButton} header-button-logout`}
            type="danger"
            onClick={this.handleLogout}
          >
            Logout
          </Button>
        </div>
      );
    } else {
      return (
        <Button
          className={`${headerButton} header-button-login`}
          onClick={this.toggleLoginModal}
        >
          Login
        </Button>
      );
    }
  }

  render() {
    const registryURL = getRegistryURL();
    const {
      state: {logoURL, showLogin, loginError},
      toggleLoginModal,
      handleInput,
      handleSubmit,
      renderUserActionButton
    } = this;
    return (
      <header className={classes.header}>
        <div className={classes.headerWrap}>
          <Link to="/">
            <img src={logoURL} className={classes.logo} />
          </Link>
          <figure>
            npm set registry {registryURL}
            <br />
            npm adduser --registry {registryURL}
          </figure>

          <div className={classes.headerRight}>{renderUserActionButton()}</div>
        </div>

        <Dialog
          title="Login"
          size="tiny"
          visible={showLogin}
          onCancel={() => toggleLoginModal()}
        >
          <Form className="login-form">
            <Dialog.Body>
              {loginError && (
                <Alert
                  title={loginError.title}
                  type={loginError.type}
                  description={loginError.description}
                  showIcon={true}
                  closable={false}
                />
              )}
              <br />
              <Input
                name="username"
                placeholder="Username"
                onChange={handleInput.bind(this, 'username')}
              />
              <br />
              <br />
              <Input
                name="password"
                type="password"
                placeholder="Type your password"
                onChange={handleInput.bind(this, 'password')}
              />
            </Dialog.Body>
            <Dialog.Footer className="dialog-footer">
              <Button
                onClick={() => toggleLoginModal()}
                className="cancel-login-button"
              >
                Cancel
              </Button>
              <Button
                nativeType="submit"
                className="login-button"
                onClick={handleSubmit}
              >
                Login
              </Button>
            </Dialog.Footer>
          </Form>
        </Dialog>
      </header>
    );
  }
}
