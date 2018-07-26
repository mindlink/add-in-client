 describe('tests', function() {

    var currentBeforeMessageSendHandler = null;
    var currentBeforeMessageSendScope = null;

    window.MindLinkAddInClient.addBeforeMessageSendHandler(function(message) {
        if (currentBeforeMessageSendHandler) {
            return currentBeforeMessageSendHandler.call(currentBeforeMessageSendScope, message);
        }

        return false;
    });

    function getParameterByName(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
            results = regex.exec(location.search);
        return results == null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    var expectedDomain = getParameterByName('dm');
    var expectedLocalUserId = getParameterByName('uid');
    var expectedDisplayName = getParameterByName('udm');
    var expectedGroupName = getParameterByName('gn');
    var expectedTopic = getParameterByName('t');
    var expectedDescription = getParameterByName('d');
    var expectedMaxMessageLength = parseInt(getParameterByName('mml'));

    function attachBeforeMessageSendHandler(handler, scope) {
        currentBeforeMessageSendHandler = handler;
        currentBeforeMessageSendScope = scope;
    }

    beforeEach(function() {
        attachBeforeMessageSendHandler(null, null);
    });

    it('initializing initializes correctly', function() {
        expect(window.MindLinkAddInClient).toBeDefined();
    });

    it('getting chat room gets chat room', function(done) {
        window.MindLinkAddInClient.getChatRoom(function(chatRoom) {
            expect(chatRoom.Domain).toBe(expectedDomain);
            expect(chatRoom.Name).toBe(expectedGroupName);
            expect(chatRoom.Description).toBe(expectedDescription);
            expect(chatRoom.Topic).toBe(expectedTopic);

            done();
        });
    });

    it('getting chat room asynchronously gets chat room', function(done) {
        window.MindLinkAddInClient.getChatRoomAsync().then((chatRoom) => {
            expect(chatRoom.Domain).toBe(expectedDomain);
            expect(chatRoom.Name).toBe(expectedGroupName);
            expect(chatRoom.Description).toBe(expectedDescription);
            expect(chatRoom.Topic).toBe(expectedTopic);

            done();
        });
    });

    it('getting local user details gets local user details', function(done) {
        window.MindLinkAddInClient.getLocalUserDetails(function(localUserDetails) {
            expect(localUserDetails.Uri.toLowerCase()).toBe(expectedLocalUserId);
            expect(localUserDetails.DisplayName).toBe(expectedDisplayName);

            done();
        });
    });

    it('getting local user details asynchronously gets local user details', function(done) {
        window.MindLinkAddInClient.getLocalUserDetailsAsync().then((localUserDetails) => {
            expect(localUserDetails.Uri.toLowerCase()).toBe(expectedLocalUserId);
            expect(localUserDetails.DisplayName).toBe(expectedDisplayName);

            done();
        });
    });

    it('getting domain details gets domain details', function(done) {
        window.MindLinkAddInClient.getDomainDetails(function(domainName) {
            expect(domainName).toBe(expectedDomain);

            done();
        });
    });

    it('getting domain details asynchronously gets domain details', function(done) {
        window.MindLinkAddInClient.getDomainDetailsAsync().then((domainName) => {
            expect(domainName).toBe(expectedDomain);

            done();
        });
    });

    it('getting max message length gets max message length', function(done) {
        window.MindLinkAddInClient.getMaxMessageLength(function(maxMessageLength) {
            expect(maxMessageLength).toBe(expectedMaxMessageLength);

            done();
        });
    });

    it('getting max message length asynchronously gets max message length', function(done) {
        window.MindLinkAddInClient.getMaxMessageLengthAsync().then((maxMessageLength) => {
            expect(maxMessageLength).toBe(expectedMaxMessageLength);

            done();
        });
    });

    it('sending message sends message', function(done) {
        window.MindLinkAddInClient.sendMessage('Message 1 - SHOULD BE SENT', false, function() {
            done();
        });
    });

    it('sending message asynchronously sends message', function(done) {
        window.MindLinkAddInClient.sendMessageAsync('Message Async 1 - SHOULD BE SENT', false).then(() => {
            done();
        });
    });

    it('sending message as alert sends message', function(done) {
        window.MindLinkAddInClient.sendMessage('Message 2 - SHOULD BE SENT AS ALERT', true, function() {
            done();
        });
    });

    it('sending long message sends message as story', function(done) {
        window.MindLinkAddInClient.getMaxMessageLength((maxMessageLength) => {
            var message = 'This should come up as a story! First Half Of Message 3' + new Array(maxMessageLength - 'First Half Of Message 3'.length).join('x') + ' Second line of message 3';

            window.MindLinkAddInClient.sendMessage(message, false, () => {
                done();
            });
        });
    });

    it('sending message triggers before message send handler', function(done) {
        var scope = {};

        var handlerInvocationCount = 0;

        attachBeforeMessageSendHandler(function(message) {
            expect(message).toBe('Message 4 - SHOULD BE SENT');
            expect(this).toBe(scope);
            handlerInvocationCount = handlerInvocationCount + 1;
        }, scope);
        
        window.MindLinkAddInClient.sendMessage('Message 4 - SHOULD BE SENT', false, function() {
            expect(handlerInvocationCount).toBe(1);
            done();
        });
    });

    it('returning nothing from before message send handler sends message', function(done) {
        attachBeforeMessageSendHandler(function() {
        }, this);
        
        window.MindLinkAddInClient.sendMessage('Message 5 - SHOULD BE SENT', false, function() {
            done();
        });
    });

    it('returning true from before message send handler does not send message', function(done) {
        attachBeforeMessageSendHandler(function() {
            return true;
        }, this);
        
        window.MindLinkAddInClient.sendMessage('Message 5 - FAIL', false, function() {
            done();
        }, function() {
            expect().toFail('Cancelling message sending should not fail the message.');
        });
    });

    it('returning false from before message send handler sends message', function(done) {
        attachBeforeMessageSendHandler(function() {
            return false;
        }, this);
        
        window.MindLinkAddInClient.sendMessage('Message 5 - SHOULD BE SENT', false, function() {
            done();
        });
    });
});
