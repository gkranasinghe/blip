/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global before */
/* global after */

import React from'react';
import mutationTracker from 'object-invariant-test-helper';
import { BrowserRouter } from 'react-router-dom';
import { mount } from 'enzyme';

import Login, { Login as LoginFunction, mapStateToProps } from'../../../app/pages/login/login.js';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

let assert = chai.assert;
let expect = chai.expect;

describe('Login', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(LoginFunction).to.be.a('function');
  });

  describe('render', function() {
    var props = {
      acknowledgeNotification: sinon.stub(),
      confirmSignup: sinon.stub(),
      fetchers: [],
      isInvite: false,
      onSubmit: sinon.stub(),
      trackMetric: sinon.stub(),
      working: false
    };

    it('should render without problems when required props are present', function () {
      console.error = sinon.stub();

      mount(<BrowserRouter><LoginFunction {...props} /></BrowserRouter>)
      expect(console.error.callCount).to.equal(0);
    });

    describe('keycloak enabled', () => {
      const defaultWorkingState = {
        inProgress: false,
        completed: false,
        notification: null,
      };
      const workingState = {
        blip: {
          working: {
            loggingIn: defaultWorkingState,
            confirmingSignup: defaultWorkingState,
          },
        },
      };
      const mockStore = configureStore([thunk]);
      const store = mockStore(workingState);
      const configMock = { KEYCLOAK_URL: 'someUrl' };
      const keycloakMock = {
        login: sinon.stub(),
      };
      let RewiredLogin, wrapper;

      before(() => {
        Login.__Rewire__('config', configMock);
        Login.__Rewire__('keycloak', keycloakMock);
        RewiredLogin = require('../../../app/pages/login/login.js').default;
        wrapper = mount(
          <Provider store={store}>
            <BrowserRouter>
              <RewiredLogin {...props} />
            </BrowserRouter>
          </Provider>
        );
      });

      after(() => {
        Login.__ResetDependency__('config');
        Login.__ResetDependency__('keycloak');
      });

      it('should render a login button instead of a form', () => {
        expect(wrapper.find('.login-simpleform').length).to.equal(0);
        expect(wrapper.find('Button').length).to.equal(1);
      });

      it('should execute keycloak login when clicked', () => {
        expect(keycloakMock.login.callCount).to.equal(0);
        wrapper.find('Button').simulate('click');
        expect(keycloakMock.login.callCount).to.equal(1);
      });
    });
  });

  describe('mapStateToProps', () => {
    const state = {
      working: {
        confirmingSignup: {inProgress: false, notification: null},
        loggingIn: {inProgress: false, notification: {type: 'alert', message: 'Hi!'}}
      }
    };

    const tracked = mutationTracker.trackObj(state);
    const result = mapStateToProps({blip: state});

    it('should not mutate the state', () => {
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });

    it('should be a function', () => {
      assert.isFunction(mapStateToProps);
    });

    it('should map working.loggingIn.inProgress to working', () => {
      expect(result.working).to.equal(state.working.loggingIn.inProgress);
    });

    it('should map working.loggingIn.notification to notification', () => {
      expect(result.notification).to.equal(state.working.loggingIn.notification);
    });

    it('should map working.confirmingSignup.notification to notification if working.loggingIn.notification is null', () => {
      const anotherState = {
        working: {
          loggingIn: {inProgress: false, notification: null},
          confirmingSignup: {inProgress: false, notification: {status: 500, body: 'Error :('}}
        }
      };
      const anotherRes = mapStateToProps({blip: anotherState});
      expect(anotherRes.notification).to.equal(anotherState.working.confirmingSignup.notification);
    });

    describe('when some state is `null`', () => {
      const state = {
        working: {
          confirmingSignup: {inProgress: false, notification: null},
          loggingIn: {inProgress: false, notification: null}
        }
      };

      const tracked = mutationTracker.trackObj(state);
      const result = mapStateToProps({blip: state});

      it('should not mutate the state', () => {
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should map working.loggingIn.notification to notification', () => {
        expect(result.notification).to.be.null;
      });
    });
  });
});
