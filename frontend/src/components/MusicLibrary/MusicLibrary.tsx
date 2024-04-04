// src/components/MusicLibrary/MusicLibrary.tsx
import React, { useState } from "react";
import "./MusicLibrary.css"; // Import the CSS module
import {
  OpenFolderDialog,
  CreateLibrary,
} from "../../../wailsjs/go/multimedia/Library";

const MusicLibrary: React.FunctionComponent = () => {
  const [folderPath, setFolderPath] = useState<string>("");
  const handleFolderSelect = async () => {
    try {
      const folderPath = await OpenFolderDialog();
      setFolderPath(folderPath);
      // Assuming CreateLibrary returns a Promise that resolves to a string
      CreateLibrary({ name: "muadssic", path: folderPath }).then((res) => {
        console.log(res);
        // Ensure that 'res' is a string that can be set as the folder path
      });
    } catch (error) {
      console.error("Error opening folder dialog:", error);
    }
  };

  return (
    <>
      <div id="leftPanel">
        <h2 id="lp-title">New Square</h2>
        <hr />
        {/* <FolderDialogModal onFolderSelect={handleFolderSelect} /> */}
        <button
          type="submit"
          id="addLibBtn"
          onClick={() => {
            handleFolderSelect();
          }}
        >
          <div id="addLibBtnText">+</div>
        </button>
        <ul id="libraryList"></ul>
      </div>

      <div id="rightPanel">
        <div id="rp-topnav">
          <ul id="breadcrumb">
            <li id="rp-lib-name"></li>
          </ul>
        </div>
        <ul id="fileList"></ul>
      </div>

      {/* <div id="modal" onClick={closeModal}>
        <div id="modal-content" onClick={(e) => e.stopPropagation()}>
          <p>Add a new library from your local drive</p>
          <form id="addLibraryForm">
            <input type="text" id="libName" placeholder="Library Name" />
            <input type="text" id="libPath" placeholder="Folder Path" />
            <div id="addLibErrorMessage"></div>
            <button type="submit" id="submitLibBtn">
              <span id="submitLibBtnText">Add</span>
            </button>
          </form>
        </div>
      </div> */}

      <div id="player">
        <div id="songName"></div>
        <audio id="audioPlayer" controls></audio>
        <div id="recentsButton">history</div>
        <div id="queueButton">queue</div>
      </div>

      <div id="queuePanel" className="hidden"></div>
      <div id="historyPanel" className="hidden"></div>
    </>
  );
};

export default MusicLibrary;
