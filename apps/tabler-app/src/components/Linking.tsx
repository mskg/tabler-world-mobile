import { Linking } from 'expo';
import React from 'react';
import { connect } from 'react-redux';
import { Audit } from '../analytics/Audit';
import { AuditEventName } from '../analytics/AuditEventName';
import { parseMemberLink } from '../helper/linking/parseMemberLink';
import { parseLink } from '../helper/linking/parseLink';
import { Categories, Logger } from '../helper/Logger';
import { showProfile } from '../redux/actions/navigation';

const logger = new Logger(Categories.UIComponents.Linking);

type Props = {
    showProfile: typeof showProfile,
};

/**
 * Global Linking Handler
 */
class LinkingBase extends React.Component<Props> {

    _handleOpenURL = (event) => {
        const { path, queryParams } = parseLink(event.url);
        logger.debug('path', path, 'params', queryParams);

        Audit.trackEvent(AuditEventName.Linking, {
            Url: path || '',
        });

        const memberLink = parseMemberLink(path, queryParams);
        if (memberLink.valid && memberLink.id) {
            this.props.showProfile(memberLink.id);
        }
    }

    async componentDidMount() {
        if (__DEV__) { logger.log('********** LINKING', Linking.makeUrl('/')); }
        Linking.addEventListener('url', this._handleOpenURL);

        // try to attach to initial opening
        const url = await Linking.getInitialURL();

        if (url != null) {
            this._handleOpenURL({
                url,
            });
        }
    }

    componentWillUnmount() {
        Linking.removeEventListener('url', this._handleOpenURL);
    }

    render() {
        return null;
    }
}

export default connect(
    null,
    {
        showProfile,
    },
)(LinkingBase);
