import _ from 'lodash';
import React from 'react';
import { View } from 'react-native';
import { Divider, Theme, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { ActionButton } from '../../components/ActionButton';
import { RoleScrollView } from "../../components/Club/RoleScrollView";
import { Placeholder } from '../../components/Placeholder/Placeholder';
import { Square } from '../../components/Placeholder/Square';
import { Element } from '../../components/Profile/Element';
import { Section } from '../../components/Profile/Section';
import { SectionPlaceholder, SectionSquarePlaceholder } from '../../components/Profile/SectionPlaceholder';
import { formatAddress, showAddress } from "../../helper/addressHelpers";
import { formatBank } from '../../helper/formatBank';
import { OpenLink } from '../../helper/OpenLink';
import { I18N } from '../../i18n/translation';
import { IAddress } from "../../model/IAddress";
import { IAppState } from '../../model/IAppState';
import { ExpandableElement } from './ExpandableElement';
import { GetClubQueryType_Club } from './Queries';
import { styles } from './Styles';

type Props = {
    theme: Theme,
    club?: GetClubQueryType_Club,
    loading: boolean,
};

class ClubDetailsBase extends React.Component<Props> {

    handleAddress = (address?: IAddress) => () => {
        showAddress(address);
    }

    render() {
        const club = this.props.club;

        if (club == null) {
            return <Placeholder ready={false} previewComponent={
                <>
                    <View style={styles.actions}>
                        <Square width={53} />
                        <Square width={53} />
                        <Square width={53} />
                        <Square width={53} />
                    </View>
                    <SectionSquarePlaceholder />
                    <Divider />
                    <SectionSquarePlaceholder />
                    {/* <Divider />
                    <SectionsPlaceholder count={2} /> */}
                    <Divider />
                    <SectionSquarePlaceholder />
                    <Divider />
                    <SectionSquarePlaceholder />
                </>
            }>
            </Placeholder>;
        }

        const place1 = formatAddress(club.meetingplace1);
        const place2 = formatAddress(club.meetingplace2);
        const places = place1 != place2
            ?
                place2 != null
                    ? 2
                    : 1
            : 1;

        const account = formatBank(club.account);

        const board = _(club.board || []);
        const assist = _(club.boardassistants || []);
        // .filter(
        //     m => board.find(b => m.member.id === b.member.id) == null
        // );
        const members = _(club.members || []).filter(
            m => board.find(b => m.id === b.member.id) == null
                && assist.find(b => m.id === b.member.id) == null
        );

        const { first_meeting, second_meeting, charter_date, national_godparent, international_godparent } = club.info || {};

        return (<>
            <View style={styles.actions}>
                <ActionButton
                    text={I18N.Club.Actions.web} size={32}
                    onPress={() => OpenLink.url(club.website as string)}
                    icon="md-globe"
                    color={this.props.theme.colors.accent}
                    disabled={!OpenLink.canOpenUrl() || club.website == null}
                    disabledColor={this.props.theme.colors.disabled}
                />

                <ActionButton
                    text={I18N.Club.Actions.facebook} size={32}
                    onPress={() => OpenLink.url(club.facebook as string)}
                    icon="logo-facebook"
                    color={this.props.theme.colors.accent}
                    disabled={!OpenLink.canOpenUrl() || club.facebook == null}
                    disabledColor={this.props.theme.colors.disabled} />

                <ActionButton
                    text={I18N.Club.Actions.instagram} size={32}
                    onPress={() => OpenLink.url(club.instagram as string)}
                    icon="logo-instagram"
                    color={this.props.theme.colors.accent}
                    disabled={!OpenLink.canOpenUrl() || club.instagram == null}
                    disabledColor={this.props.theme.colors.disabled} />

                <ActionButton
                    text={I18N.Club.Actions.twitter} size={32}
                    onPress={() => OpenLink.url(club.twitter as string)}
                    icon="logo-twitter"
                    color={this.props.theme.colors.accent}
                    disabled={!OpenLink.canOpenUrl() || club.twitter == null}
                    disabledColor={this.props.theme.colors.disabled} />
            </View>
            <Divider />

            <Placeholder ready={!this.props.loading} previewComponent={<SectionSquarePlaceholder />}>
                {((place1 && place1 != "") || (place2 && place2 != "") || first_meeting || second_meeting) &&
                    <Section theme={this.props.theme} icon={"md-calendar"} highlight={true}>
                        <Element field={I18N.Club.meetings} text={[first_meeting, second_meeting].filter(Boolean).join("\n") } />
                        {/* <Element field={I18N.Club.second} text={second_meeting} /> */}

                        <Element onPress={this.handleAddress(club.meetingplace1)} field={I18N.Club.place(places, 1)} text={place1} />

                        {places === 2 &&
                            <Element onPress={this.handleAddress(club.meetingplace2)} field={I18N.Club.place(places, 2)} text={place2} />
                        }
                    </Section>
                }
            </Placeholder>

            <Placeholder ready={!this.props.loading} previewComponent={<SectionSquarePlaceholder />}>
                {(international_godparent || national_godparent || charter_date) &&
                    <Section theme={this.props.theme} icon={"md-school"}>
                        <Element
                            field={I18N.Club.international}
                            text={international_godparent}
                        />

                        <Element
                            field={I18N.Club.national}
                            text={national_godparent}
                        />

                        <Element field={I18N.Club.charter} text={I18N.Member.Formats.date(charter_date)} />
                    </Section>
                }
            </Placeholder>

            <Placeholder ready={!this.props.loading || !board.isEmpty()} previewComponent={<SectionSquarePlaceholder />}>
                {!board.isEmpty() &&
                    <>
                        <Section theme={this.props.theme} icon={"md-medal"} disableRipple={true}>
                            <ExpandableElement field={I18N.Club.board} text={
                                <RoleScrollView roles={board.value()} />} />
                        </Section>
                    </>
                }
            </Placeholder>

            <Placeholder ready={!this.props.loading || !assist.isEmpty()} previewComponent={<SectionSquarePlaceholder />}>
                {!assist.isEmpty() &&
                    <>
                        <Section theme={this.props.theme} icon={"md-medkit"} disableRipple={true}>
                            <ExpandableElement field={I18N.Club.assist} text={
                                <RoleScrollView roles={assist.value()} />}
                            />
                        </Section>
                    </>
                }
            </Placeholder>

            <Placeholder ready={!this.props.loading || !members.isEmpty()} previewComponent={<SectionSquarePlaceholder />}>
                {!members.isEmpty() &&
                    <>
                        <Section theme={this.props.theme} icon={"md-contacts"} disableRipple={true}>
                            <ExpandableElement field={I18N.Club.members} text={
                                <RoleScrollView roles={members.map(m => ({
                                    role: "Member",
                                    member: m
                                })).value()} />} />
                        </Section>
                    </>
                }
            </Placeholder>

            <Placeholder ready={!this.props.loading} previewComponent={<SectionPlaceholder />}>
                {(account) &&
                    <Section theme={this.props.theme} icon={"md-cash"}>
                        <Element
                            field={I18N.Club.account}
                            text={account}
                        />
                    </Section>
                }
            </Placeholder>

            <View style={{ height: 16 }} />
        </>);
    }
}

export const ClubDetails = connect(
    (state: IAppState) => ({
    }), {
    })(withTheme(ClubDetailsBase));
