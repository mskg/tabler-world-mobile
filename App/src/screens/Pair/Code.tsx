import { Linking } from 'expo';
import * as React from 'react';
import { Query } from 'react-apollo';
import { View } from 'react-native';
import { withTheme } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import Assets from '../../Assets';
import { InlineLoading } from '../../components/Loading';
import { Me } from '../../model/graphql/Me';
import { GetMeQuery } from '../../queries/MeQuery';

class CodeScreenBase extends React.Component<{theme}> {
  render() {
    return (<View style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      // backgroundColor: this.props.theme.colors.surface,
    }}>
      <Query<Me> query={GetMeQuery}>
        {({ loading, data, error, refetch }) => {
          if (error) throw (error);
          if (!data || !data.Me) return <InlineLoading />

          return (<QRCode
            value={Linking.makeUrl('/member', { id: data.Me.id })}
            logo={Assets.images.icon}
            logoSize={60}
            logoBackgroundColor='transparent'
            size={250}
          />);
        }}
      </Query>
    </View>
    );
  }
}

export const CodeScreen = withTheme(CodeScreenBase);