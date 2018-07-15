import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Tag} from 'element-react';
import {Link} from 'react-router-dom';
import isNil from 'lodash/isNil';
import {formatDateDistance} from '../../utils/DateUtils';

import classes from './package.scss';

export default class Package extends Component {
  static propTypes = {
    package: PropTypes.object
  };

  render() {
    const {package: pkg} = this.props;

    return (
      <section className={classes.package}>
        <Link to={`detail/${pkg.name}`}>
          <div className={classes.header}>
            {this.renderTitle(pkg)}
            {this.renderAuthor(pkg)}
          </div>
          <div className={classes.footer}>{this.renderDescription(pkg)}</div>
          <div className={classes.details}>
            {this.renderPublished(pkg)}
            {this.renderLicense(pkg)}
          </div>
        </Link>
      </section>
    );
  }

  renderPublished({time}) {
    return (
      <div className={classes.homepage}>
        {time ? `Published ${formatDateDistance(time)} ago` : ''}
      </div>
    );
  }

  renderLicense({license}) {
    if (license) {
      return <div className={classes.license}>{license}</div>;
    }

    return null;
  }

  renderDescription({description}) {
    return <p className={classes.description}>{description}</p>;
  }

  renderTitle(pkg) {
    return (
      <div className={classes.title}>
        <h1>
          {pkg.name} {this.renderTag(pkg)}
        </h1>
      </div>
    );
  }

  renderTag({version}) {
    return <Tag type="gray">v{version}</Tag>;
  }

  renderAuthor({author}) {
    if (isNil(author) || isNil(author.name)) {
      return;
    }

    return (
      <div role="author" className={classes.author}>{`By: ${author.name}`}</div>
    );
  }
}
