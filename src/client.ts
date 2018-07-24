import { PostMessageAddInClient } from "./PostMessageAddInClient";
import { DirectAddInClient } from "./DirectAddInClient";
import { IAddInClient } from "./IAddInClient";
import { IChatRoomMetaData } from "./IChatRoomMetaData";
import { IUserMetaData } from "./IUserMetaData";

/**
 * Creates the add-in client.
 */
function createAddInClient(): IAddInClient {
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
        return new DirectAddInClient();
    } else {
        return new PostMessageAddInClient();
    }
}

const client = createAddInClient();

export default client;

export { IAddInClient, IChatRoomMetaData, IUserMetaData };
