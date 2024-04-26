import React, { useEffect, useState } from "react";
import "./QueuePanel.css";
import { SongLibrary } from "../MusicLibrary/MusicLibrary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";

interface QueuePanelProps {
  queue: Set<SongLibrary>;
  songName: string;
  // handleRemoveFromQueue: React.Dispatch<React.SetStateAction<SongLibrary>>;
  handleRemoveFromQueue: (item: SongLibrary) => void; // Function that takes a SongLibrary item and returns void
  setSelectedSongName: React.Dispatch<React.SetStateAction<string>>;
  setSelectedFilePath: React.Dispatch<React.SetStateAction<string>>;
  isOpen: boolean;
}

const QueuePanel: React.FC<QueuePanelProps> = ({
  queue,
  songName,
  handleRemoveFromQueue,
  setSelectedSongName,
  setSelectedFilePath,
  isOpen,
}) => {
  const [nowPlayingName, setNowPlayingName] = useState("");
  const [nowPlayingPath, setNowPlayingPath] = useState("");

  const playSong = (song: SongLibrary) => {
    setSelectedSongName(song.name);
    setSelectedFilePath(song.path);

    setNowPlayingName(song.name);
    setNowPlayingPath(song.path);
  };

  useEffect(() => {
setNowPlayingName(songName)
  }, [songName])

  // Remove file extension and limit to first 50 characters
  const formattedSongName = (songName: string) => {
    let nameWithoutExtension = songName.replace(/\.[^.]+$/, "");
    if (nameWithoutExtension.length < 50) {
      return nameWithoutExtension;
    } else {
      return nameWithoutExtension.substring(0, 50) + "...";
    }
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
              {/* <span
                style={{
                  color: `${
                    Array.from(queue).at(queue.size - 1)?.name === song.name
                      ? "red"
                      : ""
                  }`,
                }}
              >
                {formattedSongName(song.name)}
              </span> */}

              <span
                style={{
                  color: `${nowPlayingName === song.name ? "red" : ""}`,
                }}
              >
                {formattedSongName(song.name)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div style={{ padding: "12px", textAlign: "center" }}>
          Queue is empty.
        </div>
      )}
    </div>
  );
};

export default QueuePanel;
