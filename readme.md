
# AddIn Client

### What is this?

This project contains a client library for interacting with the Lync/Skype for Business or MindLink Add-In API.

An Add-In is any web page that is configured to show "inside" a chat room in a Lync/Skype for Business Group Chat or Persistent Chat deployment.
When exposed inside a chat room in a native Lync Group Chat / Skype for Business or MindLink client additional functionality is provided to the add-in through several JavaScript methods and callbacks.

Over time the add-in API exposed by Lync changed location and when exposed through MindLink cross-domain you need to use a completely different method (post-message).

To make it easier to develop across versions and clients MindLink developed an asynchronous wrapper - a single API surface that will automatically determine how to communicate with the native or MindLink APIs.

### How to use?

Yarn/npm install `@mindlink/add-in-client`. There's typescript type definitions you can read to know what's available.
Alternatively you can download from github releases the latest version and include the library in a `script` tag.

To use the source typescript, you should reference `@mindlink/add-in-client/src/client`.

### Browser Support

Any browser with native support for `JSON.stringify` and `JSON.parse`. For cross-domain, any browser with native post message support. 

For compatibility with the native Lync/Skype for Business clients you need to support the version of Internet Explorer shipped with Windows. That likely means you will have to include a JSON shim - we purposefully haven't as you may be using one anyway in your project and we don't want to cause bloat.

If you're not packaging your add-in up using a bundler we recommend including [JSON 3](https://github.com/bestiejs/json3) in a `script` tag before including the add-in client.

## Building

To build the modern library, simply run `yarn build` in the root folder of the project after installing the dependencies locally (`yarn install`/`npm install`). The built artifacts will be in the .\dist\ folder.

## Testing

To test the wrapper, you have to:

1. Serve the folder.
2. Create an add-in entry onto the relevant pChat infrastructure. For the tests to pass the add-in url needs to be configured with querystrings that provide expectations for the various tests. i.e.
    1. `dm` for the expected domain name.
    2. `uid` for the expected local user id.
    3. `udm` for the expected  local user display name.
    4. `gn` for the expected  name of the group that the addin is hosted into.
    5. `d` for the expected description of the group that the addin is hosted into.
    6. `t` for the expected topic of the group that the addin is hosted into.
    7. `mml` for the expected maximum message length.
3. Add the add in to a group. From the Lync/Sfb adminstrator shell run the Set-CsPersistentChatRoom -Identity -AddIn "the configured addin name", i.e.
`set-cspersistentchatroom -Identity "<domain name>/<group name>" -AddIn "<add in name>"`
4. Using a client that supports addins, go to the room.

To test add-in functionality, you have to:

1. Serve the folder.
2. Create an add-in entry as above, without the querystring parameters. You want to serve `addintester.html` instead.
3. As above.
4. As above.
5. Interact with the addin.
