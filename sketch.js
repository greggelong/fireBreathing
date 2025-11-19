let video;
let bodyPose;
let poses = [];

let dnose = []; // store nose trail
let dnoseMirror = []; // store mirrored trail

let pg; // graphics layer
let pgMirror; // mirror graphics
let cnv;

function preload() {
  bodyPose = ml5.bodyPose({ flipped: true });
}

function setup() {
  cnv = createCanvas(640, 480);
  let cx = (windowWidth - cnv.width) / 2;
  let cy = (windowHeight - cnv.height) / 2;
  cnv.position(cx, cy);
  pixelDensity(1);

  video = createCapture(VIDEO, { flipped: true });
  video.size(640, 480);
  video.hide();

  // graphics layers
  pg = createGraphics(640, 480);
  pgMirror = createGraphics(640, 480);

  bodyPose.detectStart(video, gotPoses);
}

function draw() {
  image(video, 0, 0, width, height);

  if (poses.length > 0) {
    let nose = poses[0].keypoints[0]; // nose index = 0

    if (nose.confidence > 0.1) {
      // Store original trail point
      dnose.unshift(createVector(nose.x, nose.y));
      dnoseMirror.unshift(createVector(width - nose.x, nose.y));

      // limit length
      if (dnose.length > 300) dnose.pop();
      if (dnoseMirror.length > 300) dnoseMirror.pop();

      // ----- draw original trail -----
      pg.clear();
      pg.noFill();
      for (let i = 1; i < dnose.length; i++) {
        let v1 = dnose[i - 1];
        let v2 = dnose[i];
        // pulsating stroke weight
        let sw = map(sin(frameCount * 0.2 + i * 0.1), -1, 1, 5, 15);
        pg.strokeWeight(sw);
        pg.stroke(255, 0, 0, map(i, 0, dnose.length, 255, 50)); // fade tail
        pg.line(v1.x, v1.y, v2.x, v2.y);
      }

      // ----- draw mirrored trail -----
      pgMirror.clear();
      pgMirror.noFill();
      for (let i = 1; i < dnoseMirror.length; i++) {
        let v1 = dnoseMirror[i - 1];
        let v2 = dnoseMirror[i];
        // pulsating stroke weight
        let sw = map(sin(frameCount * 0.2 + i * 0.1), -1, 1, 5, 15);
        pgMirror.strokeWeight(sw);
        pgMirror.stroke(255, 0, 0, map(i, 0, dnoseMirror.length, 255, 50)); // fade tail
        pgMirror.line(v1.x, v1.y, v2.x, v2.y);
      }

      // draw the nose dot (unmirrored)
      fill(255, 0, 0);
      noStroke();
      circle(nose.x, nose.y, 20);
    }
  }

  // draw both trail layers
  image(pg, 0, 0);
  image(pgMirror, 0, 0);
}

function gotPoses(results) {
  poses = results;
}
