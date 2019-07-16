# v0.9 RC8
Release candidate.

## Improvements
- Shake to report a problem
- Filters for association board and -assists
- Move login buttons with when KeyBoard is visible

## Fixes
- Toggeling favorites does not immediately update members view
- LRU members section is shown even with 0 entries
- Hide roles section on profile page if there are no entries in the list
- Updated external licenses MD
- Added about page to legal
- Added screenfactor for iPad devices that roles break correctly

## Operations
- Moved from writethrough to active cache updates

# v0.9 RC7
Beta build, for internal testing only

## Improvements
- Demonstration mode

# v0.9 RC6
Beta build, for internal testing only

## Improvements
- Experimental implementationn of Albums

## Operations
- Optimized caching for lists

# v0.9 RC1..5
Beta build, for internal testing only

## Fixes
- Show correct loading indicator on members page
- Removal of data now forces screen refresh, fixes #2
- Cache invalidation now triggers rendercylce asynchronous
- Show own table now shows correct data, fixes #1
- Club page no longer shows honory members as members, fixes #8
- Removed null value from favorites
- Removed // from tel url, fixes #20
- Workarrounds for Android behavior of text selection, resolves #21
- Fixed cache invalidation not resolving local data
- Removed entries with no RT email, fixes #33
- Empty countrycode produces empty export dialog, fixes #32
- Fixed async bootstrapping behavior of analytics
- Fixed analytics not accepting non-string values
- Fixed graphql TTL times beeing minutes, not hours

## Improvements
- Removed WhoAmI state, resolves #11
- Reworked loading animation for members in clubs screen
- Pictures on member/club page can now be "zoomed"
- Favorites are restored from cloud after relogin, reinstallation, resolves #10
- Reworked filtering and authentication via lambda, resolves #19
- Local data is now based on members filter (no area, local table and favorites by default)
- Allow retry in case of fetch errors on detail pages (member, club)
- Optimized local caching for favorites, and club members
- Harmonized analytics API

## Operations
- Reworked deployment
- Enlarged memory size of GraphQL functions to 256MB
- Server side caching
- Auditing enabled for new screens
- Custom domain and certificates for api
- Enforced rate limiting
- Removed schema introspection from production
- Removed double pooling in favor of pgbouncer
- X-Ray tracing for backend(s)
- Switched Analytics from Cognito to Amplitude
- Added approval gates for VSTS deployment

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
