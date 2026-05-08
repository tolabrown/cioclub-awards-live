import {
  StreamVideoClient,
  type Call,
  type StreamVideoParticipant
} from '@stream-io/video-client';

export interface StreamConfig {
  apiKey: string;
  token: string;
  userId: string;
  userName: string;
  callType: string;
  callId: string;
}

/**
 * Reactive Stream State Management Class
 * Handles all video call logic and state management
 */
export class StreamState {
  // Configuration
  private config: StreamConfig;

  // Stream Video State
  client = $state<StreamVideoClient | null>(null);
  call = $state<Call | null>(null);
  participants = $state<StreamVideoParticipant[]>([]);
  isVideoEnabled = $state(true);
  isAudioEnabled = $state(true);
  isScreenSharing = $state(false);
  isFullscreen = $state(false);
  showParticipants = $state(false);
  connectionStatus = $state<'connecting' | 'connected' | 'disconnected'>('connecting');
  error = $state<string | null>(null);

  // Video element management
  private participantsContainer: HTMLDivElement | null = null;
  private videoBindings = new Map<string, Function>();
  private audioBindings = new Map<string, Function>();
  private videoTracking = new Map<string, Function>();

  constructor(config: StreamConfig) {
    this.config = config;
  }

  async initialize() {
    try {
      // Initialize Stream Video Client
      this.client = new StreamVideoClient({
        apiKey: this.config.apiKey,
        token: this.config.token,
        user: {
          id: this.config.userId,
          name: this.config.userName
        }
      });

      // Create/join call
      this.call = this.client.call(this.config.callType, this.config.callId);
      await this.call.join({ create: true });

      this.connectionStatus = 'connected';

      // Enable camera and microphone by default
      await this.call.camera.enable();
      await this.call.microphone.enable();

      // Set up viewport for visibility tracking
      if (this.participantsContainer) {
        this.call.setViewport(this.participantsContainer);
      }

      // Subscribe to participants changes
      this.call.state.participants$.subscribe((newParticipants) => {
        this.participants = newParticipants;

        // Render participants
        newParticipants.forEach((participant) => {
          this.renderParticipant(participant);
        });

        // Clean up stale participants
        this.participantsContainer
          ?.querySelectorAll<HTMLMediaElement>('video, audio')
          .forEach((el) => {
            const sessionId = el.dataset.sessionId!;
            const participant = newParticipants.find((p) => p.sessionId === sessionId);
            if (!participant) {
              this.cleanupParticipant(sessionId);
              el.remove();
            }
          });
      });

      // Subscribe to camera state
      this.call.camera.state.status$.subscribe((status) => {
        this.isVideoEnabled = status === 'enabled';
      });

      // Subscribe to microphone state
      this.call.microphone.state.status$.subscribe((status) => {
        this.isAudioEnabled = status === 'enabled';
      });

      // Subscribe to screen share state
      this.call.screenShare.state.status$.subscribe((status) => {
        this.isScreenSharing = status === 'enabled';
      });
    } catch (err) {
      console.error('Failed to join call:', err);
      this.error = 'Failed to join the video call. Please try again.';
      this.connectionStatus = 'disconnected';
    }
  }

  private renderParticipant(participant: StreamVideoParticipant) {
    if (!this.call || !this.participantsContainer) return;

    this.renderVideo(participant);
    this.renderAudio(participant);
    this.renderScreenShare(participant);
  }

  private renderVideo(participant: StreamVideoParticipant) {
    if (!this.call || !this.participantsContainer) return;

    const id = `video-${participant.sessionId}`;
    let videoEl = document.getElementById(id) as HTMLVideoElement | null;

    if (!videoEl) {
      videoEl = document.createElement('video');
      videoEl.id = id;
      videoEl.dataset.sessionId = participant.sessionId;
      videoEl.autoplay = true;
      videoEl.playsInline = true;
      videoEl.className = 'absolute inset-0 h-full w-full object-cover rounded-lg';

      const container = document.getElementById(`participant-${participant.sessionId}`);
      if (container) {
        container.appendChild(videoEl);
      }

      const untrack = this.call.trackElementVisibility(
        videoEl,
        participant.sessionId,
        'videoTrack'
      );
      if (untrack) {
        this.videoTracking.set(id, untrack);
      }

      const unbind = this.call.bindVideoElement(videoEl, participant.sessionId, 'videoTrack');
      if (unbind) {
        this.videoBindings.set(id, unbind);
      }
    }
  }

