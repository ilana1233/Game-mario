import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";

const levels = [
  {
    playerStart: { x: 100, y: 350 },
    platforms: [
      { x: 400, y: 440, scale: 2 },
      { x: 600, y: 350, scale: 1 },
      { x: 50, y: 250, scale: 1 },
      { x: 750, y: 220, scale: 1 },
    ],
    coins: [
      { x: 50, y: 0 },
      { x: 120, y: 0 },
      { x: 190, y: 0 },
      { x: 260, y: 0 },
      { x: 330, y: 0 },
      { x: 400, y: 0 },
      { x: 470, y: 0 },
      { x: 540, y: 0 },
      { x: 610, y: 0 },
      { x: 680, y: 0 },
    ],
  },
  {
    playerStart: { x: 50, y: 350 },
    platforms: [
      { x: 300, y: 440, scale: 3 },
      { x: 550, y: 350, scale: 1 },
      { x: 100, y: 250, scale: 1 },
      { x: 700, y: 220, scale: 1 },
    ],
    coins: [
      { x: 100, y: 0 },
      { x: 170, y: 0 },
      { x: 240, y: 0 },
      { x: 310, y: 0 },
      { x: 380, y: 0 },
      { x: 450, y: 0 },
      { x: 520, y: 0 },
      { x: 590, y: 0 },
      { x: 660, y: 0 },
      { x: 730, y: 0 },
    ],
  },
];

export default function App() {
  const gameRef = useRef(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    class MyScene extends Phaser.Scene {
      constructor() {
        super({ key: "MyScene" });
        this.levelIndex = 0;
        this.score = 0;
      }

      preload() {
        this.load.image("ground", "https://labs.phaser.io/assets/sprites/platform.png");
        this.load.image("coin", "https://labs.phaser.io/assets/sprites/gold_1.png");
        this.load.spritesheet("dude", "https://labs.phaser.io/assets/sprites/dude.png", {
          frameWidth: 32,
          frameHeight: 48,
        });
      }

      create() {
        this.cameras.main.setBackgroundColor("#87ceeb");

        this.platforms = this.physics.add.staticGroup();
        this.coins = this.physics.add.group();

        this.player = this.physics.add.sprite(100, 350, "dude");
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        this.anims.create({
          key: "left",
          frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
          frameRate: 10,
          repeat: -1,
        });
        this.anims.create({
          key: "turn",
          frames: [{ key: "dude", frame: 4 }],
          frameRate: 20,
        });
        this.anims.create({
          key: "right",
          frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
          frameRate: 10,
          repeat: -1,
        });

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.coins, this.platforms);

        // קריאת overlap כאן בתוך create
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.loadLevel(this.levelIndex);
      }

      loadLevel(index) {
        this.platforms.clear(true, true);
        this.coins.clear(true, true);

        const levelData = levels[index];
        levelData.platforms.forEach((p) => {
          this.platforms.create(p.x, p.y, "ground").setScale(p.scale).refreshBody();
        });

        levelData.coins.forEach((c) => {
          let coin = this.coins.create(c.x, c.y, "coin");
          coin.setBounceY(Phaser.Math.FloatBetween(0.3, 0.7));
        });
        
        this.player.setVelocity(0);
        this.player.setPosition(levelData.playerStart.x, levelData.playerStart.y);

        this.score = 0;
        setScore(0);
        setLevel(index + 1);
      }

      collectCoin(player, coin) {
        coin.disableBody(true, true);
        this.score += 10;
        setScore(this.score);

        if (this.coins.countActive(true) === 0) {
          this.levelIndex++;
          if (this.levelIndex >= levels.length) {
            this.levelIndex = 0;
          }
          this.loadLevel(this.levelIndex);
        }
      }

      update() {
        if (this.cursors.left.isDown) {
          this.player.setVelocityX(-160);
          this.player.anims.play("left", true);
        } else if (this.cursors.right.isDown) {
          this.player.setVelocityX(160);
          this.player.anims.play("right", true);
        } else {
          this.player.setVelocityX(0);
          this.player.anims.play("turn");
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
          this.player.setVelocityY(-350);
        }
      }
    }

    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 450,
      physics: {
        default: "arcade",
        arcade: { gravity: { y: 600 }, debug: false },
      },
      parent: "game-container",
      scene: MyScene,
    };

    if (!gameRef.current) {
      gameRef.current = new Phaser.Game(config);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <div id="game-container" style={{ margin: "0 auto", width: 800, height: 450 }} />
      <div style={{ fontSize: 20, marginTop: 10, textAlign: "center", fontWeight: "bold" }}>
        ניקוד: {score} | שלב: {level}
      </div>
    </>
  );
}
