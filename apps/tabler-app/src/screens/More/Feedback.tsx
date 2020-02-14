import React from 'react';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { WebScreen } from '../../components/WebScreen';
import { getParameterValue } from '../../helper/parameters/getParameterValue';
import { UrlParameters } from '../../helper/parameters/Urls';
import { I18N } from '../../i18n/translation';
import { ParameterName } from '../../model/graphql/globalTypes';

// tslint:disable-next-line: export-name
export class FeedbackScreen extends AuditedScreen {
    state = {
        url: '',
    };

    constructor(props) {
        super(props, AuditScreenName.Feedback);
    }

    async componentDidMount() {
        super.componentDidMount();

        const urls = await getParameterValue<UrlParameters>(ParameterName.urls);
        this.setState({ url: urls.feedback });
    }

    render() {
        if (this.state.url === '') return null;

        return (
            <WebScreen
                showBack={true}
                url={this.state.url}
                title={I18N.Feedback.title}
            />
        );
    }
}
