# v0.9

## Fixes
- Show correct loading indicator on members page
- Removal of data now forces screen refresh, fixes #2
- Cache invalidation now triggers rendercylce asynchronous
- Show own table now shows correct data, fixes #1
- Club page no longer shows honory members as members, fixes #8

## Improvements
- Removed WhoAmI state, resolves #11
- Reworked loading animation for members in clubs screen
- Pictures on member/club page can now be "zoomed"

## Operations
- Reworked deployment
- Enlarged memory size of GraphQL functions to 256MB
- Server side caching
- Auditing enabled for new screens

# v0.8
Beta build, for internal testing only

# Improvements
- Show error page, and retry operations on network failures
- Show club/member screens with available offline data, only
- Less flickering on Android for avatar animations, fixes #43

# Fixes
- NPE in area page
- Permissions for contacts on Android, fixes #41

## Operations
- Check email before token creation, resolves #44

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
