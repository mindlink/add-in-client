import { IAddInClient, FailureCallback, MessageReceivedHandler, BeforeMessageSendHandler, ClosingHandler } from "./IAddInClient";

import { MulticastDispatcher } from "./MulticastDispatcher";
import { IChatRoomMetaData } from "./IChatRoomMetaData";
import { IUserMetaData } from "./IUserMetaData";
import { any, merge } from "./util";

/**
 * Represents the configuration for a registered callback.
 */
interface ICallbackConfig {
    /**
     * The success callback.
     */
    success: Function;

    /**
     * The failure callback.
     */
    failure: Function;

    /**
     * The callback scope.
     */
    scope: any;
}

/**
 * An implementation of the MindLink proxy interface that uses the PostMessage API.
 */
export class PostMessageAddInClient implements IAddInClient {
    /**
     * The callback prefix.
     */
    private static readonly callbackPrefix: string = "cb-";

    /**
     * A helper to handle dispatching an event to multiple handlers.
     */
    private readonly eventDispatcher: MulticastDispatcher;

    /**
     * The next callback ID.
     */
    private nextCallbackId: number = 1;

    /**
     * The hash of callback IDs to registered callbacks.
     */
    private callbacks: { [callbackId: string]: ICallbackConfig } = {};

    /**
     * Initializes a new instance of the class.
     */
    constructor() {
        this.eventDispatcher = new MulticastDispatcher();
        window.addEventListener("message", (event) => {
            this.onMessageReceived(event);
        });

        // *** We"re ready to receive. ***
        if (document.readyState === "complete") {
            this.register();
        } else {
            document.addEventListener("readystatechange", () => {
                if (document.readyState === "complete") {
                    this.register();
                }
            });
        }
    }

    /**
     * Asynchronously gets the chat room for the add-in.
     *
     * @param success The success callback.
     * @param failure The failure callback.
     * @param scope The callback scope.
     */
    public getChatRoom(success: (chatRoom: IChatRoomMetaData) => void, failure: FailureCallback, scope?: any): void {
        this.sendApiRequest("GetChatRoom", success, failure, scope);
    }

    /**
     * Asynchronously gets the chat room metadata for the add-in.
     *
     * @returns A promise which resolves to the chat room metadata.
     */
    public getChatRoomAsync(): Promise<IChatRoomMetaData> {
        return new Promise((resolve, reject) => this.getChatRoom(resolve, reject));
    }

    /**
     * Asynchronously gets the local user details for the add-in.
     *
     * @param success The success callback.
     * @param failure The failure callback.
     * @param scope The callback scope.
     */
    public getLocalUserDetails(success: (user: IUserMetaData) => void, failure: FailureCallback, scope?: any): void {
        this.sendApiRequest("GetLocalUserDetails", success, failure, scope);
    }

    /**
     * Asynchronously gets the local user details for the add-in.
     *
     * @returns A promise which resolves to the user metadata.
     */
    public getLocalUserDetailsAsync(): Promise<IUserMetaData> {
        return new Promise((resolve, reject) => this.getLocalUserDetails(resolve, reject));
    }

    /**
     * Asynchronously gets the domain details for the add-in.
     *
     * @param success The success callback.
     * @param failure The failure callback.
     * @param scope The callback scope.
     */
    public getDomainDetails(success: (domainName: string) => void, failure: FailureCallback, scope?: any): void {
        this.sendApiRequest("GetDomainDetails", success, failure, scope);
    }

    /**
     * Asynchronously gets the domain details for the add-in.
     *
     * @returns A promise which resolves to the domain details string.
     */
    public getDomainDetailsAsync(): Promise<string> {
        return new Promise((resolve, reject) => this.getDomainDetails(resolve, reject));
    }

    /**
     * Asynchronously gets the maximum message length for the add-in.
     *
     * @param success The success callback.
     * @param failure The failure callback.
     * @param scope The callback scope.
     */
    public getMaxMessageLength(success: (maxMessageLength: number) => void, failure: FailureCallback, scope?: any): void {
        this.sendApiRequest("GetMaxMessageLength", success, failure, scope);
    }

    /**
     * Asynchronously gets the maximum message length for the add-in.
     *
     * @returns A promise which resolves to the max message length.
     */
    public getMaxMessageLengthAsync(): Promise<number> {
        return new Promise((resolve, reject) => this.getMaxMessageLength(resolve, reject));
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
        this.sendApiRequest("SendMessage", success, failure, scope, { message: message, alert: alert });
    }

    /**
     * Asynchronously sends a message to the chat room for the add-in.
     *
     * @param message The message to send.
     * @param alert Whether the message is an alert.
     * @returns A promise which resolves to whether or not the message has been sent successfully.
     */
    public sendMessageAsync(message: string, alert: boolean): Promise<boolean> {
        return new Promise((resolve, reject) => this.sendMessage(message, alert, resolve, reject));
    }

