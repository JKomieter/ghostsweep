export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        fbq: Function;
    }
}

export const pageview = () => {
    window.fbq("track", "PageView");
};

// https://developers.facebook.com/docs/facebook-pixel/advanced/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const event = (name: any, options = {}) => {
    window.fbq("track", name, options);
};