import { IAddInClient, FailureCallback, MessageReceivedHandler, BeforeMessageSendHandler, ClosingHandler } from "./IAddInClient";

import { MulticastDispatcher } from "./MulticastDispatcher";
import { IChatRoomMetaData } from "./IChatRoomMetaData";
import { IUserMetaData } from "./IUserMetaData";
import { any } from "./util";

/**
 * Represents the direct window API methods as exposed by the Lync client.
 */
interface IDirectWindowApi {
    GetChatRoom(): IChatRoomMetaData;
    GetSelfUser(): IUserMetaData;
    GetDomain(): string;
    GetMaxMessageLength(): number;
    PostMessage(message: string, isAlert: boolean): boolean;
}

/**
 * Add the global API type definitions as exposed by the Lync client.
 */
declare global {
    interface Window extends Partial<IDirectWindowApi> {
        MessageReceived?: (message: string, senderUri: string) => void;
        MessagePosting?: (message: string) => boolean;
        Closing?: () => void;
    }
}

/**
 * A thin wrapper around the API calls injected by the Group Chat Console so that call/apply
 * methods work on them. In older versions of GCC these are not actually functions.
 */
class ActiveXWrapper implements IDirectWindowApi {
    /**
     * The API.
     */
    private readonly api: IDirectWindowApi;

    /**
     * Initializes a new instance of the class.
     *
     * @param api The api.
     */
    constructor(api: any) {
        this.api = api;
    }

    /**
     * Gets the chat room details for the add-in.
     * 
     * @returns The chat room metadata.
     */
    public GetChatRoom(): IChatRoomMetaData {
        return this.api.GetChatRoom();
    }

    /**
     * Gets the domain of the add-in.
     * 
     * @returns The domain of the chat room.
     */
    public GetDomain(): string {
        return this.api.GetDomain();
    }

    /**
     * Gets the maximum length of messages that can be sent in the chat room.
     * 
     * @returns The maximum length of messages that can be sent in the chat room.
     */
    public GetMaxMessageLength(): number {
        return this.api.GetMaxMessageLength();
    }

    /**
     * Sends a message to the room.
     *
     * @param message The message to send.
     * @param alert Whether the message is an alert.
     * @returns `true` if the message was sent to the server, `false` otherwise.
     */
    public PostMessage(message: string, alert: boolean): boolean {
        return this.api.PostMessage(message, alert);
    }

    /**
     * Gets the local user details for the add-in.
     *
     * @returns The local user details.
     */
    public GetSelfUser(): IUserMetaData {
        return this.api.GetSelfUser();
    }
}

/**
 * An implementation of the MindLink proxy interface that uses the
 * native Group Chat Client API under-the-hood.
 */
export class DirectAddInClient implements IAddInClient {
    /**
     * A helper to handle dispatching an event to multiple handlers.
     */
    private readonly dispatcher: MulticastDispatcher;

    /**
     * Indicates whether the proxy has been initialized.
     */
    private initialized: boolean = false;

    /**
     * The direct API to use.
     */
    private api: IDirectWindowApi | null = null;


    /**
     * Initializes a new instance of this class.
     */
    constructor() {
        this.dispatcher = new MulticastDispatcher()
        this.registerApiHandlers();
    }

    /**
     * Asynchronously gets the chat room for the add-in.
     *
     * @param success The success callback.
     * @param failure The failure callback.
     * @param scope The callback scope.
     */
    public getChatRoom(success: (chatRoom: IChatRoomMetaData) => void, failure: FailureCallback, scope?: any): void {
        this.callApiMethod("GetChatRoom", success, failure, scope);
    }

    /**
     * Asynchronously gets the local user details for the add-in.
     *
     * @param success The success callback.
     * @param failure The failure callback.
     * @param scope The callback scope.
     */
    public getLocalUserDetails(success: (user: IUserMetaData) => void, failure: FailureCallback, scope?: any): void {
        this.callApiMethod("GetSelfUser", success, failure, scope);
    }

    /**
     * Asynchronously gets the domain details for the add-in.
     *
     * @param success The success callback.
     * @param failure The failure callback.
     * @param scope The callback scope.
     */
    public getDomainDetails(success: (domain: string) => void, failure: FailureCallback, scope?: any): void {
        this.callApiMethod("GetDomain", success, failure, scope);
    }

