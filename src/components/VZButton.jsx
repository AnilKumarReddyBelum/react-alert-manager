import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';

const VZButton = p => {
  let { children, ...props } = p;
  return (
    <Button
      style={{ marginLeft: '3px', marginBottom: '0.22em' }}
      {...props}
      bsStyle="primary"
      bsSize="xsmall"
    >
      {children}
    </Button>
  );
};

export default VZButton;
export { VZButton, VZButton as Button };
