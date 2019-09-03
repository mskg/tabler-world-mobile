import React from 'react';
import { WebScreen } from '../../components/WebScreen';
import { getParameterValue } from '../../helper/parameters/getParameter';
import { UrlParameters } from '../../helper/parameters/Urls';
import { I18N } from '../../i18n/translation';
import { ParameterName } from '../../model/graphql/globalTypes';

export class WorldScreen extends React.Component {
    state = {
        url: '',
    };

    async componentDidMount() {
        const urls = await getParameterValue<UrlParameters>(ParameterName.urls);
        this.setState({ url: urls.world });
    }

    render() {
        if (this.state.url === '') return null;

        return <WebScreen
            showBack={true}
            url={this.state.url}
            title={I18N.World.title}
        />;
    }
}