    /**
     * Asynchronously gets the maximum message length for the add-in.
     *
     * @param success The success callback.
     * @param failure The failure callback.
     * @param scope The callback scope.
     */
    public getMaxMessageLength(success: (maxMessageLength: number) => void, failure: FailureCallback, scope?: any): void {
        this.callApiMethod("GetMaxMessageLength", success, failure, scope);
    }

    /**
     * Asynchronously sends a message to the chat room for the add-in.
     *
     * @param message The message to send.
     * @param alert Whether the message is an alert.
     * @param success The success callback.
     * @param failure The failure callback.
     * @param scope The callback scope.
     */
    public sendMessage(message: string, alert: boolean, success: (isSent: boolean) => void, failure: FailureCallback, scope?: any): void {
        this.callApiMethod("PostMessage", success, failure, scope, [message, alert]);
    }

    /**
     * Adds a handler for receiving messages from the chat room.
     *
     * @param handler The message received handler to add.
     * @param scope The handler scope.
     */
    public addMessageReceivedHandler(handler: MessageReceivedHandler, scope?: any): void {
        this.dispatcher.addHandler("messagereceived", handler, scope);
    }

    /**
     * Adds a handler for intercepting message posts from the chat room.
     *
     * @param handler The message received handler to add.
     * @param scope The handler scope.
     */
    public addBeforeMessageSendHandler(handler: BeforeMessageSendHandler, scope?: any): void {
        this.dispatcher.addHandler("beforemessagesend", handler, scope);
    }

    /**
     * Adds a handler for receiving messages from the chat room.
     *
     * @param handler The message received handler to add.
     * @param scope The handler scope.
     */
    public addClosingHandler(handler: ClosingHandler, scope?: any): void {
        this.dispatcher.addHandler("closing", handler, scope);
    }

    /**
     * Returns a string representation of the instance.
     *
     * @returns A string representation of this instance.
     */
    public toString(): string {
        return "Direct Add-In Client";
    }

    /**
     * Initializes the internal API reference.
     */
    private initialize(): void {
        if (this.initialized) {
            return;
        }

        this.api = this.api || (window as any).addins || (window.external && new ActiveXWrapper(window.external));

        if (this.api) {
            this.initialized = true;
        }
    }

    /**
     * Calls the API method with the given method name.
     *
     * @param methodName the name of the API method to invoke.
     * @param success the success callback.
     * @param failure the failure callback.
     * @param scope the callback scope.
     * @param args the arguments to pass to the API method.
     */
    private callApiMethod(methodName: keyof IDirectWindowApi, success: Function, failure: Function, scope: any, args: Array<any> | null = null): void {
        this.initialize();

        const method = this.api && this.api[methodName];

        if (method && typeof(method) === "function") {
            const result = method.apply(this.api, args || []);
            if (success) {
                success.apply(scope, [result]);
            }
        } else if (failure) {
            failure.apply(scope);
        }
    }

    /**
     * The handler for the message received callback from the add-in API.
     *
     * @param message The message.
     * @param sender The sender URI.
     */
    private messageReceivedHandler(message: string, sender: string): void {
        this.dispatcher.callHandlers("messagereceived", [message, sender]);
    }

    /**
     * The handler for the message post callback from the add-in API.
     * This is called before a message is sent (posted).
     *
     * @param message The message.
     * @returns `true` if the message should *not* be sent, `false` otherwise.
     */
    private beforeMessagePostHandler(message: string): boolean {
        const results = this.dispatcher.callHandlers("beforemessagesend", [message]);

        return any(results, (item) => { return item === true; });
    }

    /**
     * The handler for the closing callback from the add-in API.
     */
    private closingHandler(): void {
        this.dispatcher.callHandlers("closing", []);
    }

    /**
     * Registers add-in API callback handlers.
     */
    private registerApiHandlers(): void {
        window.MessageReceived = this.messageReceivedHandler;
        window.MessagePosting = this.beforeMessagePostHandler;
        window.Closing = this.closingHandler;
    }
}
