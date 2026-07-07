import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Gamepad2, Trophy, Star, Zap, Target, RotateCcw, Play } from 'lucide-react';
import { getUsers, saveUsers } from '../../lib/storage';
import { toast } from 'sonner';
import type { User } from '../../lib/mockData';

interface GameResult {
  won: boolean;
  points: number;
  message: string;
}

interface MiniGamesProps {
  user: User;
  onPointsUpdate?: (newPoints: number) => void;
}

export function MiniGames({ user, onPointsUpdate }: MiniGamesProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<GameResult | null>(null);
  const [dailyPlays, setDailyPlays] = useState(0);

  const games = [
    {
      id: 'number-guess',
      name: 'Number Guessing',
      description: 'Guess the number between 1-100',
      icon: Target,
      maxPlays: 3,
      points: { win: 10, lose: 2 }
    },
    {
      id: 'rock-paper-scissors',
      name: 'Rock Paper Scissors',
      description: 'Beat the computer in this classic game',
      icon: Trophy,
      maxPlays: 5,
      points: { win: 5, lose: 1 }
    },
    {
      id: 'memory-match',
      name: 'Memory Match',
      description: 'Match pairs of cards',
      icon: Zap,
      maxPlays: 2,
      points: { win: 15, lose: 3 }
    }
  ];

  useEffect(() => {
    // Check daily plays from localStorage
    const today = new Date().toDateString();
    const stored = localStorage.getItem(`games_${user.id}_${today}`);
    if (stored) {
      setDailyPlays(parseInt(stored));
    }
  }, [user.id]);

  const startGame = (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    if (!game) return;

    // Check if user has reached daily limit
    if (dailyPlays >= 10) { // Max 10 games per day total
      toast.error('You have reached the daily games limit!');
      return;
    }

    setSelectedGame(gameId);
    setGameState(getInitialGameState(gameId));
  };

  const getInitialGameState = (gameId: string) => {
    switch (gameId) {
      case 'number-guess':
        return {
          target: Math.floor(Math.random() * 100) + 1,
          guesses: 0,
          maxGuesses: 7,
          guess: '',
          message: 'Guess a number between 1 and 100!'
        };
      case 'rock-paper-scissors':
        return {
          userChoice: null,
          computerChoice: null,
          result: null,
          choices: ['rock', 'paper', 'scissors']
        };
      case 'memory-match':
        const cards = ['🍎', '🍌', '🍊', '🍇', '🍓', '🥝', '🍑', '🍍'];
        const gameCards = [...cards, ...cards].sort(() => Math.random() - 0.5);
        return {
          cards: gameCards,
          flipped: [],
          matched: [],
          moves: 0,
          gameOver: false
        };
      default:
        return {};
    }
  };

  const playGame = (action: any) => {
    const game = games.find(g => g.id === selectedGame);
    if (!game) return;

    let result: GameResult;

    switch (selectedGame) {
      case 'number-guess':
        const guess = parseInt(action);
        const newGuesses = gameState.guesses + 1;

        if (guess === gameState.target) {
          result = { won: true, points: game.points.win, message: `Correct! You won ${game.points.win} points!` };
        } else if (newGuesses >= gameState.maxGuesses) {
          result = { won: false, points: game.points.lose, message: `Game over! The number was ${gameState.target}. You earned ${game.points.lose} points.` };
        } else {
          const hint = guess < gameState.target ? 'Too low!' : 'Too high!';
          setGameState({
            ...gameState,
            guesses: newGuesses,
            message: `${hint} ${gameState.maxGuesses - newGuesses} guesses left.`
          });
          return;
        }
        break;

      case 'rock-paper-scissors':
        const computerChoice = gameState.choices[Math.floor(Math.random() * 3)];
        const userChoice = action;

        let gameResult: 'win' | 'lose' | 'tie';
        if (userChoice === computerChoice) {
          gameResult = 'tie';
        } else if (
          (userChoice === 'rock' && computerChoice === 'scissors') ||
          (userChoice === 'paper' && computerChoice === 'rock') ||
          (userChoice === 'scissors' && computerChoice === 'paper')
        ) {
          gameResult = 'win';
        } else {
          gameResult = 'lose';
        }

        if (gameResult === 'tie') {
          setGameState({
            ...gameState,
            userChoice,
            computerChoice,
            result: 'tie',
            message: `It's a tie! Both chose ${userChoice}. Try again!`
          });
          return;
        }

        result = {
          won: gameResult === 'win',
          points: gameResult === 'win' ? game.points.win : game.points.lose,
          message: gameResult === 'win'
            ? `You win! ${userChoice} beats ${computerChoice}. +${game.points.win} points!`
            : `You lose! ${computerChoice} beats ${userChoice}. +${game.points.lose} points.`
        };
        break;

      case 'memory-match':
        // Simplified memory game logic
        const newFlipped = [...gameState.flipped, action];
        let newMatched = [...gameState.matched];
        let message = '';

        if (newFlipped.length === 2) {
          const [first, second] = newFlipped;
          if (gameState.cards[first] === gameState.cards[second]) {
            newMatched = [...newMatched, first, second];
            message = 'Match found!';
          } else {
            message = 'No match!';
          }

          setTimeout(() => {
            setGameState({
              ...gameState,
              flipped: [],
              matched: newMatched,
              moves: gameState.moves + 1,
              message: newMatched.length === gameState.cards.length ? 'Congratulations! You won!' : 'Keep going!'
            });
          }, 1000);

          return;
        }

        setGameState({
          ...gameState,
          flipped: newFlipped,
          message
        });
        return;

      default:
        return;
    }

    // Update user points
    const allUsers = getUsers();
    const userIndex = allUsers.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      allUsers[userIndex].loyaltyPoints += result.points;
      saveUsers(allUsers);
      onPointsUpdate?.(allUsers[userIndex].loyaltyPoints);
    }

    // Update daily plays
    const today = new Date().toDateString();
    const newDailyPlays = dailyPlays + 1;
    setDailyPlays(newDailyPlays);
    localStorage.setItem(`games_${user.id}_${today}`, newDailyPlays.toString());

    setLastResult(result);
    setShowResult(true);
    setGameState(null);
    setSelectedGame(null);
  };

  const resetGame = () => {
    if (selectedGame) {
      setGameState(getInitialGameState(selectedGame));
    }
  };

  const renderGame = () => {
    if (!selectedGame || !gameState) return null;

    switch (selectedGame) {
      case 'number-guess':
        return (
          <div className="space-y-4">
            <p className="text-center">{gameState.message}</p>
            <div className="flex gap-2 justify-center">
              <input
                type="number"
                min="1"
                max="100"
                value={gameState.guess}
                onChange={(e) => setGameState({...gameState, guess: e.target.value})}
                className="w-24 px-3 py-2 border rounded"
                placeholder="1-100"
              />
              <Button onClick={() => playGame(gameState.guess)}>Guess</Button>
            </div>
            <Progress value={(gameState.guesses / gameState.maxGuesses) * 100} className="w-full" />
            <p className="text-sm text-center text-muted-foreground">
              Guesses used: {gameState.guesses}/{gameState.maxGuesses}
            </p>
          </div>
        );

      case 'rock-paper-scissors':
        return (
          <div className="space-y-4">
            <p className="text-center">Choose your move!</p>
            <div className="flex gap-4 justify-center">
              {gameState.choices.map((choice: string) => (
                <Button
                  key={choice}
                  onClick={() => playGame(choice)}
                  className="capitalize"
                >
                  {choice}
                </Button>
              ))}
            </div>
            {gameState.result && (
              <div className="text-center">
                <p>You: {gameState.userChoice}</p>
                <p>Computer: {gameState.computerChoice}</p>
                <p className="mt-2">{gameState.message}</p>
              </div>
            )}
          </div>
        );

      case 'memory-match':
        return (
          <div className="space-y-4">
            <p className="text-center">{gameState.message}</p>
            <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
              {gameState.cards.map((card: string, index: number) => (
                <button
                  key={index}
                  onClick={() => playGame(index)}
                  disabled={gameState.flipped.includes(index) || gameState.matched.includes(index)}
                  className={`w-16 h-16 border-2 rounded flex items-center justify-center text-2xl transition-all ${
                    gameState.flipped.includes(index) || gameState.matched.includes(index)
                      ? 'bg-blue-100 border-blue-300'
                      : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {gameState.flipped.includes(index) || gameState.matched.includes(index) ? card : '?'}
                </button>
              ))}
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Moves: {gameState.moves} | Matches: {gameState.matched.length / 2}/8
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Mini Games</h1>
            <p className="text-muted-foreground">Play games to earn loyalty points!</p>
          </div>
          <Badge variant="secondary">
            Daily Plays: {dailyPlays}/10
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {games.map((game) => {
            const Icon = game.icon;
            return (
              <Card key={game.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {game.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{game.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Win:</span>
                      <Badge variant="default">+{game.points.win} pts</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Lose:</span>
                      <Badge variant="secondary">+{game.points.lose} pts</Badge>
                    </div>
                  </div>
                  <Button
                    onClick={() => startGame(game.id)}
                    className="w-full"
                    disabled={dailyPlays >= 10}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Play Now
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selectedGame && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Playing: {games.find(g => g.id === selectedGame)?.name}</span>
                <Button variant="outline" size="sm" onClick={resetGame}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderGame()}
            </CardContent>
          </Card>
        )}

        {/* Loyalty Points Display */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-4">
              <Star className="h-8 w-8 text-yellow-500" />
              <div className="text-center">
                <div className="text-3xl font-bold">{user.loyaltyPoints}</div>
                <p className="text-muted-foreground">Loyalty Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Result Dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {lastResult?.won ? (
                <Trophy className="h-5 w-5 text-yellow-500" />
              ) : (
                <Gamepad2 className="h-5 w-5 text-blue-500" />
              )}
              Game Result
            </DialogTitle>
          </DialogHeader>
          {lastResult && (
            <div className="text-center space-y-4">
              <div className={`text-2xl ${lastResult.won ? 'text-green-600' : 'text-blue-600'}`}>
                {lastResult.won ? '🎉 You Won!' : '😊 Good Try!'}
              </div>
              <p>{lastResult.message}</p>
              <div className="flex items-center justify-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="text-lg font-semibold">+{lastResult.points} points</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowResult(false)}>Continue Playing</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
