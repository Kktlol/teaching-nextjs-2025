import { createContext } from "react";

export interface Song {
  id: number;
  name: string;
  author: string;
  duration: number;
}

interface PlaybackContextState {
  queue: Song[];
  isPlaying: boolean;
  progress: number;
  isShuffled: boolean;
  isRepeatOn: boolean;
  currentSong: Song | null;
  togglePlayback: () => void;
  seekTo: (newProgress: number) => void;
  handleNext: () => void;
  handleBack: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

export const PlaybackContext = createContext<PlaybackContextState>({
  queue: [],
  isPlaying: false,
  progress: 0,
  isShuffled: false,
  isRepeatOn: false,
  currentSong: null,
  togglePlayback: () => {},
  seekTo: () => {},
  handleNext: () => {},
  handleBack: () => {},
  toggleShuffle: () => {},
  toggleRepeat: () => {},
});
