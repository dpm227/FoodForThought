# Mobile Game Programming for Fun and (non)Profit

This repository holds a copy of the "Entity-Component-System" (ECS) version of
the JetLag game development framework.  It is intended for use in student
projects in the Lehigh University ENGR 005 class during the Fall of 2023.

## Getting Started

Once you have downloaded JetLag, enter the JetLag directory and type `npm
install` to fetch all of the supporting code for JetLag.  Once you have done
that, you can run `npm start` to compile your code.  JetLag uses `esbuild` for
compilation, so every time you make a change, the code will recompile.  To test
your game, open a browser and navigate to <http://localhost:4040>.

To develop a game, we recommend that you start by reading the code in
`src/game/Levels.ts`, to understand how JetLag works.  Then edit the first level
of that file to start creating your game.

To add images and sounds to JetLag, follow these steps:

1. Copy the image or sound file into the assets folder
2. Add the name of the file to the appropriate list in `src/game/myconfig.ts`

That's it.  Once you follow those two steps, you can refer to the asset by its
filename in your code.

## Documentation

Documentation for JetLag is available on
[GitHub Pages](https://mfs409.github.io/jetlag/ "JetLag GitHub Pages")

## Coding Standards

JetLag is supposed to be a library that its users will hack for their own
purposes.  Consequently, we prefer that programmers preserve the structure we
have in the repository, where both `jetlag` and `game` are sub-folders of the
`src` folder.
