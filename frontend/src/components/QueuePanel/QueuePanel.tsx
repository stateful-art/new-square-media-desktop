import React, { useEffect, useState } from "react";
import "./QueuePanel.css";
import { SongLibrary } from "../MusicLibrary/MusicLibrary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";

interface QueuePanelProps {
  queue: Set<SongLibrary>;
  // handleRemoveFromQueue: React.Dispatch<React.SetStateAction<SongLibrary>>;
  handleRemoveFromQueue: (item: SongLibrary) => void; // Function that takes a SongLibrary item and returns void
  setSelectedSongName: React.Dispatch<React.SetStateAction<string>>;
  setSelectedFilePath: React.Dispatch<React.SetStateAction<string>>;
  isOpen: boolean;
}

const QueuePanel: React.FC<QueuePanelProps> = ({
  queue,
  handleRemoveFromQueue,
  setSelectedSongName,
  setSelectedFilePath,
  isOpen,
}) => {

  const playSong = (song: SongLibrary) => {
    setSelectedSongName(song.name);
    setSelectedFilePath(song.path);
  };

  return (
    <div id="queuePanel" className={isOpen ? "" : "hidden"}>
      {queue.size > 0 ? (
        <ul>
          {Array.from(queue).map((song) => (
            <li key={song.name} onClick={() => playSong(song)}>
              <FontAwesomeIcon
                className={"remove-queue-btn"}
                icon={faMinus}
                size="xl"
                onClick={(e) => {
                  e.stopPropagation(); // Stop event propagation
                  handleRemoveFromQueue(song);
                }}
              />

              {song.name.replace(/\.[^.]+$/, "")}
            </li>
          ))}
        </ul>
      ) : (
        <>Queue is empty.</>
      )}
    </div>
  );
};

export default QueuePanel;
