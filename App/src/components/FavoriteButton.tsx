import React from 'react';
import { IconButton, Theme } from 'react-native-paper';
import { connect } from 'react-redux';
import { IAppState } from '../model/IAppState';
import { IMember } from '../model/IMember';
import { HashMap } from '../model/Maps';
import { toggleFavorite } from '../redux/actions/filter';

const testIsFavorite = (member: IMember, favorites: HashMap<boolean>) => {
    return favorites[member.id] === true;
}

type Props = {
    member: IMember,
    favorites: HashMap<boolean>,
    toggleFavorite: typeof toggleFavorite,
    theme: Theme,
    style?: any,
    size: number,
}

class FavoriteButtonBase extends React.Component<Props> {
    shouldComponentUpdate(nextProps, nextState) {
        const isnewFavorite = testIsFavorite(nextProps.member, nextProps.favorites);
        const isoldFavorite = testIsFavorite(this.props.member, this.props.favorites);

        return isnewFavorite != isoldFavorite;
    }

    _toggleFavorite = () => {
        requestAnimationFrame(() => {
            this.props.toggleFavorite(this.props.member);
        });
    }

    render() {
        const { member, favorites } = this.props;
        const isFavorite = testIsFavorite(member, favorites);

        return (
            <IconButton
                size={this.props.size}
                style={this.props.style}
                color={isFavorite ? this.props.theme.colors.accent : this.props.theme.colors.disabled}
                icon={isFavorite ? "star" : "star-border"}
                onPress={this._toggleFavorite}
            />
        );
    }
}

export const FavoriteButton = connect(
    (state: IAppState) => ({ favorites: state.filter.member.favorites }),
    {
        toggleFavorite,
    }
)(FavoriteButtonBase);
