import { EventEmitter } from 'events';
import React from 'react';
import { ButtonToolbar, Glyphicon } from 'react-bootstrap';
import _ from 'lodash';
import VZButton from './VZButton';
import FAIcon from './FAIcon';

const CHANGELIST = 'change-list';
const CHANGESTATIC = 'change-static';
const INFO = 'info';
const SUCCESS = 'success';
const WARNING = 'warning';
const ERROR = 'danger';
const DANGER = ERROR;
const FAILURE = ERROR;

const getRandomId = (x = 1) => {
  return Math.floor(Math.random() * x * (new Date()).getTime());
};

class AlertManager extends EventEmitter {
  static INFO = INFO
  static SUCCESS = SUCCESS
  static WARNNG = WARNING
  static ERROR = ERROR
  static DANGER = DANGER
  static FAILURE = FAILURE

  constructor() {
    super();
    this.listAlerts = [];
    this.staticAlert = null;
  }

  assignDefault(alert = {}) {
    const defaultAlert = {
      id: getRandomId(),
      type: INFO,
      headline: undefined,
      message: undefined,
    };
    return Object.assign(defaultAlert, alert);
  }

  remove(alert) {
    const alerts = this.listAlerts;
    const idx = alerts.indexOf(alert);
    if (idx >= 0) {
      this.listAlerts = [...alerts.slice(0, idx), ...alerts.slice(idx + 1)];
      this.emitChange();
    }
  }

  openModal(alert) {
    let newAlert = this.assignDefault(alert);
    this.staticAlert = newAlert;
    this.emitChangeStatic();
  }

  hideModal() {
    this.closeModal();
  }

  closeModal() {
    this.staticAlert = null;
    if (_.isFunction(this.cancelModalCallback)) {
      this.cancelModalCallback();
      this.cancelModalCallback = null;
    }
    this.emitChangeStatic();
  }

  wrapCloseOnClick(callback) {
    return () => {
      this.cancelModalCallback = null;
      this.closeModal();
      callback();
    };
  }

  acceptPrompt(message, options) {
    let defaultOptions = {
      type: INFO,
      headline: 'confirmation',
      hideClose: false,
      closeText: 'Close',
      onClose: () => { },
      displayClode: false,
    };

    options = Object.assign(defaultOptions, options);

    options.onClose = this.wrapCloseOnClick(options.onClose);
    this.openModal({
      type: options.type,
      headline: options.headline,
      message: (<div>
        {options.displayClode ? <pre>{message}</pre> : { message }}

        <div style={{ height: '.6em' }} />
        <ButtonToolbar
          style={{
            width: 'auto',
            marginBottom: 0,
          }}
          className='pull-right'>
          {
            (options.hideClose) ? undefined :
              <VZButton onClick={options.onClose}>
                {options.closeText}
              </VZButton>
          }
        </ButtonToolbar>
      </div>),
    })
  }

  confirmModal(message, options) {
    let defaultOptions = {
      onOk: () => { },
      onCancel: () => { },
      type: INFO,
      headline: 'confirmation',
      hideCancel: false,
      okText: 'OK',
      cancelText: 'Cancel',
    };

    options = Object.assign(defaultOptions, options);

    // Backup the original function in case the user closes the modal by
    // clicking outside it or hitting escape
    this.cancelModalCallback = options.onCancel.bind(this);

    // Ensure both buttons always close the modal
    options.onOk = this.wrapCloseOnClick(options.onOk);
    options.onCancel = this.wrapCloseOnClick(options.onCancel);

    this.openModal({
      type: options.type,
      headline: options.headline,
      message: (<div>
        {message}
        <div style={{ height: '.6em' }} />
        <ButtonToolbar
          style={{
            width: 'auto',
            marginBottom: 0,
          }}
          className='pull-right'>
          <VZButton onClick={options.onOk}>
            <FAIcon icon="check" size="1x" />{' '}{options.okText}
          </VZButton>
          {
            (options.hideCancel) ? null :
              <VZButton className="btn-info" onClick={options.onCancel}>
                <FAIcon icon="times" size="1x" />{' '}{options.cancelText}
              </VZButton>
          }
        </ButtonToolbar>
      </div>),
    });
  }

