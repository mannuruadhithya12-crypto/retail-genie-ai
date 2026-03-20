import type { Pose, Results } from '@mediapipe/pose';

export class PoseTrackingEngine {
  private pose: Pose;
  private camera: any = null;
  private isRunning: boolean = false;

  constructor(onResults: (results: Results) => void) {
    let PoseClass = typeof window !== 'undefined' ? (window as any).Pose : null;
    
    if (!PoseClass && typeof window !== 'undefined') {
      require('@mediapipe/pose');
      const posePkg = require('@mediapipe/pose');
      PoseClass = (window as any).Pose || posePkg.Pose || posePkg.default?.Pose;
    }

    if (!PoseClass) {
      this.pose = {} as Pose;
      return;
    }

    this.pose = new PoseClass({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
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

  public async start(videoElement: HTMLVideoElement, onError?: (err: unknown) => void) {
    try {
      this.isRunning = true;
      
      if (typeof window !== 'undefined' && !(window as any).Camera) {
        require('@mediapipe/camera_utils');
      }
      
      let CameraClass = (window as any).Camera;
      if (!CameraClass) {
        // Fallback for some bundle environments
        const camUtils = require('@mediapipe/camera_utils');
        CameraClass = camUtils.Camera || camUtils.default?.Camera;
      }
      
      if (!CameraClass) {
        throw new Error('MediaPipe Camera could not be loaded.');
      }

      this.camera = new CameraClass(videoElement, {
        onFrame: async () => {
          if (this.isRunning) {
            await this.pose.send({ image: videoElement }).catch(console.error);
          }
        },
        width: 640,
        height: 480,
      });
      await this.camera.start();
    } catch (err) {
      if (onError) onError(err);
    }
  }

  public stop() {
    this.isRunning = false;
    if (this.camera) {
      this.camera.stop();
    }
    if (this.pose && typeof this.pose.close === 'function') {
      this.pose.close();
    }
  }
}

