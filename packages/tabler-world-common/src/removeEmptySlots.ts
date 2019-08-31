export const removeEmptySlots = (obj: any) => {
    Object.keys(obj).forEach((key) => {
        if (obj[key] && typeof obj[key] === "object") {
            removeEmptySlots(obj[key]);
        } else if (obj[key] == null || obj[key] === "") {
            delete obj[key];
        }
    });

    return obj;
};