  showAlertMessage(message, error = 'Error') {
    this.confirmModal(message, {
      type: ERROR,
      hideCancel: true,
      headline: error
    })
  }

  databaseError(error) {
    let message = (error && error.data && error.data.message) ?
      error.data.message : (error && error.message) ? error.message : error;
    this.failure((<div>
      <p>
        Please record this error code and refer to the <a href="https://vzkoe.verizon.com/icon">ICON Web Page</a> or send an email to <a href="mailto:icon-support@one.verizon.com">ICON Support</a>.
      </p>
      <p>
        {message}
      </p>
    </div>), 'database error')
  }

  create(alert) {
    let newAlert = this.assignDefault(alert);
    this.listAlerts.push(newAlert);
    this.emitChange();
  }

  notify(message, headline = 'NOTIFICATION', type = INFO) {
    this.create({
      type: type,
      headline: headline,
      message: message,
    });
  }

  success(message, headline = 'ACTION SUCCEEDED') {
    this.create({
      type: SUCCESS,
      headline: headline,
      message: message,
    });
  }

  failure(message, headline = 'ACTION FAILED') {
    this.create({
      type: DANGER,
      headline: headline,
      message: message,
    });
  }

  warn(message, headline = 'WARNING') {
    this.create({
      type: WARNING,
      headline: headline,
      message: message,
    });
  }

  warning(message, headline = 'WARNING') {
    this.warn(message, headline);
  }

  info(message, headline = 'INFORMATION') {
    this.create({
      type: INFO,
      headline: headline,
      message: message,
    });
  }

  danger(message, headline = 'DANGER') {
    this.create({
      type: DANGER,
      headline: headline,

      message: message.length > 300 ? message.substring(0, 300) + "..." : message
    });
  }

  invalid(message, headline = 'VALIDATION FAILURE') {
    this.warn(message, headline);
  }

  parseError(error, headline) {
    let message = '';
    if (_.isString(error.message)) {
      message = error.message;
    }
    if (error.response) {
      let response = error.response;
      if (response.data) {
        let data = response.data;
        if (message.length > 0) {
          message = `${message}: ${data.message} at ${data.path}`;
        } else {
          message = `${data.message} at ${data.path}`;
        }

        return {
          message: message,
          headline: data.error
        };
      }
    }

    return {
      message: error.message || error,
      headline: error.statusText || error.name || headline
    };
  }

  error(error, _headline = 'ERROR') {
    let {
      message,
      headline
    } = this.parseError(error, _headline);
    this.danger(message, headline);
    console.error(`Error: ${message || headline || error || 'Unknown Error. Please check stack trace.'}`);
  }

  excelError(message = '', headline = 'Parse Error') {
    this.error(message, headline);
  }

  libConfigError(message = '', headline = 'Database Error') {
    this.error(`This Product Type item cannot be deleted: It has been used in a Library Configuration. ${message}`, headline);
  }

  locked(catalogType) {
    this.warn(`This ${catalogType} is used in a configuration. It cannot be updated or removed.`, `${catalogType} locked`);
  }

  crud(verb, catalogId, catalogType = 'item') {
    this.success(`A ${catalogType} with Catalog ID ${catalogId} has been ${verb}`, `${catalogType} ${verb}`);
  }

  updated(catalogId, catalogType = 'item') {
    this.crud('updated', catalogId, catalogType);
  }

  created(catalogId, catalogType = 'item') {
    this.crud('created', catalogId, catalogType);
  }

  deleted(catalogId, catalogType = 'item') {
    this.crud('deleted', catalogId, catalogType);
  }

  showModal(alert) {
    this.openModal(alert);
  }

  emitChange() {
    this.emit(CHANGELIST, this.listAlerts);
  }

  emitChangeStatic() {
    this.emit(CHANGESTATIC, this.staticAlert);
  }

  addChangeListener(callback) {
    this.addListener(CHANGELIST, callback);
  }

  removeChangeListener(callback) {
    this.removeListener(CHANGELIST, callback);
  }

  addStaticAlertListener(callback) {
    this.addListener(CHANGESTATIC, callback);
  }

  removeStaticAlertListener(callback) {
    this.removeListener(CHANGESTATIC, callback);
  }
}

export default new AlertManager();
