import * as React from 'react';
import { Query } from 'react-apollo';
import { View } from 'react-native';
import { withTheme } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import Assets from '../../Assets';
import { InlineLoading } from '../../components/Loading';
import { makeMemberLink } from '../../helper/linking/makeMemberLink';
import { Me } from '../../model/graphql/Me';
import { GetMeQuery } from '../../queries/Member/GetMeQuery';
import { QueryFailedError } from '../../helper/QueryFailedError';
import { createApolloContext } from '../../helper/createApolloContext';

class CodeScreenBase extends AuditedScreen<{ theme }> {

    constructor(props: any) {
        super(props, AuditScreenName.MemberShowQR);
    }

    render() {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: this.props.theme.colors.surface,
                }}
            >
                <Query<Me>
                    query={GetMeQuery}
                    context={createApolloContext('CodeScreenBase')}
                >
                    {({ data, error }) => {
                        if (error) throw new QueryFailedError(error);
                        if (!data || !data.Me) return <InlineLoading />;

                        return (
                            <QRCode
                                value={makeMemberLink(data.Me.id)}
                                logo={Assets.images.icon}
                                logoSize={60}
                                backgroundColor={this.props.theme.colors.surface}
                                size={250}
                            />
                        );
                    }}
                </Query>
            </View>
        );
    }
}

// tslint:disable-next-line: export-name
export const CodeScreen = withTheme(CodeScreenBase);