    /**
     * Adds a handler for receiving messages from the chat room.
     *
     * @param handler The message received handler to add, invoked for each received message.
     * @param scope The handler scope.
     */
    public addMessageReceivedHandler(handler: MessageReceivedHandler, scope?: any): void {
        this.eventDispatcher.addHandler("messagereceived", handler, scope);
    }

    /**
     * Adds a handler for intercepting message posts from the chat room.
     * The handler should return true if it wishes to prevent the message from being sent.
     *
     * @param handler The message received handler to add, invoked before each message is sent.
     * @param scope The handler scope.
     */
    public addBeforeMessageSendHandler(handler: BeforeMessageSendHandler, scope?: any): void {
        this.eventDispatcher.addHandler("beforemessagesend", handler, scope);
    }

    /**
     * Adds a handler for being notified when the add-in is being removed.
     *
     * @param handler The closing handler to add, invoked when the add-in is being torn-down.
     * @param scope The handler scope.
     */
    public addClosingHandler(handler: ClosingHandler, scope?: any): void {
        this.eventDispatcher.addHandler("closing", handler, scope);
    }

    /**
     * Returns a string representation of this instance.
     *
     * @returns A [string] representing this instance.
     */
    public toString(): string {
        return "Post Message Add-In Client";
    }

    /**
     * Gets a value indicating whether the given message is for an event.
     *
     * @param message The message received from the API.
     * @return `true` if the message is for an event, `false` otherwise.
     */
    private isApiEvent(message: any): boolean {
        return !!message.event;
    }

    /**
     * Dispatches an API event to multiple event handlers.
     *
     * @param message The message received from the API.
     */
    private dispatchApiEvent(message: any): void {
        const apiEvent = message.event;

        const results = this.eventDispatcher.callHandlers(apiEvent.name, apiEvent.args);

        if (apiEvent.id) {
            const result = any(results, (item) => { return item === true; });

            const response = { eventId: apiEvent.id, stopEvent: result };
            window.parent.postMessage(JSON.stringify(response), "*");
        }
    }

    /**
     * Adds a new callback and returns the registered ID.
     *
     * @param success The callback to invoke on successful execution.
     * @param failure The callback to invoke on failed execution.
     * @param scope The scope in which to invoke the callbacks.
     * @returns The registered callback ID.
     */
    private addCallback(success: Function, failure: Function, scope: any): string {
        const callback = {
            success: success,
            failure: failure,
            scope: scope
        };

        const callbackId = PostMessageAddInClient.callbackPrefix + (this.nextCallbackId++);

        this.callbacks[callbackId] = callback;

        return callbackId;
    }

    /**
     * Gets a value indicating whether the given message is a response to an RPC request.
     *
     * @param message The RPC message.
     * @returns `true` if the message represents an RPC response, `false` otherwise.
     */
    private isApiResponse(message: any): boolean {
        return !!message.id;
    }

    /**
     * Invokes the callback registered for the given RPC response.
     *
     * @param message The RPC message.
     */
    private invokeResponseCallback(message: any): void {
        if (message.id && this.callbacks[message.id]) {
            const response = message.result || "";

            const callback = this.callbacks[message.id];
            delete this.callbacks[message.id];

            if (message.success && callback.success) {
                callback.success.apply(callback.scope, [response]);
            } else if (!message.success && callback.failure) {
                callback.failure.apply(callback.scope, [response]);
            }
        }
    }

    /**
     * Handles when a window post message is received.
     *
     * @param event The post message event.
     */
    private onMessageReceived(event: any): void {
        const message = JSON.parse(event.data);

        if (message) {
            if (this.isApiEvent(message)) {
                this.dispatchApiEvent(message);
                return;
            }

            if (this.isApiResponse(message)) {
                this.invokeResponseCallback(message);
            }
        }
    }

    /**
     * Sends an RPC request to the host.
     *
     * @param method The name of the method to invoke.
     * @param success The success callback.
     * @param failure The failure callback.
     * @param scope The scope in which to invoke the callbacks.
     * @param args The method arguments.
     */
    private sendApiRequest(method: string, success: Function, failure: Function, scope: any, args: any = null): void {
        const callbackId = this.addCallback(success, failure, scope);

        const message = merge({
            id: callbackId,
            method: method
        }, args);

        window.parent.postMessage(JSON.stringify(message), "*");
    }

    /**
     * Registers the add-in client to the host.
     */
    private register(): void {
        const message = {
            method: "Register"
        };

        window.parent.postMessage(JSON.stringify(message), "*");
    }
}