  private renderScreenShare(participant: StreamVideoParticipant) {
    if (!this.call || !this.participantsContainer) return;

    const screenShareId = `screenshare-participant-${participant.sessionId}`;
    const hasScreenShare = participant.publishedTracks.includes('screenShareTrack' as any);

    if (hasScreenShare) {
      let screenShareContainer = document.getElementById(screenShareId);

      if (!screenShareContainer) {
        screenShareContainer = document.createElement('div');
        screenShareContainer.id = screenShareId;
        screenShareContainer.className =
          'group relative overflow-hidden rounded-xl bg-card shadow-lg transition-all hover:bg-muted';

        const screenVideoEl = document.createElement('video');
        screenVideoEl.id = `screenshare-video-${participant.sessionId}`;
        screenVideoEl.dataset.sessionId = participant.sessionId;
        screenVideoEl.autoplay = true;
        screenVideoEl.playsInline = true;
        screenVideoEl.className = 'absolute inset-0 h-full w-full object-contain rounded-lg bg-black';

        screenShareContainer.appendChild(screenVideoEl);

        const overlay = document.createElement('div');
        overlay.className =
          'absolute right-0 bottom-0 left-0 bg-gradient-to-t from-background/80 to-transparent p-4';
        overlay.innerHTML = `
          <div class="flex items-center gap-2">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <div>
              <p class="font-bold text-foreground">${this.getParticipantName(participant)}'s screen</p>
              <p class="text-xs text-muted-foreground">Screen sharing</p>
            </div>
          </div>
        `;
        screenShareContainer.appendChild(overlay);
        this.participantsContainer.appendChild(screenShareContainer);

        const unbind = this.call.bindVideoElement(
          screenVideoEl,
          participant.sessionId,
          'screenShareTrack' as any
        );
        if (unbind) {
          this.videoBindings.set(`screenshare-${participant.sessionId}`, unbind);
        }
      }
    } else {
      const screenShareContainer = document.getElementById(screenShareId);
      if (screenShareContainer) {
        const unbind = this.videoBindings.get(`screenshare-${participant.sessionId}`);
        if (unbind) {
          unbind();
          this.videoBindings.delete(`screenshare-${participant.sessionId}`);
        }
        screenShareContainer.remove();
      }
    }
  }

  private renderAudio(participant: StreamVideoParticipant) {
    if (!this.call || !this.participantsContainer || participant.isLocalParticipant) return;

    const id = `audio-${participant.sessionId}`;
    let audioEl = document.getElementById(id) as HTMLAudioElement | null;

    if (!audioEl) {
      audioEl = document.createElement('audio');
      audioEl.id = id;
      audioEl.dataset.sessionId = participant.sessionId;
      audioEl.autoplay = true;
      this.participantsContainer.appendChild(audioEl);

      const unbind = this.call.bindAudioElement(audioEl, participant.sessionId);
      if (unbind) {
        this.audioBindings.set(id, unbind);
      }
    }
  }

  private cleanupParticipant(sessionId: string) {
    const unbindVideo = this.videoBindings.get(`video-${sessionId}`);
    if (unbindVideo) {
      unbindVideo();
      this.videoBindings.delete(`video-${sessionId}`);
    }

    const untrackVideo = this.videoTracking.get(`video-${sessionId}`);
    if (untrackVideo) {
      untrackVideo();
      this.videoTracking.delete(`video-${sessionId}`);
    }

    const unbindAudio = this.audioBindings.get(`audio-${sessionId}`);
    if (unbindAudio) {
      unbindAudio();
      this.audioBindings.delete(`audio-${sessionId}`);
    }

    const unbindScreenShare = this.videoBindings.get(`screenshare-${sessionId}`);
    if (unbindScreenShare) {
      unbindScreenShare();
      this.videoBindings.delete(`screenshare-${sessionId}`);
    }

    const screenShareContainer = document.getElementById(`screenshare-participant-${sessionId}`);
    if (screenShareContainer) {
      screenShareContainer.remove();
    }
  }

  // Public Methods
  async toggleVideo() {
    if (!this.call) return;
    await this.call.camera.toggle();
  }

  async toggleAudio() {
    if (!this.call) return;
    await this.call.microphone.toggle();
  }

  async toggleScreenShare() {
    if (!this.call) return;

    try {
      if (this.isScreenSharing) {
        await this.call.screenShare.disable();
      } else {
        await this.call.screenShare.enable();
      }
    } catch (err) {
      console.error('Screen share error:', err);
    }
  }

  async leaveCall() {
    await this.call?.leave();
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      this.isFullscreen = true;
    } else {
      document.exitFullscreen();
      this.isFullscreen = false;
    }
  }

  getParticipantName(participant: StreamVideoParticipant): string {
    return participant.name || participant.userId || 'Unknown';
  }

  setParticipantsContainer(container: HTMLDivElement) {
    this.participantsContainer = container;
    if (this.call && container) {
      this.call.setViewport(container);
    }
  }

  toggleParticipantsPanel() {
    this.showParticipants = !this.showParticipants;
  }

  // Cleanup
  destroy() {
    this.participants.forEach((p) => this.cleanupParticipant(p.sessionId));
    this.call?.leave();
    this.client?.disconnectUser();
  }
}
