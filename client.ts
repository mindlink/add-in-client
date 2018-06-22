interface IChatRoomInfo {
    Name: string;
    Domain: string;
    Description: string;
    Topic: string;
}

interface IUserInfo {
    Uri: string;
    DisplayName: string;
}

/**
 * Merges the source object into the target object.
 *
 * @param {Object} target The object to merge into.
 * @param {Object} source The object to merge.
 * @return The merged target.
 */
function merge(target: any, source: any): any {
    if (source) {
        for (var attr in source) {
            if (source.hasOwnProperty(attr)) {
                target[attr] = source[attr];
            }
        }
    }

    return target;
}

/**
 * Gets a value indicating whether any elements match the given predicate.
 *
 * @param {Array} array The array to check for matches.
 * @param {Function} predicate The function predicate performing the comparison.
 * @return {Boolean} "true" if any element in the array matches the predicate, "false" otherwise.
 */
function any(array: Array<any>, predicate: (any) => boolean): boolean {
    let current;

    for (let i = 0; i < array.length; ++i) {
        current = array[i];

        if (predicate(current)) {
            return true;
        }
    }

    return false;
}

/**
 * A helper class for dispatching callbacks to multiple handlers.
 */
class MulticastDispatcher {
    /**
     * @private
     * @property {Object} handlers
     * The mapping of events to handler configurations.
     */
    handlers = {};

    /**
     * Initializes a new instance of this class.
     */
    constructor() {
    }

    /**
     * Retrieves the collection of handler configurations for an event.
     * @param {String} eventName The name of the event.
     *
     * @return {Array} The collection of handler configurations.
     */
    public getHandlers(eventName: string): any {
        return this.handlers[eventName];
    }

    /**
     * Retrieves or creates a collection of handler configurations for an event.
     * @param {String} eventName The name of the event.
     *
     * @return {Array} The collection of handler configurations.
     */
    public getOrCreateHandlers(eventName: string): any {
        this.handlers[eventName] = this.handlers[eventName] || [];

        return this.handlers[eventName];
    }

    /**
     * Adds a handler configuration for an event.
     * @param {String} eventName The name of the event.
     * @param {Function} handler The event handler to add.
     * @param {Object} scope The scope in which to execute the handler.
     */
    public addHandler(eventName: string, handler: Function, scope: object): void {
        if (!handler || typeof (handler) !== "function") {
            return;
        }

        const eventHandlers = this.getOrCreateHandlers(eventName);

        eventHandlers.push({ handler: handler, scope: scope });
    }

    /**
     * Removes a handler configuration for an event.
     * @param {String} eventName The name of the event.
     * @param {Function} handler The handler to remove.
     * @param {Object} scope The handler scope.
     */
    public removeHandler(eventName: string, handler: Function, scope: object): any {
        const eventHandlers = this.getHandlers(eventName);

        if (!eventHandlers) {
            return;
        }

        let existingHandler;
        for (let i = 0; i < eventHandlers.length; ++i) {
            existingHandler = eventHandlers[i];
            if (existingHandler.handler === handler && existingHandler.scope === scope) {
                eventHandlers.splice(i, 1);
                --i;
            }
        }
    }

    /**
     * @method callHandlers
     * Calls the registered handlers for the given event.
     * @param {String} eventName The name of the event.
     * @param {Array} args The event arguments.
     * @returns {Array} The results of the event handling.
     */
    public callHandlers(eventName: string, args: Array<any>): Array<any> {
        args = args || [];

        const eventHandlers = this.getHandlers(eventName);
        let results: Array<any> = [];

        if (!eventHandlers) {
            return results;
        }

        let handler;
        for (let i = 0; i < eventHandlers.length; ++i) {
            handler = eventHandlers[i];
            results.push(handler.handler.apply(handler.scope, args.slice()));
        }

        return results;
    }
}

/**
 * A thin wrapper around the API calls injected by the Group Chat Console so that call/apply
 * methods work on them. In older versions of GCC these are not actually functions.
 */
class ActiveXWrapper {
    /**
     * The API.
     */
    private readonly api: any;

    /**
     * Initializes a new instance of the class.
     *
     * @param api The api
     */
    constructor(api: any) {
        this.api = api;
    }

    /**
     * Gets the chat room details for the add-in.
     * 
     * @return {Object} The chat room details.
     * @return {String} return.Name The chat room name.
     * @return {String} return.Description The chat room description.
     * @return {String} return.Topic The chat room topic.
     * @return {String} return.Domain The chat room domain.
     */
    public GetChatRoom(): string {
        return this.api.GetChatRoom();
    }

