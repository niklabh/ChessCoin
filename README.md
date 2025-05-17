# Chess Game

A modern 2D chess game built with React and Chess.js, offering a rich, user-friendly chess experience with professional-looking pieces and comprehensive gameplay features.

## Features

- Professional chess.com style piece images
- Proper chess rules implementation with chess.js library
- Pawn promotion options dialog
- Display for captured pieces
- Move history and game status display
- Board flipping capability
- Responsive design

## Technologies Used

- React
- Chess.js for chess rules and game logic
- Tailwind CSS for styling

## How to Run Locally

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open your browser and navigate to the local server address shown in your terminal

## GitHub Pages Deployment

This project is configured to be automatically deployed to GitHub Pages when changes are pushed to the main branch.

### Manual Deployment

If you want to deploy manually:

1. Build the project: `npm run build`
2. Push the contents of the `dist/public` directory to the `gh-pages` branch of your repository

## Game Controls

- Click on a piece to select it
- Click on a valid destination square to move the selected piece
- When a pawn reaches the last rank, a promotion dialog will appear to choose the promotion piece
- Use the "Undo" button to take back the last move
- Use the "Flip Board" button to change the board orientation
- Use the "New Game" button to start a new game

## Credits

- Chess piece images from chess.com
- Chess rules implemented using chess.js library