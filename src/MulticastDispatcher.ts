/**
 * Represents a handler configuration.
 */
export interface IHandlerConfig {
    /**
     * The handler function.
     */
    handler: Function;

    /**
     * The handler scope.
     */
    scope?: any;
}

/**
 * A helper class for dispatching callbacks to multiple handlers.
 */
export class MulticastDispatcher {
    /**
     * The mapping of events to handler configurations.
     */
    private readonly handlers: { [eventName: string]: Array<IHandlerConfig> } = {};

    /**
     * Retrieves the collection of handler configurations for an event.
     *
     * @param eventName The name of the event.
     * @returns The collection of handler configurations.
     */
    public getHandlers(eventName: string): Array<IHandlerConfig> {
        return this.handlers[eventName];
    }

    /**
     * Retrieves or creates a collection of handler configurations for an event.
     *
     * @param  eventName The name of the event.
     * @returns The collection of handler configurations.
     */
    public getOrCreateHandlers(eventName: string): any {
        this.handlers[eventName] = this.handlers[eventName] || [];

        return this.handlers[eventName];
    }

    /**
     * Adds a handler configuration for an event.
     *
     * @param eventName The name of the event.
     * @param handler The event handler to add.
     * @param scope The scope in which to execute the handler.
     */
    public addHandler(eventName: string, handler: Function, scope: object): void {
        if (!handler || typeof(handler) !== "function") {
            return;
        }

        const eventHandlers = this.getOrCreateHandlers(eventName);

        eventHandlers.push({ handler: handler, scope: scope });
    }

    /**
     * Removes a handler configuration for an event.
     *
     * @param eventName The name of the event.
     * @param handler The handler to remove.
     * @param scope The handler scope.
     */
    public removeHandler(eventName: string, handler: Function, scope?: any): any {
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
     * Calls the registered handlers for the given event.
     *
     * @param eventName The name of the event.
     * @param args The event arguments.
     * @returns The results of the event handling.
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
