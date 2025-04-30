"use client";
import { CustomBtn } from "../../../wallet/WalletConnect";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { AccountAddress } from "@aptos-labs/ts-sdk";
import MobileControls from "../DraggableBtn";

// Define types for our tetromino pieces
type TetrominoType = "I" | "J" | "L" | "O" | "S" | "T" | "Z";

interface Tetromino {
  shape: number[][];
  color: string;
  type: TetrominoType;
}

// All possible tetromino shapes
const TETROMINOES: Record<TetrominoType, Tetromino> = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: "cyan",
    type: "I",
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "blue",
    type: "J",
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "orange",
    type: "L",
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "yellow",
    type: "O",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: "green",
    type: "S",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "violet",
    type: "T",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: "red",
    type: "Z",
  },
};

// Game constants
const ROWS = 20; // height
const COLS = 10; // width
const TICK_RATE_MS = 500;

// Utility functions
const createEmptyBoard = () =>
  Array.from(Array(ROWS), () => Array(COLS).fill(0));

const randomTetromino = (): Tetromino => {
  const tetrominoes: TetrominoType[] = ["I", "J", "L", "O", "S", "T", "Z"];
  const randTetromino =
    tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
  return { ...TETROMINOES[randTetromino] }; // Return a copy to prevent mutations
};

const rotateTetromino = (matrix: number[][]): number[][] => {
  const N = matrix.length;
  const result = Array.from({ length: N }, () => Array(N).fill(0));

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      result[j][N - 1 - i] = matrix[i][j];
    }
  }

  return result;
};

// Function to get initial position for a tetromino
const getInitialPosition = (tetrominoType: TetrominoType) => {
  // Adjust the initial position based on tetromino type
  const xOffset = tetrominoType === "I" ? -1 : tetrominoType === "O" ? -1 : -1;
  return {
    x: Math.floor(COLS / 2) + xOffset,
    y: tetrominoType === "I" ? -1 : 0, // I piece needs to start higher
  };
};

