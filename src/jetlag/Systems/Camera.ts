// Last review: 08-11-2023

import { b2Vec2 } from "@box2d/core";
import { Actor } from "../Entities/Actor";
import { game } from "../Stage";

/**
 * The Camera is used to determine /how much/ of a world to render.  The Camera
 * has a minimum X and Y coordinate, and a maximum X and Y coordinate.  It also
 * has a zoom factor, and a current center point.
 *
 * The zoom factor and center point give a rectangular region.  The min and max
 * coordinates give another rectangular region.  If the first region is not
 * fully within the second, we shift it so that it is within, and then we only
 * show those things that are within it.
 *
 * Note that the camera center can be changed dynamically, in response to
 * changes in the world to which the camera is attached.
 */
export class CameraSystem {
  /** Anything in the world that can be rendered (5 planes [-2, -1, 0, 1, 2]) */
  protected readonly renderables: Actor[][] = [[], [], [], [], []];

  /** The minimum x/y coordinates that can be shown (top left corner) */
  private readonly min = new b2Vec2(0, 0);

  /** The maximum x/y coordinates that can be shown (bottom right corner) */
  private readonly max = new b2Vec2(0, 0);

  /** The current center point of the camera */
  private readonly center = new b2Vec2(0, 0);

  /** The effective (scaled) pixel/meter ratio */
  private ratio: number;

  /** The dimensions of the screen, in pixels */
  private readonly screenDims = new b2Vec2(0, 0);

  /** The visible dimensions of the screen, in meters */
  private readonly scaledVisibleRegionDims = new b2Vec2(0, 0);

  /** The Entity that the camera chases, if any */
  private cameraChaseActor?: Actor;

  /**
   * When the camera follows the entity without centering on it, this gives us
   * the difference between the entity and camera
   */
  private readonly cameraOffset = new b2Vec2(0, 0);

  /**
   * Make the camera follow an Actor.  Optionally add x,y to the actor's center,
   * and center the camera on that point instead.
   *
   * @param actor The actor to follow
   * @param x     Amount of x distance to add to actor center
   * @param y     Amount of y distance to add to actor center
   */
  public setCameraChase(actor: Actor | undefined, x: number = 0, y: number = 0) {
    this.cameraChaseActor = actor;
    this.cameraOffset.Set(x, y);
  }

  /**
   * If the world's camera is supposed to follow an entity, this code will
   * figure out the point on which the camera should center, and will request
   * that the camera center on that point.
   *
   * NB: The camera may decide not to center on that point, depending on zoom
   *     and camera bounds.
   */
  public adjustCamera() {
    if (!this.cameraChaseActor) return;

    // figure out the entity's position + the offset
    let a = this.cameraChaseActor;
    let x = (a.rigidBody?.body.GetWorldCenter().x ?? 0) + this.cameraOffset.x;
    let y = (a.rigidBody?.body.GetWorldCenter().y ?? 0) + this.cameraOffset.y;

    // request that the camera center on that point
    this.setCenter(x, y);
  }

  /**
   * Create a Camera by setting its bounds and its current pixel/meter ratio
   *
   * @param maxX The maximum X value (in meters)
   * @param maxY The maximum Y value (in meters)
   * @param ratio The initial pixel/meter ratio
   */
  constructor(maxX: number, maxY: number, ratio: number) {
    this.max.Set(maxX, maxY)
    this.center.Set((this.max.x - this.min.x) / 2, (this.max.y - this.min.y) / 2);
    this.screenDims.Set(game.screenWidth, game.screenHeight);
    this.ratio = ratio;
    this.setScale(this.ratio);

    // set up the containers for holding anything we can render
    this.renderables = new Array<Array<Actor>>(5);
    for (let i = 0; i < 5; ++i)
      this.renderables[i] = new Array<Actor>();
  }

  /**
   * Get the pixel/meter ratio of the camera.  Increasing the ratio would
   * equate to zooming in.  Decreasing the ratio would equate to zooming out.
   */
  public getScale(): number { return this.ratio; }

  /**
   * Set the pixel/meter ratio of the camera.  Bigger numbers mean zooming in,
   * and smaller ones mean zooming out.  The base value to consider is whatever
   * you have set in your game's configuration.
   *
   * @param ratio The new pixel/meter ratio
   */
  public setScale(ratio: number) {
    this.ratio = ratio;
    // Update our precomputed visible screen dimensions
    this.scaledVisibleRegionDims.Set(this.screenDims.x / ratio, this.screenDims.y / ratio);
    // Warn if the new scale is too small to fill the screen
    this.checkDims();
  }

  /**
   * Update a camera's bounds by providing a new maximum (X, Y) coordinate
   *
   * TODO: We should have support for a truly "infinite" level
   *
   * @param maxX The new maximum X value (in meters)
   * @param maxY The new maximum Y value (in meters)
   */
  public setBounds(maxX: number, maxY: number) {
    this.max.Set(maxX, maxY);
    // Warn if the new bounds are too small to fill the screen
    this.checkDims();
  }