    /**
     * Gets the domain of the add-in.
     * 
     * @return {String} The domain of the chat room.
     */
    public GetDomain(): string {
        return this.api.GetDomain();
    }

    /**
     * Gets the maximum length of messages that can be sent in the chat room.
     * 
     * @return {Number} The maximum length of messages that can be sent in the chat room.
     */
    public GetMaxMessageLength(): number {
        return this.api.GetMaxMessageLength();
    }

    /**
     * Sends a message to the room.
     *
     * @param {String} message The message to send.
     * @param {Boolean} alert Whether the message is an alert.
     */
    public PostMessage(message: string, alert: boolean): boolean {
        return this.api.PostMessage(message, alert);
    }

    /**
     * @method GetSelfUser
     * Gets the local user details for the add-in.
     * @return {Object} The local user details.
     * @return {String} return.Uri The Uri of the user.
     * @return {String} return.DisplayName The display name of the user.
     */
    public GetSelfUser(): object {
        return this.api.GetSelfUser();
    }
}

/**
 * The interface of the addin wrapper.
 */
interface IProxy {
    /**
     * @method getChatRoom
     * Asynchronously gets the chat room for the add-in.
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     * @param {Object} scope The callback scope.
     */
    getChatRoom(success: Function, failure: Function, scope: object): void;

    /**
     * @method getLocalUserDetails
     * Asynchronously gets the local user details for the add-in.
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     * @param {Object} scope The callback scope.
     */
    getLocalUserDetails(success: Function, failure: Function, scope: object): void;

    /**
     * @method getDomainDetails
     * Asynchronously gets the domain details for the add-in.
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     * @param {Object} scope The callback scope.
     */
    getDomainDetails(success: Function, failure: Function, scope: object): void;

    /**
     * @method getMaxMessageLength
     * Asynchronously gets the maximum message length for the add-in.
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     * @param {Object} scope The callback scope.
     */
    getMaxMessageLength(success: Function, failure: Function, scope: object): void;

    /**
     * @method sendMessage
     * Asynchronously sends a message to the chat room for the add-in.
     * @param {String} message The message to send.
     * @param {Boolean} alert Whether the message is an alert.
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     * @param {Object} scope The callback scope.
     */
    sendMessage(message: string, alert: boolean, success: Function, failure: Function, scope: object): void;

    /**
     * @method addMessageReceivedHandler
     * Adds a handler for receiving messages from the chat room.
     * @param {Function} handler The message received handler to add.
     * @param {Object} scope The handler scope.
     */
    addMessageReceivedHandler(handler: Function, scope: object): void;

    /**
     * @method addBeforeMessagePostHandler
     * Adds a handler for intercepting message posts from the chat room.
     * @param {Function} handler The message received handler to add.
     * @param {Object} scope The handler scope.
     */
    addBeforeMessageSendHandler(handler: Function, scope: object): void;

    /**
     * @method addMessageReceivedHandler
     * Adds a handler for receiving messages from the chat room.
     * @param {Function} handler The message received handler to add.
     * @param {Object} scope The handler scope.
     */
    addClosingHandler(handler: Function, scope: object): void;

    /**
     * Returns a string representation of the instance.
     *
     * @returns A string representation of this instance.
     */
    toString(): string;
}

/**
 * An implementation of the MindLink proxy interface that uses the
 * native Group Chat Client API under-the-hood.
 */
class DirectProxy implements IProxy {
    /**
     * @property {Boolean}
     * Indicates whether the proxy has been initialized.
     */
    private initialized: boolean = false;

    /**
     * @property {Object}
     * The direct API to use with methods:
     * @property {Function} property.GetChatRoom Gets the chat room details.
     * @property {Function} property.GetSelfUser Gets the local user details.
     * @property {Function} property.GetDomain Gets the current domain details.
     * @property {Function} property.GetMaxMessageLength Gets the maximum message length.
     * @property {Function} property.PostMessage Sends a message to the chat room.
     */
    private api: any;

    /**
     * @property {MulticastDispatcher}
     * A helper to handle dispatching an event to multiple handlers.
     */
    private readonly dispatcher: MulticastDispatcher;

    /**
     * Initializes a new instance of this class.
     */
    constructor() {
        this.dispatcher = new MulticastDispatcher()
        this.registerApiHandlers();
    }