const Tetris: React.FC = () => {
  // Use useRef for checking if component is mounted
  const isMounted = useRef(false);

  // State initialization with null default values to prevent hydration mismatch
  const [initialized, setInitialized] = useState(false);
  const [board, setBoard] = useState<(string | number)[][]>([]);
  const [currentTetromino, setCurrentTetromino] = useState<Tetromino | null>(
    null
  );
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [level, setLevel] = useState(1);
  const [tickRate, setTickRate] = useState(TICK_RATE_MS);
  const [nextTetromino, setNextTetromino] = useState<Tetromino | null>(null);
  const [linesCleared, setLinesCleared] = useState(0);
  const [currentAddress, setCurrentAddress] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [addressError, setAddressError] = useState<string | null>(null);
  const { account, connected } = useWallet();

  // Initialize game on client-side only
  useEffect(() => {
    if (!isMounted.current) {
      // Initialize the game state only on the client
      setBoard(createEmptyBoard());
      const firstTetromino = randomTetromino();
      const secondTetromino = randomTetromino();
      setCurrentTetromino(firstTetromino);
      setNextTetromino(secondTetromino);
      setPosition(getInitialPosition(firstTetromino.type));

      // Mark as mounted
      isMounted.current = true;
    }

    // Check if we're authenticated, either via wallet connection or manual address entry
    const isAuthenticated = connected || currentAddress !== "";
    if (isAuthenticated) {
      setInitialized(true);
    }
  }, [connected, currentAddress]);

  // Update currentAddress when wallet connects
  useEffect(() => {
    if (connected && account) {
      setCurrentAddress(account.address);
    }
  }, [connected, account]);

  // Check if the current position is valid
  const isPositionValid = useCallback(
    (tetromino: number[][], pos: { x: number; y: number }): boolean => {
      if (!initialized) return false;

      for (let y = 0; y < tetromino.length; y++) {
        for (let x = 0; x < tetromino[y].length; x++) {
          if (tetromino[y][x] !== 0) {
            const newX = pos.x + x;
            const newY = pos.y + y;

            // Check bounds
            if (newX < 0 || newX >= COLS || newY >= ROWS) {
              return false;
            }

            // Check collision with placed pieces
            if (newY >= 0 && board[newY][newX] !== 0) {
              return false;
            }
          }
        }
      }
      return true;
    },
    [board, initialized]
  );

  // Draw the current state of the game
  const renderBoard = useCallback(() => {
    if (!initialized || !currentTetromino) return board;

    // Create a new board copy
    const newBoard = board.map((row) => [...row]);

    // Draw current tetromino
    for (let y = 0; y < currentTetromino.shape.length; y++) {
      for (let x = 0; x < currentTetromino.shape[y].length; x++) {
        if (currentTetromino.shape[y][x] !== 0) {
          const boardY = position.y + y;
          const boardX = position.x + x;

          if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
            newBoard[boardY][boardX] = currentTetromino.color;
          }
        }
      }
    }

    return newBoard;
  }, [board, currentTetromino, position, initialized]);

  // Place a tetromino on the board
  const placeTetromino = useCallback(() => {
    if (!initialized || !currentTetromino || !nextTetromino) return;

    const newBoard = board.map((row) => [...row]);

    // Check if game is over - any part of the tetromino is above the board
    let isGameOver = false;
    for (let y = 0; y < currentTetromino.shape.length; y++) {
      for (let x = 0; x < currentTetromino.shape[y].length; x++) {
        if (currentTetromino.shape[y][x] !== 0) {
          const boardY = position.y + y;
          if (boardY < 0) {
            isGameOver = true;
            break;
          }
        }
      }
      if (isGameOver) break;
    }

    if (isGameOver) {
      setGameOver(true);
      return;
    }

    // Place the tetromino on the board
    for (let y = 0; y < currentTetromino.shape.length; y++) {
      for (let x = 0; x < currentTetromino.shape[y].length; x++) {
        if (currentTetromino.shape[y][x] !== 0) {
          const boardY = position.y + y;
          const boardX = position.x + x;

          if (boardY >= 0 && boardY < ROWS) {
            newBoard[boardY][boardX] = currentTetromino.color;
          }
        }
      }
    }

    // Check for completed rows
    let completedRows = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (newBoard[y].every((cell) => cell !== 0)) {
        // Remove the row and add a new one at the top
        newBoard.splice(y, 1);
        newBoard.unshift(Array(COLS).fill(0));
        completedRows++;
        y++; // Check the same row again as rows above shift down
      }
    }

    // Update score based on completed rows
    if (completedRows > 0) {
      const points = [0, 40, 100, 300, 1200][completedRows] * level;
      setScore((prevScore) => prevScore + points);
      setLinesCleared((prev) => prev + completedRows);

      // Increase level every 10 rows
      const newLevel = Math.floor((linesCleared + completedRows) / 10) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        setTickRate(TICK_RATE_MS / (1 + (newLevel - 1) * 0.1));
      }
    }

    setBoard(newBoard);

    // Get next tetromino ready
    const nextTet = nextTetromino;
    const initialPos = getInitialPosition(nextTet.type);

    setCurrentTetromino(nextTet);
    setNextTetromino(randomTetromino());
    setPosition(initialPos);

    // Check if game over - if new tetromino placement isn't valid
    if (!isPositionValid(nextTet.shape, initialPos)) {
      setGameOver(true);
    }
  }, [
    board,
    currentTetromino,
    nextTetromino,
    position,
    level,
    linesCleared,
    isPositionValid,
    initialized,
  ]);

  // Move the current tetromino down
  const moveDown = useCallback(() => {
    if (!initialized || gameOver || isPaused || !currentTetromino) return;

    const newPosition = { ...position, y: position.y + 1 };

    if (isPositionValid(currentTetromino.shape, newPosition)) {
      setPosition(newPosition);
    } else {
      // We hit something, place the tetromino
      placeTetromino();
    }
  }, [
    position,
    currentTetromino,
    isPositionValid,
    placeTetromino,
    gameOver,
    isPaused,
    initialized,
  ]);

  // Move tetromino left or right
  const moveHorizontal = useCallback(
    (direction: number) => {
      if (!initialized || gameOver || isPaused || !currentTetromino) return;

      const newPosition = { ...position, x: position.x + direction };

      if (isPositionValid(currentTetromino.shape, newPosition)) {
        setPosition(newPosition);
      }
    },
    [
      position,
      currentTetromino,
      isPositionValid,
      gameOver,
      isPaused,
      initialized,
    ]
  );

  // Rotate tetromino
  const rotate = useCallback(() => {
    if (!initialized || gameOver || isPaused || !currentTetromino) return;

    const rotated = rotateTetromino(currentTetromino.shape);

    if (isPositionValid(rotated, position)) {
      setCurrentTetromino({
        ...currentTetromino,
        shape: rotated,
      });
    } else {
      // Try wall kicks
      const kicks = [-1, 1, -2, 2];
      for (const kick of kicks) {
        const newPosition = { ...position, x: position.x + kick };
        if (isPositionValid(rotated, newPosition)) {
          setCurrentTetromino({
            ...currentTetromino,
            shape: rotated,
          });
          setPosition(newPosition);
          break;
        }
      }
    }
  }, [
    position,
    currentTetromino,
    isPositionValid,
    gameOver,
    isPaused,
    initialized,
  ]);

  // Hard drop
  const hardDrop = useCallback(() => {
    if (!initialized || gameOver || isPaused || !currentTetromino) return;

    let newY = position.y;
    while (
      isPositionValid(currentTetromino.shape, { ...position, y: newY + 1 })
    ) {
      newY++;
    }

    setPosition({ ...position, y: newY });
    placeTetromino();
  }, [
    position,
    currentTetromino,
    isPositionValid,
    placeTetromino,
    gameOver,
    isPaused,
    initialized,
  ]);

  // Restart game
  const restartGame = useCallback(() => {
    setBoard(createEmptyBoard());
    const firstTetromino = randomTetromino();
    const secondTetromino = randomTetromino();
    setCurrentTetromino(firstTetromino);
    setNextTetromino(secondTetromino);
    setPosition(getInitialPosition(firstTetromino.type));
    setScore(0);
    setLinesCleared(0);
    setGameOver(false);
    setIsPaused(false);
    setLevel(1);
    setTickRate(TICK_RATE_MS);
  }, []);

  // Handle keydown events - client-side only
  useEffect(() => {
    if (!initialized) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault(); // Prevent page scroll
          moveHorizontal(-1);
          break;
        case "ArrowRight":
          e.preventDefault(); // Prevent page scroll
          moveHorizontal(1);
          break;
        case "ArrowDown":
          e.preventDefault(); // Prevent page scroll
          moveDown();
          break;
        case "ArrowUp":
          e.preventDefault(); // Prevent page scroll
          rotate();
          break;
        case " ":
          e.preventDefault(); // Prevent page scroll
          hardDrop();
          break;
        case "p":
          e.preventDefault(); // Prevent page scroll
          setIsPaused(!isPaused);
          break;
        case "r":
          e.preventDefault(); // Prevent page scroll
          restartGame();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [
    moveHorizontal,
    moveDown,
    rotate,
    hardDrop,
    gameOver,
    isPaused,
    restartGame,
    initialized,
  ]);

  // Game tick for gravity - client-side only
  useEffect(() => {
    if (!initialized || gameOver || isPaused) return;

    const gameLoop = setInterval(moveDown, tickRate);
    return () => {
      clearInterval(gameLoop);
    };
  }, [moveDown, tickRate, gameOver, isPaused, initialized]);

  // Render next tetromino preview
  const renderNextTetromino = useCallback(() => {
    if (!initialized || !nextTetromino) {
      return Array.from({ length: 4 }, () => Array(4).fill(0));
    }

    const grid = Array.from({ length: 4 }, () => Array(4).fill(0));

    // Adjust offsets for different tetromino types to center them
    let offsetX = 0;
    let offsetY = 0;

    switch (nextTetromino.type) {
      case "I":
        offsetX = 0;
        offsetY = 1;
        break;
      case "O":
        offsetX = 1;
        offsetY = 1;
        break;
      default:
        offsetX = 0.5;
        offsetY = 0.5;
    }

    for (let y = 0; y < nextTetromino.shape.length; y++) {
      for (let x = 0; x < nextTetromino.shape[y].length; x++) {
        if (nextTetromino.shape[y][x] !== 0) {
          const previewX = Math.floor(x + offsetX);
          const previewY = Math.floor(y + offsetY);

          if (previewY >= 0 && previewY < 4 && previewX >= 0 && previewX < 4) {
            grid[previewY][previewX] = nextTetromino.color;
          }
        }
      }
    }

    return grid;
  }, [nextTetromino, initialized]);

  // Save score when game ends
  useEffect(() => {
    const saveTetrisScore = async (address: string, score: number) => {
      const url = `${process.env.NEXT_PUBLIC_TRACKIT_API_HOST}/game/save`;
      const content = {
        email: "test@trackit.com",
        move_wallet: address,
        score: score,
        nft_metadata: {
          name: "TrackIt Champion",
          description: "Awarded for high score in TrackIt game",
          attributes: {
            score: score,
            date: "2025-04-03",
          },
          image: "https://example.com/nft_image.png",
        },
      };

      // console.log(content);

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(content),
        });

        if (response.ok) {
          console.log("Score is saved successfully!");
        } else {
          console.log("Failed to save score. Try again!");
        }
      } catch (error) {
        console.log("Failed to save score. Try again!");
      }
    };
    if (gameOver) {
      if (currentAddress) {
        saveTetrisScore(currentAddress, score);
      }
    }
  }, [gameOver, currentAddress, score]);

  // Show loading state until client-side initialization is complete
  if (currentAddress && !initialized) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg text-white rounded-lg">
        <h1 className="text-4xl font-bold mb-4">Tetris</h1>
        <p>Loading game...</p>
      </div>
    );
  }

  // Authentication screen - show both options
  if (!initialized) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg text-white rounded-lg">
        <h1 className="text-center text-4xl font-bold mb-4 text-gray-200">
          Connect to play Tetris
        </h1>

        <div className="flex flex-col items-center w-full max-w-md gap-4">
          {/* Wallet Connection Option */}
          <div className="w-full text-center">
            <CustomBtn />
          </div>

          <div className="flex items-center w-full my-2">
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="px-4 text-gray-400">OR</span>
            <div className="flex-1 border-t border-gray-600"></div>
          </div>

          {/* Manual Address Entry Option */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isValidAptosAddress(walletAddress)) {
                setCurrentAddress(walletAddress);
                setAddressError(null);
              } else {
                setAddressError("Invalid Aptos address");
              }
            }}
            className="w-full"
          >
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => {
                setWalletAddress(e.currentTarget.value);
                setAddressError(null);
              }}
              placeholder="Enter your Aptos wallet address"
              className="w-full p-2.5 rounded-lg bg-[#102447] focus:outline-none text-sm text-gray-50 border border-bluesky mb-2"
            />
            {addressError && (
              <p className="text-red-500 mb-2">{addressError}</p>
            )}
            <button
              type="submit"
              className="w-full p-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
            >
              Start Game
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Color mapping for better visual distinction
  const getColorClass = (colorName: string) => {
    const colorMap: Record<string, string> = {
      cyan: "bg-cyan-500",
      blue: "bg-blue-500",
      orange: "bg-orange-500",
      yellow: "bg-yellow-500",
      green: "bg-green-500",
      violet: "bg-violet-500",
      red: "bg-red-500",
    };
    return colorMap[colorName] || "bg-gray-500";
  };

  return (
    <div className="flex flex-col items-center text-white">
      <h1 className="text-4xl font-bold mb-4">Tetris</h1>

      <div className="flex flex-col lg:flex-row gap-2 md:gap-8">
        <div className="relative">
          {/* Main game board */}
          <div
            className="grid bg border-2 border-itemborder"
            style={{
              gridTemplateColumns: `repeat(${COLS}, 30px)`,
              gridTemplateRows: `repeat(${ROWS}, 30px)`,
            }}
          >
            {renderBoard().map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${y}-${x}`}
                  className={`border border-gray-700 ${
                    cell !== 0 ? getColorClass(cell.toString()) : ""
                  }`}
                />
              ))
            )}
          </div>

          {/* Game over overlay */}
          {gameOver && (
            <div className="absolute inset-0 bg-[#0e203f] bg-opacity-90 flex flex-col items-center justify-center border-2 border-itemborder">
              <h2 className="text-3xl font-bold mb-4">Game Over</h2>
              <p className="text-xl mb-6">Score: {score}</p>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                onClick={restartGame}
              >
                Play Again
              </button>
            </div>
          )}

          {/* Pause overlay */}
          {isPaused && !gameOver && (
            <div className="absolute inset-0 bg-[#0e203f] bg-opacity-90 flex items-center justify-center border-2 border-itemborder">
              <h2 className="text-3xl font-bold">Paused</h2>
            </div>
          )}

          {/* Buttons for mobile */}
          <MobileControls
            moveHorizontal={moveHorizontal}
            moveDown={moveDown}
            rotate={rotate}
            hardDrop={hardDrop}
            isPaused={isPaused}
            setIsPaused={setIsPaused}
            gameOver={gameOver}
            className="md:hidden"
          />
        </div>

        <div className="flex flex-col justify-between gap-2">
          {/* Game info */}
          <div className="bg p-4 rounded-lg border border-itemborder">
            <h2 className="text-xl font-bold mb-2">Score: {score}</h2>
            <h3 className="text-lg">Level: {level}</h3>
            {/* <h3 className="text-lg">Lines: {linesCleared}</h3> */}
          </div>

          {/* Next tetromino preview */}
          <div className="bg p-4 rounded-lg border border-itemborder">
            <h3 className="text-lg font-bold mb-2">Next:</h3>
            <div
              className="grid mx-auto"
              style={{
                gridTemplateColumns: `repeat(4, 20px)`,
                gridTemplateRows: `repeat(4, 20px)`,
              }}
            >
              {renderNextTetromino().map((row, y) =>
                row.map((cell, x) => (
                  <div
                    key={`next-${y}-${x}`}
                    className={`border border-gray-700 ${
                      cell !== 0 ? getColorClass(cell.toString()) : ""
                    }`}
                  />
                ))
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="bg p-4 rounded-lg border border-itemborder">
            <h3 className="text-lg font-bold mb-2">Controls:</h3>
            <ul className="text-sm">
              <li>← → : Move</li>
              <li>↓ : Soft Drop</li>
              <li>↑ : Rotate</li>
              <li>Space : Hard Drop</li>
              <li>P : Pause</li>
              <li>R : Restart</li>
            </ul>
          </div>

          {/* Buttons for desktop */}
          <div className="hidden md:grid grid-cols-3 gap-2">
            <button
              className="min-w-20 bg p-2 select-none rounded border border-itemborder hover:bg-blue-500"
              onClick={() => moveHorizontal(-1)}
            >
              ←
            </button>
            <button
              className="bg p-2 select-none rounded border border-itemborder hover:bg-blue-500"
              onClick={rotate}
            >
              Rotate
            </button>
            <button
              className="min-w-20 bg p-2 select-none rounded border border-itemborder hover:bg-blue-500"
              onClick={() => moveHorizontal(1)}
            >
              →
            </button>
            <button
              className="min-w-20 bg p-2 select-none rounded border border-itemborder hover:bg-blue-500"
              onClick={moveDown}
            >
              ↓
            </button>
            <button
              className="bg p-2 select-none rounded border border-itemborder hover:bg-blue-500"
              onClick={hardDrop}
            >
              Drop
            </button>
            <button
              className={`min-w-20 bg p-2 select-none rounded border border-itemborder ${
                !gameOver && "hover:bg-blue-500"
              } ${isPaused && "bg-blue-500"}`}
              onClick={() => setIsPaused(!isPaused)}
              disabled={gameOver}
            >
              {isPaused ? "Resume" : "Pause"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tetris;

const isValidAptosAddress = (address: string) => {
  try {
    AccountAddress.fromString(address);
    return true;
  } catch (error) {
    return false;
  }
};
