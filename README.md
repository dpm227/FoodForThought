## FOOD FOR THOUGHT
Demo here: <br />
<https://www.cse.lehigh.edu/~spear/eng5_2023/engr_005_fl_2023_N/> <br />
<br />
Food for Throught was developed in Introduction to Engineering Practice using Typescript, UNIX, and VS Code. <br />
It utilizes a game engine called JetLag. More information on JetLag can be found below.

## Mobile Game Programming for Fun and (non)Profit

This repository holds a copy of the "Entity-Component-System" (ECS) version of
the JetLag game development framework.  It is intended for use in student
projects in the Lehigh University ENGR 005 class during the Fall of 2023.

## Getting Started

Once you have downloaded JetLag, enter the JetLag directory and type `npm
install` to fetch all of the supporting code for JetLag.  Once you have done
that, you can run `npm start` to compile your code.  JetLag uses `esbuild` for
compilation, so every time you make a change, the code will recompile.  To test
your game, open a browser and navigate to <http://localhost:4040>.

## Documentation

Documentation for JetLag is available on
[GitHub Pages](https://mfs409.github.io/jetlag/ "JetLag GitHub Pages")

## Coding Standards

JetLag is supposed to be a library that its users will hack for their own
purposes.  Consequently, we prefer that programmers preserve the structure we
have in the repository, where both `jetlag` and `game` are sub-folders of the
`src` folder.
