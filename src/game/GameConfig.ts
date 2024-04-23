// Last review: 08-10-2023

import { buildChooserScreen } from "./Chooser";
import { buildLevelScreen } from "./Levels";
import { buildStoreScreen } from "./Store";
import { buildHelpScreen } from "./Help";
import { buildSplashScreen } from "./Splash";
import { GameCfg } from "../jetlag/Config";
import { ErrorVerbosity } from "../jetlag/Services/Console";

/**
 * GameConfig stores things like screen dimensions and other game configuration,
 * as well as the names of all the assets (images and sounds) used by this game.
 */
export class GameConfig implements GameCfg {
  // It's very unlikely that you'll want to change these next four values.
  // Hover over them to see what they mean.
  pixelMeterRatio = 100;
  defaultScreenWidth = 1600;
  defaultScreenHeight = 900;
  adaptToScreenSize = true;

  // When you deploy your game, you'll want to change all of these
  canVibrate = true;
  forceAccelerometerOff = true;
  storageKey = "com.me.my_jetlag_game.storage";
  verbosity = ErrorVerbosity.LOUD;
  hitBoxes = false;

  // Here's where we name all the images/sounds/background music files.  You'll
  // probably want to delete these files from the assets folder, remove them
  // from these lists, and add your own.
  resourcePrefix = "./assets/";
  musicNames = ["homescreen.mp3", "bgMusic_1.mp3"];
  soundNames = ["high_pitch.ogg", "low_pitch.ogg", "lose_sound.ogg", "win_sound.ogg", "slow_down.ogg", "woo_woo_woo.ogg", "flap_flap.ogg", "jump.wav", 
  "landSound.wav", "damage.mp3", "foodPickup.wav"];
  imageNames = [
    // The non-animated actors in the game
    "green_ball.png", "mustard_ball.png", "red_ball.png", "blue_ball.png", "purple_ball.png", "grey_ball.png",

    // Images that we use for buttons in the Splash and Chooser
    "left_arrow.png", "right_arrow.png", "back_arrow.png", "level_tile.png", "audio_on.png", "audio_off.png",

    // Some raw colors
    "black.png", "red.png", // TODO: stop needing these!

    // Background images for OverlayScenes
    "msg2.png", "fade.png",

    // The backgrounds for the Splash and Chooser
    "splash.png", "chooser.png",

    // Layers for Parallax backgrounds and foregrounds
    "mid.png", "front.png", "back.png",

    // The animation for a star with legs
    "leg_star_1.png", "leg_star_2.png", "leg_star_3.png", "leg_star_4.png", "leg_star_5.png", "leg_star_6.png", "leg_star_7.png", "leg_star_8.png",

    // The animation for the star with legs, with each image flipped
    "flip_leg_star_1.png", "flip_leg_star_2.png", "flip_leg_star_3.png", "flip_leg_star_4.png", "flip_leg_star_5.png", "flip_leg_star_6.png", "flip_leg_star_7.png", "flip_leg_star_8.png",

    // The flying star animation
    "fly_star_1.png", "fly_star_2.png",

    // Animation for a star that expands and then disappears
    "star_burst_1.png", "star_burst_2.png", "star_burst_3.png", "star_burst_4.png",

    // eight colored stars
    "color_star_1.png", "color_star_2.png", "color_star_3.png", "color_star_4.png", "color_star_5.png", "color_star_6.png", "color_star_7.png", "color_star_8.png",

    // background noise, and buttons
    "noise.png", "pause.png", "character1.png", "citybg.png", "blackbox.png",

    // imported
    "character3.png", "character3_flip.png", "character_run1.png", "character_run1_flip.png", "city_skyline.png", "idle_L.png", "idle_R.png", "run1_L.png", 
    "run2_L.png", "run3_L.png", "run4_L.png", "run5_L.png", "run6_L.png", "run7_L.png", "run8_L.png", "run1_R.png", "run2_R.png", "run3_R.png", "run4_R.png", 
    "run5_R.png", "run6_R.png", "run7_R.png","run8_R.png", "citybg_2.png",

    // jump
    "jump1_R.png", "jump2_R.png", "jump3_R.png", "jump1_L.png", "jump2_L.png", "jump3_L.png", "pizza.png", "hamburger.png",
    "hotdog.png", "waffle.png", "building1.png", "building2.png", "building3.png", "building4.png", "building5.png",

    // cars
    "car2_L.png", "car2_R.png",

    // bird
    "leftbird_1.png", "leftbird_2.png", "leftbird_3.png", "leftbird_4.png",
    "rightbird_1.png", "rightbird_2.png", "rightbird_3.png", "rightbird_4.png", 
    
    // extra 
    "cloud.png", "door.png", "level1_bg.png", "level2_bg.png", "level3_bg.png", "purple.png"

  ];

  // This is where we tell JetLag about the functions we wrote for configuring
  // each level.  You probably don't want to change these lines.
  levelBuilder = buildLevelScreen;
  chooserBuilder = buildChooserScreen;
  helpBuilder = buildHelpScreen;
  splashBuilder = buildSplashScreen;
  storeBuilder = buildStoreScreen;
}
