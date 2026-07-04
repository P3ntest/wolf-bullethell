import shot from "./assets/shot.wav";
import splat from "./assets/splat.flac";
import impact from "./assets/impact.flac";
import zombieDeath from "./assets/zombieDeath.wav";
import zombieBig from "./assets/zombieBig.wav";
import bark from "./assets/bark.wav";
import waveStart from "./assets/waveStart.wav";
import hurt from "./assets/hurt.flac";
import positive from "./assets/positive.ogg";
const Sounds = {
  Shot: shot,
  Splat: splat,
  Impact: impact,
  ZombieDeath: zombieDeath,
  ZombieBig: zombieBig,
  WaveStart: waveStart,
  Bark: bark,
  Hurt: hurt,
  Positive: positive,
};

const defaultVolume: { [key: string]: number } = {};

defaultVolume["Shot"] = 0.2;
defaultVolume["Splat"] = 0.2;
defaultVolume["Impact"] = 0.1;
defaultVolume["ZombieDeath"] = 0.2;
defaultVolume["ZombieBig"] = 0.2;
defaultVolume["WaveStart"] = 0.3;
defaultVolume["Bark"] = 1;
defaultVolume["Hurt"] = 0.2;
defaultVolume["Positive"] = 0.32;

export function playSound(sound: keyof typeof Sounds, volume?: number) {
  volume = volume ?? defaultVolume[sound] ?? 0.1;
  const audio = new Audio(Sounds[sound]);
  audio.volume = volume;
  audio.play();
}

import monster1 from "./assets/growls/monster/monster.1.ogg";
import monster2 from "./assets/growls/monster/monster.2.ogg";
import monster3 from "./assets/growls/monster/monster.3.ogg";
import monster4 from "./assets/growls/monster/monster.4.ogg";
import monster5 from "./assets/growls/monster/monster.5.ogg";
import monster6 from "./assets/growls/monster/monster.6.ogg";
import monster7 from "./assets/growls/monster/monster.7.ogg";
import monster8 from "./assets/growls/monster/monster.8.ogg";
import monster9 from "./assets/growls/monster/monster.9.ogg";
import monster10 from "./assets/growls/monster/monster.10.ogg";
import monster11 from "./assets/growls/monster/monster.11.ogg";
import monster12 from "./assets/growls/monster/monster.12.ogg";
import monster13 from "./assets/growls/monster/monster.13.ogg";
import monster14 from "./assets/growls/monster/monster.14.ogg";
import monster15 from "./assets/growls/monster/monster.15.ogg";
import monster16 from "./assets/growls/monster/monster.16.ogg";

import growl1 from "./assets/growls/growl1.wav";
import growl2 from "./assets/growls/growl2.wav";

const GrowlSounds = [
  growl1,
  growl2,
  monster1,
  monster2,
  monster3,
  monster4,
  monster5,
  monster6,
  monster7,
  monster8,
  monster9,
  monster10,
  monster11,
  monster12,
  monster13,
  monster14,
  monster15,
  monster16,
].map((src) => new Audio(src));

GrowlSounds.forEach((sound) => {
  sound.volume = 0.1;
});

export function playZombieSound() {
  const sound = GrowlSounds[Math.floor(Math.random() * GrowlSounds.length)];
  sound.play();
}

import coin1 from "./assets/coins/Coins_Single_00.mp3";
import coin2 from "./assets/coins/Coins_Single_01.mp3";
import coin3 from "./assets/coins/Coins_Single_02.mp3";
import coin4 from "./assets/coins/Coins_Single_03.mp3";
import coin5 from "./assets/coins/Coins_Single_04.mp3";
import coin6 from "./assets/coins/Coins_Single_05.mp3";
import coin7 from "./assets/coins/Coins_Single_06.mp3";
import coin8 from "./assets/coins/Coins_Single_07.mp3";
import coin9 from "./assets/coins/Coins_Single_08.mp3";
import coin10 from "./assets/coins/Coins_Single_09.mp3";

const CoinSounds = [
  coin1,
  coin2,
  coin3,
  coin4,
  coin5,
  coin6,
  coin7,
  coin8,
  coin9,
  coin10,
].map((src) => new Audio(src));

CoinSounds.forEach((sound) => {
  sound.volume = 0.25;
});

export function playCoinSound() {
  const sound = CoinSounds[Math.floor(Math.random() * CoinSounds.length)];
  sound.play();
}
