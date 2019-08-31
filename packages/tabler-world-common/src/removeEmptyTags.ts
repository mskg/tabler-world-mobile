export const removeEmptyTags = (text: string) => {
    let removed = text.replace(/<[^\/>]+>[ \n\r\t]*<\/[^>]+>/g, "");

    // tslint:disable-next-line: no-constant-condition
    do {
        const newRemoved = removed.replace(/<[^\/>]+>[ \n\r\t]*<\/[^>]+>/g, "");
        if (newRemoved !== removed) {
            removed = newRemoved;
        } else {
            return newRemoved;
        }
    } while (true);
};
