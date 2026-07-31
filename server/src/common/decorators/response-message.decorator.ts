import { SetMetadata } from '@nestjs/common';

export const RESPONSE_MESSAGE = 'response:message';

/**
 * Overrides the envelope's `message` for a handler.
 *
 * @example
 *   @ResponseMessage('Article published')
 */
export const ResponseMessage = (message: string) => SetMetadata(RESPONSE_MESSAGE, message);
