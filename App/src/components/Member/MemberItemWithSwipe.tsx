import React from 'react';
import { Theme } from 'react-native-paper';
import { IMemberOverviewFragment } from "../../model/IMemberOverviewFragment";
import { FavoriteButton, FavoriteIcon } from '../FavoriteButton';
import { SwipableItem, SwipeButtonsContainer } from '../SwipableItem';
import { MemberListItem } from "./MemberListItem";

export class MemberItemWithSwipe extends React.Component<{
    item: IMemberOverviewFragment;
    theme: Theme;
    onPress?: (item: IMemberOverviewFragment) => void;
    margin?: number;
    height?: number;
}> {
    ref;

    getSnapshotBeforeUpdate(prevProps) {
        if (prevProps.item != this.props.item) {
            return true;
        }
        return false;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (snapshot) {
            this.ref.close();
        }
    }

    _right = ({ size }) => (<FavoriteIcon theme={this.props.theme} member={this.props.item} style={{ marginRight: this.props.margin }} size={size} />);

    render() {
        return (<SwipableItem ref={(o) => { this.ref = o; }} leftButtons={<SwipeButtonsContainer style={{
            alignSelf: 'center',
            flexDirection: 'column',
            padding: 12,
            height: this.props.height
        }}>
            <FavoriteButton
                theme={this.props.theme}
                member={this.props.item}
                size={24}
            />
        </SwipeButtonsContainer>}>
            <MemberListItem
                height={this.props.height}
                theme={this.props.theme}
                onPress={this.props.onPress}
                member={this.props.item}
                margin={this.props.margin}
                right={this._right}
            />
        </SwipableItem>);
    }
}
