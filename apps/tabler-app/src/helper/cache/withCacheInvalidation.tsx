import React from 'react';
import { CacheInvalidation } from './CacheInvalidation';
import { FieldType } from './FieldType';

export function withCacheInvalidation(field: FieldType, WrappedComponent: any, maxAge?: number) {
    return class extends React.PureComponent {
        render() {
            return (
                <CacheInvalidation field={field} maxAge={maxAge}>
                    <WrappedComponent {...this.props} />
                </CacheInvalidation>
            );
        }
    };
}