  /**
   * Set the center point on which the camera should focus
   *
   * NB: this is called (indirectly) by the render loop in order to make sure
   *     we don't go out of bounds.
   *
   * @param centerX The X coordinate of the center point (in meters)
   * @param centerY The Y coordinate of the center point (in meters)
   */
  public setCenter(centerX: number, centerY: number) {
    // Make sure that X and Y aren't so close to an edge as to lead to
    // out-of-bounds stuff being rendered (modulo warnings from checkDims())
    let top = centerY - this.scaledVisibleRegionDims.y / 2;
    let bottom = centerY + this.scaledVisibleRegionDims.y / 2;
    let left = centerX - this.scaledVisibleRegionDims.x / 2;
    let right = centerX + this.scaledVisibleRegionDims.x / 2;

    this.center.Set(centerX, centerY);

    if (bottom > this.max.y) this.center.y = this.max.y - this.scaledVisibleRegionDims.y / 2;
    if (top < this.min.y) this.center.y = this.min.y + this.scaledVisibleRegionDims.y / 2;
    if (right > this.max.x) this.center.x = this.max.x - this.scaledVisibleRegionDims.x / 2;
    if (left < this.min.x) this.center.x = this.min.x + this.scaledVisibleRegionDims.x / 2;
  }

  /**
   * Determine whether a sprite is within the region being shown by the
   * camera, so that we can reduce the overhead on the renderer.
   *
   * @param x The X coordinate of the top left corner of the sprite, in meters
   * @param y The Y coordinate of the top left corner of the sprite, in meters
   * @param r The radius of the circumscribing circle
   */
  public inBounds(x: number, y: number, r: number): boolean {
    let leftOk = x + r >= this.center.x - this.scaledVisibleRegionDims.x / 2;
    let rightOk = x - r <= this.center.x + this.scaledVisibleRegionDims.x / 2;
    let topOk = y + r >= this.center.y - this.scaledVisibleRegionDims.y / 2;
    let bottomOk = y - r <= this.center.y + this.scaledVisibleRegionDims.y / 2;
    return leftOk && rightOk && topOk && bottomOk;
  }

  /** Return the X coordinate of the left of the camera viewport */
  public getOffsetX() { return this.center.x - this.scaledVisibleRegionDims.x / 2; }

  /** Return the Y coordinate of the top of the camera viewport */
  public getOffsetY() { return this.center.y - this.scaledVisibleRegionDims.y / 2; }

  /**
   * Given screen coordinates, convert them to meter coordinates in the world
   *
   * @param screenX The X coordinate, in pixels
   * @param screenY The Y coordinate, in pixels
   */
  public screenToMeters(screenX: number, screenY: number) {
    return { x: screenX / this.ratio + this.getOffsetX(), y: screenY / this.ratio + this.getOffsetY() };
  }

  /**
   * Convert meter coordinates to screen coordinates
   *
   * @param worldX  The X coordinate, in meters
   * @param worldY  The Y coordinate, in meters
   */
  public metersToScreen(worldX: number, worldY: number) {
    return { x: (worldX - this.getOffsetX()) * this.ratio, y: (worldY - this.getOffsetY()) * this.ratio };
  }

  /**
   * Check to make sure that the current screen bounds, scaled by the current
   * pixel/meter ratio, are at least as big as the screen dimensions.
   */
  private checkDims() {
    // w and h are the visible world's width and height in pixels
    let w = this.ratio * (this.max.x - this.min.x);
    let h = this.ratio * (this.max.y - this.min.y);
    if (w < this.screenDims.x) game.console.urgent("Warning, the visible game area is less than the screen width");
    if (h < this.screenDims.y) game.console.urgent("Warning, the visible game area is less than the screen height");
  }

  /**
   * Add an actor to the level, putting it into the appropriate z plane
   *
   * @param actor The actor to add
   */
  addEntity(actor: Actor) {
    if (actor.appearance)
      this.renderables[actor.appearance.props.z + 2].push(actor);
  }

  /**
   * Remove an actor from its z plane
   *
   * @param actor The actor to remove
   */
  removeEntity(actor: Actor) {
    if (!actor.appearance) return;
    let z = actor.appearance.props.z
    let i = this.renderables[z + 2].indexOf(actor);
    this.renderables[z + 2].splice(i, 1);
  }

  /**
   * Render this scene
   *
   * @return True if the scene was rendered, false if it was not
   */
  render(elapsedMs: number) {
    // Draw everything
    for (let zPlane of this.renderables)
      for (let renderable of zPlane)
        if (renderable.prerender(elapsedMs)) renderable.appearance?.render(this, elapsedMs);
    return true;
  }
}
