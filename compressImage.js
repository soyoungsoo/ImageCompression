function compressImage (data) {
    if (data.type === 'image/gif') {
        return data;
    }
    return new Promise((resolve, reject) => {
        readImage(data)
            .then(img => {
                let canvas = document.createElement('canvas');
                let scale = Math.min(1, Math.sqrt((1024 * 1024) / (img.width * img.height)));
                let scaledWidth = parseInt(img.width * scale);
                let scaledHeight = parseInt(img.height * scale);

                let ctx = canvas.getContext("2d");
                let srcOrientation = 0;

                EXIF.getData(img, function () {
                    srcOrientation = EXIF.getTag(this, "Orientation");
                });
                // set proper canvas dimensions before transform & export
                if (4 < srcOrientation && srcOrientation < 9) {
                    canvas.width = scaledHeight;
                    canvas.height = scaledWidth;
                } else {
                    canvas.width = scaledWidth;
                    canvas.height = scaledHeight;
                }

                // transform context before drawing image
                switch (srcOrientation) {
                    // horizontal flip
                    case 2: ctx.transform(-1, 0, 0, 1, scaledWidth, 0); break;
                    // 180° rotate left
                    case 3: ctx.transform(-1, 0, 0, -1, scaledWidth, scaledHeight); break;
                    // vertical flip
                    case 4: ctx.transform(1, 0, 0, -1, 0, scaledHeight); break;
                    // vertical flip + 90 rotate right
                    case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
                    // 90° rotate right
                    case 6: ctx.transform(0, 1, -1, 0, scaledHeight, 0); break;
                    // horizontal flip + 90 rotate right
                    case 7: ctx.transform(0, -1, -1, 0, scaledHeight, scaledWidth); break;
                    // 90° rotate left
                    case 8: ctx.transform(0, -1, 1, 0, 0, scaledWidth); break;
                    default: break;
                }

                ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
                let dataUrl;

                console.log(ctx);
                try {
                    dataUrl = canvas.toDataURL('image/jpeg');
                } catch (e) {
                    dataUrl = canvas.toDataURL('image/jpeg');
                }
                resolve(dataURItoBlob(dataUrl));
                console.log(dataURItoBlob(dataUrl));
            })
            .catch(reject);
    });
}
