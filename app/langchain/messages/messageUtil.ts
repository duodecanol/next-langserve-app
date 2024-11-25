import { coerceMessageLikeToMessage, BaseMessageLike } from '@langchain/core/messages'
import { Message } from 'ai';

export function coerceVercelMessageToLCMessage(message: Message) {
    const _message: BaseMessageLike = { ...message };
    return coerceMessageLikeToMessage(_message);
}