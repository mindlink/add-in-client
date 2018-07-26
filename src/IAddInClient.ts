import { IChatRoomMetaData } from "./IChatRoomMetaData";
import { IUserMetaData } from "./IUserMetaData";

/**
 * Represents an API failure callback.
 */
export type FailureCallback = (error: Error) => void;

/**
 * Represents a handler called for each message received in the mounted chat room.
 *
 * @param message The message that has been received.
 * @param senderUri The URI of the message sender.
 */
export type MessageReceivedHandler = (message: string, senderUri: string) => void;

/**
 * Represents a handler called before a message is sent by the local user in the mounted chat room.
 *
 * @param The message that is being sent.
 * @returns `true` if the message should *not* be sent, `false` otherwise.
 */
export type BeforeMessageSendHandler = (message: string) => boolean;

/**
 * Represents the closing handler called when the add-in is going to be destroyed.
 */
export type ClosingHandler = () => void;

/**
 * Represents the add-in client.
 */
export interface IAddInClient {
    /**
     * Asynchronously gets the chat room for the add-in.
     *
     * @param success The success callback.
     * @param failure The failure callback.
     * @param scope The callback scope.
     */
    getChatRoom(success: (chatRoom: IChatRoomMetaData) => void, failure: FailureCallback, scope?: any): void;

    /**
     * Asynchronously gets the chat room for the add-in.
     *
     * @returns A promise which resolves to the chat room metadata.
     */
    getChatRoomAsync(): Promise<IChatRoomMetaData>;

    /**
     * Asynchronously gets the local user details for the add-in.
     *
     * @param success The success callback.
     * @param failure The failure callback.
     * @param scope The callback scope.
     */
    getLocalUserDetails(success: (user: IUserMetaData) => void, failure: FailureCallback, scope?: any): void;

    /**
     * Asynchronously gets the local user details for the add-in.
     *
     * @returns A promise which resolves to the user metadata.
     */
    getLocalUserDetailsAsync(): Promise<IUserMetaData>;

    /**
     * Asynchronously gets the domain details for the add-in.
     *
     * @param success The success callback.
     * @param failure The failure callback.
     * @param scope The callback scope.
     */
    getDomainDetails(success: (domain: string) => void, failure: FailureCallback, scope?: any): void;

    /**
     * Asynchronously gets the domain details for the add-in.
     *
     * @returns A promise which resolves to the domain details string.
     */
    getDomainDetailsAsync(): Promise<string>;

    /**
     * Asynchronously gets the maximum message length for the add-in.
     *
     * @param success The success callback.
     * @param failure The failure callback.
     * @param scope The callback scope.
     */
    getMaxMessageLength(success: (maxMessageLength: number) => void, failure: FailureCallback, scope?: any): void;

    /**
     * Asynchronously gets the maximum message length for the add-in.
     *
     * @returns A promise which resolves to the max message length.
     */
    getMaxMessageLengthAsync(): Promise<number>;

    /**
     * Asynchronously sends a message to the chat room for the add-in.
     *
     * @param message The message to send.
     * @param alert Whether the message is an alert.
     * @param success The success callback.
     * @param failure The failure callback.
     * @param scope The callback scope.
     */
    sendMessage(message: string, alert: boolean, success: (hasMessageSent: boolean) => void, failure: FailureCallback, scope?: any): void;

    /**
     * Asynchronously sends a message to the chat room for the add-in.
     *
     * @param message The message to send.
     * @param alert Whether the message is an alert.
     * @returns A promise which resolves to whether or not the message has been sent successfully.
     */
    sendMessageAsync(message: string, alert: boolean): Promise<boolean>;

    /**
     * Adds a handler for receiving messages from the chat room.
     *
     * @param handler The message received handler to add.
     * @param scope The handler scope.
     */
    addMessageReceivedHandler(handler: MessageReceivedHandler, scope?: any): void;

    /**
     * Adds a handler for intercepting message posts from the chat room.
     *
     * @param handler The message received handler to add.
     * @param scope The handler scope.
     */
    addBeforeMessageSendHandler(handler: BeforeMessageSendHandler, scope?: any): void;

    /**
     * Adds a handler for being notified of the add-in closing.
     *
     * @param handler The message received handler to add.
     * @param scope The handler scope.
     */
    addClosingHandler(handler: ClosingHandler, scope?: any): void;
}