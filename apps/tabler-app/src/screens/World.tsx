import { UrlParameters } from '@mskg/tabler-world-config-app';
import React from 'react';
import { WebScreen } from '../components/WebScreen';
import { getParameterValue } from '../helper/parameters/getParameterValue';
import { I18N } from '../i18n/translation';
import { ParameterName } from '../model/graphql/globalTypes';

// tslint:disable-next-line: export-name
export class WorldScreen extends React.Component {
    state = {
        url: '',
        whitelist: undefined,
    };

    async componentDidMount() {
        const urls = await getParameterValue<UrlParameters>(ParameterName.urls);
        this.setState({
            url: urls.world.replace('#lang#', I18N.id),
            whitelist: urls.world_whitelist,
        });
    }

    render() {
        if (this.state.url === '') return null;

        return (
            <WebScreen
                showBack={false}
                url={this.state.url}
                whitelist={this.state.whitelist}
                title={I18N.World.title}
            />
        );
    }
}
