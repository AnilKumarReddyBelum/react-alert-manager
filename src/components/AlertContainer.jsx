import React, { PropTypes } from 'react';
import { AlertList, Alert as StaticAlert } from 'react-bs-notifier';
import { Modal, Alert as RBSAlert } from 'react-bootstrap';
import AlertManager from './AlertManager';
import _ from 'lodash';

class AlertContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      listAlerts: [],
      staticAlert: null,
      showStatic: false,
    };

    this.handleListChange = this.handleListChange.bind(this);
    this.handleStaticChange = this.handleStaticChange.bind(this);
    this.handleAlertDismissed = this.handleAlertDismissed.bind(this);
    this.handleExitedModal = this.handleExitedModal.bind(this);
    this.handleHideModal = this.handleHideModal.bind(this);
  }

  static defaultProps = {
    position: 'bottom-right',
    timeout: 5000,
    dismissable: true,
    stickyModal: false,
  };

  static propTypes = {
    position: PropTypes.string.isRequired,
    timeout: PropTypes.number.isRequired,
    dismissable: PropTypes.bool.isRequired,
  };

  componentWillMount() {
    AlertManager.addChangeListener(this.handleListChange);
    AlertManager.addStaticAlertListener(this.handleStaticChange);
  }

  componentWillUnmount() {
    AlertManager.removeChangeListener(this.handleListChange);
    AlertManager.removeStaticAlertListener(this.handleStaticChange);
  }

  handleAlertDismissed(alert) {
    AlertManager.remove(alert);
  }

  handleStaticChange(staticAlert) {
    if (staticAlert) {
      this.setState({
        staticAlert: staticAlert,
        showStatic: true,
      });
    } else {
      this.setState({
        showStatic: false,
      });
    }
  }

  handleHideModal() {
    AlertManager.closeModal();
  }

  handleExitedModal() {
    this.setState({
      staticAlert: null,
      showStatic: false,
    });
  }

  handleListChange(listAlerts) {
    this.setState({
      listAlerts: listAlerts,
    });
  }

  render() {
    return (
      <div>
          <Modal
            show={this.state.showStatic}
            keyboard={true}
            onExited={this.handleExitedModal}
            onHide={(this.props.stickyModal) ? undefined : this.handleHideModal}
            dialogClassName='alert-modal'
            >
            {
              (this.state.showStatic) ?
                <StaticAlert
                  type={this.state.staticAlert.type}
                  headline={this.state.staticAlert.headline}>
                  {this.state.staticAlert.message}
                </StaticAlert>  : undefined
            }
          </Modal>

        <AlertList
          alerts={this.state.listAlerts}
          position={this.props.position}
          timeout={this.props.timeout}
          onDismiss={
            (this.props.dismissable) ?
              this.handleAlertDismissed :
              undefined
          }/>
      </div>
    );
  }
}

export default AlertContainer;