    /**
     * @method getChatRoom
     * Asynchronously gets the chat room for the add-in.
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     * @param {Object} scope The callback scope.
     */
    public getChatRoom(success: Function, failure: Function, scope: object): void {
        this.callApiMethod("GetChatRoom", success, failure, scope);
    }

    /**
     * @method getLocalUserDetails
     * Asynchronously gets the local user details for the add-in.
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     * @param {Object} scope The callback scope.
     */
    public getLocalUserDetails(success: Function, failure: Function, scope: object): void {
        this.callApiMethod("GetSelfUser", success, failure, scope);
    }

    /**
     * @method getDomainDetails
     * Asynchronously gets the domain details for the add-in.
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     * @param {Object} scope The callback scope.
     */
    public getDomainDetails(success: Function, failure: Function, scope: object): void {
        this.callApiMethod("GetDomain", success, failure, scope);
    }

    /**
     * @method getMaxMessageLength
     * Asynchronously gets the maximum message length for the add-in.
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     * @param {Object} scope The callback scope.
     */
    public getMaxMessageLength(success: Function, failure: Function, scope: object): void {
        this.callApiMethod("GetMaxMessageLength", success, failure, scope);
    }

    /**
     * @method sendMessage
     * Asynchronously sends a message to the chat room for the add-in.
     * @param {String} message The message to send.
     * @param {Boolean} alert Whether the message is an alert.
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     * @param {Object} scope The callback scope.
     */
    public sendMessage(message: string, alert: boolean, success: Function, failure: Function, scope: object): void {
        this.callApiMethod("PostMessage", success, failure, scope, [message, alert]);
    }

    /**
     * @method addMessageReceivedHandler
     * Adds a handler for receiving messages from the chat room.
     * @param {Function} handler The message received handler to add.
     * @param {Object} scope The handler scope.
     */
    public addMessageReceivedHandler(handler: Function, scope: object): void {
        this.dispatcher.addHandler("messagereceived", handler, scope);
    }

    /**
     * @method addBeforeMessagePostHandler
     * Adds a handler for intercepting message posts from the chat room.
     * @param {Function} handler The message received handler to add.
     * @param {Object} scope The handler scope.
     */
    public addBeforeMessageSendHandler(handler: Function, scope: object): void {
        this.dispatcher.addHandler("beforemessagesend", handler, scope);
    }

    /**
     * @method addMessageReceivedHandler
     * Adds a handler for receiving messages from the chat room.
     * @param {Function} handler The message received handler to add.
     * @param {Object} scope The handler scope.
     */
    public addClosingHandler(handler: Function, scope: object): void {
        this.dispatcher.addHandler("closing", handler, scope);
    }

    /**
     * Returns a string representation of the instance.
     *
     * @returns A string representation of this instance.
     */
    public toString(): string {
        return "Direct API Proxy";
    }

    /**
     * @method initialize
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
     * @method callApiMethod
     * Calls the API method with the given method name.
     * @param {String} methodName the name of the API method to invoke.
     * @param {Function} success the success callback.
     * @param {Function} failure the failure callback.
     * @param {Object} scope the callback scope.
     * @param {Array} args the arguments to pass to the API method.
     */
    private callApiMethod(methodName: string, success: Function, failure: Function, scope: object, args: Array<any> | null = null): void {
        this.initialize();

        const method = this.api && this.api[methodName];

        if (method && typeof (method) === "function") {
            const result = method.apply(this.api, args || []);
            if (success) {
                success.apply(scope, [result]);
            }
        } else if (failure) {
            failure.apply(scope);
        }
    }

    /**
     * @private
     * @method messageReceivedHandler
     * The handler for the message received callback from the add-in API.
     */
    private messageReceivedHandler(message: string, sender: any): void {
        this.dispatcher.callHandlers("messagereceived", [message, sender]);
    }

    /**
     * @private
     * @method beforeMessagePostHandler
     * The handler for the message post callback from the add-in API.
     * This is called before a message is sent (posted).
     */
    private beforeMessagePostHandler(message: string): boolean {
        const results = this.dispatcher.callHandlers("beforemessagesend", [message]);

        return any(results, (item) => { return item === true; });
    }

    /**
     * @private
     * @method closingHandler
     * The handler for the closing callback from the add-in API.
     */
    private closingHandler(): void {
        this.dispatcher.callHandlers("closing", []);
    }

