export function wait(time: number = 300): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}