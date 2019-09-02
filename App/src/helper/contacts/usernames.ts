let __indexOf = [].indexOf || function (item) { for (let i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

export const facebook = function (profile_url) {
    let matches;
    matches = profile_url.match(/^(?:https?:\/\/)?(?:(?:www\.)|(?:[a-z]{2}-[a-z]{2}\.))?facebook\.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*?(?:\/)?(\d*[^0-9/?]+\d*)\/?$/i);
    if ((matches != null) && matches.length === 2 && (matches[1] != null) && matches[1].length >= 5 && matches[1].length <= 50) {
      return matches[1];
  } 
    return null;
  
};

export const twitter = function (profile_url) {
    let matches;
    matches = profile_url.match(/^(?:https?:\/\/)?(?:www\.)?twitter\.com\/(?:#!\/)?@?([a-z0-9_]+)(?:\/\w+)*$/i);
    if ((matches != null) && matches.length === 2 && (matches[1] != null) && matches[1].length >= 1 && matches[1].length <= 15) {
      return matches[1];
  } 
    return null;
  
};

export const google = function (profile_url) {
    let matches;
    matches = profile_url.match(/^(?:https?:\/\/)?plus\.google\.com\/(?:.?\/)?(?:.?\/)?\+([^/]+)(?:\/\w+)*$/i);
    if ((matches != null) && matches.length === 2 && (matches[1] != null) && matches[1].length >= 1 && matches[1].length <= 15) {
      return matches[1];
  } 
    return null;
  
};

export const github = function (profile_url) {
    let blacklist, matches, _ref;
    matches = profile_url.match(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([^\-][a-z0-9\-]*)(?:\/\w*)?$/i);
    blacklist = ['c', 'blog', 'explore', 'features', 'notifications', 'settings', 'terms', 'site', 'security', 'contact', 'about', 'login', 'join'];
    if ((matches != null) && matches.length === 2 && (matches[1] != null) && matches[1].length >= 1 && matches[1].length <= 39 && (_ref = matches[1], __indexOf.call(blacklist, _ref) < 0)) {
      return matches[1];
  } 
    return null;
  
};

export const linkedin = function (profile_url) {
    let matches;
    matches = profile_url.match(/^(?:https?:\/\/)?(?:(?:www|\w\w)\.)?linkedin.com\/(?:(?:pub\/|in\/)([\w\-]+))/i);
    if ((matches != null) && matches.length === 2 && (matches[1] != null) && matches[1].length >= 5 && matches[1].length <= 30) {
      return matches[1];
  } 
    return null;
  
};

export const instagram = function (profile_url) {
    let matches;
    matches = profile_url.match(/^(?:https?:\/\/)?(?:(?:www|\w\w)\.)?instagram.com\/(?:(?:pub\/|in\/)([\w\-]+))/i);
    if ((matches != null) && matches.length === 2 && (matches[1] != null) && matches[1].length >= 5 && matches[1].length <= 30) {
      return matches[1];
  } 
    return null;
  
};
