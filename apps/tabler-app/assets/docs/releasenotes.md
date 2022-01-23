# v1.5 - Update 1

## Fixes
- Fixed an issue that prevented some Android users from beeing able to create a new user account
- When using the export to adress book feature on Android, firstname was duplicated in middle namne
- Fixed an issue that exported contacts do not contain pictures

# v1.5
- Round Table Family version

# v1.4 - Update 1

## Fixes
- Fixed an issue that specific foreground services were not started on Android. (#150)

# v1.4

## Improvements
- TABLER.APP now speaks Dutch, thanks to [Aart de Boer](tablerworld:/member?id=144504).
- TABLER.APP now speaks Finnish, thanks to [Teemu Keski-Valkama](tablerworld:/member?id=121983).
- TABLER.APP now speaks Icelandic, thanks to [Daníel Sigurður Eðvaldsson](tablerworld:/member?id=128546).
- We now format all phone numbers in international format.
- We now better help you to fill your username in the login screen.
- Basic member export functionality for Android devices. We know it's not complete, still the best we can offer today.
- We now hide areas without clubs for you automatically.
- We now show a little map preview of addresses we know. If the map is not correct, just drop us a note.

## Fixes
- Fixed an issue with cameral roll permissions on Android.
- Fixed an issue in chat conversations, when camera permission have not been granted.
- Fixed some issues with directory data, where board- and boardassistants where no longer members.
- Fixed an issue with address not beeing available.
- Archived members are now gone forever. Farewell!
- Fixed an issue where conversations with past members were not loaded.

---

# v1.2 - Update 2

## Improvements
- Prepare App to add more and dynamic language support. [Help translating?](https://poeditor.com/join/project/yn5eIXR07r)
- Live translation preview for people helping translating the App
- Conversations now shows latest message time
- Changed client geocoding provider to bigdatacloud

## Fixes
- Fixed an issue that prevented locale-based formatting from beeing applied

---

# v1.2 - Update 1 (v1.3)

## Improvements
- You can now login with your TABLER.WORLD email and corresponding password
- The images in conversations can now be transformed on-screen and be exported/shared (resolves #116, #115)
- Images in member and club profiles can now also be zoomed
- Changed unread conversation badge to a circle
- Conversations that you started but never posted a message are now automatically invisible
- Conversations now show last message sent or received
- Nearby members screen now shows country flag beside table name
- Nearby members settings are now preserved if you reinstall/upgrade the App
- You can now also take a picture with your camera during chat conversations

## Fixes

- Removed invalid sectors from companies preventing profiles to load
- Clubs that are in preparation are now visible
- Fixed an issue when loading conversations, where one partner had archived the conversation
- Fixed time format for conversations
- Workaround for camera not always loading in "Exchange Contact Details"
- Fixed an issue on conversations screen, where parts of input where hidden during edit
- Fixed spelling of 'Association' for english language
- Fixed an issue in the news-screens preventing videos to load correctly (fixes #125)
- Fixed an issue that prevents a test-notification from being shown
- Fixed an issue that prevented links in news to be opened a second time (fixes #126)
- Fixed an issue with last opened members not being associated correctly (fixes #128)
- When exporting contacts, the url now correctly display the language

---

# v1.2

## Improvements

- Complete world-wide data from RTI
- Assocation search functionality
- Member screen how shows member count and date joined
- Pushing bottom navigation again scrolls the visible page to top
- Opt-out for birthday notifications
- Replace dark-mode maps on iOS with Apple Maps
- Oppted-in nearby members can now be displayed on a map
- 1:1 chat with other members
- Reworked navigation to give focus on new functionalities

---

# v1.1

## Improvements

- Basic offline support
- Members on club screen now include board, and -assists
- Nearby Members shows other members around you, that are willing to share their location. Get connected!
- Readability of text and html has been optimized for dark theme, #54
- Expandable sections on club page now only prompt for expansion with enough elements
- Favorites now need swipe-right to toggle value
- A scanned member is automatically added to the favorites now
- App now follows iOS 13's appearance. Happy dark mode!

## Fixes

- Some members could not be exported to the phonebook on ios #70
- Sometimes, two-letter text avatars were hidden in member overview
- Settings were not saved, when not settings existed at all #71
- Background jobs could not access JWT tokens #68
- App does not present downloaded documents from TABLER.WORLD #78
- RTI roles were not displayed #76

---

# v1.0.1

## Fixes

- Cascading context menus did not open correctly on Android #56
- New value voluntaryservices for company profiles #55
- Global profile link does not open member card directly #57
- Fixed birthdate formatting on Android #58
- Fixed typos and translations #62

## Improvements

- Sort clubs by name instead of number on search page
- When scanning a tabler-world QR code outside the App, the member's profile is now opened correctly
- Added extended logging to authentication challenge
- Updated texts for permission requests

---

# v1.0

Initial relase

- Members’ directory, and -search
- Club directory
- Favorite your friends, and keep your phone book up-to date
- Never miss a birthday again, we’ll notify you
