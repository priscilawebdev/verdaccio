
import React from 'react';
import PropTypes from 'prop-types';

import classes from './404.scss';

const NotFound = ({pkg}) => {
    return (
      <div className={classes.notFound}>
        <h1>Error 404 - {pkg}</h1>
        <hr/>
        <p>
          Oops, The package you are trying to access does not exist.
        </p>
      </div>
    );
};

NotFound.propTypes = {
  pkg: PropTypes.string.isRequired
};

export default NotFound;
