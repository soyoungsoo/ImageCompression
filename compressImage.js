// 에디터 img 추출 정규식
// let src = content.match(new RegExp('src=\\"data:image\\/([a-zA-Z]*);base64,([^\\"]*)\\"', 'g'));

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

                setCanvas(img, canvas, scaledWidth, scaledHeight);
                let dataUrl;

                try {
                    dataUrl = canvas.toDataURL('image/jpeg');
                } catch (e) {
                    dataUrl = canvas.toDataURL('image/jpeg');
                }
                resolve(dataURItoBlob(dataUrl));
            })
            .catch(reject);
    });
}
function readImage (data) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();

        reader.onerror = reject;

        reader.onload = () => {
            let img = new Image();

            img.onerror = reject;

            img.onload = () => {
                resolve(img);
            };

            img.src = reader.result;
        };
        if(typeof data == "object") {
            reader.readAsDataURL(data);
        } else {
            // data가 파일 객체가 아니라 data uri일 경우
            reader.readAsDataURL(dataURItoBlob(data));
        }
    });
}

function setCanvas(image, canvas, width, height) {
    let srcOrientation = 0;
    let ctx = canvas.getContext("2d");
    EXIF.getData(image, function () {
        srcOrientation = EXIF.getTag(this, "Orientation");
        if (4 < srcOrientation && srcOrientation < 9) {
            canvas.width = height;
            canvas.height = width;
        } else {
            canvas.width = width;
            canvas.height = height;
        }
        // transform context before drawing image
        switch (srcOrientation) {
            // horizontal flip
            case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
            // 180° rotate left
            case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
            // vertical flip
            case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
            // vertical flip + 90 rotate right
            case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
            // 90° rotate right
            case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
            // horizontal flip + 90 rotate right
            case 7: ctx.transform(0, -1, -1, 0, height, width); break;
            // 90° rotate left
            case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
            default: break;
        }
        ctx.drawImage(image, 0, 0, width, height);
    });
}

function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], {type: mimeString});


}
