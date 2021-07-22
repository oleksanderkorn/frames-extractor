export const extractFramesFromVideo = (videoUrl, fps, rowSize) => {
    return new Promise(async(resolve) => {

        // fully download it first (no buffering):
        let videoBlob = await fetch(videoUrl).then(r => r.blob());
        let videoObjectUrl = URL.createObjectURL(videoBlob);
        let video = document.createElement("video");

        let seekResolve;
        video.addEventListener('seeked', async function() {
            if (seekResolve) seekResolve();
        });

        video.src = videoObjectUrl;

        // workaround chromium metadata bug (https://stackoverflow.com/q/38062864/993683)
        while ((video.duration === Infinity || isNaN(video.duration)) && video.readyState < 2) {
            await new Promise(r => setTimeout(r, 1000));
            video.currentTime = 10000000 * Math.random();
        }
        let duration = video.duration;

        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');
        let [w, h] = [video.videoWidth, video.videoHeight]
        const thumbWidth = w / 5;
        const thumbHeight = h / 5;
        const maxLine = 4

        canvas.width = thumbWidth * rowSize;
        canvas.height = thumbHeight * maxLine;

        let interval = 1 / fps;
        let currentTime = 0;

        const elementsPerLine = rowSize

        let currentPosition = 0
        let currentLine = 0
        let dx = 0
        let dy = 0

        let thumbnails = []


        while (currentTime < duration) {
            video.currentTime = currentTime;
            // TODO fix and rewrite to ts
            // eslint-disable-next-line 
            await new Promise(r => seekResolve = r);

            context.drawImage(video, dx, dy, thumbWidth, thumbHeight);
            console.log(`time[${currentTime}] image [${thumbnails.length}] line[${currentLine}] x[${dx}] y[${dy}] w[${canvas.width}] h[${canvas.height}]`)

            if (currentPosition < elementsPerLine - 1) {
                dx += thumbWidth
                currentPosition += 1;
            } else {
                dx = 0
                dy += thumbHeight
                currentPosition = 0
                currentLine += 1
            }
            if (currentLine === maxLine) {
                currentLine = 0
                console.log('push full image')
                thumbnails.push(canvas.toDataURL())
                context.clearRect(0, 0, canvas.width, canvas.height);
                dx = 0
                dy = 0
            } else if (currentTime + interval >= duration) {
                console.log('push last image')
                thumbnails.push(canvas.toDataURL())
            }
            currentTime += interval;
        }
        resolve(thumbnails);
    });
};