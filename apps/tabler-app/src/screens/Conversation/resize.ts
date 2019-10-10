
type Dimensions = {
    width: number,
    height: number,
};

export function resize(original: Dimensions, desiredWidth: number = 100, desiredHeight: number = 100): Dimensions {
    // image fits in bounding box, keep size (center with css) If we made it bigger it would stretch the image resulting in loss of quality.
    if (original.width < desiredWidth && original.height
        < desiredHeight) {
        return original;
    }

    // check for double squares
    if (original.width === original.height
        && desiredWidth === desiredHeight) {
        // image and bounding box are square, no need to calculate aspects, just size it
        // with the bounding box
        return { width: desiredWidth, height: desiredHeight };
    }

    // check original image is square
    if (original.width === original.height
    ) {
        // image is square, bounding box isn't. Get smallest side of bounding box and resize to a square
        // of that center the image vertically and horizontally with Css there will be space on one side.
        const smallSide = Math.min(desiredWidth, desiredHeight);
        return { width: smallSide, height: smallSide };
    }

    // image is wider and taller than bounding box
    if (original.width > desiredWidth && original.height > desiredHeight) {
        // two dimensions so figure out which bounding box dimension is the smallest and which original
        // image dimension is the smallest, already knoriginal.Width original image is larger than bounding box
        const r = Math.min(desiredWidth, desiredHeight) / Math.min(original.width, original.height);
        const nH = original.height * r;
        const nW = original.width * r;

        return { width: nW, height: nH };
    }

    // image is wider than bounding box
    if (original.width > desiredWidth) {
        // one dimension (width) so calculate the aspect ratio between the bounding box width and original image width
        const r = desiredWidth / original.width;
        const nW = original.width * r;
        const nH = original.height * r;

        return { width: nW, height: nH };
    }
    {
        // original image is taller than bounding box
        const r = desiredHeight / original.height;
        const nH = original.height * r;
        const nW = original.width * r;

        return { width: nW, height: nH };
    }
}
