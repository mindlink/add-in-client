/**
 * Represents the information for a user.
 */
export interface IUserMetaData {
    /**
     * The SIP URI of the user.
     */
    readonly Uri: string;

    /**
     * The display name of the user.
     */
    readonly DisplayName: string;
}
