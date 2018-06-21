/* 
 * This enables Add-Ins to work in both GCC and WebChat.
 * GCC inserts the outgoing API into the window.external object. 
 * The problem is that WebChat cannot mimic this API on the window.external object, since it is readonly in IE.
 * Therefore, we need to insert the Add-In API as a different window property. Here we choose "window.addins".
 * In WebChat, the API is inserted into the window as the window.addins object. 
 * In GroupChat Console, the inclusion of this file ensures that calls to window.addins are forwarded to the real window.external object correctly.
 * Add-Ins need to include this file as the first javascript import on the page, and then code against the window.addins object.
 * The method signatures/return types will be identical to those on the GCC window.external API.
 */

// for now, just reference the window.external add-in API directly.
window.addins = window.addins || window.external;