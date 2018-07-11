import React, { PropTypes } from 'react';

function FAIcon(props) {
  let addons = '';

  if (props.fixedWidth) addons += ' fa-fw';

  if (props.spin) addons += ' fa-spin';
  else if (props.pulse) addons += ' fa-pulse';

  if (props.pullLeft) addons += ' fa-pull-left';
  else if (props.pullRight) addons += ' pull-right';

  if (props.border) addons += ' fa-border';

  if (props.large) addons += ' fa-lg';
  else if (props.size) addons += ` fa-${props.size}`;

  if (props.addons) addons += `${props.addons}`;

  return (
    <i
      className={`fa fa-${props.icon} ${addons}`}
      aria-hidden="true"
      style={{ marginRight: '0.1em' }}
    />
  );
}

export default FAIcon;
