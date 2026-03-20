import { Pose, Results } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';

export class PoseTrackingEngine {
  private pose: Pose;
  private camera: Camera | null = null;

  constructor(onResults: (results: Results) => void) {
    this.pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    this.pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: true,
      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    this.pose.onResults(onResults);
  }

  public start(videoElement: HTMLVideoElement) {
    this.camera = new Camera(videoElement, {
      onFrame: async () => {
        await this.pose.send({ image: videoElement });
      },
      width: 640,
      height: 480,
    });
    this.camera.start();
  }

  public stop() {
    if (this.camera) {
      this.camera.stop();
    }
  }
}
