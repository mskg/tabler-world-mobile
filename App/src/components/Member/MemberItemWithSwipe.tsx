import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Theme, TouchableRipple } from 'react-native-paper';
import { connect } from 'react-redux';
import { IAppState } from '../../model/IAppState';
import { IMemberOverviewFragment } from '../../model/IMemberOverviewFragment';
import { HashMap } from '../../model/Maps';
import { toggleFavorite } from '../../redux/actions/filter';
import { FavoriteIcon } from '../FavoriteButton';
import { SwipableItem, SwipeButtonsContainer } from '../SwipableItem';
import { MemberListItem } from './MemberListItem';

type Props = {
    item: IMemberOverviewFragment;
    theme: Theme;
    onPress?: (item: IMemberOverviewFragment) => void;
    margin?: number;
    height?: number;

    favorites: HashMap<boolean>,
    toggleFavorite: typeof toggleFavorite,
};

type State = {
    initialized: boolean,
    hasPhone: boolean,
};

const testIsFavorite = (member: IMemberOverviewFragment, favorites: HashMap<boolean>) => {
    return favorites[member.id] === true;
};

export class MemberItemWithSwipeBase extends React.Component<Props, State> {
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

    _right = ({ size }) => (
        <FavoriteIcon
            theme={this.props.theme}
            member={this.props.item}
            style={{ marginRight: this.props.margin }}
            size={size} />
    )

    _toggle = () => {
        requestAnimationFrame(() => {
            this.props.toggleFavorite(this.props.item);
            this.ref.close();
        });
    }

    render() {
        const { item, favorites } = this.props;
        const isFavorite = testIsFavorite(item, favorites);

        return (
            <SwipableItem
                ref={(o) => { this.ref = o; }}

                leftButtons={<SwipeButtonsContainer style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    // height: this.props.height,
                    backgroundColor: this.props.theme.colors.accent,
                }}>
                    {/* <FavoriteButton
                        theme={this.props.theme}
                        member={this.props.item}
                        size={24}
                    /> */}

                    <TouchableRipple
                        onPress={this._toggle}
                        style={{
                            height: '100%',
                            width: 24 * 3,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: this.props.theme.colors.accent,
                        }}
                    >
                        <Ionicons
                            size={24}
                            name={isFavorite ? 'md-star-outline' : 'md-star'}
                            color={this.props.theme.colors.placeholder}
                        />
                    </TouchableRipple>
                </SwipeButtonsContainer>}

            // rightButtons={
            //     <SwipeButtonsContainer style={{
            //         alignItems: 'center',
            //         justifyContent: 'center',
            //         flexDirection: 'row',
            //         // backgroundColor: this.props.theme.colors.b,
            //     }}>
            //         <TouchableRipple
            //             onPress={() => { }}
            //             style={{
            //                 height: "100%",
            //                 width: 24 * 2,
            //                 alignItems: 'center',
            //                 justifyContent: 'center',
            //                 backgroundColor: this.props.theme.colors.accent,
            //             }}
            //         >
            //             <Ionicons size={24} name="md-call" color={this.props.theme.colors.placeholder} />
            //         </TouchableRipple>

            //         <TouchableRipple
            //             onPress={() => { }}
            //             style={{
            //                 height: "100%",
            //                 width: 24 * 2,
            //                 alignItems: 'center',
            //                 justifyContent: 'center',
            //                 backgroundColor: this.props.theme.colors.accent,
            //             }}
            //         >
            //             <Ionicons size={24} name="md-chatbubbles" color={this.props.theme.colors.placeholder} />
            //         </TouchableRipple>

            //         <TouchableRipple
            //             onPress={() => { }}
            //             style={{
            //                 height: "100%",
            //                 width: 24 * 2 + 24,
            //                 paddingRight: 24,
            //                 alignItems: 'center',
            //                 justifyContent: 'center',
            //                 backgroundColor: this.props.theme.colors.accent,
            //             }}
            //         >
            //             <Ionicons size={24} name="md-mail" color={this.props.theme.colors.placeholder} />
            //         </TouchableRipple>
            //     </SwipeButtonsContainer>
            // }
            >
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


export const MemberItemWithSwipe = connect(
    (state: IAppState) => ({ favorites: state.filter.member.favorites }),
    {
        toggleFavorite,
    },
)(MemberItemWithSwipeBase);
