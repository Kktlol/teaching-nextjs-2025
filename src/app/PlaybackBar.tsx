"use client";

import { useEffect, useState } from "react";
import { LikeSongButton } from "@/components/LikeSongButton";
import { AddSongToPlaylistButton } from "@/app/album/[id]/AddSongToPlaylistButton";

interface Song {
  id: number;
  name: string;
  author: string;
  duration: number;
}

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

function formatDuration(duration: number): string {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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

export function PlaybackBar(props: {
  initialSongs: Song[];
  likedSongIds: number[];
  playlists: { id: number; name: string }[];
}) {
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>({
    queue: props.initialSongs,
    currentSongIndex: 0,
    isPlaying: false,
    progress: 0,
    playbackStart: null,
    isShuffled: false,
    shuffleOrder: [],
    shufflePosition: 0,
  });

  const { isPlaying, progress, playbackStart, isShuffled } = playbackStatus;
  const currentSong = playbackStatus.queue.at(playbackStatus.currentSongIndex);

  function startPlayback() {
    setPlaybackStatus(prev => ({ ...prev, isPlaying: true, playbackStart: { timestamp: Date.now(), progressAtStart: progress } }));
  }

  function pausePlayback() {
    setPlaybackStatus(prev => ({ ...prev, isPlaying: false, playbackStart: null }));
  }

  function seekTo(newProgress: number) {
    setPlaybackStatus(prev => ({ ...prev, progress: newProgress, playbackStart: prev.isPlaying ? { timestamp: Date.now(), progressAtStart: newProgress } : null }));
  }

  function togglePlayback() {
    if (isPlaying) {
      pausePlayback();
    } else {
      startPlayback();
    }
  }

  function toggleShuffle() {
    setPlaybackStatus(prev => {
      if (prev.isShuffled) {
        return {
          ...prev,
          isShuffled: false,
          shuffleOrder: [],
          shufflePosition: 0,
        };
      }

      const newShuffleOrder = shuffleIndices(prev.queue.length, prev.currentSongIndex);
      return {
        ...prev,
        isShuffled: true,
        shuffleOrder: newShuffleOrder,
        shufflePosition: 0,
      };
    });
  }

  function handleNext() {
    setPlaybackStatus(prev => {
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

      return { ...prev, currentSongIndex: prev.currentSongIndex + 1, progress: 0, isPlaying: true, playbackStart: { timestamp: Date.now(), progressAtStart: 0 } };
    });
  }

  function handleBack() {
    setPlaybackStatus(prev => {
      if (prev.progress > 5) {
        return { ...prev, progress: 0, playbackStart: prev.isPlaying ? { timestamp: Date.now(), progressAtStart: 0 } : null }
      }

      if (prev.isShuffled) {
        const isFirst = prev.shufflePosition <= 0;
        if (isFirst) {
          return { ...prev, progress: 0, playbackStart: prev.isPlaying ? { timestamp: Date.now(), progressAtStart: 0 } : null }
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
        return { ...prev, progress: 0, playbackStart: prev.isPlaying ? { timestamp: Date.now(), progressAtStart: 0 } : null }
      }

      return { ...prev, currentSongIndex: prev.currentSongIndex - 1, progress: 0, isPlaying: true, playbackStart: { timestamp: Date.now(), progressAtStart: 0 } };
    })
  }

  useEffect(() => {
    if (!isPlaying || currentSong == null || playbackStart == null) return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - playbackStart.timestamp) / 1000;
      const newProgress = playbackStart.progressAtStart + elapsed;

      if (newProgress >= currentSong.duration) {
        handleNext();
      } else {
        setPlaybackStatus(prev => ({ ...prev, progress: newProgress }));
      }
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [isPlaying, currentSong, playbackStart]);

  const duration = currentSong?.duration || 0;
  const currentProgress = Math.floor(progress);
  const currentRemaining = duration - currentProgress;

  return (
    <div className="flex items-center justify-between h-full pl-16 pr-4">
      <div className="flex items-center gap-3 w-48 min-w-48">
        {currentSong ? (
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">
              {currentSong.name}
            </span>
            <span className="text-xs text-gray-500 truncate">
              {currentSong.author}
            </span>
          </div>
        ) : (
          <div className="text-sm text-gray-500">No song playing</div>
        )}
      </div>

      <div className="flex flex-col items-center gap-1 flex-1 max-w-xl">
        <div className="flex items-center gap-2">
          <button className="btn btn-circle btn-sm btn-ghost" onClick={handleBack}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d="M9.195 18.44c1.25.713 2.805-.19 2.805-1.629v-2.34l6.945 3.968c1.25.714 2.805-.188 2.805-1.628V8.688c0-1.44-1.555-2.342-2.805-1.628L12 11.03v-2.34c0-1.44-1.555-2.343-2.805-1.629l-7.108 4.062c-1.26.72-1.26 2.536 0 3.256l7.108 4.061z" />
            </svg>
          </button>

          <button
            className="btn btn-circle btn-primary"
            onClick={togglePlayback}
          >
            {isPlaying ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          <button className="btn btn-circle btn-sm btn-ghost" onClick={handleNext}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d="M5.055 7.06c-1.25-.714-2.805.189-2.805 1.628v8.123c0 1.44 1.555 2.342 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.342 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256L14.805 7.06C13.555 6.346 12 7.25 12 8.688v2.34L5.055 7.06z" />
            </svg>
          </button>

          <label className={`swap btn btn-circle btn-sm btn-ghost ${isShuffled ? 'btn-active' : ''}`}>
            <input
              type="checkbox"
              checked={isShuffled}
              onChange={toggleShuffle}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="swap-off w-4 h-4"
            >
              <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.18 1.42-1.42zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="swap-on w-4 h-4 text-primary"
            >
              <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.18 1.42-1.42zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
            </svg>
          </label>
        </div>

        <div className="flex items-center gap-2 w-full">
          <span className="text-xs text-gray-500 w-10 text-right">
            {formatDuration(currentProgress)}
          </span>
          <input
            type="range"
            min={0}
            max={duration}
            value={currentProgress}
            onChange={(e) => seekTo(Number(e.target.value))}
            className="range range-xs flex-1 cursor-pointer"
          />
          <span className="text-xs text-gray-500 w-10">
            -{formatDuration(currentRemaining)}
          </span>
        </div>
      </div>
      <div className="w-48 min-w-48 flex items-center justify-end gap-2">
        {currentSong && (
          <>
            <LikeSongButton
              songId={currentSong.id}
              isLiked={props.likedSongIds.includes(currentSong.id)}
            />
            <AddSongToPlaylistButton
              songId={currentSong.id}
              playlists={props.playlists}
              dropdownClassName="dropdown-top dropdown-end"
            />
          </>
        )}
      </div>
    </div>
  );
}
