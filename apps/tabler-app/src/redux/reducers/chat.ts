import * as actions from '../actions/chat';
import { INITIAL_STATE } from '../initialState';

// tslint:disable-next-line: export-name
export function chatReducer(
    state = INITIAL_STATE.chat,
    action:
        | typeof actions.setActiveConversation.shape
        | typeof actions.clearActiveConversation.shape
        | typeof actions.sendMessage.shape
        | typeof actions.removeMessage.shape
        | typeof actions.markFailed.shape
        | typeof actions.setBadge.shape
        | typeof actions.clearMessages.shape
    ,
): typeof INITIAL_STATE.chat {
    switch (action.type) {
        case actions.setActiveConversation.type:
            return { ...state, activeConversation: action.payload };

        case actions.clearActiveConversation.type:
            return { ...state, activeConversation: null };

        case actions.sendMessage.type:
            return {
                ...state,
                pendingSend: [
                    // we filter out old message on retry
                    ...state.pendingSend.filter((m) => m.id !== action.payload.id),
                    action.payload,
                ],
            };

        case actions.clearMessages.type:
            return { ...state, pendingSend: [] };

        case actions.removeMessage.type:
            return { ...state, pendingSend: state.pendingSend.filter((m) => m.id !== action.payload) };

        case actions.setBadge.type:
            return { ...state, badge: action.payload };

        case actions.markFailed.type:
            const msg = state.pendingSend.find((m) => m.id === action.payload);

            if (!msg) {
                return state;
            }

            msg.failed = true;
            msg.numTries = (msg.numTries || 0) + 1;

            return {
                ...state,
                pendingSend: [...state.pendingSend],
            };

        default:
            return state;
    }
}
