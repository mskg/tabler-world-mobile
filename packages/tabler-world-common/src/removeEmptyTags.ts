export const removeEmptyTags = (text: string) => {
    let removed = text.replace(/<[^\/>]+>[ \n\r\t]*<\/[^>]+>/g, '');

    do {
        const newRemoved = removed.replace(/<[^\/>]+>[ \n\r\t]*<\/[^>]+>/g, '');
        if (newRemoved !== removed) {
            removed = newRemoved;
        } else {
            return newRemoved;
        }
        // tslint:disable-next-line: no-constant-condition
    } while (true);
};
