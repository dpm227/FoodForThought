// Last review: 08-10-2023

import { Actor } from "../jetlag/Entities/Actor";
import { ImageSprite, TextSprite } from "../jetlag/Components/Appearance";
import * as Helpers from "./helpers";
import { game } from "../jetlag/Stage";
import { KeyCodes } from "../jetlag/Services/Keyboard";

/**
 * buildHelpScreen draws the help screens.  Technically, a help screen can be
 * anything... even a playable level.  In this demonstration, we just provide a
 * bit of information about the demo game, and how to get started.  This is also
 * often a good place to put credits.
 *
 * For the purposes of this demonstration, there are two Help screens.  That
 * way, we can show how to move from one to the next.
 *
 * @param index Which help screen should be displayed
 */
export function buildHelpScreen(index: number) {
  // This line ensures that, no matter what level we draw, the ESCAPE key is
  // configured to go back to the Splash.  We don't go to Splash on down-press
  // of ESCAPE, but when the key is released.
  game.keyboard.setKeyUpHandler(KeyCodes.ESCAPE, () => game.switchTo(game.config.splashBuilder, 1));

  // Our first scene describes the color coding that we use for the different
  // entities in the game
  if (index == 1) {
    // Note that this code is exactly the same as in Levels.ts, except that
    // there is no notion of "winning".  So, for example, based on our
    // configuration object, we should expect this Help screen to be drawn in a
    // level that is 1600x900 pixels (16x9 meters), with no default
    // gravitational forces

    // Light blue background
    game.backgroundColor = 0x19698e;

    // put some information and pictures on the screen
    let t = new Actor(game.world);
    t.appearance = new TextSprite({ center: true, cx: 8, cy: 1, face: "Arial", color: "#FFFFFF", size: 56, z: 0 },
      () => "The levels of this game demonstrate JetLag features");

    let cfg = { box: true, cx: 0.75, cy: 2.5, width: 0.75, height: 0.75, img: "green_ball.png" };
    let img = new ImageSprite(cfg);
    new Actor(game.world).appearance = img;
    t = new Actor(game.world);
    t.appearance = new TextSprite({ center: false, cx: 1.5, cy: 2.25, face: "Arial", color: "#000000", size: 24, z: 0 },
      () => "You control the hero");

    cfg = { box: true, cx: 0.75, cy: 3.5, width: 0.75, height: 0.75, img: "blue_ball.png" };
    img = new ImageSprite(cfg);
    new Actor(game.world).appearance = img;
    t = new Actor(game.world);
    t.appearance = new TextSprite({ center: false, cx: 1.5, cy: 3.25, face: "Arial", color: "#000000", size: 24, z: 0 },
      () => "Collect these goodies");

    cfg = { box: true, cx: 0.75, cy: 4.5, width: 0.75, height: 0.75, img: "red_ball.png" };
    img = new ImageSprite(cfg);
    new Actor(game.world).appearance = img;
    t = new Actor(game.world);
    t.appearance = new TextSprite({ center: false, cx: 1.5, cy: 4.25, face: "Arial", color: "#000000", size: 24, z: 0 },
      () => "Avoid or defeat enemies");

    cfg = { box: true, cx: 0.75, cy: 5.5, width: 0.75, height: 0.75, img: "mustard_ball.png" };
    img = new ImageSprite(cfg);
    new Actor(game.world).appearance = img;
    t = new Actor(game.world);
    t.appearance = new TextSprite({ center: false, cx: 1.5, cy: 5.25, face: "Arial", color: "#000000", size: 24, z: 0 },
      () => "Reach the destination");

    cfg = { box: true, cx: 0.75, cy: 6.5, width: 0.75, height: 0.75, img: "purple_ball.png" };
    img = new ImageSprite(cfg);
    new Actor(game.world).appearance = img;
    t = new Actor(game.world);
    t.appearance = new TextSprite({ center: false, cx: 1.5, cy: 6.25, face: "Arial", color: "#000000", size: 24, z: 0 },
      () => "These are walls");

    cfg = { box: true, cx: 0.75, cy: 7.5, width: 0.75, height: 0.75, img: "grey_ball.png" };
    img = new ImageSprite(cfg);
    new Actor(game.world).appearance = img;
    t = new Actor(game.world);
    t.appearance = new TextSprite({ center: false, cx: 1.5, cy: 7.25, face: "Arial", color: "#000000", size: 24, z: 0 },
      () => "Throw projectiles");

    t = new Actor(game.world);
    t.appearance = new TextSprite({ center: false, cx: 11, cy: 8.5, face: "Arial", color: "#FFFFFF", size: 24, z: 0 },
      () => "(All image files are stored in the assets folder)");

    // set up a control to go to the next help level on screen tap
    Helpers.addTapControl(game.hud, { cx: 8, cy: 4.5, width: 16, height: 9, img: "" }, () => {
      game.switchTo(game.config.helpBuilder, 2);
      return true;
    });
  }

  // Our second help scene is just here to show that it is possible to have more than one help scene.
  else if (index == 2) {
    // This is just like the previous screen, but with different text
    game.backgroundColor = 0x19698e;
    let t = new Actor(game.world);
    t.appearance = new TextSprite({ center: true, cx: 8, cy: 1, face: "Arial", color: "#FFFFFF", size: 56, z: 0 },
      () => "Read, Write, Play");
    t = new Actor(game.world);
    t.appearance = new TextSprite({ center: true, cx: 8, cy: 5, face: "Arial", color: "#FFFFFF", size: 32, z: 0 },
      () => `As you play through the levels of the sample game, be sure to read the code that accompanies
each world.  The levels aren't meant to be "hard", or even really "fun".  They are meant to show
you how to use the different features of JetLag, and to show you how the same features can
be used in many different ways, to achieve very different styles of game play.  JetLag has been
used to make racing games, platformers, side-scrollers, puzzle games, re-creations of classic Atari
games, and much more.  It's up to you, so be creative!

If you're not sure where to start, consider making small changes to the levels, such as changing
the numbers that are passed to different functions.

Start with the "Levels.ts" file in the "src/game" folder, then move on to other files in that folder,
until you have a plan for how to build your next game.`);

    // set up a control to go to the splash screen on screen tap
    Helpers.addTapControl(game.hud, { cx: 8, cy: 4.5, width: 16, height: 9, img: "" }, () => {
      game.switchTo(game.config.splashBuilder, 1);
      return true;
    });
  }
}
