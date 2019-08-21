export const removeNulls = (obj: any) => {
    Object.keys(obj).forEach(key => {
        if (obj[key] && typeof obj[key] === 'object') {
            removeNulls(obj[key]);
        }
        else if (obj[key] == null || obj[key] === "") {
            delete obj[key];
        }
    });

    return obj;
};
