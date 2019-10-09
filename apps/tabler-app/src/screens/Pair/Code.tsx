import * as React from 'react';
import { Query } from 'react-apollo';
import { View } from 'react-native';
import { withTheme } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import Assets from '../../Assets';
import { InlineLoading } from '../../components/Loading';
import { makeMemberLink } from '../../helper/linking/member';
import { Me } from '../../model/graphql/Me';
import { GetMeQuery } from '../../queries/Member/GetMeQuery';

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
                    // backgroundColor: this.props.theme.colors.surface,
                }}
            >
                <Query<Me> query={GetMeQuery}>
                    {({ data, error }) => {
                        if (error) throw (error);
                        if (!data || !data.Me) return <InlineLoading />;

                        return (<QRCode
                            value={makeMemberLink(data.Me.id)}
                            logo={Assets.images.icon}
                            logoSize={60}
                            logoBackgroundColor="transparent"
                            size={250}
                        />);
                    }}
                </Query>
            </View>
        );
    }
}

// tslint:disable-next-line: export-name
export const CodeScreen = withTheme(CodeScreenBase);
