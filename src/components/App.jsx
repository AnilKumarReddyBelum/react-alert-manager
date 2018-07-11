import React from 'react';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import AlertManagerComponent from './AlertManagerComponent';

class App extends React.Component {

    constructor(props) {
        super(props);
    }

    createNotification = (type) => {
        return () => {
            switch (type) {
                case 'info':
                    NotificationManager.warning ('Info message');
                    break;
                case 'success':
                    NotificationManager.success('Success message', 'Title here');
                    break;
                case 'warning':
                    NotificationManager.warning('Warning message', 'Close after 3000ms', 3000);
                    break;
                case 'error':
                    NotificationManager.error('Error message', 'Click me!', 5000, () => {
                        alert('callback');
                    });
                    break;
            }
        };
    };



    render() {
        return (<div>

            <button className='btn btn-info'
                onClick={this.createNotification('success')}>Info
                </button>
                <NotificationContainer />
        </div>);
    }
}

export default App;