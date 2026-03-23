"use client";

import { useCallback, useEffect, useState } from "react";
import { PlaybackContext, Song } from "./playback-context";
import {
  recordPlaybackEnd,
  recordPlaybackSkip,
} from "@/actions/playback_events";

interface PlaybackStatus {
  queue: Song[];
  currentSongIndex: number;
  isPlaying: boolean;
  progress: number;
  playbackStart: {
    timestamp: number;
    progressAtStart: number;
  } | null;
  isShuffled: boolean;
  shuffleOrder: number[];
  shufflePosition: number;
}

function shuffleIndices(length: number, excludeIndex: number): number[] {
  const indices: number[] = [];
  for (let i = 0; i < length; i++) {
    if (i !== excludeIndex) {
      indices.push(i);
    }
  }
  for (let i = 0; i < indices.length * 3; i++) {
    const a = Math.floor(Math.random() * indices.length);
    const b = Math.floor(Math.random() * indices.length);
    [indices[a], indices[b]] = [indices[b], indices[a]];
  }
  return [excludeIndex, ...indices];
}

function handleNextPlaybackStatus(prev: PlaybackStatus): PlaybackStatus {
  if (prev.isShuffled) {
    const isLast = prev.shufflePosition >= prev.shuffleOrder.length - 1;
    if (isLast) {
      return { ...prev, isPlaying: false, playbackStart: null };
    }
    const newShufflePosition = prev.shufflePosition + 1;
    return {
      ...prev,
      shufflePosition: newShufflePosition,
      currentSongIndex: prev.shuffleOrder[newShufflePosition],
      progress: 0,
      isPlaying: true,
      playbackStart: { timestamp: Date.now(), progressAtStart: 0 },
    };
  }

  const isLastSong = prev.currentSongIndex >= prev.queue.length - 1;

  if (isLastSong) {
    return { ...prev, isPlaying: false, playbackStart: null };
  }

  return {
    ...prev,
    currentSongIndex: prev.currentSongIndex + 1,
    progress: 0,
    isPlaying: true,
    playbackStart: { timestamp: Date.now(), progressAtStart: 0 },
  };
}

function handleBackPlaybackStatus(prev: PlaybackStatus): PlaybackStatus {
  if (prev.progress > 5) {
    return {
      ...prev,
      progress: 0,
      playbackStart: prev.isPlaying
        ? { timestamp: Date.now(), progressAtStart: 0 }
        : null,
    };
  }

  if (prev.isShuffled) {
    const isFirst = prev.shufflePosition <= 0;
    if (isFirst) {
      return {
        ...prev,
        progress: 0,
        playbackStart: prev.isPlaying
          ? { timestamp: Date.now(), progressAtStart: 0 }
          : null,
      };
    }
    const newShufflePosition = prev.shufflePosition - 1;
    return {
      ...prev,
      shufflePosition: newShufflePosition,
      currentSongIndex: prev.shuffleOrder[newShufflePosition],
      progress: 0,
      isPlaying: true,
      playbackStart: { timestamp: Date.now(), progressAtStart: 0 },
    };
  }

  const isFirstSong = prev.currentSongIndex <= 0;

  if (isFirstSong) {
    return {
      ...prev,
      progress: 0,
      playbackStart: prev.isPlaying
        ? { timestamp: Date.now(), progressAtStart: 0 }
        : null,
    };
  }

  return {
    ...prev,
    currentSongIndex: prev.currentSongIndex - 1,
    progress: 0,
    isPlaying: true,
    playbackStart: { timestamp: Date.now(), progressAtStart: 0 },
  };
}

export function PlaybackContextProvider({
  children,
  initialSongs,
}: Readonly<{
  children: React.ReactNode;
  initialSongs: Song[];
}>) {
  const [dummy, setDummy] = useState(5);
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>({
    queue: initialSongs,
    currentSongIndex: 0,
    isPlaying: false,
    progress: 0,
    playbackStart: null,
    isShuffled: false,
    shuffleOrder: [],
    shufflePosition: 0,
  });

  const { isPlaying, progress, isShuffled, queue, playbackStart } =
    playbackStatus;
  const currentSong = queue.at(playbackStatus.currentSongIndex);

  const handleNext = useCallback(() => {
    if (currentSong && playbackStatus.progress < currentSong.duration) {
      recordPlaybackSkip(currentSong.id);
    }
    setPlaybackStatus((prev) => handleNextPlaybackStatus(prev));
  }, [currentSong, playbackStatus.progress, setPlaybackStatus]);
  const handleBack = useCallback(() => {
    setPlaybackStatus((prev) => handleBackPlaybackStatus(prev));
  }, [setPlaybackStatus]);

  useEffect(() => {
    if (!isPlaying || currentSong == null || playbackStart == null) return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - playbackStart.timestamp) / 1000;
      const newProgress = playbackStart.progressAtStart + elapsed;

      if (newProgress >= currentSong.duration) {
        recordPlaybackEnd(currentSong.id);
        handleNext();
      } else {
        setPlaybackStatus((prev) => ({ ...prev, progress: newProgress }));
      }
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [isPlaying, currentSong, playbackStart, handleNext]);

  return (
    <PlaybackContext
      value={{
        isPlaying: isPlaying,
        progress: progress,
        isShuffled: isShuffled,
        currentSong: currentSong ?? null,
        togglePlayback: () => {
          setPlaybackStatus((prev) =>
            prev.isPlaying
              ? {
                  ...prev,
                  isPlaying: false,
                  playbackStart: null,
                }
              : {
                  ...prev,
                  isPlaying: true,
                  playbackStart: {
                    timestamp: Date.now(),
                    progressAtStart: prev.progress,
                  },
                },
          );
        },
        seekTo: (newProgress: number) => {
          setPlaybackStatus((prev) => ({
            ...prev,
            progress: newProgress,
            playbackStart: prev.isPlaying
              ? { timestamp: Date.now(), progressAtStart: newProgress }
              : null,
          }));
        },
        handleNext,
        handleBack,
        toggleShuffle: () => {
          setPlaybackStatus((prev) => {
            if (prev.isShuffled) {
              return {
                ...prev,
                isShuffled: false,
                shuffleOrder: [],
                shufflePosition: 0,
              };
            }

            const newShuffleOrder = shuffleIndices(
              prev.queue.length,
              prev.currentSongIndex,
            );
            return {
              ...prev,
              isShuffled: true,
              shuffleOrder: newShuffleOrder,
              shufflePosition: 0,
            };
          });
        },
        // Dummy
        dummy,
        setDummy,
      }}
    >
      {children}
    </PlaybackContext>
  );
}