    /**
     * @private
     * @method registerApiHandlers
     * Registers add-in API callback handlers.
     */
    private registerApiHandlers(): void {
        const anywindow = window as any;

        anywindow.MessageReceived = this.messageReceivedHandler;
        anywindow.MessagePosting = this.beforeMessagePostHandler;
        anywindow.Closing = this.closingHandler;
    }
}

/**
 * An implementation of the MindLink proxy interface that uses the PostMessage API.
 */
class PostMessageProxy implements IProxy {
    /**
     * @private
     * @property {MulticastDispatcher}
     * A helper to handle dispatching an event to multiple handlers.
     */
    private readonly eventDispatcher: MulticastDispatcher;

    /**
     * @private
     * @property {String}
     * The callback prefix.
     */
    private readonly callbackPrefix: string = "cb-";

    /**
     * @private
     * @property {Number}
     * The next callback ID.
     */
    private nextCallbackId: number = 1;

    /**
     * @private
     * @property {Object}
     * The hash of callback IDs to registered callbacks.
     */
    private callbacks = {};

    /**
     * Initializes a new instance of the class.
     */
    constructor() {
        this.eventDispatcher = new MulticastDispatcher();
        window.addEventListener("message", (event) => {
            this.onMessageReceived(event)
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
     * @method getChatRoom
     * Asynchronously gets the chat room for the add-in.
     * @param {(IChatRoomInfo) => void} success The success callback, invoked with parameters:
     * @param {IChatRoomInfo} success.chatRoom The chat room object.
     * @param {(Error) => void} failure The failure callback.
     * @param {any} scope The callback scope.
     */
    public getChatRoom(success: (chatRoomInfo: IChatRoomInfo) => void, failure: (error: Error) => void, scope?: any): void {
        this.sendApiRequest("GetChatRoom", success, failure, scope);
    }

    /**
     * @method getLocalUserDetails
     * Asynchronously gets the local user details for the add-in.
     * @param {(IUserInfo) => void} success The success callback, invoked with parameters:
     * @param {IUserInfo} success.user The local user object.
     * @param {(Error) => void} failure The failure callback.
     * @param {any} scope The callback scope.
     */
    public getLocalUserDetails(success: (userInfo: IUserInfo) => void, failure: (error: Error) => void, scope?: any): void {
        this.sendApiRequest("GetLocalUserDetails", success, failure, scope);
    }

    /**
     * @method getDomainDetails
     * Asynchronously gets the domain details for the add-in.
     * @param {(string) => void} success The success callback, invoked with parameters:
     * @param {string} success.domainName The name of the domain.
     * @param {(Error) => void} failure The failure callback.
     * @param {any} scope The callback scope.
     */
    public getDomainDetails(success: (domainName: string) => void, failure: (error: Error) => void, scope: object): void {
        this.sendApiRequest("GetDomainDetails", success, failure, scope);
    }

    /**
     * @method getMaxMessageLength
     * Asynchronously gets the maximum message length for the add-in.
     * @param {(number) => void} success The success callback, invoked with parameters:
     * @param {number} success.maxMessageLength The maximum message length.
     * @param {(Error) => void} failure The failure callback.
     * @param {any} scope The callback scope.
     */
    public getMaxMessageLength(success: (maxMessageLength: number) => void, failure: (error: Error) => void, scope?: any): void {
        this.sendApiRequest("GetMaxMessageLength", success, failure, scope);
    }

    /**
     * @method sendMessage
     * Asynchronously sends a message to the chat room for the add-in.
     * @param {string} message The message to send.
     * @param {boolean} alert Whether the message is an alert.
     * @param {(boolean) => void} success The success callback.
     * @param {(Error) => void} failure The failure callback.
     * @param {any} scope The callback scope.
     */
    public sendMessage(message: string, alert: boolean, success: (isSent: boolean) => void, failure: (error: Error) => void, scope?: any): void {
        this.sendApiRequest("SendMessage", success, failure, scope, { message: message, alert: alert });
    }

    /**
     * @method addMessageReceivedHandler
     * Adds a handler for receiving messages from the chat room.
     * @param {(string, string) => void} handler The message received handler to add, invoked for each received message with:
     * @param {string} handler.message The message that has been received.
     * @param {string} handler.sender The ID of the message sender.
     * @param {any} scope The handler scope.
     */
    public addMessageReceivedHandler(handler: (message: string, sender: string) => void, scope?: any): void {
        this.eventDispatcher.addHandler("messagereceived", handler, scope);
    }

    /**
     * @method addBeforeMessagePostHandler
     * Adds a handler for intercepting message posts from the chat room.
     * The handler should return true if it wishes to prevent the message from being sent.
     * @param {(string) => boolean} handler The message received handler to add, invoked before each message is sent with:
     * @param {String} handler.message The message that will be sent.
     * @param {any} scope The handler scope.
     */
    public addBeforeMessageSendHandler(handler: (message: string) => boolean, scope?: any): void {
        this.eventDispatcher.addHandler("beforemessagesend", handler, scope);
    }

    /**
     * @method addClosingHandler
     * Adds a handler for being notified when the add-in is being removed.
     * @param {() => void)} handler The closing handler to add, invoked when the add-in is being torn-down.
     * @param {any} scope The handler scope.
     */
    public addClosingHandler(handler: () => void, scope?: any): void {
        this.eventDispatcher.addHandler("closing", handler, scope);
    }

    /**
     * Returns a string representation of this instance.
     * 
     * @returns A [string] representing this instance.
     */
    public toString(): string {
        return "Post Message API Proxy";
    }

    /**
     * @private
     * @method isApiEvent
     * Gets a value indicating whether the given message is for an event.
     * @param {Object} message The message received from the API.
     *
     * @return {Boolean} true if the message is for an event, else false.
     */
    private isApiEvent(message: any): boolean {
        return !!message.event;
    }

    /**
     * @private
     * @method dispatchApiEvent
     * Dispatches an API event to multiple event handlers.
     * @param {Object} message The message received from the API.
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
     * @private
     * @method addCallback
     * Adds a new callback and returns the registered ID.
     * @param {Function} success The callback to invoke on successful execution.
     * @param {Function} failure The callback to invoke on failed execution.
     * @param {Object} scope The scope in which to invoke the callbacks.
     *
     * @return {String} The registered callback ID.
     */
    private addCallback(success: Function, failure: Function, scope: any): string {
        const callback = {
            success: success,
            failure: failure,
            scope: scope
        };

        const callbackId = this.callbackPrefix + (this.nextCallbackId++);

        this.callbacks[callbackId] = callback;

        return callbackId;
    };

    /**
     * @private
     * @method isApiResponse
     * Gets a value indicating whether the given message is a response to an RPC request.
     * @param {Object} message The RPC message.
     *
     * @return {Boolean} True if the message represents an RPC response, false otherwise.
     */
    private isApiResponse(message: any): boolean {
        return !!message.id;
    }

    /**
     * @private
     * @method invokeResponseCallback
     * Invokes the callback registered for the given RPC response.
     * @param {Object} message The RPC message.
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
     * @private
     * @method onMessageReceived
     * Handles when a window post message is received.
     * @param {Object} event The post message event.
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
     * @private
     * @method sendApiRequest
     * Sends an RPC request to the host.
     * @param {String} method The name of the method to invoke.
     * @param {Function} success The success callback.
     * @param {Function} failure The failure callback.
     * @param {Object} scope The scope in which to invoke the callbacks.
     * @param {Object} args The method arguments.
     */
    private sendApiRequest(method: string, success: Function, failure: Function, scope: object, args: any = null): void {
        const callbackId = this.addCallback(success, failure, scope);

        const message = merge({
            id: callbackId,
            method: method
        }, args);

        window.parent.postMessage(JSON.stringify(message), "*");
    }

    private register(): void {
        const message = {
            method: "Register"
        };

        window.parent.postMessage(JSON.stringify(message), "*");
    }
}

function createProxy(): IProxy {
    let isCrossDomain = true;

    try {
        // We know we are cross-domain if we cannot access the parent location
        // Grab the href outside of the typeof call because otherwise IE will consume the exception.
        const parentHref = window.parent && window.parent.location.href;
        const canAccessParentWindow = window.parent && (typeof (parentHref) !== "undefined");
    
        isCrossDomain = !canAccessParentWindow;
    } catch (e) {
    }

    const anyWindow = window as any;

    if ((window.external && anyWindow.external.GetChatRoom) || (anyWindow.addins && anyWindow.addins.GetChatRoom) || !isCrossDomain) {
        return new DirectProxy();
    } else {
        return new PostMessageProxy();
    }
}

const proxy = createProxy();
export default proxy;
