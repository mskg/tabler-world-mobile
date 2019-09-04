import React from 'react';
import { Audit } from './Audit';
import { AuditScreenName } from './AuditScreenName';
import { IAuditor } from './Types';

export class AuditedScreen<P = {}, S = {}, SS = any> extends React.Component<P, S, SS> {
    protected audit: IAuditor;

    constructor(props, screenName: AuditScreenName) {
        super(props);
        this.audit = Audit.screen(screenName);
    }

    componentDidMount() {
        this.audit.submit();
    }
}
