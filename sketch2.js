let video;
let bodyPose;
let poses = [];

let dnose = [];
let dnoseMirror = [];

let pg;

const camW = 640;
const camH = 480;

function preload() {
  bodyPose = ml5.bodyPose({ flipped: true });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  video = createCapture(VIDEO, { flipped: true });
  video.size(camW, camH);
  video.hide();

  // single graphics layer
  pg = createGraphics(camW, camH);

  bodyPose.detectStart(video, gotPoses);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);

  // draw webcam scaled to fullscreen
  image(video, 0, 0, width, height);

  if (poses.length > 0) {
    let nose = poses[0].keypoints[0];

    if (nose.confidence > 0.1) {
      // add nose points to trails
      dnose.unshift(createVector(nose.x, nose.y));
      dnoseMirror.unshift(createVector(camW - nose.x, nose.y));

      if (dnose.length > 300) dnose.pop();
      if (dnoseMirror.length > 300) dnoseMirror.pop();

      // draw both trails in ONE pg
      pg.clear();
      pg.noFill();

      // ---- original trail ----
      for (let i = 1; i < dnose.length; i++) {
        let v1 = dnose[i - 1];
        let v2 = dnose[i];
        let sw = map(sin(frameCount * 0.2 + i * 0.1), -1, 1, 5, 15);
        pg.strokeWeight(sw);
        pg.stroke(255, 0, 0, map(i, 0, dnose.length, 255, 50));
        pg.line(v1.x, v1.y, v2.x, v2.y);
      }

      // ---- mirrored trail ----
      for (let i = 1; i < dnoseMirror.length; i++) {
        let v1 = dnoseMirror[i - 1];
        let v2 = dnoseMirror[i];
        let sw = map(sin(frameCount * 0.2 + i * 0.1), -1, 1, 5, 15);
        pg.strokeWeight(sw);
        pg.stroke(255, 0, 0, map(i, 0, dnoseMirror.length, 255, 50));
        pg.line(v1.x, v1.y, v2.x, v2.y);
      }

      // nose dot
      pg.noStroke();
      pg.fill(255, 0, 0);
      pg.circle(nose.x, nose.y, 20);
    }
  }

  // draw trails scaled to fullscreen
  image(pg, 0, 0, width, height);
}

function gotPoses(results) {
  poses = results;
}
