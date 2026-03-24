"use client";

import { useContext } from "react";
import { PlaybackContext } from "./playback-context";

export function SideBar() {
  const { currentSong, queue } = useContext(PlaybackContext);
  return (
    <div>
      <div>Current Song:</div>
      <div>{currentSong?.name}</div>
      <br />
      <div>Queue:</div>
      <div>
        <ul>
          {queue.map((song) => (
            <li key={song.id} className="list-disc">
              {song.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
