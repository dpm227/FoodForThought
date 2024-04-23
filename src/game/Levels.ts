// Last review: 08-10-2023

import { BasicChase, ChaseFixed, Draggable, FlickMovement, GravityMovement, HoverFlick, HoverMovement, PathMovement, TiltMovement, Path, ExplicitMovement } from "../jetlag/Components/Movement";
import { game } from "../jetlag/Stage";
import { StageTypes } from "../jetlag/Systems/Score";
import * as Helpers from "./helpers";
import { ProjectileSystem } from "../jetlag/Systems/Projectiles";
import { Scene } from "../jetlag/Entities/Scene";
import { AnimatedSprite, ImageSprite, TextSprite } from "../jetlag/Components/Appearance";
import { Actor } from "../jetlag/Entities/Actor";
import { b2Vec2 } from "@box2d/core";
import { RigidBodyComponent } from "../jetlag/Components/RigidBody";
import { Hero, Destination, Enemy, Goodie, Obstacle, Sensor } from "../jetlag/Components/Role";
import { KeyCodes } from "../jetlag/Services/Keyboard";
import { SoundEffectComponent } from "../jetlag/Components/SoundEffect";
import { TimedEvent } from "../jetlag/Systems/Timer";
import { AnimationSequence } from "../jetlag/Config";
import { SvgSystem } from "../jetlag/Systems/Svg";

/**
 * buildLevelScreen is used to draw the playable levels of the game
 *
 * We currently have 90 levels, each of which is described in part of the
 * following function.
 *
 * Remember that this code creates the initial configuration of the level, after
 * which the physics simulator takes over and starts running the game.
 *
 * @param index Which level should be displayed
 */
