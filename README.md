# New Square Media (Desktop client)

New Square Media is a platform for discovering, streaming, and publishing music in a new way. It allows users to explore, share, and monetize music across a network of cafes, restaurants, and bars, transforming undiscovered venues into vibrant artistic hubs.


[![Video Title](https://www.newsquare.media/_next/image?url=%2Fhero.png&w=1080&q=75)](https://www.youtube.com/watch?v=Lsy4TXD8xLU)


## Features

- Publish on-air metadata in real-time or share curated playlists
- Enhance venue ambiance with curated artistic content
- Create unique revenue mechanisms with artists
- Seamless integration with popular music services

## Technology Stack

- Backend: Golang
- Frontend: TypeScript, React
- Framework: Wails (wails.io)

## Installation

### Prerequisites

1. Install Go (version 1.18 or later)
2. Install Node.js (version 14 or later)
3. Install Wails CLI:


`go install github.com/wailsapp/wails/v2/cmd/wails@latest`

### Setting up the project

Clone the repository:

`git clone https://github.com/stateful-art/new-square-media-desktop.git`

`cd new-square-media-desktop`

###  Install dependencies:

`wails dev`

This will start the application and enable hot-reloading for frontend changes.

### Building

`wails build`

This will compile the project for production. The production-ready binary will be saved in the build/bin directory.
Note for Linux users: If you are using a Linux distribution that does not have webkit2gtk-4.0 (such as Ubuntu 24.04), you will need to add the `-tags webkit2_41` flag:

`wails build -tags webkit2_41`

### Contributing:

We welcome contributions! Please create an issue for the feature you'd like to implement or want to have in the app.

### Contact
To get in touch or book a demo, please visit [our website](https://newsquare.media).
