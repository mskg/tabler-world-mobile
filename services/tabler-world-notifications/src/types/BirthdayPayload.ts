export type BirthdayPayload = {
    title: string;
    body: string;
    reason: "birthday";
    payload: {
        userid: number;
        date: Date;
        id: number;
    };
};
