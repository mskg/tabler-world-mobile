# v0.7
Beta build, for internal testing only

# Improvements
- LRU display for last opened member
- German translation
- Social media profiles for members

# Fixes
- Tabler e-mail not displayed
- Android formatting

## Operations
- GraphQL Backend
- Fully differential API
- Bumped Expo XDK
- bgbouncer for database connections
- GraphQL query caching
- maxage for data

# v0.6
Beta build, for internal testing only.

# Improvements
- Redesign of member screen
- Export single contact functionality

## Operations
- Upraded infrastructure to CloudFormation deployments

# v0.5
Beta build, for internal testing only.

# Improvements
- Simplified menu, removed obsolete navigation entries to tabler-world
- First draft of table structure display

# Fixes
- Empty adresses don't render empty blocks #12


# v0.4
Beta build, for internal testing only.

## Improvements
- Faster scrolling for full contacts list
- Display filter tags for search
- Adjust height of elements for larger tag lists

## Fixes
- Members page crashed when adjusting filters
- Images were not updated when scrolling fast
- Scheme changes were not propagated
- Birthday notifications

## Operations
- Auditing of user actions

# v0.3
Beta build, for internal testing only.

## Improvements
- Now available, phone numbers, and secondary e-mail adresses
- Search is now word based: Mar Kli matches any records that match Mar and Kli together, independent of the order of ocurence

## Operations
- Synchronization of removals
- 1h update against RTD database

# v0.2
Beta build, for internal testing only.

## New
- Local notifications for favorites, and own tables birthdays

## Improvements
- Token is removed, if user logs out
- Buttons on logon screen now correctly handle resizing
- Show loading animation
- Links to profiles now show correct profile
- Larger download batches (500)

## Fixes
- Token is not pushed if user not logged in
- Initial state shows loading without a request been initiated
- Birthdate not shown on profile page
- Tabler state not persisted
- Keyboard is not dismissed in search screen
- Ordering of jumbar for non letter, and special characters is now correct
- Changed ordering of tables, and districts to #
- Sort and display order settings are now saved correctly

## Operations
- Automated deployments to Google play and Apple Appstore
- Better separation of encrypted/non-encrypted content
- Wait for startup before Sagas launch
- Reorganization of size properties
- Reorganization of project structure
- Add throtteling for write
- Optimizte modified processing

# v0.1
Beta build, for internal testing only.

## New
- Legal aspects and release notes are now shown in the settings menu
- German translation
- Dark/night mode

## Improvements
- Contact information is now encrypted locally
- Authentication e-mail now contains clickable app deep-link with token
- Filter page redesign

## Fixes
- Search now correctly replaces and escapes äöü and other special characters

## Operations
- Moved released app to release channels beta/prod
- Better bundling and resolving of cached assets
- Preparation for push notifications
