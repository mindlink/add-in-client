/**
 * Represents the information associated with a chat room.
 */
export interface IChatRoomMetaData {
    /**
     * The name of the chat room.
     */
    readonly Name: string;

    /**
     * The chat room domain.
     */
    readonly Domain: string;
    
    /**
     * The chat room description.
     */
    readonly Description: string;

    /**
     * The chat room topic.
     */
    readonly Topic: string;
}
