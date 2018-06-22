
# AddIn Wrapper

This project contains wrapping libraries for pchat addins.

## Tools

To build this package you need the following tools installed:

1. Yarn or NPM

## Building

To build the modern library, simply run "yarn build" in the root folder of the project after installing the dependencies locally (`yarn install`/`npm install`). The built artifacts will be in the .\dist\ folder.

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

## Source

To use the source typescript, you should reference `"@mindlink/add-in-client/client"`