import React, { useEffect, useState } from "react";
import "./QueuePanel.css";
import { SongLibrary } from "../MusicLibrary/MusicLibrary";

interface QueuePanelProps {
  queue: Set<SongLibrary>;
  setSelectedSongName: React.Dispatch<React.SetStateAction<string>>;
  setSelectedFilePath: React.Dispatch<React.SetStateAction<string>>;
  isOpen: boolean; 
}

const QueuePanel: React.FC<QueuePanelProps> = ({
  queue,
  setSelectedSongName,
  setSelectedFilePath,
  isOpen,
}) => {
  const playSong = (song: SongLibrary) => {
    setSelectedSongName(song.name);
    setSelectedFilePath(song.path)
  };

  return (
    <div id="queuePanel" className={isOpen ? "" : "hidden"}>
     {queue.size > 0 ? 
     <ul>
     {Array.from(queue).map((song) => (
       <li key={song.name} onClick={() => playSong(song)}>
         {song.name.replace(/\.[^.]+$/, "")}
       </li>
     ))}
   </ul>: <>
   Queue is empty.</> 
    }
    </div>
  );
};

export default QueuePanel;
