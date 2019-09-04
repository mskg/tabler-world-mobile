import { connect } from 'react-redux';
import { IAppState } from '../../model/IAppState';
import { MemberTitleBase } from './MemberTitleBase';

export const MemberTitle = connect((state: IAppState) => ({
    diplayFirstNameFirst: state.settings.diplayFirstNameFirst,
    sortByLastName: state.settings.sortByLastName,
}))(MemberTitleBase);
