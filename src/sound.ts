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
  Shot: new Audio(shot),
  Splat: new Audio(splat),
  Impact: new Audio(impact),
  ZombieDeath: new Audio(zombieDeath),
  ZombieBig: new Audio(zombieBig),
  WaveStart: new Audio(waveStart),
  Bark: new Audio(bark),
  Hurt: new Audio(hurt),
  Positive: new Audio(positive),
};

Sounds.Shot.volume = 0.2;
Sounds.Splat.volume = 0.2;
Sounds.Impact.volume = 0.1;
Sounds.ZombieDeath.volume = 0.2;
Sounds.ZombieBig.volume = 0.2;
Sounds.WaveStart.volume = 0.3;
Sounds.Bark.volume = 1;
Sounds.Hurt.volume = 0.2;
Sounds.Positive.volume = 0.32;

export function playSound(sound: keyof typeof Sounds) {
  Sounds[sound].play();
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

// there are 56 coins
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
import coin11 from "./assets/coins/Coins_Single_10.mp3";
import coin12 from "./assets/coins/Coins_Single_11.mp3";
import coin13 from "./assets/coins/Coins_Single_12.mp3";
import coin14 from "./assets/coins/Coins_Single_13.mp3";
import coin15 from "./assets/coins/Coins_Single_14.mp3";
import coin16 from "./assets/coins/Coins_Single_15.mp3";
import coin17 from "./assets/coins/Coins_Single_16.mp3";
import coin18 from "./assets/coins/Coins_Single_17.mp3";
import coin19 from "./assets/coins/Coins_Single_18.mp3";
import coin20 from "./assets/coins/Coins_Single_19.mp3";
import coin21 from "./assets/coins/Coins_Single_20.mp3";
import coin22 from "./assets/coins/Coins_Single_21.mp3";
import coin23 from "./assets/coins/Coins_Single_22.mp3";
import coin24 from "./assets/coins/Coins_Single_23.mp3";
import coin25 from "./assets/coins/Coins_Single_24.mp3";
import coin26 from "./assets/coins/Coins_Single_25.mp3";
import coin27 from "./assets/coins/Coins_Single_26.mp3";
import coin28 from "./assets/coins/Coins_Single_27.mp3";
import coin29 from "./assets/coins/Coins_Single_28.mp3";
import coin30 from "./assets/coins/Coins_Single_29.mp3";
import coin31 from "./assets/coins/Coins_Single_30.mp3";
import coin32 from "./assets/coins/Coins_Single_31.mp3";
import coin33 from "./assets/coins/Coins_Single_32.mp3";
import coin34 from "./assets/coins/Coins_Single_33.mp3";
import coin35 from "./assets/coins/Coins_Single_34.mp3";
import coin36 from "./assets/coins/Coins_Single_35.mp3";
import coin37 from "./assets/coins/Coins_Single_36.mp3";
import coin38 from "./assets/coins/Coins_Single_37.mp3";
import coin39 from "./assets/coins/Coins_Single_38.mp3";
import coin40 from "./assets/coins/Coins_Single_39.mp3";
import coin41 from "./assets/coins/Coins_Single_40.mp3";
import coin42 from "./assets/coins/Coins_Single_41.mp3";
import coin43 from "./assets/coins/Coins_Single_42.mp3";
import coin44 from "./assets/coins/Coins_Single_43.mp3";
import coin45 from "./assets/coins/Coins_Single_44.mp3";
import coin46 from "./assets/coins/Coins_Single_45.mp3";
import coin47 from "./assets/coins/Coins_Single_46.mp3";
import coin48 from "./assets/coins/Coins_Single_47.mp3";
import coin49 from "./assets/coins/Coins_Single_48.mp3";
import coin50 from "./assets/coins/Coins_Single_49.mp3";
import coin51 from "./assets/coins/Coins_Single_50.mp3";
import coin52 from "./assets/coins/Coins_Single_51.mp3";
import coin53 from "./assets/coins/Coins_Single_52.mp3";
import coin54 from "./assets/coins/Coins_Single_53.mp3";
import coin55 from "./assets/coins/Coins_Single_54.mp3";
import coin56 from "./assets/coins/Coins_Single_55.mp3";

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
  coin11,
  coin12,
  coin13,
  coin14,
  coin15,
  coin16,
  coin17,
  coin18,
  coin19,
  coin20,
  coin21,
  coin22,
  coin23,
  coin24,
  coin25,
  coin26,
  coin27,
  coin28,
  coin29,
  coin30,
  coin31,
  coin32,
  coin33,
  coin34,
  coin35,
  coin36,
  coin37,
  coin38,
  coin39,
  coin40,
  coin41,
  coin42,
  coin43,
  coin44,
  coin45,
  coin46,
  coin47,
  coin48,
  coin49,
  coin50,
  coin51,
  coin52,
  coin53,
  coin54,
  coin55,
  coin56,
].map((src) => new Audio(src));

CoinSounds.forEach((sound) => {
  sound.volume = 0.25;
});

export function playCoinSound() {
  const sound = CoinSounds[Math.floor(Math.random() * CoinSounds.length)];
  sound.play();
}