export function buildLevelScreen(index: number) {

  if (index == 1) 
  {
    let neededGoodies = 5;
    let jumpPower = 8; // this should be 8 when not testing
    game.score.setVictoryGoodies(neededGoodies,0,0,0);

    game.world.camera.setBounds(128, 15);
    Helpers.resetGravity(0, 10);
    Helpers.drawBoundingBox(0, 0, 90, 15, .1, { density: 1 });
    Helpers.setMusic("bgMusic_1.mp3");

    let duration: number = 175;
    let jumpDuration: number = 500;

    
    let cfg = {
      cx: 0, cy: 15, width: 0.75, height: 0.75,

      move_right: new AnimationSequence(true)
        .to("run1_R.png", duration)
        .to("run2_R.png", duration)
        .to("run3_R.png", duration)
        .to("run4_R.png", duration)
        .to("run5_R.png", duration)
        .to("run6_R.png", duration)
        .to("run7_R.png", duration)
        .to("run8_R.png", duration),
      idle_right: Helpers.makeAnimation({ timePerFrame: 100, repeat: true, images: ["idle_R.png"] }),

      move_left: new AnimationSequence(true)
        .to("run1_L.png", duration)
        .to("run2_L.png", duration)
        .to("run3_L.png", duration)
        .to("run4_L.png", duration)
        .to("run5_L.png", duration)
        .to("run6_L.png", duration)
        .to("run7_L.png", duration)
        .to("run8_L.png", duration),
      idle_left: Helpers.makeAnimation({ timePerFrame: 100, repeat: true, images: ["idle_L.png"] }),

      jump_right: new AnimationSequence(true)
        .to("jump1_R.png", jumpDuration)
        .to("jump2_R.png", jumpDuration)
        .to("jump3_R.png", jumpDuration),

      jump_left: new AnimationSequence(true)
        .to("jump1_L.png", jumpDuration)
        .to("jump2_L.png", jumpDuration)
        .to("jump3_L.png", jumpDuration),

    };


    let h = new Actor(game.world);
    h.appearance = new AnimatedSprite(cfg);
    h.rigidBody = RigidBodyComponent.Box(cfg, game.world, { density: 25, friction: .5, disableRotation: true });
    h.movement = new ExplicitMovement({ gravityAffectsIt: true});
    h.role = new Hero({ strength: 3, jumpSound: "jump.wav" });

    // KEY UP
    let canJump = true;

    if (canJump)
    {
      game.keyboard.setKeyUpHandler(KeyCodes.UP, () => (jump()));
      //let jumpSound = "flap_flap.ogg";
      //jumpSound.play()
    }

    // jumps then set canJump to false, calling a timer
    function jump()
    {
      if (canJump)
      {
        (h.role as Hero).jump(0, -jumpPower)
        canJump = false;
        // Set canJump true after .5 seconds
        game.world.timer.addEvent(new TimedEvent(.1, true, () => 
        {
        canJump = true;
        }));
      }
    }

    game.keyboard.setKeyUpHandler(KeyCodes.LEFT, () => (h.movement as ExplicitMovement).setAbsoluteVelocity(0, (h.movement as ExplicitMovement).getYVelocity()!));
    game.keyboard.setKeyUpHandler(KeyCodes.RIGHT, () => (h.movement as ExplicitMovement).setAbsoluteVelocity(0, (h.movement as ExplicitMovement).getYVelocity()!));
    game.keyboard.setKeyDownHandler(KeyCodes.RIGHT, () => (h.movement as ExplicitMovement).updateVelocity(10, (h.movement as ExplicitMovement).getYVelocity()!));
    game.keyboard.setKeyDownHandler(KeyCodes.LEFT, () => (h.movement as ExplicitMovement).updateVelocity(-10, (h.movement as ExplicitMovement).getYVelocity()!));

    game.score.setVictoryDestination(1);

    game.world.camera.setCameraChase(h, 0, 10);
    game.backgroundColor = 0x17b4ff;
    game.background.addLayer({ appearance: new ImageSprite({ cx: 0, cy: 9, width: 42, height: 13, img: "citybg_2.png" }), speed: 0 });


    // LEVEL ONE OBSTACLES, GOODIES, & ENEMIES
    function obstacles()
    {
      // building 4
      let buildingFour = { cx: 10, cy: 13.75, width: 2.6, height: 2.84, img: "building4.png" };
      let building1 = new Actor(game.world);
      building1.appearance = new ImageSprite(buildingFour);
      building1.rigidBody = RigidBodyComponent.Box(buildingFour, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
      building1.role = new Obstacle();

      // hotdog
      let collectables = { cx: 9.9, cy: 11.75, radius: 0.25, width: 0.5, height: 0.5, img: "hotdog.png" };
      let g1 = new Actor(game.world);
      g1.appearance = new ImageSprite(collectables);
      g1.role = new Goodie();
      g1.rigidBody = RigidBodyComponent.Circle(collectables, game.world);

      // building 2
      let buildingTwo = { cx: 17, cy: 13, width: 2.7, height: 4.85, img: "building2.png" };
      let building2 = new Actor(game.world);
      building2.appearance = new ImageSprite(buildingTwo);
      building2.rigidBody = RigidBodyComponent.Box(buildingTwo, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
      building2.role = new Obstacle();

      // floating platform 1
      let platform_cfg = { cx: 22, cy: 12, width: 2, height: 0.25, img: "cloud.png" };
      let regular_platform = new Actor(game.world);
      regular_platform.appearance = new ImageSprite(platform_cfg);
      regular_platform.rigidBody = RigidBodyComponent.Box(platform_cfg, game.world, { density: 100, friction: 1 });
      regular_platform.role = new Obstacle();
      regular_platform.movement = new PathMovement(new Path().to(22, 9).to(22, 14).to(22, 9), 1, true);

      // waffle
      collectables = { cx: 22, cy: 13, radius: 0.25, width: 0.5, height: 0.5, img: "hamburger.png" };
      let g5 = new Actor(game.world);
      g5.appearance = new ImageSprite(collectables);
      g5.role = new Goodie();
      g5.rigidBody = RigidBodyComponent.Circle(collectables, game.world);

      // building 1
      let buildingOne = { cx: 25, cy: 13, width: 3, height: 10.1325, img: "building1.png" };
      let building6 = new Actor(game.world);
      building6.appearance = new ImageSprite(buildingOne);
      building6.rigidBody = RigidBodyComponent.Box(buildingOne, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
      building6.role = new Obstacle();

      // waffle
      collectables = { cx: 25, cy: 7.5, radius: 0.25, width: 0.5, height: 0.5, img: "waffle.png" };
      let g2 = new Actor(game.world);
      g2.appearance = new ImageSprite(collectables);
      g2.role = new Goodie();
      g2.rigidBody = RigidBodyComponent.Circle(collectables, game.world);

    // ENEMY CAR
    let efg = {
      cx: 27.5, cy: 14, width: 1.97, height: 0.65,

      move_right: new AnimationSequence(true)
        .to("car2_R.png", duration),
      idle_right: Helpers.makeAnimation({ timePerFrame: 100, repeat: true, images: ["car2_R.png"] }),

      move_left: new AnimationSequence(true)
        .to("car2_L.png", duration),
      idle_left: Helpers.makeAnimation({ timePerFrame: 100, repeat: true, images: ["car2_L.png"] }),
    };
    
    let e = new Actor(game.world);
    e.appearance = new AnimatedSprite(efg);
    e.role = new Enemy({ onDefeated: () => { updateHealth(); }, damage: 1, onDefeatHero: () => { updateHealth(); }, disableHeroCollision: true});
    e.rigidBody = RigidBodyComponent.Box(efg, game.world, { density: 1.0, elasticity: 0.3, friction: 0.6 });
    e.movement = new PathMovement(new Path().to(27.5, 14.7).to(45, 14.7).to(27.5, 14.7), 5, true);

    let carfg = { cx: 27.5, cy: 14, width: 1.95, height: 0.63, img: "" };
    
    let carbox = new Actor(game.world);
    carbox.appearance = new ImageSprite(carfg);
    carbox.rigidBody = RigidBodyComponent.Box(carfg, game.world, { density: 1000, friction: .1 });
    carbox.role = new Obstacle();
    carbox.movement = new PathMovement(new Path().to(27.5, 14.7).to(45, 14.7).to(27.5, 14.7), 5, true);
    // END CAR

    // pizza
    collectables = { cx: 30, cy: 14, radius: 0.25, width: 0.5, height: 0.5, img: "pizza.png" };
    let g3 = new Actor(game.world);
    g3.appearance = new ImageSprite(collectables);
    g3.role = new Goodie();
    g3.rigidBody = RigidBodyComponent.Circle(collectables, game.world);
    
    buildingFour = { cx: 47.5, cy: 13.25, width: 3.25, height: 3.55, img: "building4.png" };
    let building4 = new Actor(game.world);
    building4.appearance = new ImageSprite(buildingFour);
    building4.rigidBody = RigidBodyComponent.Box(buildingFour, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
    building4.role = new Obstacle();


    let buildingFive = { cx: 61, cy: 13.25, width: 3.4, height: 10, img: "building5.png" };
    let building8 = new Actor(game.world);
    building8.appearance = new ImageSprite(buildingFive);
    building8.rigidBody = RigidBodyComponent.Box(buildingFive, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
    building8.role = new Obstacle();

    // hamburger
    collectables = { cx: 61, cy: 7.8, radius: 0.25, width: 0.5, height: 0.5, img: "hamburger.png" };
    let g4 = new Actor(game.world);
    g4.appearance = new ImageSprite(collectables);
    g4.role = new Goodie();
    g4.rigidBody = RigidBodyComponent.Circle(collectables, game.world);

    // END OF LEVEL DOOR
    let dfg =  { cx: 75, cy: 14.35, width: .64, height: 1.28, img: "" };
    let d = new Actor(game.world);
    d.appearance = new ImageSprite(dfg);
    d.rigidBody = RigidBodyComponent.Box(dfg, game.world);
    d.role = new Destination( {onAttemptArrival: () => { return game.score.goodieCount[0] >= neededGoodies;}} );

    // box around door
    dfg = { cx: 75, cy: 14.35, width: .62, height: 1.40, img: "door.png" };
    let dbox = new Actor(game.world);
    dbox.appearance = new ImageSprite(dfg);
    dbox.rigidBody = RigidBodyComponent.Box(dfg, game.world);
    dbox.role = new Obstacle();
    }
    
    obstacles();
    
    function makeUI()
    {
    // LEVEL ONE FOOD COUNT AND HEALTH
    let t = new Actor(game.hud);
    t.appearance = new TextSprite({ cx: 0.25, cy: .25, center: false, face: "Arial", color: "#FFFFFF", size: 100, z: 2 },
      () => "🍔" + game.score.goodieCount[0] + "/" + neededGoodies + " " + updateHealth());

    // LEVEL ONE  TIMER / COUNTDOWN
    t = new Actor(game.hud);
    game.score.loseCountDownRemaining = 120;
    t.appearance = new TextSprite({ cx: 14.7, cy: .35, center: false, face: "Arial", color: "#FFFFFF", size: 64, z: 2 }, () =>
      (game.score.loseCountDownRemaining ?? 0).toFixed(0));
    }

    function updateHealth()
    {
      if ((h.role as Hero).strength == 3)
        return "❤️❤️❤️"
      if ((h.role as Hero).strength == 2)
      {
        return "❤️❤️"
      }
      if ((h.role as Hero).strength == 1)
      {
        return "❤️"
      }
      return "";
    }

    makeUI();

    welcomeMessage("LEVEL ONE\nUse WASD or Arrow Keys to Move\nYou Need to Collect Food to Bring to Your Family!\nCollect the Minimum Amount of Food\nto Go Through the Door and Pass The Level\nPress Space to Jump\nJump Against Walls to Make it Over Buildings\nCLICK TO BEGIN!");
    winMessage("LEVEL ONE PASSED");
    loseMessage("LEVEL FAILED\nCLICK TO TRY AGAIN");
  }

  else if (index == 2)
  {
    let neededGoodies = 15;
    let jumpPower = 8; // this should be 8 when not testing
    game.score.setVictoryGoodies(neededGoodies,0,0,0);

    game.world.camera.setBounds(128, 15);
    Helpers.resetGravity(0, 10);
    //Helpers.enableTilt(10, 0);
    Helpers.drawBoundingBox(0, 0, 128, 15, .1, { density: 1 });
    Helpers.setMusic("bgMusic_1.mp3");

    let duration: number = 175;
    let jumpDuration: number = 500;


    let cfg = {
      cx: 0, cy: 15, width: 0.75, height: 0.75,

      move_right: new AnimationSequence(true)
        .to("run1_R.png", duration)
        .to("run2_R.png", duration)
        .to("run3_R.png", duration)
        .to("run4_R.png", duration)
        .to("run5_R.png", duration)
        .to("run6_R.png", duration)
        .to("run7_R.png", duration)
        .to("run8_R.png", duration),
      idle_right: Helpers.makeAnimation({ timePerFrame: 100, repeat: true, images: ["idle_R.png"] }),

      move_left: new AnimationSequence(true)
        .to("run1_L.png", duration)
        .to("run2_L.png", duration)
        .to("run3_L.png", duration)
        .to("run4_L.png", duration)
        .to("run5_L.png", duration)
        .to("run6_L.png", duration)
        .to("run7_L.png", duration)
        .to("run8_L.png", duration),
      idle_left: Helpers.makeAnimation({ timePerFrame: 100, repeat: true, images: ["idle_L.png"] }),

      jump_right: new AnimationSequence(true)
        .to("jump1_R.png", jumpDuration)
        .to("jump2_R.png", jumpDuration)
        .to("jump3_R.png", jumpDuration),

      jump_left: new AnimationSequence(true)
        .to("jump1_L.png", jumpDuration)
        .to("jump2_L.png", jumpDuration)
        .to("jump3_L.png", jumpDuration),

    };


    let h = new Actor(game.world);
    h.appearance = new AnimatedSprite(cfg);
    h.rigidBody = RigidBodyComponent.Box(cfg, game.world, { density: 25, friction: .5, disableRotation: true });
    h.movement = new ExplicitMovement({ gravityAffectsIt: true});
    h.role = new Hero({ strength: 3, jumpSound: "jump.wav" });

    // this jump is working Helpers.jumpAction(h, 0, -5, 0)
    // KEY UP
    let canJump = true;

    if (canJump)
    {
      game.keyboard.setKeyUpHandler(KeyCodes.UP, () => (jump()));
      // NEED TO FIX THIS HERE
      //game.keyboard.setKeyUpHandler(KeyCodes.UP, () => (canJump = false));
    }

    // jumps then set canJump to false, calling a timer
    function jump()
    {
      if (canJump)
      {
        (h.role as Hero).jump(0, -jumpPower)
        canJump = false;
        // Set canJump true after .5 seconds
        game.world.timer.addEvent(new TimedEvent(.1, true, () => 
        {
        canJump = true;
        }));
      }
    }

    //game.keyboard.setKeyUpHandler(KeyCodes.DOWN, () => (h.movement as ExplicitMovement).setAbsoluteVelocity(h.movement.getXVelocity(), 0));
    game.keyboard.setKeyUpHandler(KeyCodes.LEFT, () => (h.movement as ExplicitMovement).setAbsoluteVelocity(0, (h.movement as ExplicitMovement).getYVelocity()!));
    game.keyboard.setKeyUpHandler(KeyCodes.RIGHT, () => (h.movement as ExplicitMovement).setAbsoluteVelocity(0, (h.movement as ExplicitMovement).getYVelocity()!));
    //h.movement.getXVelocity();
    //h.movement.getYVelocity();
    //(h.role as Hero).jump()x

    game.keyboard.setKeyDownHandler(KeyCodes.RIGHT, () => (h.movement as ExplicitMovement).updateVelocity(10, (h.movement as ExplicitMovement).getYVelocity()!));
    game.keyboard.setKeyDownHandler(KeyCodes.LEFT, () => (h.movement as ExplicitMovement).updateVelocity(-10, (h.movement as ExplicitMovement).getYVelocity()!));
    
    game.score.setVictoryDestination(1);

    // center the camera a little ahead of the hero, so we can see more of the
    // world during gameplay
    game.world.camera.setCameraChase(h, 0, 10);
    // Put a button on screen that makes the hero jump. Note that we can put a
    // delay (in this case, 9000 milliseconds) to prevent rapid re-jumping.  If
    // you make it 0, you still can't jump while in the air, but you can jump as
    // soon as you land.
    //Helpers.addTapControl(game.hud, { cx: 8, cy: 4.5, width: 16, height: 9, img: "" }, Helpers.jumpAction(h, 0, -10, 9000));
    // set up the backgrounds
    game.backgroundColor = 0x17b4ff;
    game.background.addLayer({ appearance: new ImageSprite({ cx: 0, cy: 9, width: 42, height: 13, img: "citybg_2.png" }), speed: 0 });


    // LEVEL 1 OBSTACLES THESE SHOULD APPEAR IN THE ORDER THAT THEY DO IN THE CODE
    let buildingOne = { cx: 15, cy: 13, width: 3, height: 10.1325, img: "building1.png" };
    let buildingTwo = { cx: 10, cy: 13, width: 2.7, height: 4.85, img: "building2.png" };
    let buildingThree = { cx: 26, cy: 12, width: 3.95, height: 6.2, img: "building3.png" }
    let buildingFour = { cx: 36, cy: 13.25, width: 3.25, height: 3.55, img: "building4.png" };
    let buildingFive = { cx: 36, cy: 13.25, width: 3.4, height: 10, img: "building5.png" };
    let collectables = { cx: 2, cy: 12, radius: 0.25, width: 0.5, height: 0.5, img: "pizza.png" };


    // floating platform 1
    let platform_cfg = { cx: 6, cy: 12, width: 2, height: 0.25, img: "cloud.png" };
    let regular_platform = new Actor(game.world);
    regular_platform.appearance = new ImageSprite(platform_cfg);
    regular_platform.rigidBody = RigidBodyComponent.Box(platform_cfg, game.world, { density: 100, friction: 1 });
    regular_platform.role = new Obstacle();
    regular_platform.movement = new PathMovement(new Path().to(6, 12).to(6, 14).to(6, 12), 1, true);
    
    // box must be at heigh of 7 in order to be in the ground
    let building1 = new Actor(game.world);
    building1.appearance = new ImageSprite(buildingOne);
    building1.rigidBody = RigidBodyComponent.Box(buildingOne, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
    building1.role = new Obstacle();
    //building1.role = new Obstacle({jumpReEnable:false});
    // use this if you want the platform to be moving
    //sticky_platform.movement = new PathMovement(new Path().to(2, 6).to(4, 8).to(6, 6).to(4, 4).to(2, 6), 1, true);

    let building2 = new Actor(game.world);
    building2.appearance = new ImageSprite(buildingTwo);
    building2.rigidBody = RigidBodyComponent.Box(buildingTwo, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
    building2.role = new Obstacle();

    let building3 = new Actor(game.world);
    building3.appearance = new ImageSprite(buildingThree);
    building3.rigidBody = RigidBodyComponent.Box(buildingThree, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
    building3.role = new Obstacle();

    let building4 = new Actor(game.world);
    building4.appearance = new ImageSprite(buildingFour);
    building4.rigidBody = RigidBodyComponent.Box(buildingFour, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
    building4.role = new Obstacle();

    buildingOne = { cx: 42, cy: 13, width: 3, height: 10.1325, img: "building1.png" };
    let building5 = new Actor(game.world);
    building5.appearance = new ImageSprite(buildingOne);
    building5.rigidBody = RigidBodyComponent.Box(buildingOne, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
    building5.role = new Obstacle();


    // waffle
    collectables = { cx: 50, cy: 14, radius: 0.25, width: 0.5, height: 0.5, img: "hotdog.png" };
    let g10 = new Actor(game.world);
    g10.appearance = new ImageSprite(collectables);
    g10.role = new Goodie();
    g10.rigidBody = RigidBodyComponent.Circle(collectables, game.world);

    // ENEMY CAR
    let efg = {
      cx: 44, cy: 14, width: 1.97, height: 0.65,

      move_right: new AnimationSequence(true)
        .to("car2_R.png", duration),
      idle_right: Helpers.makeAnimation({ timePerFrame: 100, repeat: true, images: ["car2_R.png"] }),

      move_left: new AnimationSequence(true)
        .to("car2_L.png", duration),
      idle_left: Helpers.makeAnimation({ timePerFrame: 100, repeat: true, images: ["car2_L.png"] }),
    };
    
    let e = new Actor(game.world);
    e.appearance = new AnimatedSprite(efg);
    e.role = new Enemy({ onDefeated: () => { updateHealth(); }, damage: 1, onDefeatHero: () => { updateHealth(); }, disableHeroCollision: true});
    e.rigidBody = RigidBodyComponent.Box(efg, game.world, { density: 1.0, elasticity: 0.3, friction: 0.6 });
    e.movement = new PathMovement(new Path().to(44.5, 14.7).to(59.5, 14.7).to(44.5, 14.7), 7, true);

    let carfg = { cx: 44, cy: 14, width: 1.95, height: 0.63, img: "" };
    
    let carbox = new Actor(game.world);
    carbox.appearance = new ImageSprite(carfg);
    carbox.rigidBody = RigidBodyComponent.Box(carfg, game.world, { density: 1000, friction: .1 });
    carbox.role = new Obstacle();
    carbox.movement = new PathMovement(new Path().to(44.5, 14.7).to(59.5, 14.7).to(44.5, 14.7), 7, true);
    // END CAR


     // floating platform 2
    platform_cfg = { cx: 52, cy: 6, width: 2, height: 0.25, img: "cloud.png" };
    regular_platform = new Actor(game.world);
    regular_platform.appearance = new ImageSprite(platform_cfg);
    regular_platform.rigidBody = RigidBodyComponent.Box(platform_cfg, game.world, { density: 100, friction: 1 });
    regular_platform.role = new Obstacle();
    regular_platform.movement = new PathMovement(new Path().to(52, 16).to(52, 9).to(52, 16), 1, true);

    // floating platform 3
    platform_cfg = { cx: 56, cy: 6, width: 2, height: 0.25, img: "cloud.png" };
    regular_platform = new Actor(game.world);
    regular_platform.appearance = new ImageSprite(platform_cfg);
    regular_platform.rigidBody = RigidBodyComponent.Box(platform_cfg, game.world, { density: 100, friction: 1 });
    regular_platform.role = new Obstacle();
    regular_platform.movement = new PathMovement(new Path().to(58, 9).to(58, 16).to(58, 9), 1, true);

    collectables = { cx: 57.5, cy: 8, radius: 0.25, width: 0.5, height: 0.5, img: "pizza.png" };
    let g7 = new Actor(game.world);
    g7.appearance = new ImageSprite(collectables);
    g7.role = new Goodie();
    g7.rigidBody = RigidBodyComponent.Circle(collectables, game.world);

    // building 1
    buildingOne = { cx: 62, cy: 13, width: 3, height: 10.1325, img: "building1.png" };
    let building6 = new Actor(game.world);
    building6.appearance = new ImageSprite(buildingOne);
    building6.rigidBody = RigidBodyComponent.Box(buildingOne, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
    building6.role = new Obstacle();

    // waffle
    collectables = { cx: 62, cy: 7.5, radius: 0.25, width: 0.5, height: 0.5, img: "waffle.png" };
    let g5 = new Actor(game.world);
    g5.appearance = new ImageSprite(collectables);
    g5.role = new Goodie();
    g5.rigidBody = RigidBodyComponent.Circle(collectables, game.world);

    // building 4
    buildingFour = { cx: 68, cy: 13.25, width: 3.25, height: 3.55, img: "building4.png" };
    let building7 = new Actor(game.world);
    building7.appearance = new ImageSprite(buildingFour);
    building7.rigidBody = RigidBodyComponent.Box(buildingFour, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
    building7.role = new Obstacle();

    // hamburger
    collectables = { cx: 68, cy: 11, radius: 0.25, width: 0.5, height: 0.5, img: "hamburger.png" };
    let g8 = new Actor(game.world);
    g8.appearance = new ImageSprite(collectables);
    g8.role = new Goodie();
    g8.rigidBody = RigidBodyComponent.Circle(collectables, game.world);

    // building 5
    buildingFive = { cx: 75, cy: 13.25, width: 3.4, height: 10, img: "building5.png" };
    let building8 = new Actor(game.world);
    building8.appearance = new ImageSprite(buildingFive);
    building8.rigidBody = RigidBodyComponent.Box(buildingFive, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
    building8.role = new Obstacle();

    // hotdog
    collectables = { cx: 80, cy: 8.5, radius: 0.25, width: 0.5, height: 0.5, img: "hotdog.png" };
    let g9 = new Actor(game.world);
    g9.appearance = new ImageSprite(collectables);
    g9.role = new Goodie();
    g9.rigidBody = RigidBodyComponent.Circle(collectables, game.world);

    // waffle
    collectables = { cx: 77.2, cy: 14, radius: 0.25, width: 0.5, height: 0.5, img: "waffle.png" };
    let g15 = new Actor(game.world);
    g15.appearance = new ImageSprite(collectables);
    g15.role = new Goodie();
    g15.rigidBody = RigidBodyComponent.Circle(collectables, game.world);

    // building 3
    buildingThree = { cx: 80, cy: 12, width: 3.95, height: 6.2, img: "building3.png" }
    let building9 = new Actor(game.world);
    building9.appearance = new ImageSprite(buildingThree);
    building9.rigidBody = RigidBodyComponent.Box(buildingThree, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
    building9.role = new Obstacle();

    // ENEMY BIRD
    let bfg = {
      cx: 81, cy: 14, width: .69375, height: .39375,


      move_left: new AnimationSequence(true)
        .to("leftbird_1.png", duration)
        .to("leftbird_2.png", duration)
        .to("leftbird_3.png", duration)
        .to("leftbird_4.png", duration)
        .to("leftbird_3.png", duration)
        .to("leftbird_2.png", duration),
      idle_left: Helpers.makeAnimation({ timePerFrame: 60, repeat: true, images: ["leftbird_1.png"] }),

      move_right: new AnimationSequence(true)
        .to("rightbird_1.png", duration)
        .to("rightbird_2.png", duration)
        .to("rightbird_3.png", duration)
        .to("rightbird_4.png", duration)
        .to("rightbird_3.png", duration)
        .to("rightbird_2.png", duration),
      idle_right: Helpers.makeAnimation({ timePerFrame: 60, repeat: true, images: ["rightbird_1.png"] }),
    };
    

    let b = new Actor(game.world);
    b.appearance = new AnimatedSprite(bfg);
    // update the health once defeated
    b.role = new Enemy({ onDefeated: () => { updateHealth(); }, damage: 1, onDefeatHero: () => { updateHealth(); }, disableHeroCollision: true});
    b.rigidBody = RigidBodyComponent.Box(bfg, game.world, { density: 1.0, elasticity: 0.3, friction: 0.6 });
    b.movement = new PathMovement(new Path().to(81, 8).to(90, 11).to(95, 6).to(90, 11).to(81, 8), 4, true);

    // waffle
    collectables = { cx: 92.5, cy: 12, radius: 0.25, width: 0.5, height: 0.5, img: "waffle.png" };
    let g11 = new Actor(game.world);
    g11.appearance = new ImageSprite(collectables);
    g11.role = new Goodie();
    g11.rigidBody = RigidBodyComponent.Circle(collectables, game.world);

    // building 4
    buildingFour = { cx: 90, cy: 13.25, width: 3.25, height: 3.55, img: "building4.png" };
    let building10 = new Actor(game.world);
    building10.appearance = new ImageSprite(buildingFour);
    building10.rigidBody = RigidBodyComponent.Box(buildingFour, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
    building10.role = new Obstacle();5

    // building 1
    buildingOne = { cx: 95, cy: 13, width: 3, height: 10.1325, img: "building1.png" };
    let building11 = new Actor(game.world);
    building11.appearance = new ImageSprite(buildingOne);
    building11.rigidBody = RigidBodyComponent.Box(buildingOne, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
    building11.role = new Obstacle();

    // hamburger
    collectables = { cx: 95, cy: 7, radius: 0.25, width: 0.5, height: 0.5, img: "hamburger.png" };
    let g12 = new Actor(game.world);
    g12.appearance = new ImageSprite(collectables);
    g12.role = new Goodie();
    g12.rigidBody = RigidBodyComponent.Circle(collectables, game.world);

    // START ENEMY CAR
    e = new Actor(game.world);
    e.appearance = new AnimatedSprite(efg);
    e.role = new Enemy({ onDefeated: () => { updateHealth(); }, damage: 1, onDefeatHero: () => { updateHealth(); }, disableHeroCollision: true});
    e.rigidBody = RigidBodyComponent.Box(efg, game.world, { density: 1.0, elasticity: 0.3, friction: 0.6 });
    e.movement = new PathMovement(new Path().to(97.5, 14.7).to(105.5, 14.7).to(97.5, 14.7), 7, true);

    carfg = { cx: 97.5, cy: 14.7, width: 1.95, height: 0.63, img: "" };
    
    carbox = new Actor(game.world);
    carbox.appearance = new ImageSprite(carfg);
    carbox.rigidBody = RigidBodyComponent.Box(carfg, game.world, { density: 1000, friction: .1 });
    carbox.role = new Obstacle();
    carbox.movement = new PathMovement(new Path().to(97.5, 14.7).to(105.5, 14.7).to(97.5, 14.7), 7, true);
    // END CAR

    // hot dog
    collectables = { cx: 104, cy: 14.7, radius: 0.25, width: 0.5, height: 0.5, img: "hotdog.png" };
    let g13 = new Actor(game.world);
    g13.appearance = new ImageSprite(collectables);
    g13.role = new Goodie();
    g13.rigidBody = RigidBodyComponent.Circle(collectables, game.world);

    // building 4
    buildingFour = { cx: 108, cy: 13.25, width: 3.25, height: 3.55, img: "building4.png" };
    let building12 = new Actor(game.world);
    building12.appearance = new ImageSprite(buildingFour);
    building12.rigidBody = RigidBodyComponent.Box(buildingFour, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
    building12.role = new Obstacle();

    // waffle
    collectables = { cx: 118, cy: 9, radius: 0.25, width: 0.5, height: 0.5, img: "waffle.png" };
    let g14 = new Actor(game.world);
    g14.appearance = new ImageSprite(collectables);
    g14.role = new Goodie();
    g14.rigidBody = RigidBodyComponent.Circle(collectables, game.world);

    // building 2
    buildingTwo = { cx: 118, cy: 13, width: 2.7, height: 4.85, img: "building2.png" };
    let building13 = new Actor(game.world);
    building13.appearance = new ImageSprite(buildingTwo);
    building13.rigidBody = RigidBodyComponent.Box(buildingTwo, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
    building13.role = new Obstacle();
     
    // END OF LEVEL DOOR
    let dfg =  { cx: 125, cy: 14.35, width: .64, height: 1.28, img: "" };
    let d = new Actor(game.world);
    d.appearance = new ImageSprite(dfg);
    d.rigidBody = RigidBodyComponent.Box(dfg, game.world);
    d.role = new Destination( {onAttemptArrival: () => { return game.score.goodieCount[0] >= neededGoodies;}} );

    // box around door
    dfg = { cx: 125, cy: 14.35, width: .62, height: 1.40, img: "door.png" };
    let dbox = new Actor(game.world);
    dbox.appearance = new ImageSprite(dfg);
    dbox.rigidBody = RigidBodyComponent.Box(dfg, game.world);
    dbox.role = new Obstacle();

    // GOODIES (MADE BEFOREHAND)
    collectables = { cx: 6, cy: 12, radius: 0.25, width: 0.5, height: 0.5, img: "pizza.png" };
    let g = new Actor(game.world);
    g.appearance = new ImageSprite(collectables);
    g.role = new Goodie();
    g.rigidBody = RigidBodyComponent.Circle(collectables, game.world);

    collectables = { cx: 10, cy: 10, radius: 0.25, width: 0.5, height: 0.5, img: "hamburger.png" };
    let g2 = new Actor(game.world);
    g2.appearance = new ImageSprite(collectables);
    g2.role = new Goodie();
    g2.rigidBody = RigidBodyComponent.Circle(collectables, game.world);

    collectables = { cx: 12.5, cy: 14, radius: 0.25, width: 0.5, height: 0.5, img: "waffle.png" };
    let g3 = new Actor(game.world);
    g3.appearance = new ImageSprite(collectables);
    g3.role = new Goodie();
    g3.rigidBody = RigidBodyComponent.Circle(collectables, game.world);
    collectables = { cx: 20, cy: 12, radius: 0.25, width: 0.5, height: 0.5, img: "hotdog.png" };
    let g4 = new Actor(game.world);
    g4.appearance = new ImageSprite(collectables);
    g4.role = new Goodie();
    g4.rigidBody = RigidBodyComponent.Circle(collectables, game.world);

    collectables = { cx: 30, cy: 12, radius: 0.25, width: 0.5, height: 0.5, img: "hamburger.png" };
    let g6 = new Actor(game.world);
    g6.appearance = new ImageSprite(collectables);
    g6.role = new Goodie();
    g6.rigidBody = RigidBodyComponent.Circle(collectables, game.world);

    // LEVEL TWO FOOD COUNT AND HEALTH
    let t = new Actor(game.hud);
    t.appearance = new TextSprite({ cx: 0.25, cy: .25, center: false, face: "Arial", color: "#FFFFFF", size: 100, z: 2 },
      () => "🍔" + game.score.goodieCount[0] + "/" + neededGoodies + " " + updateHealth());

    // LEVEL TWO  TIMER / COUNTDOWN
    t = new Actor(game.hud);
    game.score.loseCountDownRemaining = 90;
    t.appearance = new TextSprite({ cx: 15, cy: .35, center: false, face: "Arial", color: "#FFFFFF", size: 64, z: 2 }, () =>
      (game.score.loseCountDownRemaining ?? 0).toFixed(0));
    
    //t = new Actor(game.hud);
    //t.appearance = new TextSprite({ cx: 4, cy: .45, center: false, face: "Arial", color: "#FFFFFF", size: 64, z: 2 },
    //  () => updateHealth());
    // draw a strength meter to show this hero's strength
    // we use this function to detect if a collision with an enemy occurs as well
    function updateHealth()
    {
      if ((h.role as Hero).strength == 3)
        return "❤️❤️❤️"
      if ((h.role as Hero).strength == 2)
      {
        return "❤️❤️"
      }
      if ((h.role as Hero).strength == 1)
      {
        return "❤️"
      }
      return "";
    }

    welcomeMessage("LEVEL TWO\nCLICK TO BEGIN");
    winMessage("LEVEL TWO PASSED");
    loseMessage("LEVEL FAILED\nCLICK TO TRY AGAIN");
  }

  else if (index == 3)
  {
    {  
      let neededGoodies = 20;
      game.score.setVictoryGoodies(neededGoodies,0,0,0);
      let jumpPower = 8; // this should be 8 when not testing
      Helpers.setMusic("bgMusic_1.mp3");
  
  
  
      game.world.camera.setBounds(128, 15);
      Helpers.resetGravity(0, 10);
      //Helpers.enableTilt(10, 0);
      Helpers.drawBoundingBox(0, 0, 128, 15, .1, { density: 1 });
      //let cfg = { cx: 0, cy: 0, width: 1, height: 1, radius: 0, img: "character1.png" };
  
  
      let duration: number = 175;
      let jumpDuration: number = 500;
  
  
      let cfg = {
        cx: 0, cy: 15, width: 0.75, height: 0.75,
  
  
  
  
        move_right: new AnimationSequence(true)
          .to("run1_R.png", duration)
          .to("run2_R.png", duration)
          .to("run3_R.png", duration)
          .to("run4_R.png", duration)
          .to("run5_R.png", duration)
          .to("run6_R.png", duration)
          .to("run7_R.png", duration)
          .to("run8_R.png", duration),
        idle_right: Helpers.makeAnimation({ timePerFrame: 100, repeat: true, images: ["idle_R.png"] }),
  
  
  
  
        move_left: new AnimationSequence(true)
          .to("run1_L.png", duration)
          .to("run2_L.png", duration)
          .to("run3_L.png", duration)
          .to("run4_L.png", duration)
          .to("run5_L.png", duration)
          .to("run6_L.png", duration)
          .to("run7_L.png", duration)
          .to("run8_L.png", duration),
        idle_left: Helpers.makeAnimation({ timePerFrame: 100, repeat: true, images: ["idle_L.png"] }),
  
  
  
  
        jump_right: new AnimationSequence(true)
          .to("jump1_R.png", jumpDuration)
          .to("jump2_R.png", jumpDuration)
          .to("jump3_R.png", jumpDuration),
  
  
  
  
        jump_left: new AnimationSequence(true)
          .to("jump1_L.png", jumpDuration)
          .to("jump2_L.png", jumpDuration)
          .to("jump3_L.png", jumpDuration),
  
  
  
  
      };
  
  
  
  
  
  
  
  
      let h = new Actor(game.world);
      h.appearance = new AnimatedSprite(cfg);
      h.rigidBody = RigidBodyComponent.Box(cfg, game.world, { density: 25, friction: .5, disableRotation: true });
      h.movement = new ExplicitMovement({ gravityAffectsIt: true});
      h.role = new Hero({ strength: 3, jumpSound: "jump.wav" });
  
  
  
  
      // this jump is working Helpers.jumpAction(h, 0, -5, 0)
      // KEY UP
      let canJump = true;
  
  
  
  
      if (canJump)
      {
        game.keyboard.setKeyUpHandler(KeyCodes.UP, () => (jump()));
        // NEED TO FIX THIS HERE
        //game.keyboard.setKeyUpHandler(KeyCodes.UP, () => (canJump = false));
      }
  
  
  
  
      // jumps then set canJump to false, calling a timer
      function jump()
      {
        if (canJump)
        {
          (h.role as Hero).jump(0, -jumpPower)
          canJump = false;
          // Set canJump true after .5 seconds
          game.world.timer.addEvent(new TimedEvent(.1, true, () =>
          {
          canJump = true;
          }));
        }
      }
  
  
  
  
      //game.keyboard.setKeyUpHandler(KeyCodes.DOWN, () => (h.movement as ExplicitMovement).setAbsoluteVelocity(h.movement.getXVelocity(), 0));
      game.keyboard.setKeyUpHandler(KeyCodes.LEFT, () => (h.movement as ExplicitMovement).setAbsoluteVelocity(0, (h.movement as ExplicitMovement).getYVelocity()!));
      game.keyboard.setKeyUpHandler(KeyCodes.RIGHT, () => (h.movement as ExplicitMovement).setAbsoluteVelocity(0, (h.movement as ExplicitMovement).getYVelocity()!));
      //h.movement.getXVelocity();
      //h.movement.getYVelocity();
      //(h.role as Hero).jump()x
  
  
  
  
      game.keyboard.setKeyDownHandler(KeyCodes.RIGHT, () => (h.movement as ExplicitMovement).updateVelocity(10, (h.movement as ExplicitMovement).getYVelocity()!));
      game.keyboard.setKeyDownHandler(KeyCodes.LEFT, () => (h.movement as ExplicitMovement).updateVelocity(-10, (h.movement as ExplicitMovement).getYVelocity()!));
  
  
  
  
      game.score.setVictoryDestination(1);
  
  
  
  
      // center the camera a little ahead of the hero, so we can see more of the
      // world during gameplay
      game.world.camera.setCameraChase(h, 0, 10);
      // Put a button on screen that makes the hero jump. Note that we can put a
      // delay (in this case, 9000 milliseconds) to prevent rapid re-jumping.  If
      // you make it 0, you still can't jump while in the air, but you can jump as
      // soon as you land.
      //Helpers.addTapControl(game.hud, { cx: 8, cy: 4.5, width: 16, height: 9, img: "" }, Helpers.jumpAction(h, 0, -10, 9000));
      // set up the backgrounds
      game.backgroundColor = 0x17b4ff;
      game.background.addLayer({ appearance: new ImageSprite({ cx: 0, cy: 9, width: 42, height: 13, img: "citybg_2.png" }), speed: 0 });
  
  
  
  
  
  
  
  
      // LEVEL 1 OBSTACLES THESE SHOULD APPEAR IN THE ORDER THAT THEY DO IN THE CODE
      let buildingOne = { cx: 12.7, cy: 13, width: 3, height: 10.1325, img: "building1.png" };
      let buildingTwo = { cx: 5, cy: 13.2, width: 2.7, height: 3.87, img: "building2.png" };
      let buildingThree = { cx: 8, cy: 14, width: 1.316, height: 3.06666, img: "building3.png" }
      let buildingFour = { cx: 26, cy: 13.25, width: 3.9, height: 4.01, img: "building4.png" };
      let buildingSix = { cx: 33.2, cy: 13, width: 3.9, height: 6.2, img: "building3.png" };
      let buildingEight = { cx: 60, cy: 12.7, width: 3.9, height: 9.18, img: "building3.png"};
      let buildingNine = { cx: 67, cy: 12.7, width: 3.9, height: 9.18, img: "building3.png"};
      let buildingTen = { cx: 85, cy: 13.25, width: 2.6, height: 4.67, img: "building4.png"};
      let buildingEleven = { cx: 93, cy: 13, width: 3, height: 10.1325, img: "building1.png"};
      let buildingTwelve = { cx: 100, cy: 13.25, width: 2.6, height: 4.67, img: "building4.png"};
      let buildingThirteen = { cx: 107, cy: 13.25, width: 2.6, height: 4.67, img: "building4.png"};
      let buildingFourteen = { cx: 114, cy: 13.25, width: 2.6, height: 4.67, img: "building4.png"};
      let buildingFifteen = { cx: 123, cy: 13, width: 3, height: 10.1325, img:"building1.png"};
  
  
      // box must be at heigh of 7 in order to be in the ground
      let building1 = new Actor(game.world);
      building1.appearance = new ImageSprite(buildingOne);
      building1.rigidBody = RigidBodyComponent.Box(buildingOne, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
      building1.role = new Obstacle();
      //building1.role = new Obstacle({jumpReEnable:false});
      // use this if you want the platform to be moving
      //sticky_platform.movement = new PathMovement(new Path().to(2, 6).to(4, 8).to(6, 6).to(4, 4).to(2, 6), 1, true);
  
  
  
  
      let building2 = new Actor(game.world);
      building2.appearance = new ImageSprite(buildingTwo);
      building2.rigidBody = RigidBodyComponent.Box(buildingTwo, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
      building2.role = new Obstacle();
  
  
  
  
      let building3 = new Actor(game.world);
      building3.appearance = new ImageSprite(buildingThree);
      building3.rigidBody = RigidBodyComponent.Box(buildingThree, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
      building3.role = new Obstacle();
  
  
  
  
      let building4 = new Actor(game.world);
      building4.appearance = new ImageSprite(buildingFour);
      building4.rigidBody = RigidBodyComponent.Box(buildingFour, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
      building4.role = new Obstacle();
  
  
  
  
      buildingOne = { cx: 42, cy: 13, width: 3, height: 10.1325, img: "building1.png" };
      let building5 = new Actor(game.world);
      building5.appearance = new ImageSprite(buildingOne);
      building5.rigidBody = RigidBodyComponent.Box(buildingOne, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
      building5.role = new Obstacle();
  
  
  
  
      let building7 = new Actor(game.world);
      building7.appearance = new ImageSprite(buildingSix);
      building7.rigidBody = RigidBodyComponent.Box(buildingSix, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
      building7.role = new Obstacle();
  
  
  
  
      let building8 = new Actor(game.world);
      building8.appearance = new ImageSprite(buildingEight);
      building8.rigidBody = RigidBodyComponent.Box(buildingEight, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
      building8.role = new Obstacle();
  
  
  
  
      let building9 = new Actor(game.world);
      building9.appearance = new ImageSprite(buildingNine);
      building9.rigidBody = RigidBodyComponent.Box(buildingNine, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
      building9.role = new Obstacle();
  
  
  
  
      let building10 = new Actor(game.world);
      building10.appearance = new ImageSprite(buildingTen);
      building10.rigidBody = RigidBodyComponent.Box(buildingTen, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
      building10.role = new Obstacle();
  
  
  
  
      let building11 = new Actor(game.world);
      building11.appearance = new ImageSprite(buildingEleven);
      building11.rigidBody = RigidBodyComponent.Box(buildingEleven, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
      building11.role = new Obstacle();
  
  
  
  
      let building12 = new Actor(game.world);
      building12.appearance = new ImageSprite(buildingTwelve);
      building12.rigidBody = RigidBodyComponent.Box(buildingTwelve, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
      building12.role = new Obstacle();
  
  
  
  
      let building13 = new Actor(game.world);
      building13.appearance = new ImageSprite(buildingThirteen);
      building13.rigidBody = RigidBodyComponent.Box(buildingThirteen, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
      building13.role = new Obstacle();
  
  
  
  
      let building14 = new Actor(game.world);
      building14.appearance = new ImageSprite(buildingFourteen);
      building14.rigidBody = RigidBodyComponent.Box(buildingFourteen, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
      building14.role = new Obstacle();
  
  
  
  
      let building15 = new Actor(game.world);
      building15.appearance = new ImageSprite(buildingFifteen);
      building15.rigidBody = RigidBodyComponent.Box(buildingFifteen, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
      building15.role = new Obstacle();
  
  
  
  
      // ENEMY CAR
      let efg = {
        cx: 44, cy: 14, width: 1.97, height: 0.65,
  
  
  
  
        move_right: new AnimationSequence(true)
          .to("car2_R.png", duration),
        idle_right: Helpers.makeAnimation({ timePerFrame: 100, repeat: true, images: ["car2_R.png"] }),
  
  
  
  
        move_left: new AnimationSequence(true)
          .to("car2_L.png", duration),
        idle_left: Helpers.makeAnimation({ timePerFrame: 100, repeat: true, images: ["car2_L.png"] }),
      };
  
      let e = new Actor(game.world);
      e.appearance = new AnimatedSprite(efg);
      e.role = new Enemy({ onDefeated: () => { updateHealth(); }, damage: 1, onDefeatHero: () => { updateHealth(); }, disableHeroCollision: true});
      e.rigidBody = RigidBodyComponent.Box(efg, game.world, { density: 1.0, elasticity: 0.3, friction: 0.6 });
      e.movement = new PathMovement(new Path().to(15.2, 14.7).to(23, 14.7).to(15.2, 14.7), 7, true);

      let carfg = { cx: 15.2, cy: 14.7, width: 1.95, height: 0.63, img: "" };  
      let carbox = new Actor(game.world);
      carbox.appearance = new ImageSprite(carfg);
      carbox.rigidBody = RigidBodyComponent.Box(carfg, game.world, { density: 1000, friction: .1 });
      carbox.role = new Obstacle();
      carbox.movement = new PathMovement(new Path().to(15.2, 14.7).to(23, 14.7).to(15.2, 14.7), 7, true);
      // END ENEMY CAR
  
  
      
  
      // ENEMY BIRD
      let bfg = {
        cx: 44, cy: 14, width: .69375, height: .39375,
  
  
        move_left: new AnimationSequence(true)
          .to("leftbird_1.png", duration)
          .to("leftbird_2.png", duration)
          .to("leftbird_3.png", duration)
          .to("leftbird_4.png", duration)
          .to("leftbird_3.png", duration)
          .to("leftbird_2.png", duration),
        idle_left: Helpers.makeAnimation({ timePerFrame: 60, repeat: true, images: ["leftbird_1.png"] }),
  
  
        move_right: new AnimationSequence(true)
          .to("rightbird_1.png", duration)
          .to("rightbird_2.png", duration)
          .to("rightbird_3.png", duration)
          .to("rightbird_4.png", duration)
          .to("rightbird_3.png", duration)
          .to("rightbird_2.png", duration),
        idle_right: Helpers.makeAnimation({ timePerFrame: 60, repeat: true, images: ["rightbird_1.png"] }),
      };
     
      let b = new Actor(game.world);
      b.appearance = new AnimatedSprite(bfg);
      // update the health once defeated
      b.role = new Enemy({ onDefeated: () => { updateHealth(); }, damage: 1, onDefeatHero: () => { updateHealth(); }, disableHeroCollision: true});
      b.rigidBody = RigidBodyComponent.Box(bfg, game.world, { density: 1.0, elasticity: 0.3, friction: 0.6 });
      b.movement = new PathMovement(new Path().to(23, 7).to(29, 9.83).to(23, 7), 4, true);
  
  
      b = new Actor(game.world);
      b.appearance = new AnimatedSprite(bfg);
      b.role = new Enemy({ onDefeated: () => { updateHealth(); }, damage: 1, onDefeatHero: () => { updateHealth(); }, disableHeroCollision: true});
      b.rigidBody = RigidBodyComponent.Box(bfg, game.world, { density: 1.0, elasticity: 0.3, friction: 0.6 });
      b.movement = new PathMovement(new Path().to(115.7, 10).to(120.8, 10).to(115.7, 10), 6, true);
  
  
      b = new Actor(game.world);
      b.appearance = new AnimatedSprite(bfg);
      b.role = new Enemy({ onDefeated: () => { updateHealth(); }, damage: 1, onDefeatHero: () => { updateHealth(); }, disableHeroCollision: true});
      b.rigidBody = RigidBodyComponent.Box(bfg, game.world, { density: 1.0, elasticity: 0.3, friction: 0.6 });
      b.movement = new PathMovement(new Path().to(44.3, 12).to(49.7, 12).to(44.3, 12), 5, true);
  
  
      b = new Actor(game.world);
      b.appearance = new AnimatedSprite(bfg);
      b.role = new Enemy({ onDefeated: () => { updateHealth(); }, damage: 1, onDefeatHero: () => { updateHealth(); }, disableHeroCollision: true});
      b.rigidBody = RigidBodyComponent.Box(bfg, game.world, { density: 1.0, elasticity: 0.3, friction: 0.6 });
      b.movement = new PathMovement(new Path().to(86.8, 10).to(91.43, 8).to(86.8, 10), 5, true);
  
  
  
  
      e = new Actor(game.world);
      e.appearance = new AnimatedSprite(efg);
      e.role = new Enemy({ onDefeated: () => { updateHealth(); }, damage: 1, onDefeatHero: () => { updateHealth(); }, disableHeroCollision: true});
      e.rigidBody = RigidBodyComponent.Box(efg, game.world, { density: 1.0, elasticity: 0.3, friction: 0.6 });
      e.movement = new PathMovement(new Path().to(69.77, 14.7).to(83.5, 14.7).to(69.77, 14.7), 7, true);
  
  
      buildingOne = { cx: 52, cy: 15, width: 3, height: 10.1325, img: "building1.png" };
      let building6 = new Actor(game.world);
      building6.appearance = new ImageSprite(buildingOne);
      building6.rigidBody = RigidBodyComponent.Box(buildingOne, game.world, { topSticky: false, topRigidOnly: false, density: 100, friction: .1 });
      building6.role = new Obstacle();
  
  
  
  
      // GOODIES
      let collectables = { cx: 2, cy: 12, radius: 0.25, width: 0.5, height: 0.5, img: "pizza.png" };
      let g = new Actor(game.world);
      g.appearance = new ImageSprite(collectables);
      g.role = new Goodie();
      g.rigidBody = RigidBodyComponent.Circle(collectables, game.world);
  
  
  
  
      collectables = { cx: 12.7, cy: 7.54, radius: 0.25, width: 0.5, height: 0.5, img: "hamburger.png" };
      let g2 = new Actor(game.world);
      g2.appearance = new ImageSprite(collectables);
      g2.role = new Goodie();
      g2.rigidBody = RigidBodyComponent.Circle(collectables, game.world);
  
  
  
  
      collectables = { cx: 7.65, cy: 12, radius: 0.25, width: 0.5, height: 0.5, img: "pizza.png" };
      let g3 = new Actor(game.world);
      g3.appearance = new ImageSprite(collectables);
      g3.role = new Goodie();
      g3.rigidBody = RigidBodyComponent.Circle(collectables, game.world);
  
  
  
  
      collectables = { cx: 19.35, cy: 13, radius: 0.25, width: 0.5, height: 0.5, img: "hotdog.png" };
      let g4 = new Actor(game.world);
      g4.appearance = new ImageSprite(collectables);
      g4.role = new Goodie();
      g4.rigidBody = RigidBodyComponent.Circle(collectables, game.world);
  
  
  
  
      collectables = { cx: 26, cy: 11, radius: 0.25, width: 0.5, height: 0.5, img: "waffle.png" };
      let g5 = new Actor(game.world);
      g5.appearance = new ImageSprite(collectables);
      g5.role = new Goodie();
      g5.rigidBody = RigidBodyComponent.Circle(collectables, game.world);
  
  
  
  
      collectables = { cx: 33.2, cy: 9.64, radius: 0.25, width: 0.5, height: 0.5, img: "hamburger.png" };
      let g6 = new Actor(game.world);
      g6.appearance = new ImageSprite(collectables);
      g6.role = new Goodie();
      g6.rigidBody = RigidBodyComponent.Circle(collectables, game.world);
  
  
  
  
      collectables = { cx: 42, cy: 7.5, radius: 0.25, width: 0.5, height: 0.5, img: "pizza.png" };
      let g7 = new Actor(game.world);
      g7.appearance = new ImageSprite(collectables);
      g7.role = new Goodie();
      g7.rigidBody = RigidBodyComponent.Circle(collectables, game.world);
  
  
  
  
      collectables = { cx: 47, cy: 14.5, radius: 0.25, width: 0.5, height: 0.5, img: "hotdog.png" };
      let g8 = new Actor(game.world);
      g8.appearance = new ImageSprite(collectables);
      g8.role = new Goodie();
      g8.rigidBody = RigidBodyComponent.Circle(collectables, game.world);
  
  
  
  
      collectables = { cx: 60, cy: 7.5, radius: 0.25, width: 0.5, height: 0.5, img: "waffle.png" };
      let g9 = new Actor(game.world);
      g9.appearance = new ImageSprite(collectables);
      g9.role = new Goodie();
      g9.rigidBody = RigidBodyComponent.Circle(collectables, game.world);
  
  
  
  
      collectables = { cx: 63.5, cy: 10, radius: 0.25, width: 0.5, height: 0.5, img: "hamburger.png" };
      let g10 = new Actor(game.world);
      g10.appearance = new ImageSprite(collectables);
      g10.role = new Goodie();
      g10.rigidBody = RigidBodyComponent.Circle(collectables, game.world);
  
  
  
  
      collectables = { cx: 63.5, cy: 12, radius: 0.25, width: 0.5, height: 0.5, img: "pizza.png" };
      let g11 = new Actor(game.world);
      g11.appearance = new ImageSprite(collectables);
      g11.role = new Goodie();
      g11.rigidBody = RigidBodyComponent.Circle(collectables, game.world);
  
  
  
  
      collectables = { cx: 63.5, cy: 14, radius: 0.25, width: 0.5, height: 0.5, img: "hotdog.png" };
      let g12 = new Actor(game.world);
      g12.appearance = new ImageSprite(collectables);
      g12.role = new Goodie();
      g12.rigidBody = RigidBodyComponent.Circle(collectables, game.world);
  
  
  
  
      collectables = { cx: 67, cy: 7.5, radius: 0.25, width: 0.5, height: 0.5, img: "waffle.png" };
      let g13 = new Actor(game.world);
      g13.appearance = new ImageSprite(collectables);
      g13.role = new Goodie();
      g13.rigidBody = RigidBodyComponent.Circle(collectables, game.world);
  
  
  
  
      collectables = { cx: 73, cy: 14.5, radius: 0.25, width: 0.5, height: 0.5, img: "hamburger.png" };
      let g14 = new Actor(game.world);
      g14.appearance = new ImageSprite(collectables);
      g14.role = new Goodie();
      g14.rigidBody = RigidBodyComponent.Circle(collectables, game.world);
  
  
  
  
      collectables = { cx: 78, cy: 14.5, radius: 0.25, width: 0.5, height: 0.5, img: "hamburger.png" };
      let g15 = new Actor(game.world);
      g15.appearance = new ImageSprite(collectables);
      g15.role = new Goodie();
      g15.rigidBody = RigidBodyComponent.Circle(collectables, game.world);
  
  
  
  
      collectables = { cx: 100, cy: 9.6, radius: 0.25, width: 0.5, height: 0.5, img: "pizza.png" };
      let g16 = new Actor(game.world);
      g16.appearance = new ImageSprite(collectables);
      g16.role = new Goodie();
      g16.rigidBody = RigidBodyComponent.Circle(collectables, game.world);
  
  
  
  
      collectables = { cx: 103.5, cy: 14.5, radius: 0.25, width: 0.5, height: 0.5, img: "hotdog.png" };
      let g17 = new Actor(game.world);
      g17.appearance = new ImageSprite(collectables);
      g17.role = new Goodie();
      g17.rigidBody = RigidBodyComponent.Circle(collectables, game.world);
  
  
  
  
      collectables = { cx: 110.5, cy: 14.5, radius: 0.25, width: 0.5, height: 0.5, img: "waffle.png" };
      let g18 = new Actor(game.world);
      g18.appearance = new ImageSprite(collectables);
      g18.role = new Goodie();
      g18.rigidBody = RigidBodyComponent.Circle(collectables, game.world);
  
  
  
  
      collectables = { cx: 118.5, cy: 14.5, radius: 0.25, width: 0.5, height: 0.5, img: "pizza.png" };
      let g19 = new Actor(game.world);
      g19.appearance = new ImageSprite(collectables);
      g19.role = new Goodie();
      g19.rigidBody = RigidBodyComponent.Circle(collectables, game.world);
  
  
  
  
      collectables = { cx: 127, cy: 9.8, radius: 0.25, width: 0.5, height: 0.5, img: "hamburger.png" };
      let g20 = new Actor(game.world);
      g20.appearance = new ImageSprite(collectables);
      g20.role = new Goodie();
      g20.rigidBody = RigidBodyComponent.Circle(collectables, game.world);
  
  // END OF LEVEL TWO DOOR
  let dfg =  { cx: 126.5, cy: 14.35, width: .64, height: 1.28, img: "" };
  let d = new Actor(game.world);
  d.appearance = new ImageSprite(dfg);
  d.rigidBody = RigidBodyComponent.Box(dfg, game.world);
  d.role = new Destination( {onAttemptArrival: () => { return game.score.goodieCount[0] >= neededGoodies;}} );

  // door image and collider, does not allow player to come in from the top
  dfg = { cx: 126.5, cy: 14.35, width: .64, height: 1.40, img: "door.png" };
  let dbox = new Actor(game.world);
  dbox.appearance = new ImageSprite(dfg);
  dbox.rigidBody = RigidBodyComponent.Box(dfg, game.world);
  dbox.role = new Obstacle();
  
  
  
      // LEVEL THREE FOOD COUNT
      let t = new Actor(game.hud);
      t.appearance = new TextSprite({ cx: 0.25, cy: .25, center: false, face: "Arial", color: "#FFFFFF", size: 100, z: 2 },
        () => "🍔" + game.score.goodieCount[0] + "/20");
  
  
  
  
      // LEVEL THREE  TIMER / COUNTDOWN
      t = new Actor(game.hud);
      game.score.loseCountDownRemaining = 60;
      t.appearance = new TextSprite({ cx: 15, cy: .35, center: false, face: "Arial", color: "#FFFFFF", size: 64, z: 2 }, () =>
        (game.score.loseCountDownRemaining ?? 0).toFixed(0));
     
        t = new Actor(game.hud);
        t.appearance = new TextSprite({ cx: 4, cy: .45, center: false, face: "Arial", color: "#FFFFFF", size: 64, z: 2 },
          () => updateHealth());
        // draw a strength meter to show this hero's strength
        // we use this function to detect if a collision with an enemy occurs as well
        function updateHealth()
        {
          if ((h.role as Hero).strength == 3)
            return "❤️❤️❤️"
          if ((h.role as Hero).strength == 2)
          {
            return "❤️❤️"
          }
          if ((h.role as Hero).strength == 1)
          {
            return "❤️"
          }
          return "";
        }
         
  
  
  
  
      welcomeMessage("LEVEL THREE\nCLICK TO BEGIN");
      winMessage("GAME COMPLETE");
      loseMessage("LEVEL FAILED\nCLICK TO TRY AGAIN");
  
  
    // In the last level, the green ball could go off screen, and there were no
    // instructions when we started.  Let's re-create the level, and make it a
    // little nicer.
   
    }
  
  }

  // You just made it to the last level.  Now it's time to reveal a little
  // secret...  No matter which "if" or "else if" the code did, it eventually
  // got down here, where we do three standard configuration tasks.

  // This line ensures that, no matter what level we draw, the ESCAPE key is
  // configured to go back to the Chooser.  index/24 makes sure we go to the
  // correct chooser screen.
  game.keyboard.setKeyUpHandler(KeyCodes.ESCAPE, () => game.switchTo(game.config.chooserBuilder, Math.ceil(index / 24)));

  // Put the level number in the top right corner of every level
  //let t = new Actor(game.hud);
  //t.appearance = new TextSprite({ cx: 14.7, cy: 0.4, center: false, face: "arial", color: "#FFFFFF", size: 32, z: 2 },
  //  () => "LEVEL " + index);

  // Make sure we go to the correct level when this level is won/lost: for
  // anything but the last level, we go to the next level.  Otherwise, go to the splash screen
  if (index != 3) {
    game.score.levelOnFail = { index, which: StageTypes.PLAY };
    game.score.levelOnWin = { index: index + 1, which: StageTypes.PLAY };
  }
  else {
    game.score.levelOnFail = { index, which: StageTypes.PLAY };
    game.score.levelOnWin = { index: 1, which: StageTypes.SPLASH };
  }
}

/**
 * This is a standard way of drawing a black screen with some text, to serve as
 * the welcome screen for the game
 *
 * @param message The message to display
 */
export function welcomeMessage(message: string) {
  // Immediately install the overlay, to pause the game
  game.installOverlay((overlay: Scene) => {
    // Pressing anywhere on the black background will make the overlay go away
    Helpers.addTapControl(overlay, { cx: 8, cy: 4.5, width: 16, height: 9, img: "purple.png" }, () => { game.clearOverlay(); return true; });
    // The text goes in the middle
    let t = new Actor(overlay);
    t.appearance = new TextSprite({ center: true, cx: 8, cy: 4.5, face: "Arial", color: "#FFFFFF", size: 50, z: 10 }, () => message);
  });
}

/**
 * This is a standard way of drawing a black screen with some text, to serve as
 * the win screen for the game
 *
 * @param message   The message to display in the middle of the screen
 * @param callback  Code to run when the win message first appears
 */
export function winMessage(message: string, callback?: () => void) {
  game.score.winSceneBuilder = (overlay: Scene) => {
    Helpers.addTapControl(overlay, { cx: 8, cy: 4.5, width: 16, height: 9, img: "purple.png" }, () => {
      // We need to be careful... we might go back to the chooser or splash!
      if (game.score.levelOnWin.which == StageTypes.PLAY)
        game.switchTo(game.config.levelBuilder, game.score.levelOnWin.index);
      else if (game.score.levelOnWin.which == StageTypes.CHOOSER)
        game.switchTo(game.config.chooserBuilder, game.score.levelOnWin.index);
      else if (game.score.levelOnWin.which == StageTypes.SPLASH)
        game.switchTo(game.config.splashBuilder, game.score.levelOnWin.index);
      return true;
    });
    let t = new Actor(overlay);
    t.appearance = new TextSprite({ center: true, cx: 8, cy: 4.5, face: "Arial", color: "#FFFFFF", size: 50, z: 10 },
      () => message);
    if (callback) callback();
  };
}

/**
 * This is a standard way of drawing a black screen with some text, to serve as
 * the lose screen for the game
 *
 * @param message   The message to display in the middle of the screen
 * @param callback  Code to run when the lose message first appears
 */
export function loseMessage(message: string, callback?: () => void) {
  game.score.loseSceneBuilder = (overlay: Scene) => {
    Helpers.addTapControl(overlay, { cx: 8, cy: 4.5, width: 16, height: 9, img: "purple.png" }, () => {
      // Just repeat the last level
      //
      // NB: we should be more careful, like in winMessage...
      game.switchTo(game.config.levelBuilder, game.score.levelOnFail.index);
      return true;
    });
    let t = new Actor(overlay);
    t.appearance = new TextSprite({ center: true, cx: 8, cy: 4.5, face: "Arial", color: "#FFFFFF", size: 50, z: 10 }, () => message);
    if (callback) callback();
  };
}
