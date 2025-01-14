/* global chai */
/* global describe */
/* global sinon */
/* global before */
/* global after */
/* global it */
/* global beforeEach */
/* global afterEach */

import React, { createElement } from 'react';
import mutationTracker from 'object-invariant-test-helper';
import { mount } from 'enzyme';
import sundial from 'sundial';
import { BrowserRouter } from 'react-router-dom';
import { Signup } from '../../../app/pages/signup';
import { mapStateToProps } from '../../../app/pages/signup';

var assert = chai.assert;
var expect = chai.expect;

describe('Signup', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(Signup).to.be.a('function');
  });

  let props = {
    location: { pathname: 'signup' }
  };

  let wrapper;
  beforeEach(() => {
    wrapper = mount(
      createElement(
        props => (
          <BrowserRouter>
            <Signup {...props} />
          </BrowserRouter>
        ), props )
    );
  });

  afterEach(() => {

  });

  describe('render', function() {
    it('should render without problems when required props are set', function () {
      console.error = sinon.stub();
      var props = {
        acknowledgeNotification: sinon.stub(),
        api: {},
        configuredInviteKey: '',
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub(),
        working: false,
        location: { pathname: 'signup' },
      };
      wrapper.setProps(props);

      expect(console.error.callCount).to.equal(0);
    });

    it('should render signup-selection when no key is set and no key is configured', function () {
      var props = {
        configuredInviteKey: '',
        inviteKey: '',
        location: { pathname: 'signup' },
      };
      wrapper.setProps(props);
      var signupSelection = wrapper.find('.signup-selection');
      expect(signupSelection.length).to.equal(2);
    });

    it('should render signup-selection when key is set and validates', function () {
      var props = {
        configuredInviteKey: 'foobar',
        inviteKey: 'foobar',
        location: { pathname: 'signup' },
      };
      wrapper.setProps(props);
      var signupSelection = wrapper.find('.signup-selection');
      expect(signupSelection.length).to.equal(2);
    });

    it('should render signup-selection when both key and email are set, even if key doesn\'t match configured key', function () {
      var props = {
        configuredInviteKey: 'foobar',
        inviteKey: 'wrong-key',
        inviteEmail: 'gordonmdent@gmail.com',
        location: { pathname: 'signup' },
      };
      wrapper.setProps(props);
      var signupSelection = wrapper.find('.signup-selection');
      expect(signupSelection.length).to.equal(2);
    });

    it('should render signup-selection when key is valid and email is empty', function () {
      var props = {
        configuredInviteKey: 'foobar',
        inviteKey: 'foobar',
        inviteEmail: '',
        location: { pathname: 'signup' },
      };
      wrapper.setProps(props);
      var signupSelection = wrapper.find('.signup-selection');
      expect(signupSelection.length).to.equal(2);
    });

    it('should render signup-form when selection has been made', function () {
      var props = {
        configuredInviteKey: '',
        inviteKey: '',
        location: { pathname: 'signup' },
      };
      wrapper.setProps(props);
      wrapper.find(Signup).instance().getWrappedInstance().setState({madeSelection:true});
      wrapper.update();
      var signupForm = wrapper.find('.signup-form');
      expect(signupForm.length).to.equal(1);
    });

    it('should render the personal signup-form when personal was selected', function () {
      var props = {
        configuredInviteKey: '',
        inviteKey: '',
        location: { pathname: 'signup' }
      };

      wrapper.setProps(props);
      wrapper.find(Signup).instance().getWrappedInstance().setState({madeSelection:true, selected: 'personal'});
      wrapper.update()

      expect(wrapper.find('.signup-form').length).to.equal(1)
      expect(wrapper.find('.signup-title-condensed').length).to.equal(1)
      expect(wrapper.find('.signup-title-condensed').text()).to.equal('Create Tidepool Account')
    });

    it('should render the clinician signup-form when clinician was selected', function () {
      var props = {
        location: { pathname: 'signup' }
      };

      wrapper.setProps(props);

      wrapper.find(Signup).instance().getWrappedInstance().setState({ madeSelection: true, selected: 'clinician'});
      wrapper.update();

      expect(wrapper.find('.signup-form').length).to.equal(1)
      expect(wrapper.find('.signup-title-condensed').length).to.equal(1)
      expect(wrapper.find('.signup-title-condensed').text()).to.equal('Create Clinician Account')
    });

    it('should render the correct fields for the personal signup form', function() {
      var props = {
        location: { pathname: '/signup/personal' },
      };

      wrapper.setProps(props);

      expect(wrapper.find('input#fullName').length).to.equal(1);
      expect(wrapper.find('input#username').length).to.equal(1);
      expect(wrapper.find('input#password').length).to.equal(1);
      expect(wrapper.find('input#passwordConfirm').length).to.equal(1);
      expect(wrapper.find('input#termsAccepted').length).to.equal(0);
    });

    it('should render the correct fields for the clinician signup form', function() {
      var props = {
        location: { pathname: '/signup/clinician' },
      };

      wrapper.setProps(props);

      expect(wrapper.find('input#fullName').length).to.equal(0);
      expect(wrapper.find('input#username').length).to.equal(1);
      expect(wrapper.find('input#password').length).to.equal(1);
      expect(wrapper.find('input#passwordConfirm').length).to.equal(1);
      expect(wrapper.find('input#termsAccepted').length).to.equal(1);
    });

    it('should render a link from the personal form to the clinician form, and vice-versa', function() {
      var props = {
        location: { pathname: '/signup/personal' },
        history: { push: sinon.stub() }
      };

      wrapper.setProps(props);

      const typeSwitch = wrapper.find('.signup-formTypeSwitch');
      const link = wrapper.find('.type-switch');

      expect(typeSwitch.length).to.equal(1);
      expect(link.length).to.equal(1);

      link.simulate('click');
      expect(wrapper.find(Signup).instance().getWrappedInstance().state.selected).to.equal('clinician');

      link.simulate('click');
      expect(wrapper.find(Signup).instance().getWrappedInstance().state.selected).to.equal('personal');
    });

    it('should render the proper submit button text for each signup form', function() {
      var props = {
        location: { pathname: '/signup/personal' },
      };

      wrapper.setProps(props);

      const submitButton = wrapper.find('.simple-form-submit');

      expect(submitButton.text()).to.equal('Create Personal Account');

      wrapper.setProps({
        location: { pathname: '/signup/clinician' },
      });

      expect(submitButton.text()).to.equal('Create Clinician Account');
    });

    it('should render the proper submit button text for each signup form while the form is submitting', function() {
      var props = {
        location: { pathname: '/signup/personal' },
        working: true,
      };

      wrapper.setProps(props);

      const submitButton = wrapper.find('.simple-form-submit');

      expect(submitButton.text()).to.equal('Creating Personal Account...');

      wrapper.setProps({
        location: { pathname: '/signup/clinician' },
      });

      expect(submitButton.text()).to.equal('Creating Clinician Account...');
    });
  });

  describe('initial state', function() {
    it('should return expected initial state', function() {
      var props = {
        inviteEmail: 'gordonmdent@gmail.com',
        location: { pathname: 'signup' },
      };
      wrapper = mount(
        createElement(
          props => (
            <BrowserRouter>
              <Signup {...props} />
            </BrowserRouter>
          ), props )
      );
      var render = wrapper.find(Signup).instance().getWrappedInstance();
      var state = render.state;

      expect(state.loading).to.equal(false); // once rendered, loading has been set to false
      expect(state.formValues.username).to.equal(props.inviteEmail);
      expect(Object.keys(state.validationErrors).length).to.equal(0);
      expect(state.notification).to.equal(null);
    });

    it('should set the state to show the personal form according to the location pathname', function() {
      var props = {
        location: { pathname: '/signup/personal' },
      };

      wrapper.setProps(props);

      expect(wrapper.find('.signup-form').length).to.equal(1)
      expect(wrapper.find('.signup-title-condensed').length).to.equal(1)
      expect(wrapper.find('.signup-title-condensed').text()).to.equal('Create Tidepool Account')
    });

    it('should set the state to show the clinician form according to the location pathname', function() {
      var props = {
        location: { pathname: '/signup/clinician' },
      };

      wrapper.setProps(props);

      expect(wrapper.find('.signup-form').length).to.equal(1)
      expect(wrapper.find('.signup-title-condensed').length).to.equal(1)
      expect(wrapper.find('.signup-title-condensed').text()).to.equal('Create Clinician Account')
    });
  });

  describe('mapStateToProps', () => {
    const state = {
      working: {
        signingUp: {
          inProgress: true,
          notification: {msg: 'Nothing to see here...'}
        }
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

    it('should map working.signingUp.notification to notification', () => {
      expect(result.notification).to.deep.equal(state.working.signingUp.notification);
    });

    it('should map working.signingUp.inProgress to working', () => {
      expect(result.working).to.equal(state.working.signingUp.inProgress);
    });
  });

  describe('handleChange', function() {
    it('should be update the form values in state when an input is changed', function() {
      const username = 'jill@gmail.com';

      const props = {
        location: { pathname: '/signup/clinician' }
      };

      wrapper.setProps(props);

      const input = wrapper.find('.simple-form').first().find('.input-group').first().find('input');
      expect(input.length).to.equal(1);
      expect(wrapper.find(Signup).instance().getWrappedInstance().state.formValues).to.eql({});

      input.simulate('change', { target: { name: 'username', value: username } });

      expect(wrapper.find(Signup).instance().getWrappedInstance().state.formValues).to.eql({ username });
    });
  });

  describe('prepareFormValuesForSubmit', function() {
    let acceptedDate = new Date().toISOString();
    let dateStub;

    before(function() {
      dateStub = sinon.stub(sundial, 'utcDateString').returns(acceptedDate)
    });

    after(function() {
      dateStub.reset();
    });

    it('should prepare the form values for submission of the personal signup form', function() {
      var props = {
        location: { pathname: '/signup/personal' },
      };

      const formValues = {
        username: 'jill@gmail.com',
        fullName: 'Jill Jellyfish',
        termsAccepted: true,
        password: 'secret',
        passwordConfirm: 'secret',
      };

      wrapper.setProps(props);
      const rendered = wrapper.find(Signup).instance().getWrappedInstance();

      const expectedformattedValues = {
        username: formValues.username,
        emails: [ formValues.username ],
        password: formValues.password,
        roles: [],
        profile: {
          fullName: formValues.fullName,
        },
      };

      const formattedValues = rendered.prepareFormValuesForSubmit(formValues);

      expect(formattedValues).to.eql(expectedformattedValues);
    });

    it('should prepare the form values for submission of the clinician signup form', function() {
      var props = {
        location: { pathname: '/signup/clinician' },
      };

      const formValues = {
        username: 'jill@gmail.com',
        fullName: 'Jill Jellyfish',
        termsAccepted: true,
        password: 'secret',
        passwordConfirm: 'secret',
      };

      wrapper.setProps(props);
      var rendered = wrapper.find(Signup).instance().getWrappedInstance();

      const expectedformattedValues = {
        username: formValues.username,
        emails: [ formValues.username ],
        termsAccepted: acceptedDate,
        password: formValues.password,
        roles: [ 'clinician' ],
      };

      const formattedValues = rendered.prepareFormValuesForSubmit(formValues);

      expect(formattedValues).to.eql(expectedformattedValues);
    });
  });
});
